-- Paramètres légaux complémentaires + page formulaire de rétractation

ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS mediation_url TEXT,
  ADD COLUMN IF NOT EXISTS rep_idu TEXT,
  ADD COLUMN IF NOT EXISTS host_name TEXT,
  ADD COLUMN IF NOT EXISTS host_address TEXT,
  ADD COLUMN IF NOT EXISTS host_phone TEXT;

INSERT INTO public.legal_pages (slug, title, content)
VALUES (
  'formulaire-retractation',
  'Formulaire type de rétractation',
  '<p>Contenu à initialiser depuis l''administration (bouton « Restaurer le modèle »).</p>'
)
ON CONFLICT (slug) DO NOTHING;
