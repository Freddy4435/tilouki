-- Barre d'annonces storefront (messages rotatifs, administrables)

ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS announcements_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS announcements JSONB NOT NULL DEFAULT '[
    {"text": "Livraison en point relais Mondial Relay", "active": false},
    {"text": "Retours sous 14 jours", "active": false},
    {"text": "Paiement 100% sécurisé", "active": false}
  ]'::jsonb;

COMMENT ON COLUMN public.shop_settings.announcements_enabled IS
  'Active la barre d''annonces en tête du site.';
COMMENT ON COLUMN public.shop_settings.announcements IS
  'Messages d''annonce (max 3) : { text, href?, active }.';

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
  created_at,
  updated_at
FROM public.shop_settings;

COMMENT ON VIEW public.shop_settings_public IS
  'Paramètres boutique exposés au storefront (mentions légales, contact, annonces).';

GRANT SELECT ON public.shop_settings_public TO anon, authenticated;
