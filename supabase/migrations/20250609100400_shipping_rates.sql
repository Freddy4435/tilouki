-- =============================================================================
-- Tilouki — Tarifs livraison configurables (point relais)
-- =============================================================================

CREATE TABLE public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'mondial_relay',
  label TEXT NOT NULL,
  min_weight_grams INTEGER NOT NULL DEFAULT 0 CHECK (min_weight_grams >= 0),
  max_weight_grams INTEGER NOT NULL CHECK (max_weight_grams > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT shipping_rates_weight_range CHECK (max_weight_grams >= min_weight_grams)
);

COMMENT ON TABLE public.shipping_rates IS 'Barème livraison par tranche de poids (centimes EUR).';

CREATE INDEX idx_shipping_rates_active_sort
  ON public.shipping_rates (is_active, sort_order)
  WHERE is_active = true;

CREATE TRIGGER shipping_rates_set_updated_at
  BEFORE UPDATE ON public.shipping_rates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shipping_rates_public_read_active"
  ON public.shipping_rates
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "shipping_rates_admin_insert"
  ON public.shipping_rates
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

CREATE POLICY "shipping_rates_admin_select_all"
  ON public.shipping_rates
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "shipping_rates_admin_update"
  ON public.shipping_rates
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "shipping_rates_admin_delete"
  ON public.shipping_rates
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- Barème initial Mondial Relay (éditable admin)
INSERT INTO public.shipping_rates (provider, label, min_weight_grams, max_weight_grams, price_cents, sort_order) VALUES
  ('mondial_relay', '0 – 250 g', 0, 250, 390, 1),
  ('mondial_relay', '251 – 500 g', 251, 500, 490, 2),
  ('mondial_relay', '501 g – 1 kg', 501, 1000, 590, 3),
  ('mondial_relay', '1 – 2 kg', 1001, 2000, 690, 4),
  ('mondial_relay', '2 – 3 kg', 2001, 3000, 890, 5);
