-- Pack photos Tilouki 2026 — visuels catégories (enfant, pyjama, pluie…)

UPDATE public.categories
SET image_url = '/images/tilouki/01-categories/categorie-bebe-combinaison-grise.jpg'
WHERE slug = 'bebe'
  AND (image_url IS NULL OR image_url LIKE '%.svg' OR image_url LIKE '/editorial/%');

UPDATE public.categories
SET image_url = '/images/tilouki/01-categories/categorie-fille-look-doux.jpg'
WHERE slug = 'fille'
  AND (image_url IS NULL OR image_url LIKE '%.svg' OR image_url LIKE '/editorial/%');

UPDATE public.categories
SET image_url = '/images/tilouki/01-categories/categorie-garcon-look-moderne.jpg'
WHERE slug = 'garcon'
  AND (image_url IS NULL OR image_url LIKE '%.svg' OR image_url LIKE '/editorial/%');

UPDATE public.categories
SET image_url = '/images/tilouki/01-categories/categorie-pyjama-fille-doudou.jpg'
WHERE slug = 'pyjamas'
  AND (image_url IS NULL OR image_url LIKE '%.svg' OR image_url LIKE '/editorial/%');

UPDATE public.categories
SET image_url = '/images/tilouki/01-categories/categorie-accessoires-bebe-chaussettes.jpg'
WHERE slug = 'accessoires'
  AND (image_url IS NULL OR image_url LIKE '%.svg' OR image_url LIKE '/editorial/%');
