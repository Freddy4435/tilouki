-- =============================================================================
-- Favoris client synchronisés (compte magic link Supabase Auth)
-- =============================================================================

CREATE TABLE public.customer_favorites (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  slugs TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT customer_favorites_slugs_max CHECK (cardinality(slugs) <= 50)
);

CREATE INDEX idx_customer_favorites_updated
  ON public.customer_favorites (updated_at DESC);

COMMENT ON TABLE public.customer_favorites IS
  'Favoris synchronisés par compte client (magic link). Une ligne par utilisateur auth.';

ALTER TABLE public.customer_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_favorites_select_own"
  ON public.customer_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "customer_favorites_insert_own"
  ON public.customer_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "customer_favorites_update_own"
  ON public.customer_favorites
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER customer_favorites_set_updated_at
  BEFORE UPDATE ON public.customer_favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
