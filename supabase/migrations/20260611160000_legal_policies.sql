-- Politiques administrables (retours, échanges) + analytics + nettoyage placeholders légaux

ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS return_policy TEXT,
  ADD COLUMN IF NOT EXISTS exchange_policy TEXT,
  ADD COLUMN IF NOT EXISTS analytics_enabled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.shop_settings.return_policy IS
  'Politique de retour / rétractation affichée dans CGV et livraison-retours.';
COMMENT ON COLUMN public.shop_settings.exchange_policy IS
  'Politique d''échange de taille (livraison-retours).';
COMMENT ON COLUMN public.shop_settings.analytics_enabled IS
  'Si true, un outil de mesure d''audience peut être activé après consentement cookies.';

-- Réinitialiser le contenu placeholder → le moteur de templates prend le relais
UPDATE public.legal_pages
SET content = ''
WHERE content ILIKE '%contenu à compléter%'
   OR content ILIKE '%contenu à initialiser%';

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
  created_at,
  updated_at
FROM public.shop_settings;

COMMENT ON VIEW public.shop_settings_public IS
  'Paramètres boutique exposés au storefront (mentions légales, contact).';

GRANT SELECT ON public.shop_settings_public TO anon, authenticated;
