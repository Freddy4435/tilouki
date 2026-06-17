-- =============================================================================
-- Alertes retour en stock par variante (taille)
-- =============================================================================

CREATE TYPE public.stock_alert_status AS ENUM (
  'pending',
  'notified',
  'cancelled'
);

CREATE TABLE public.stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  size_label TEXT,
  status public.stock_alert_status NOT NULL DEFAULT 'pending',
  consent_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT stock_alerts_email_variant_unique UNIQUE (email, variant_id),
  CONSTRAINT stock_alerts_email_format CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  CONSTRAINT stock_alerts_slug_length CHECK (
    char_length(trim(product_slug)) BETWEEN 1 AND 120
  )
);

CREATE INDEX idx_stock_alerts_status_created
  ON public.stock_alerts (status, created_at DESC);

CREATE INDEX idx_stock_alerts_variant_pending
  ON public.stock_alerts (variant_id)
  WHERE status = 'pending';

COMMENT ON TABLE public.stock_alerts IS
  'Alertes e-mail retour en stock par variante — insertion via service role (API storefront).';

ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_alerts_admin_select"
  ON public.stock_alerts
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "stock_alerts_admin_update"
  ON public.stock_alerts
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "stock_alerts_admin_delete"
  ON public.stock_alerts
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

CREATE TRIGGER stock_alerts_set_updated_at
  BEFORE UPDATE ON public.stock_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
