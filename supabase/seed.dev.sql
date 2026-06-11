-- =============================================================================
-- Tilouki — Seed DÉVELOPPEMENT UNIQUEMENT
-- ⛔ Ne jamais exécuter en production.
--
-- Structure boutique (paramètres, catégories, pages légales).
-- Les 12 produits de démo sont dans seed.dev-products.sql (chargé ensuite).
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
  'Prénom Nom (dev)',
  'Auto-entrepreneur',
  NULL,
  '1 rue de la Démo, 75001 Paris',
  'contact@tilouki.fr',
  '0600000000',
  false,
  0.2000,
  'TVA non applicable, art. 293 B du CGI',
  'EUR',
  NULL,
  NULL,
  'Vercel Inc.',
  '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  'support@vercel.com'
)
ON CONFLICT (id) DO NOTHING;

UPDATE public.shop_settings SET
  return_policy = 'Frais de retour à la charge du client sauf erreur du vendeur. Remboursement sous 14 jours après réception du retour (dev).',
  exchange_policy = 'Retour puis nouvelle commande sous réserve du stock (dev).'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Catégories de navigation (structure, pas de produits)
INSERT INTO public.categories (name, slug, description, sort_order, is_active) VALUES
  ('Bébé', 'bebe', 'Naissance à 24 mois', 1, true),
  ('Fille', 'fille', 'Vêtements fille', 2, true),
  ('Garçon', 'garcon', 'Vêtements garçon', 3, true),
  ('Pyjamas', 'pyjamas', 'Nuits douces', 4, true),
  ('Accessoires', 'accessoires', 'Compléments', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Pages légales : contenu vide → modèles structurés + paramètres boutique
INSERT INTO public.legal_pages (slug, title, content) VALUES
  ('mentions-legales', 'Mentions légales', ''),
  ('cgv', 'Conditions générales de vente', ''),
  ('confidentialite', 'Politique de confidentialité', ''),
  ('cookies', 'Politique de cookies', ''),
  ('livraison-retours', 'Livraison et retours', ''),
  ('formulaire-retractation', 'Formulaire type de rétractation', '')
ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content
WHERE public.legal_pages.content ILIKE '%contenu à compléter%'
   OR public.legal_pages.content ILIKE '%contenu à initialiser%';
