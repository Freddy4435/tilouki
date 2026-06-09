-- Notes internes admin + historique des changements de statut commande

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS internal_notes TEXT;

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  from_status public.order_status,
  to_status public.order_status NOT NULL,
  note TEXT,
  changed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order
  ON public.order_status_history (order_id, created_at DESC);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_status_history_admin_select"
  ON public.order_status_history
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "order_status_history_admin_insert"
  ON public.order_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());
