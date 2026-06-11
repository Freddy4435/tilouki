-- Champs légaux complémentaires : médiateur (nom) et e-mail hébergeur

ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS mediation_name TEXT,
  ADD COLUMN IF NOT EXISTS host_email TEXT;

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
  created_at,
  updated_at
FROM public.shop_settings;

COMMENT ON VIEW public.shop_settings_public IS
  'Paramètres boutique exposés au storefront (mentions légales, contact).';

GRANT SELECT ON public.shop_settings_public TO anon, authenticated;
