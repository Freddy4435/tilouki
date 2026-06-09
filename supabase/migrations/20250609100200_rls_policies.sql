-- =============================================================================
-- Tilouki — Row Level Security (RLS)
-- Lecture publique : catalogue actif uniquement
-- Écriture : administrateurs authentifiés
-- Commandes : service_role (API serveur) — pas d'accès anon
-- =============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- shop_settings
-- -----------------------------------------------------------------------------

CREATE POLICY "shop_settings_public_read"
  ON public.shop_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "shop_settings_admin_insert"
  ON public.shop_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "shop_settings_admin_select_all"
  ON public.shop_settings
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "shop_settings_admin_update"
  ON public.shop_settings
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "shop_settings_admin_delete"
  ON public.shop_settings
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------

CREATE POLICY "categories_public_read_active"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "categories_admin_read_all"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "categories_admin_insert"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "categories_admin_update"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "categories_admin_delete"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- -----------------------------------------------------------------------------
-- products
-- -----------------------------------------------------------------------------

CREATE POLICY "products_public_read_active"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "products_admin_read_all"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "products_admin_insert"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "products_admin_update"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "products_admin_delete"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- -----------------------------------------------------------------------------
-- product_images
-- -----------------------------------------------------------------------------

CREATE POLICY "product_images_public_read"
  ON public.product_images
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND p.status = 'active'
    )
  );

CREATE POLICY "product_images_admin_read_all"
  ON public.product_images
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "product_images_admin_insert"
  ON public.product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "product_images_admin_update"
  ON public.product_images
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "product_images_admin_delete"
  ON public.product_images
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- -----------------------------------------------------------------------------
-- product_variants
-- -----------------------------------------------------------------------------

CREATE POLICY "product_variants_public_read"
  ON public.product_variants
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND p.status = 'active'
    )
  );

CREATE POLICY "product_variants_admin_read_all"
  ON public.product_variants
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "product_variants_admin_insert"
  ON public.product_variants
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "product_variants_admin_update"
  ON public.product_variants
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "product_variants_admin_delete"
  ON public.product_variants
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- -----------------------------------------------------------------------------
-- orders — pas d'accès public (checkout via service_role)
-- -----------------------------------------------------------------------------

CREATE POLICY "orders_admin_select"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "orders_admin_insert"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "orders_admin_update"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "orders_admin_delete"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- Suivi commande invité via fonction dédiée (token opaque)
CREATE OR REPLACE FUNCTION public.get_order_by_tracking_token(p_token UUID)
RETURNS SETOF public.orders
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.orders
  WHERE tracking_token = p_token
    AND status <> 'pending';
$$;

REVOKE ALL ON FUNCTION public.get_order_by_tracking_token(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_by_tracking_token(UUID) TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- order_items
-- -----------------------------------------------------------------------------

CREATE POLICY "order_items_admin_select"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "order_items_admin_insert"
  ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "order_items_admin_update"
  ON public.order_items
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "order_items_admin_delete"
  ON public.order_items
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- -----------------------------------------------------------------------------
-- legal_pages
-- -----------------------------------------------------------------------------

CREATE POLICY "legal_pages_public_read"
  ON public.legal_pages
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "legal_pages_admin_insert"
  ON public.legal_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "legal_pages_admin_select_all"
  ON public.legal_pages
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "legal_pages_admin_update"
  ON public.legal_pages
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "legal_pages_admin_delete"
  ON public.legal_pages
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- -----------------------------------------------------------------------------
-- admin_users
-- -----------------------------------------------------------------------------

CREATE POLICY "admin_users_admin_select"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "admin_users_admin_insert"
  ON public.admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "admin_users_admin_update"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "admin_users_admin_delete"
  ON public.admin_users
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- -----------------------------------------------------------------------------
-- inventory_movements
-- -----------------------------------------------------------------------------

CREATE POLICY "inventory_movements_admin_select"
  ON public.inventory_movements
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "inventory_movements_admin_insert"
  ON public.inventory_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "inventory_movements_admin_delete"
  ON public.inventory_movements
  FOR DELETE
  TO authenticated
  USING (private.is_admin());
