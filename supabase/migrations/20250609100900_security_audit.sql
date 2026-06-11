-- =============================================================================
-- Tilouki — Audit sécurité Supabase (RLS, vues publiques, contraintes, index)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. is_admin() : user_id + email synchronisé avec auth.users
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    INNER JOIN auth.users u ON u.id = au.user_id
    WHERE au.user_id = auth.uid()
      AND lower(trim(au.email)) = lower(trim(u.email))
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO service_role;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private, auth
AS $$
  SELECT private.is_admin();
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- -----------------------------------------------------------------------------
-- 2. Vues catalogue : exécution définer (sous-requêtes variants sans exposer cost_cents)
-- -----------------------------------------------------------------------------

DROP VIEW IF EXISTS public.catalog_products;

CREATE VIEW public.catalog_products
WITH (security_barrier = true)
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

COMMENT ON VIEW public.catalog_products IS
  'Catalogue public agrégé. Ne pas utiliser security_invoker (sous-requêtes variants).';

GRANT SELECT ON public.catalog_products TO anon, authenticated;

CREATE OR REPLACE VIEW public.catalog_variants
WITH (security_barrier = true)
AS
SELECT
  v.id,
  v.product_id,
  v.sku,
  v.size_label,
  v.age_label,
  v.color,
  v.price_cents,
  v.compare_at_price_cents,
  v.stock_quantity,
  v.weight_grams,
  v.is_active,
  v.created_at,
  v.updated_at
FROM public.product_variants v
WHERE v.is_active = true
  AND v.price_cents > 0
  AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = v.product_id AND p.status = 'active'
  );

COMMENT ON VIEW public.catalog_variants IS
  'Variantes catalogue publiques sans cost_cents. Accès direct product_variants réservé admin.';

GRANT SELECT ON public.catalog_variants TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. shop_settings : lecture publique limitée aux champs vitrine / légaux
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "shop_settings_public_read" ON public.shop_settings;

CREATE OR REPLACE VIEW public.shop_settings_public
WITH (security_barrier = true)
AS
SELECT
  id,
  shop_name,
  legal_name,
  legal_status,
  siret,
  address,
  email,
  phone,
  vat_enabled,
  vat_rate,
  vat_notice,
  currency,
  mediation_url,
  rep_idu,
  host_name,
  host_address,
  host_phone,
  created_at,
  updated_at
FROM public.shop_settings;

COMMENT ON VIEW public.shop_settings_public IS
  'Paramètres boutique exposés au storefront (mentions légales, contact).';

GRANT SELECT ON public.shop_settings_public TO anon, authenticated;

-- Table complète : SELECT réservé admin (policy shop_settings_admin_select_all existante)

-- -----------------------------------------------------------------------------
-- 4. inventory_movements : journal immuable (suppression interdite)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "inventory_movements_admin_delete" ON public.inventory_movements;

-- -----------------------------------------------------------------------------
-- 5. Contraintes métier
-- -----------------------------------------------------------------------------

ALTER TABLE public.product_variants
  DROP CONSTRAINT IF EXISTS product_variants_active_price_positive;

ALTER TABLE public.product_variants
  ADD CONSTRAINT product_variants_active_price_positive
  CHECK (NOT is_active OR price_cents > 0);

ALTER TABLE public.shipping_rates
  DROP CONSTRAINT IF EXISTS shipping_rates_price_positive;

ALTER TABLE public.shipping_rates
  ADD CONSTRAINT shipping_rates_price_positive
  CHECK (price_cents > 0);

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_paid_requires_payment_paid;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_paid_requires_payment_paid
  CHECK (status <> 'paid' OR payment_status = 'paid');

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_refunded_requires_payment_refunded;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_refunded_requires_payment_refunded
  CHECK (status <> 'refunded' OR payment_status = 'refunded');

ALTER TABLE public.order_items
  DROP CONSTRAINT IF EXISTS order_items_quantity_positive;

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_quantity_positive
  CHECK (quantity > 0);

-- -----------------------------------------------------------------------------
-- 6. Index utiles
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_orders_pending_expires
  ON public.orders (pending_expires_at)
  WHERE payment_status = 'pending' AND status = 'pending';

CREATE INDEX IF NOT EXISTS idx_admin_users_email_lower
  ON public.admin_users (lower(email));

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed_at
  ON public.stripe_webhook_events (processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_variants_catalog
  ON public.product_variants (product_id, is_active, price_cents)
  WHERE is_active = true AND price_cents > 0;

CREATE INDEX IF NOT EXISTS idx_orders_relay_point
  ON public.orders (relay_point_id)
  WHERE relay_point_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 7. Storage : lecture publique, écriture admin (renforcement commentaires)
-- -----------------------------------------------------------------------------

COMMENT ON POLICY "product_images_public_read" ON storage.objects IS
  'Lecture publique des images produit (bucket product-images).';
