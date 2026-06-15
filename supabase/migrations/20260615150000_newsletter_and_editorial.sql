-- =============================================================================
-- Newsletter (double opt-in) + liens sociaux + blocs éditoriaux vitrine
-- =============================================================================

CREATE TYPE public.newsletter_subscriber_status AS ENUM (
  'pending',
  'confirmed',
  'unsubscribed'
);

CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  consent_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL DEFAULT 'footer',
  status public.newsletter_subscriber_status NOT NULL DEFAULT 'pending',
  confirm_token_hash TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email),
  CONSTRAINT newsletter_subscribers_email_format CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  CONSTRAINT newsletter_subscribers_source_length CHECK (
    char_length(trim(source)) BETWEEN 1 AND 64
  )
);

CREATE INDEX idx_newsletter_subscribers_status_created
  ON public.newsletter_subscribers (status, created_at DESC);

COMMENT ON TABLE public.newsletter_subscribers IS
  'Inscriptions newsletter — insertion via service role uniquement (double opt-in).';

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "newsletter_subscribers_admin_select"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "newsletter_subscribers_admin_update"
  ON public.newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "newsletter_subscribers_admin_delete"
  ON public.newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- Vitrine : réseaux sociaux + blocs éditoriaux
ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS editorial_blocks JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.shop_settings.social_links IS
  'Liens réseaux sociaux : { instagram?, facebook?, tiktok? } — URLs publiques.';
COMMENT ON COLUMN public.shop_settings.editorial_blocks IS
  'Blocs éditoriaux accueil (max 3) : { title, hook, imageUrl, href, active? }.';

DROP VIEW IF EXISTS public.shop_settings_public;

CREATE VIEW public.shop_settings_public
WITH (security_barrier = true)
AS
SELECT
  id,
  shop_name,
  legal_name,
  legal_status,
  siret,
  address,
  email,
  phone,
  vat_enabled,
  vat_rate,
  vat_notice,
  currency,
  mediation_name,
  mediation_url,
  rep_idu,
  host_name,
  host_address,
  host_phone,
  host_email,
  return_policy,
  exchange_policy,
  analytics_enabled,
  hero_image_url,
  announcements_enabled,
  announcements,
  social_links,
  editorial_blocks,
  created_at,
  updated_at
FROM public.shop_settings;

COMMENT ON VIEW public.shop_settings_public IS
  'Paramètres boutique exposés au storefront (mentions légales, contact, vitrine).';

GRANT SELECT ON public.shop_settings_public TO anon, authenticated;
