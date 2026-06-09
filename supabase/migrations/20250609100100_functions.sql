-- =============================================================================
-- Tilouki — Fonctions SQL utilitaires
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Vérification admin (ne jamais utiliser user_metadata)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO service_role;

-- -----------------------------------------------------------------------------
-- Génération numéro de commande : TK-2026-00001
-- -----------------------------------------------------------------------------

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  seq_value BIGINT;
BEGIN
  year_part := to_char(timezone('utc', now()), 'YYYY');
  seq_value := nextval('public.order_number_seq');
  RETURN 'TK-' || year_part || '-' || lpad(seq_value::TEXT, 5, '0');
END;
$$;

REVOKE ALL ON FUNCTION public.generate_order_number() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO service_role;

-- -----------------------------------------------------------------------------
-- Application automatique des mouvements de stock
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.apply_inventory_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  delta INTEGER;
  current_stock INTEGER;
BEGIN
  delta := CASE NEW.type
    WHEN 'sale' THEN -abs(NEW.quantity)
    WHEN 'restock' THEN abs(NEW.quantity)
    WHEN 'cancel' THEN abs(NEW.quantity)
    WHEN 'manual_adjustment' THEN NEW.quantity
    ELSE 0
  END;

  SELECT stock_quantity INTO current_stock
  FROM public.product_variants
  WHERE id = NEW.variant_id
  FOR UPDATE;

  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Variante introuvable : %', NEW.variant_id;
  END IF;

  IF current_stock + delta < 0 THEN
    RAISE EXCEPTION 'Stock insuffisant pour la variante %. Stock actuel : %, delta : %',
      NEW.variant_id, current_stock, delta;
  END IF;

  UPDATE public.product_variants
  SET stock_quantity = stock_quantity + delta
  WHERE id = NEW.variant_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER inventory_movements_apply_stock
  AFTER INSERT ON public.inventory_movements
  FOR EACH ROW EXECUTE FUNCTION public.apply_inventory_movement();

-- -----------------------------------------------------------------------------
-- Enregistrer une vente (appelée par webhook Stripe via service_role)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.record_sale_movement(
  p_variant_id UUID,
  p_quantity INTEGER,
  p_note TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  movement_id UUID;
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'La quantité doit être positive.';
  END IF;

  INSERT INTO public.inventory_movements (variant_id, type, quantity, note)
  VALUES (p_variant_id, 'sale', p_quantity, p_note)
  RETURNING id INTO movement_id;

  RETURN movement_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_sale_movement(UUID, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_sale_movement(UUID, INTEGER, TEXT) TO service_role;

-- -----------------------------------------------------------------------------
-- Vue catalogue public (security invoker — respecte RLS)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.catalog_products
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.category_id,
  p.name,
  p.slug,
  p.short_description,
  p.material,
  p.season,
  p.brand_label,
  p.gender,
  p.seo_title,
  p.seo_description,
  c.name AS category_name,
  c.slug AS category_slug,
  (
    SELECT min(v.price_cents)
    FROM public.product_variants v
    WHERE v.product_id = p.id AND v.is_active = true
  ) AS min_price_cents,
  (
    SELECT coalesce(sum(v.stock_quantity), 0)
    FROM public.product_variants v
    WHERE v.product_id = p.id AND v.is_active = true
  ) AS total_stock,
  (
    SELECT pi.url
    FROM public.product_images pi
    WHERE pi.product_id = p.id
    ORDER BY pi.sort_order ASC
    LIMIT 1
  ) AS primary_image_url
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.category_id
WHERE p.status = 'active';

GRANT SELECT ON public.catalog_products TO anon, authenticated;
