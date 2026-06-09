-- =============================================================================
-- Tilouki — Seed DÉVELOPPEMENT UNIQUEMENT
-- Ne jamais exécuter en production.
-- Aucun produit fictif — structure et contenus légaux placeholder uniquement.
-- =============================================================================

-- Paramètres boutique par défaut (ID fixe — singleton)
INSERT INTO public.shop_settings (
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
  mediation_url,
  rep_idu,
  host_name,
  host_address,
  host_phone
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Tilouki',
  'À compléter — Auto-entrepreneur',
  'Auto-entrepreneur',
  NULL,
  'Adresse à compléter',
  'contact@tilouki.fr',
  NULL,
  false,
  0.2000,
  'TVA non applicable, art. 293 B du CGI',
  'EUR',
  NULL,
  NULL,
  'Vercel Inc.',
  '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Catégories de navigation (structure, pas de produits)
INSERT INTO public.categories (name, slug, description, sort_order, is_active) VALUES
  ('Bébé', 'bebe', 'Naissance à 24 mois', 1, true),
  ('Fille', 'fille', 'Vêtements fille', 2, true),
  ('Garçon', 'garcon', 'Vêtements garçon', 3, true),
  ('Pyjamas', 'pyjamas', 'Nuits douces', 4, true),
  ('Accessoires', 'accessoires', 'Compléments', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Pages légales (placeholders éditables depuis l''admin)
INSERT INTO public.legal_pages (slug, title, content) VALUES
  (
    'mentions-legales',
    'Mentions légales',
    '<p>Contenu à compléter depuis l''administration.</p>'
  ),
  (
    'cgv',
    'Conditions générales de vente',
    '<p>Contenu à compléter depuis l''administration.</p>'
  ),
  (
    'confidentialite',
    'Politique de confidentialité',
    '<p>Contenu à compléter depuis l''administration.</p>'
  ),
  (
    'cookies',
    'Politique de cookies',
    '<p>Contenu à compléter depuis l''administration.</p>'
  ),
  (
    'livraison-retours',
    'Livraison et retours',
    '<p>Contenu à compléter depuis l''administration.</p>'
  ),
  (
    'formulaire-retractation',
    'Formulaire type de rétractation',
    '<p>Contenu à compléter depuis l''administration.</p>'
  )
ON CONFLICT (slug) DO NOTHING;
