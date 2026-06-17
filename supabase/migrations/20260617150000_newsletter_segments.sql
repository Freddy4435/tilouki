-- Segments newsletter (taille repérée, rituel consulté)
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS segment_size TEXT,
  ADD COLUMN IF NOT EXISTS segment_ritual TEXT;

ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_segment_size_length CHECK (
    segment_size IS NULL OR char_length(trim(segment_size)) BETWEEN 1 AND 64
  ),
  ADD CONSTRAINT newsletter_subscribers_segment_ritual_length CHECK (
    segment_ritual IS NULL OR char_length(trim(segment_ritual)) BETWEEN 1 AND 64
  );

COMMENT ON COLUMN public.newsletter_subscribers.segment_size IS
  'Taille ou tranche d''âge associée à l''inscription (alerte arrivage ciblée).';
COMMENT ON COLUMN public.newsletter_subscribers.segment_ritual IS
  'Slug rituel ou capsule associé à l''inscription.';
