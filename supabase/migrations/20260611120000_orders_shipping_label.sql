-- =============================================================================
-- Tilouki — Étiquette d'expédition Mondial Relay (WSI2_CreationEtiquette)
-- =============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_label_url TEXT,
  ADD COLUMN IF NOT EXISTS shipping_number TEXT,
  ADD COLUMN IF NOT EXISTS label_created_at TIMESTAMPTZ;

COMMENT ON COLUMN public.orders.shipping_label_url IS 'URL du PDF d''étiquette Mondial Relay (WSI2_CreationEtiquette).';
COMMENT ON COLUMN public.orders.shipping_number IS 'Numéro d''expédition Mondial Relay (8 chiffres).';
COMMENT ON COLUMN public.orders.label_created_at IS 'Date de génération de l''étiquette.';

-- RLS : la table orders est déjà restreinte aux admins (policies orders_admin_*)
-- et au service_role — aucun accès public direct. Les nouvelles colonnes héritent
-- de ces policies. Le client n'accède qu'au shipping_number via la fonction
-- get_order_by_tracking_token (token opaque), nécessaire au lien de suivi colis.

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
  relay_point_zip TEXT,
  shipping_number TEXT
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
    o.relay_point_zip,
    o.shipping_number
  FROM public.orders o
  WHERE o.tracking_token = p_token
    AND o.status <> 'pending';
$$;

REVOKE ALL ON FUNCTION public.get_order_by_tracking_token(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_by_tracking_token(UUID) TO anon, authenticated, service_role;
