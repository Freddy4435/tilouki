-- =============================================================================
-- Tilouki — Métadonnées livraison sur commandes (V1 point relais Mondial Relay)
-- =============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_provider TEXT NOT NULL DEFAULT 'mondial_relay',
  ADD COLUMN IF NOT EXISTS shipping_method TEXT NOT NULL DEFAULT 'relay_point',
  ADD COLUMN IF NOT EXISTS total_weight_grams INTEGER,
  ADD COLUMN IF NOT EXISTS shipping_rate_label TEXT;

COMMENT ON COLUMN public.orders.shipping_provider IS 'Transporteur (ex. mondial_relay).';
COMMENT ON COLUMN public.orders.shipping_method IS 'Mode de livraison (ex. relay_point).';
COMMENT ON COLUMN public.orders.total_weight_grams IS 'Poids total colis en grammes au moment de la commande.';
COMMENT ON COLUMN public.orders.shipping_rate_label IS 'Libellé de la tranche tarifaire appliquée.';
