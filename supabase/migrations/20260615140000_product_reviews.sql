-- =============================================================================
-- Avis produits modérés
-- =============================================================================

CREATE TYPE public.product_review_status AS ENUM ('pending', 'published', 'rejected');

CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders (id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status public.product_review_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  published_at TIMESTAMPTZ,
  CONSTRAINT product_reviews_author_name_length CHECK (
    char_length(trim(author_name)) BETWEEN 1 AND 80
  ),
  CONSTRAINT product_reviews_author_email_format CHECK (
    author_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  CONSTRAINT product_reviews_title_length CHECK (
    char_length(trim(title)) BETWEEN 2 AND 120
  ),
  CONSTRAINT product_reviews_body_length CHECK (
    char_length(trim(body)) BETWEEN 10 AND 2000
  )
);

CREATE INDEX idx_product_reviews_product_status
  ON public.product_reviews (product_id, status);

CREATE INDEX idx_product_reviews_pending_created
  ON public.product_reviews (status, created_at DESC)
  WHERE status = 'pending';

COMMENT ON TABLE public.product_reviews IS
  'Avis clients modérés. Insertion publique via service role uniquement.';

COMMENT ON COLUMN public.product_reviews.author_email IS
  'E-mail de vérification achat — jamais exposé au catalogue public.';

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_reviews_public_read_published"
  ON public.product_reviews
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "product_reviews_admin_select"
  ON public.product_reviews
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "product_reviews_admin_update"
  ON public.product_reviews
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "product_reviews_admin_delete"
  ON public.product_reviews
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

CREATE VIEW public.catalog_product_ratings
WITH (security_invoker = true) AS
SELECT
  product_id,
  COUNT(*)::integer AS review_count,
  ROUND(AVG(rating)::numeric, 1)::double precision AS rating_average
FROM public.product_reviews
WHERE status = 'published'
GROUP BY product_id;

COMMENT ON VIEW public.catalog_product_ratings IS
  'Moyennes publiques des avis publiés (security invoker = RLS sur product_reviews).';

GRANT SELECT ON public.catalog_product_ratings TO anon, authenticated;
