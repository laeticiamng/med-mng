-- MED MNG — registre serveur des générations audio (quota Premium, 04.10.2026)
--
-- CONSTAT : mm-generate-music décompte le quota mensuel (30) sur
-- generated_music_tracks. Or cette table (partagée avec EmotionsCare, dont le
-- front y écrit) a des politiques RLS « ALL / UPDATE / DELETE » sur ses propres
-- lignes : un abonné peut, par l'API REST, passer ses générations à 'failed'
-- ou les supprimer et remettre son compteur à zéro → générations Suno
-- illimitées (facturées à EmotionsCare SASU). Les politiques de
-- generated_music_tracks ne sont pas modifiées ici (risque pour EmotionsCare).
--
-- Registre propre à MED MNG, que seul le serveur écrit :
--   mm-generate-music  → INSERT (task_id, user_id, 'en_cours') après acceptation Suno ;
--   _shared/mm-suno-enregistrement.ts → 'terminee' / 'echouee' (échecs non décomptés).
-- mm-generate-music retient le plus élevé des deux décomptes (historique, registre).
CREATE TABLE IF NOT EXISTS public.mm_generations_audio (
  task_id    TEXT PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  statut     TEXT NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'terminee', 'echouee')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mm_generations_audio_user_mois
  ON public.mm_generations_audio (user_id, created_at DESC);

ALTER TABLE public.mm_generations_audio ENABLE ROW LEVEL SECURITY;

-- Lecture de ses propres lignes uniquement ; aucune écriture hors clé de service.
DROP POLICY IF EXISTS mm_generations_audio_lecture_propre ON public.mm_generations_audio;
CREATE POLICY mm_generations_audio_lecture_propre
  ON public.mm_generations_audio FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

REVOKE ALL ON public.mm_generations_audio FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.mm_generations_audio FROM authenticated;
GRANT SELECT ON public.mm_generations_audio TO authenticated;
GRANT ALL ON public.mm_generations_audio TO service_role;

-- Reprise des générations MED MNG existantes (lignes principales écrites par
-- mm-generate-music : suno_track_id = task_id, metadata.itemCode renseigné).
INSERT INTO public.mm_generations_audio (task_id, user_id, statut, created_at, updated_at)
SELECT g.task_id,
       g.user_id,
       CASE g.generation_status WHEN 'failed' THEN 'echouee' WHEN 'completed' THEN 'terminee' ELSE 'en_cours' END,
       g.created_at,
       COALESCE(g.updated_at, g.created_at)
  FROM public.generated_music_tracks g
 WHERE g.task_id IS NOT NULL
   AND g.suno_track_id = g.task_id
   AND g.user_id IS NOT NULL
   AND g.metadata ? 'itemCode'
   AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = g.user_id)
ON CONFLICT (task_id) DO NOTHING;
