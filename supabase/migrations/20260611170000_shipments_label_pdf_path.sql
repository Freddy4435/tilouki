-- Chemin optionnel vers un PDF d'étiquette archivé (bucket storage admin).
-- label_url reste la source principale (URL Mondial Relay).

ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS label_pdf_path TEXT;

COMMENT ON COLUMN public.shipments.label_pdf_path IS
  'Chemin storage d''un PDF d''étiquette archivé (optionnel). label_url = URL transporteur.';
