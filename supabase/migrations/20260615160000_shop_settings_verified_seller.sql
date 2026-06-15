-- =============================================================================
-- Identité vendeuse — valeurs publiques vérifiées (SIRET 10462384800017)
-- Idempotent : ne remplit que les champs NULL ou vides.
-- Téléphone, e-mail client, médiateur et REP IDU restent à compléter en admin.
-- Source : recherche-entreprises.api.gouv.fr (2026-06-15)
-- =============================================================================

UPDATE public.shop_settings
SET
  legal_name = COALESCE(NULLIF(trim(legal_name), ''), 'Alizée Peltier'),
  legal_status = COALESCE(NULLIF(trim(legal_status), ''), 'Entrepreneur individuel (EI)'),
  siret = COALESCE(NULLIF(trim(siret), ''), '10462384800017'),
  address = COALESCE(
    NULLIF(trim(address), ''),
    '1 impasse des Perrières, 44117 Saint-André-des-Eaux'
  ),
  updated_at = timezone('utc', now())
WHERE legal_name IS NULL
   OR trim(legal_name) = ''
   OR legal_status IS NULL
   OR trim(legal_status) = ''
   OR siret IS NULL
   OR trim(siret) = ''
   OR address IS NULL
   OR trim(address) = '';

COMMENT ON COLUMN public.shop_settings.legal_name IS
  'Nom légal / raison sociale — vérifier en admin avant publication.';
