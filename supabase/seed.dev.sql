-- =============================================================================
-- Tilouki — Seed DÉVELOPPEMENT UNIQUEMENT
-- ⛔ Ne jamais exécuter en production.
--
-- Structure boutique (paramètres, catégories, pages légales).
-- Les 12 produits de démo sont dans seed.dev-products.sql (chargé ensuite).
-- =============================================================================

-- Enrichit la ligne bootstrap (migration shop_settings_bootstrap) avec des valeurs dev
UPDATE public.shop_settings SET
  legal_name = 'Prénom Nom (dev)',
  legal_status = 'Auto-entrepreneur',
  address = '1 rue de la Démo, 75001 Paris',
  email = 'contact@tilouki.fr',
  phone = '0600000000',
  host_phone = 'support@vercel.com',
  return_policy = 'Frais de retour à la charge du client sauf erreur du vendeur. Remboursement sous 14 jours après réception du retour (dev).',
  exchange_policy = 'Retour puis nouvelle commande sous réserve du stock (dev).';

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
