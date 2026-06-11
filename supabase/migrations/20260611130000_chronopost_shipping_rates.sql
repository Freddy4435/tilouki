-- =============================================================================
-- Tilouki — Barème Chronopost relais (Shop2Shop) par défaut
-- Inséré désactivé (is_active = false) : à activer depuis l'admin une fois
-- les identifiants CHRONOPOST_* configurés.
-- =============================================================================

INSERT INTO public.shipping_rates (provider, label, min_weight_grams, max_weight_grams, price_cents, sort_order, is_active)
SELECT v.provider, v.label, v.min_weight_grams, v.max_weight_grams, v.price_cents, v.sort_order, false
FROM (
  VALUES
    ('chronopost', '0 – 250 g',    0,    250,  490, 1),
    ('chronopost', '251 – 500 g',  251,  500,  590, 2),
    ('chronopost', '501 g – 1 kg', 501,  1000, 690, 3),
    ('chronopost', '1 – 2 kg',     1001, 2000, 850, 4),
    ('chronopost', '2 – 3 kg',     2001, 3000, 1050, 5)
) AS v(provider, label, min_weight_grams, max_weight_grams, price_cents, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.shipping_rates r WHERE r.provider = 'chronopost'
);

-- Index de filtrage par transporteur (les requêtes filtrent désormais par provider).
CREATE INDEX IF NOT EXISTS idx_shipping_rates_provider_active
  ON public.shipping_rates (provider, is_active, sort_order);

-- ============================================================================
-- Suivi client multi-transporteur : la fonction de suivi expose désormais
-- shipping_provider pour construire le lien de suivi du bon transporteur.
-- ============================================================================

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
  shipping_number TEXT,
  shipping_provider TEXT
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
    o.shipping_number,
    o.shipping_provider
  FROM public.orders o
  WHERE o.tracking_token = p_token
    AND o.status <> 'pending';
$$;

REVOKE ALL ON FUNCTION public.get_order_by_tracking_token(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_by_tracking_token(UUID) TO anon, authenticated, service_role;
