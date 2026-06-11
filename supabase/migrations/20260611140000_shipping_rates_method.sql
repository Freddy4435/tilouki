-- Mode de livraison par tranche (point relais en V1 — extensible ultérieurement).
ALTER TABLE public.shipping_rates
  ADD COLUMN IF NOT EXISTS shipping_method TEXT NOT NULL DEFAULT 'relay_point'
  CHECK (shipping_method IN ('relay_point'));

COMMENT ON COLUMN public.shipping_rates.shipping_method IS
  'Mode de livraison associé à la tranche (relay_point = point retrait).';

UPDATE public.shipping_rates
SET shipping_method = 'relay_point'
WHERE shipping_method IS NULL OR shipping_method = '';
