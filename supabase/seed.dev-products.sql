-- =============================================================================
-- Tilouki — Produits de DÉMONSTRATION (DÉVELOPPEMENT UNIQUEMENT)
-- =============================================================================
--
-- ⛔ NE JAMAIS EXÉCUTER EN PRODUCTION
--
-- Contenu : 12 produits enfants fictifs avec variantes, stock, poids et images
-- locales (/demo-products/*.svg). SKU préfixés DEV- pour purge sans risque.
--
-- Chargement :
--   Local  : inclus dans `supabase db reset` (config.toml)
--   Cloud  : npm run seed:dev  (nécessite supabase link)
--
-- =============================================================================

DELETE FROM public.products
WHERE slug IN (
  'body-bebe-coton-naturel',
  'gigoteuse-nuages-bebe',
  'robe-liberty-fleurie',
  'sweat-capuche-fille',
  'tshirt-dinosaure-garcon',
  'pantalon-jogger-garcon',
  'pyjama-etoiles',
  'pyjama-combi-hiver',
  'bonnet-doux-maille',
  'chaussettes-coton-lot3',
  'debardeur-fille-ete',
  'short-garcon-promo'
);

-- -----------------------------------------------------------------------------
-- Produits
-- -----------------------------------------------------------------------------

INSERT INTO public.products (
  id, category_id, name, slug, short_description, description,
  material, season, brand_label, made_in, care_instructions, gender, status,
  created_at
) VALUES
  (
    'b1000001-0001-4000-8000-000000000001',
    (SELECT id FROM public.categories WHERE slug = 'bebe'),
    'Body bébé coton naturel',
    'body-bebe-coton-naturel',
    'Body doux en coton bio, pressions à l''entrejambe.',
    'Body bébé en coton biologique, idéal pour les premiers mois. Coupe confortable et finitions soignées.',
    '100 % coton bio', 'Toute saison', 'Tilouki démo', 'Portugal',
    'Lavage 30 °C, séchage à l''air libre.', 'mixte', 'active',
    timezone('utc', now()) - interval '12 days'
  ),
  (
    'b1000002-0002-4000-8000-000000000002',
    (SELECT id FROM public.categories WHERE slug = 'bebe'),
    'Gigoteuse nuages',
    'gigoteuse-nuages-bebe',
    'Gigoteuse légère imprimée nuages, fermeture éclair.',
    'Gigoteuse douce pour des nuits sereines. Matière respirante et zip de sécurité.',
    '100 % coton', 'Automne-hiver', 'Tilouki démo', 'France',
    'Lavage 30 °C.', 'mixte', 'active',
    timezone('utc', now()) - interval '11 days'
  ),
  (
    'b1000003-0003-4000-8000-000000000003',
    (SELECT id FROM public.categories WHERE slug = 'fille'),
    'Robe liberty fleurie',
    'robe-liberty-fleurie',
    'Robe légère imprimé liberty, parfaite pour le printemps.',
    'Robe fille en coton imprimé liberty. Coupe évasée et finitions délicates.',
    '100 % coton', 'Printemps-été', 'Tilouki démo', 'Portugal',
    'Lavage 30 °C, repassage doux.', 'fille', 'active',
    timezone('utc', now()) - interval '10 days'
  ),
  (
    'b1000004-0004-4000-8000-000000000004',
    (SELECT id FROM public.categories WHERE slug = 'fille'),
    'Sweat capuche fille',
    'sweat-capuche-fille',
    'Sweat molletonné doux avec capuche et poche kangourou.',
    'Sweat confortable pour l''école et le week-end. Intérieur gratté tout doux.',
    '80 % coton, 20 % polyester', 'Automne-hiver', 'Tilouki démo', 'Turquie',
    'Lavage 30 °C, ne pas sécher en machine.', 'fille', 'active',
    timezone('utc', now()) - interval '9 days'
  ),
  (
    'b1000005-0005-4000-8000-000000000005',
    (SELECT id FROM public.categories WHERE slug = 'garcon'),
    'T-shirt dinosaure',
    'tshirt-dinosaure-garcon',
    'T-shirt imprimé dinosaures, col rond.',
    'T-shirt garçon en coton peigné, imprimé résistant aux lavages.',
    '100 % coton', 'Printemps-été', 'Tilouki démo', 'Bangladesh',
    'Lavage 30 °C, retourner avant lavage.', 'garcon', 'active',
    timezone('utc', now()) - interval '8 days'
  ),
  (
    'b1000006-0006-4000-8000-000000000006',
    (SELECT id FROM public.categories WHERE slug = 'garcon'),
    'Pantalon jogger',
    'pantalon-jogger-garcon',
    'Jogger confortable avec taille élastiquée.',
    'Pantalon jogger garçon, coupe ample et chevilles resserrées.',
    '95 % coton, 5 % élasthanne', 'Toute saison', 'Tilouki démo', 'Turquie',
    'Lavage 30 °C.', 'garcon', 'active',
    timezone('utc', now()) - interval '7 days'
  ),
  (
    'b1000007-0007-4000-8000-000000000007',
    (SELECT id FROM public.categories WHERE slug = 'pyjamas'),
    'Pyjama deux pièces étoiles',
    'pyjama-etoiles',
    'Ensemble pyjama imprimé étoiles, t-shirt + pantalon.',
    'Pyjama doux pour des nuits paisibles. Coton certifié Oeko-Tex.',
    '100 % coton', 'Automne-hiver', 'Tilouki démo', 'Portugal',
    'Lavage 30 °C.', 'mixte', 'active',
    timezone('utc', now()) - interval '6 days'
  ),
  (
    'b1000008-0008-4000-8000-000000000008',
    (SELECT id FROM public.categories WHERE slug = 'pyjamas'),
    'Pyjama combi hiver',
    'pyjama-combi-hiver',
    'Combinaison pyjama chaude, pieds intégrés.',
    'Pyjama combi bien chaud pour l''hiver. Ouverture pressions devant.',
    '100 % coton gratté', 'Automne-hiver', 'Tilouki démo', 'France',
    'Lavage 30 °C.', 'mixte', 'active',
    timezone('utc', now()) - interval '5 days'
  ),
  (
    'b1000009-0009-4000-8000-000000000009',
    (SELECT id FROM public.categories WHERE slug = 'accessoires'),
    'Bonnet doux maille',
    'bonnet-doux-maille',
    'Bonnet en maille douce, revers côtelé.',
    'Bonnet doux pour protéger les oreilles. Maille extensible et confortable.',
    '100 % coton', 'Automne-hiver', 'Tilouki démo', 'France',
    'Lavage main ou programme laine.', 'mixte', 'active',
    timezone('utc', now()) - interval '4 days'
  ),
  (
    'b1000010-0010-4000-8000-000000000010',
    (SELECT id FROM public.categories WHERE slug = 'accessoires'),
    'Lot chaussettes coton x3',
    'chaussettes-coton-lot3',
    'Lot de 3 paires de chaussettes en coton.',
    'Chaussettes douces anti-glisse, lot de 3 coloris assortis.',
    '75 % coton, 23 % polyamide, 2 % élasthanne', 'Toute saison', 'Tilouki démo', 'France',
    'Lavage 30 °C.', 'mixte', 'active',
    timezone('utc', now()) - interval '3 days'
  ),
  (
    'b1000011-0011-4000-8000-000000000011',
    (SELECT id FROM public.categories WHERE slug = 'fille'),
    'Débardeur fille été',
    'debardeur-fille-ete',
    'Débardeur léger en coton, petit prix.',
    'Débardeur fille parfait pour les journées chaudes. Coupe ajustée et bretelles fines.',
    '100 % coton', 'Printemps-été', 'Tilouki démo', 'Portugal',
    'Lavage 30 °C.', 'fille', 'active',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    'b1000012-0012-4000-8000-000000000012',
    (SELECT id FROM public.categories WHERE slug = 'garcon'),
    'Short garçon promo',
    'short-garcon-promo',
    'Short en coton, prix promo.',
    'Short garçon confortable avec cordon de serrage. Idéal pour jouer dehors.',
    '100 % coton', 'Printemps-été', 'Tilouki démo', 'Bangladesh',
    'Lavage 30 °C.', 'garcon', 'active',
    timezone('utc', now()) - interval '1 day'
  );

-- -----------------------------------------------------------------------------
-- Images (chemins locaux — jamais example.com)
-- -----------------------------------------------------------------------------

INSERT INTO public.product_images (id, product_id, url, alt, sort_order) VALUES
  ('c1000001-0001-4000-8000-000000000001', 'b1000001-0001-4000-8000-000000000001', '/demo-products/body-bebe-coton-naturel.svg', 'Body bébé coton naturel — visuel démo', 0),
  ('c1000002-0002-4000-8000-000000000002', 'b1000002-0002-4000-8000-000000000002', '/demo-products/gigoteuse-nuages-bebe.svg', 'Gigoteuse nuages — visuel démo', 0),
  ('c1000003-0003-4000-8000-000000000003', 'b1000003-0003-4000-8000-000000000003', '/demo-products/robe-liberty-fleurie.svg', 'Robe liberty fleurie — visuel démo', 0),
  ('c1000004-0004-4000-8000-000000000004', 'b1000004-0004-4000-8000-000000000004', '/demo-products/sweat-capuche-fille.svg', 'Sweat capuche fille — visuel démo', 0),
  ('c1000005-0005-4000-8000-000000000005', 'b1000005-0005-4000-8000-000000000005', '/demo-products/tshirt-dinosaure-garcon.svg', 'T-shirt dinosaure — visuel démo', 0),
  ('c1000006-0006-4000-8000-000000000006', 'b1000006-0006-4000-8000-000000000006', '/demo-products/pantalon-jogger-garcon.svg', 'Pantalon jogger — visuel démo', 0),
  ('c1000007-0007-4000-8000-000000000007', 'b1000007-0007-4000-8000-000000000007', '/demo-products/pyjama-etoiles.svg', 'Pyjama étoiles — visuel démo', 0),
  ('c1000008-0008-4000-8000-000000000008', 'b1000008-0008-4000-8000-000000000008', '/demo-products/pyjama-combi-hiver.svg', 'Pyjama combi hiver — visuel démo', 0),
  ('c1000009-0009-4000-8000-000000000009', 'b1000009-0009-4000-8000-000000000009', '/demo-products/bonnet-doux-maille.svg', 'Bonnet doux maille — visuel démo', 0),
  ('c1000010-0010-4000-8000-000000000010', 'b1000010-0010-4000-8000-000000000010', '/demo-products/chaussettes-coton-lot3.svg', 'Lot chaussettes coton — visuel démo', 0),
  ('c1000011-0011-4000-8000-000000000011', 'b1000011-0011-4000-8000-000000000011', '/demo-products/debardeur-fille-ete.svg', 'Débardeur fille été — visuel démo', 0),
  ('c1000012-0012-4000-8000-000000000012', 'b1000012-0012-4000-8000-000000000012', '/demo-products/short-garcon-promo.svg', 'Short garçon promo — visuel démo', 0);

-- -----------------------------------------------------------------------------
-- Variantes (≥ 2 par produit : taille/âge, stock, poids, prix)
-- -----------------------------------------------------------------------------

INSERT INTO public.product_variants (
  id, product_id, sku, size_label, age_label, color,
  price_cents, compare_at_price_cents, stock_quantity, weight_grams, is_active
) VALUES
  -- Body bébé
  ('a1000001-0001-4000-8000-000000000001', 'b1000001-0001-4000-8000-000000000001', 'DEV-BODY-BEBE-3M', '3 mois', '0-3 mois', 'Naturel', 1290, NULL, 12, 150, true),
  ('a1000002-0002-4000-8000-000000000002', 'b1000001-0001-4000-8000-000000000001', 'DEV-BODY-BEBE-6M', '6 mois', '3-6 mois', 'Naturel', 1390, NULL, 8, 160, true),
  -- Gigoteuse (stock bas pour badge « Dernières pièces »)
  ('a1000003-0003-4000-8000-000000000003', 'b1000002-0002-4000-8000-000000000002', 'DEV-GIGO-0-6', '0-6 mois', '0-6 mois', 'Bleu nuage', 3490, NULL, 2, 280, true),
  ('a1000004-0004-4000-8000-000000000004', 'b1000002-0002-4000-8000-000000000002', 'DEV-GIGO-6-12', '6-12 mois', '6-12 mois', 'Bleu nuage', 3690, NULL, 6, 300, true),
  -- Robe liberty (promo)
  ('a1000005-0005-4000-8000-000000000005', 'b1000003-0003-4000-8000-000000000003', 'DEV-ROBE-4A', '4 ans', '3-4 ans', 'Liberty rose', 2790, 3490, 5, 180, true),
  ('a1000006-0006-4000-8000-000000000006', 'b1000003-0003-4000-8000-000000000003', 'DEV-ROBE-6A', '6 ans', '5-6 ans', 'Liberty rose', 2990, 3490, 4, 190, true),
  -- Sweat fille
  ('a1000007-0007-4000-8000-000000000007', 'b1000004-0004-4000-8000-000000000004', 'DEV-SWEAT-6A', '6 ans', '5-6 ans', 'Rose poudré', 2490, NULL, 7, 220, true),
  ('a1000008-0008-4000-8000-000000000008', 'b1000004-0004-4000-8000-000000000004', 'DEV-SWEAT-8A', '8 ans', '7-8 ans', 'Rose poudré', 2590, NULL, 5, 240, true),
  -- T-shirt garçon
  ('a1000009-0009-4000-8000-000000000009', 'b1000005-0005-4000-8000-000000000005', 'DEV-TSHIRT-4A', '4 ans', '3-4 ans', 'Vert sauge', 1890, NULL, 10, 90, true),
  ('a1000010-0010-4000-8000-000000000010', 'b1000005-0005-4000-8000-000000000005', 'DEV-TSHIRT-6A', '6 ans', '5-6 ans', 'Vert sauge', 1990, NULL, 9, 100, true),
  -- Jogger garçon
  ('a1000011-0011-4000-8000-000000000011', 'b1000006-0006-4000-8000-000000000006', 'DEV-JOG-6A', '6 ans', '5-6 ans', 'Gris chiné', 2290, NULL, 6, 200, true),
  ('a1000012-0012-4000-8000-000000000012', 'b1000006-0006-4000-8000-000000000006', 'DEV-JOG-8A', '8 ans', '7-8 ans', 'Gris chiné', 2390, NULL, 4, 210, true),
  -- Pyjama étoiles
  ('a1000013-0013-4000-8000-000000000013', 'b1000007-0007-4000-8000-000000000007', 'DEV-PJ-ETO-4A', '4 ans', '3-4 ans', 'Bleu nuit', 2690, NULL, 8, 250, true),
  ('a1000014-0014-4000-8000-000000000014', 'b1000007-0007-4000-8000-000000000007', 'DEV-PJ-ETO-6A', '6 ans', '5-6 ans', 'Bleu nuit', 2790, NULL, 7, 260, true),
  -- Pyjama combi
  ('a1000015-0015-4000-8000-000000000015', 'b1000008-0008-4000-8000-000000000008', 'DEV-PJ-COM-12M', '12 mois', '9-12 mois', 'Crème', 3190, NULL, 5, 320, true),
  ('a1000016-0016-4000-8000-000000000016', 'b1000008-0008-4000-8000-000000000008', 'DEV-PJ-COM-18M', '18 mois', '12-18 mois', 'Crème', 3290, NULL, 4, 340, true),
  -- Bonnet
  ('a1000017-0017-4000-8000-000000000017', 'b1000009-0009-4000-8000-000000000009', 'DEV-BON-0-12', '0-12 mois', '0-12 mois', 'Rose', 1290, NULL, 15, 45, true),
  ('a1000018-0018-4000-8000-000000000018', 'b1000009-0009-4000-8000-000000000009', 'DEV-BON-1-3A', '1-3 ans', '1-3 ans', 'Rose', 1390, NULL, 11, 50, true),
  -- Chaussettes (petit prix)
  ('a1000019-0019-4000-8000-000000000019', 'b1000010-0010-4000-8000-000000000010', 'DEV-CHAUS-12-18', '12-18 mois', '12-18 mois', 'Assorti', 990, NULL, 20, 60, true),
  ('a1000020-0020-4000-8000-000000000020', 'b1000010-0010-4000-8000-000000000010', 'DEV-CHAUS-2-3A', '2-3 ans', '2-3 ans', 'Assorti', 1090, NULL, 18, 65, true),
  -- Débardeur (petit prix < 15 €)
  ('a1000021-0021-4000-8000-000000000021', 'b1000011-0011-4000-8000-000000000011', 'DEV-DEB-4A', '4 ans', '3-4 ans', 'Blanc', 1190, NULL, 14, 70, true),
  ('a1000022-0022-4000-8000-000000000022', 'b1000011-0011-4000-8000-000000000011', 'DEV-DEB-6A', '6 ans', '5-6 ans', 'Blanc', 1290, NULL, 12, 75, true),
  -- Short promo
  ('a1000023-0023-4000-8000-000000000023', 'b1000012-0012-4000-8000-000000000012', 'DEV-SHORT-6A', '6 ans', '5-6 ans', 'Bleu', 1490, 1990, 9, 120, true),
  ('a1000024-0024-4000-8000-000000000024', 'b1000012-0012-4000-8000-000000000012', 'DEV-SHORT-8A', '8 ans', '7-8 ans', 'Bleu', 1590, 2090, 7, 130, true);
