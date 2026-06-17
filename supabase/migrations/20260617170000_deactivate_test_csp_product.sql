-- Désactive le produit technique de test CSP (non vendable en production).
UPDATE public.products
SET status = 'draft', updated_at = now()
WHERE slug = 'produit-test-csp'
  AND status = 'active';
