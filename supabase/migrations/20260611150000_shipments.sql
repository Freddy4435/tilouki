-- =============================================================================
-- Tilouki — Expéditions (1 colis par commande en V1)
-- =============================================================================

CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT 'relay_point',
  pickup_point_id TEXT,
  pickup_point_name TEXT,
  pickup_point_address TEXT,
  pickup_point_zip TEXT,
  pickup_point_city TEXT,
  pickup_point_country TEXT,
  weight_grams INTEGER CHECK (weight_grams IS NULL OR weight_grams > 0),
  tracking_number TEXT,
  carrier_shipment_number TEXT,
  label_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending_label'
    CHECK (status IN ('pending_label', 'label_created', 'shipped', 'delivered')),
  label_created_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

COMMENT ON TABLE public.shipments IS
  'Expédition liée à une commande (transporteur, point retrait, étiquette, suivi).';

CREATE INDEX idx_shipments_order_id ON public.shipments (order_id);
CREATE INDEX idx_shipments_status ON public.shipments (status);

CREATE TRIGGER shipments_set_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shipments_admin_all"
  ON public.shipments
  FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Colonne shipped_at sur orders (date d'expédition effective).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;

COMMENT ON COLUMN public.orders.shipped_at IS
  'Date de passage en statut expédié (manuel ou via génération d''étiquette).';

-- Rétro-remplissage depuis les commandes existantes.
INSERT INTO public.shipments (
  order_id,
  carrier,
  service,
  pickup_point_id,
  pickup_point_name,
  pickup_point_address,
  pickup_point_zip,
  pickup_point_city,
  pickup_point_country,
  weight_grams,
  tracking_number,
  carrier_shipment_number,
  label_url,
  status,
  label_created_at,
  shipped_at
)
SELECT
  o.id,
  o.shipping_provider,
  o.shipping_method,
  o.relay_point_id,
  o.relay_point_name,
  o.relay_point_address,
  o.relay_point_zip,
  o.relay_point_city,
  o.relay_point_country,
  o.total_weight_grams,
  o.tracking_number,
  o.shipping_number,
  o.shipping_label_url,
  CASE
    WHEN o.status IN ('shipped', 'delivered') THEN 'shipped'
    WHEN o.shipping_number IS NOT NULL THEN 'label_created'
    ELSE 'pending_label'
  END,
  o.label_created_at,
  CASE WHEN o.status IN ('shipped', 'delivered') THEN o.updated_at ELSE NULL END
FROM public.orders o
WHERE o.relay_point_id IS NOT NULL
ON CONFLICT (order_id) DO NOTHING;

UPDATE public.orders o
SET shipped_at = o.updated_at
WHERE o.status IN ('shipped', 'delivered')
  AND o.shipped_at IS NULL;
