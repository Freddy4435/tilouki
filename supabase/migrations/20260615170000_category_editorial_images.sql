-- Visuels catégories : photos éditoriales sémantiques (enfant, pyjama, pluie…)
-- plutôt que les SVG produit du seed catalogue.

UPDATE public.categories
SET image_url = '/editorial/universe-bebe.webp'
WHERE slug = 'bebe'
  AND (image_url IS NULL OR image_url LIKE '%.svg');

UPDATE public.categories
SET image_url = '/editorial/universe-fille.webp'
WHERE slug = 'fille'
  AND (image_url IS NULL OR image_url LIKE '%.svg');

UPDATE public.categories
SET image_url = '/editorial/universe-garcon.webp'
WHERE slug = 'garcon'
  AND (image_url IS NULL OR image_url LIKE '%.svg');

UPDATE public.categories
SET image_url = '/editorial/night-calm.webp'
WHERE slug = 'pyjamas'
  AND (image_url IS NULL OR image_url LIKE '%.svg');

UPDATE public.categories
SET image_url = '/editorial/universe-accessoires.webp'
WHERE slug = 'accessoires'
  AND (image_url IS NULL OR image_url LIKE '%.svg');
