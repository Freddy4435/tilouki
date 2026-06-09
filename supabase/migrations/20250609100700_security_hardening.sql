-- Durcissement sécurité : suivi commande, variants catalogue, webhooks, stock

-- -----------------------------------------------------------------------------
-- Suivi commande : colonnes publiques uniquement (pas de PII)
-- -----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.get_order_by_tracking_token(UUID);

CREATE OR REPLACE FUNCTION public.get_order_by_tracking_token(p_token UUID)
RETURNS TABLE (
  order_number TEXT,
  status public.order_status,
  payment_status public.payment_status,
  total_cents INTEGER,
  currency TEXT,
  created_at TIMESTAMPTZ,
  tracking_number TEXT,
  relay_point_name TEXT,
  relay_point_city TEXT,
  relay_point_zip TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    o.order_number,
    o.status,
    o.payment_status,
    o.total_cents,
    o.currency,
    o.created_at,
    o.tracking_number,
    o.relay_point_name,
    o.relay_point_city,
    o.relay_point_zip
  FROM public.orders o
  WHERE o.tracking_token = p_token
    AND o.status <> 'pending';
$$;

REVOKE ALL ON FUNCTION public.get_order_by_tracking_token(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_by_tracking_token(UUID) TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Wrapper public is_admin() pour middleware
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT private.is_admin();
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- -----------------------------------------------------------------------------
-- Variantes catalogue sans cost_cents (accès anon)
-- -----------------------------------------------------------------------------

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
  AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = v.product_id AND p.status = 'active'
  );

GRANT SELECT ON public.catalog_variants TO anon, authenticated;

DROP POLICY IF EXISTS "product_variants_public_read" ON public.product_variants;

-- -----------------------------------------------------------------------------
-- Idempotence webhooks Stripe
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

COMMENT ON TABLE public.stripe_webhook_events IS 'Déduplication des événements Stripe (event.id).';

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Aucune politique publique — accès service_role uniquement

-- -----------------------------------------------------------------------------
-- Expiration commandes pending abandonnées
-- -----------------------------------------------------------------------------

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pending_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN public.orders.pending_expires_at IS 'Expiration réservation stock pour commandes pending non payées.';
