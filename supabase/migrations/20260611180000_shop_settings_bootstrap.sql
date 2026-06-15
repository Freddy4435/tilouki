-- =============================================================================
-- Tilouki — Ligne initiale shop_settings (singleton)
-- Idempotent : insère uniquement si la table est vide (sans danger en prod).
-- Les champs légaux sensibles restent NULL — à compléter dans /admin/parametres.
-- =============================================================================

INSERT INTO public.shop_settings (
  shop_name,
  legal_name,
  siret,
  address,
  email,
  phone,
  vat_enabled,
  vat_rate,
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
  hero_image_url
)
SELECT
  'Tilouki',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  0.2000,
  'EUR',
  NULL,
  NULL,
  NULL,
  'Vercel Inc.',
  '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM public.shop_settings);

-- Catégories de navigation (structure vide, sans produits démo)
INSERT INTO public.categories (name, slug, description, sort_order, is_active) VALUES
  ('Bébé', 'bebe', 'Naissance à 24 mois', 1, true),
  ('Fille', 'fille', 'Vêtements fille', 2, true),
  ('Garçon', 'garcon', 'Vêtements garçon', 3, true),
  ('Pyjamas', 'pyjamas', 'Nuits douces', 4, true),
  ('Accessoires', 'accessoires', 'Compléments', 5, true)
ON CONFLICT (slug) DO NOTHING;
