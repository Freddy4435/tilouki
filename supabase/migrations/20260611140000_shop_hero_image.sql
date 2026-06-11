-- Image hero de la page d'accueil (URL publique Supabase Storage).

ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

COMMENT ON COLUMN public.shop_settings.hero_image_url IS
  'URL publique de la photo hero (bucket product-images/shop/hero/).';

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
  hero_image_url,
  created_at,
  updated_at
FROM public.shop_settings;

COMMENT ON VIEW public.shop_settings_public IS
  'Paramètres boutique exposés au storefront (mentions légales, contact, vitrine).';

GRANT SELECT ON public.shop_settings_public TO anon, authenticated;
