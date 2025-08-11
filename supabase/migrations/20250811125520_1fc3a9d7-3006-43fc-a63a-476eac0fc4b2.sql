-- 1) Vue de parsing des compétences à partir de l'identifiant canonique OIC
CREATE OR REPLACE VIEW public.v_competences_parsed AS
SELECT 
  objectif_id,
  intitule,
  description,
  url_source,
  rang,
  item_parent,
  split_part(objectif_id, '-', 2) AS item_id,          -- ex: '001'
  (split_part(objectif_id, '-', 3))::int AS ordre_num, -- ex: 9
  split_part(objectif_id, '-', 4) AS rang_code         -- ex: 'A'/'B'
FROM public.backup_oic_competences;

-- 2) Table des versions de paroles générées
CREATE TABLE IF NOT EXISTS public.edn_lyrics_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id text NOT NULL,                  -- '001' issu du parsing
  item_code text,                         -- optionnel: 'IC-1'
  version text NOT NULL,                  -- 'A' | 'B' | 'A+B'
  texte text[] NOT NULL,                  -- paroles complètes (lignes)
  couverture_json jsonb NOT NULL DEFAULT '[]'::jsonb, -- mapping objectifs -> extraits
  score_couverture numeric NOT NULL DEFAULT 0,
  prompt_hash text,
  texte_hash text,
  valide boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT edn_lyrics_version_chk CHECK (version IN ('A','B','A+B'))
);

-- Index utiles
CREATE INDEX IF NOT EXISTS idx_edn_lyrics_item_version ON public.edn_lyrics_versions (item_id, version);
CREATE UNIQUE INDEX IF NOT EXISTS uq_edn_lyrics_idem_prompt ON public.edn_lyrics_versions (item_id, version, prompt_hash);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_edn_lyrics_versions_updated_at ON public.edn_lyrics_versions;
CREATE TRIGGER trg_edn_lyrics_versions_updated_at
BEFORE UPDATE ON public.edn_lyrics_versions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Activer RLS
ALTER TABLE public.edn_lyrics_versions ENABLE ROW LEVEL SECURITY;

-- Politiques: lecture publique, écriture par service role
DROP POLICY IF EXISTS "Public can read lyrics versions" ON public.edn_lyrics_versions;
CREATE POLICY "Public can read lyrics versions"
ON public.edn_lyrics_versions
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Service role can write lyrics versions" ON public.edn_lyrics_versions;
CREATE POLICY "Service role can write lyrics versions"
ON public.edn_lyrics_versions
FOR ALL
USING ((auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- 3) Table des pistes Suno liées aux paroles
CREATE TABLE IF NOT EXISTS public.edn_suno_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lyrics_version_id uuid NOT NULL REFERENCES public.edn_lyrics_versions(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'suno',
  provider_track_id text,
  status text NOT NULL DEFAULT 'queued',   -- queued | generating | done | failed
  duration integer,
  seed text,
  genre text,
  bpm integer,
  intensity text,
  audio_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_log text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_edn_suno_tracks_lyrics ON public.edn_suno_tracks (lyrics_version_id);

DROP TRIGGER IF EXISTS trg_edn_suno_tracks_updated_at ON public.edn_suno_tracks;
CREATE TRIGGER trg_edn_suno_tracks_updated_at
BEFORE UPDATE ON public.edn_suno_tracks
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.edn_suno_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read suno tracks" ON public.edn_suno_tracks;
CREATE POLICY "Public can read suno tracks"
ON public.edn_suno_tracks
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Service role can write suno tracks" ON public.edn_suno_tracks;
CREATE POLICY "Service role can write suno tracks"
ON public.edn_suno_tracks
FOR ALL
USING ((auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- 4) Table de suivi des jobs (batch/single)
CREATE TABLE IF NOT EXISTS public.edn_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,                  -- 'single' | 'batch'
  item_ids text[],                         -- liste d'items (ex: {'001','002'})
  all_items boolean NOT NULL DEFAULT false,
  versions text[] NOT NULL DEFAULT '{}'::text[],  -- ex: {'A','B','A+B'}
  status text NOT NULL DEFAULT 'pending',  -- pending | running | done | failed
  progress integer NOT NULL DEFAULT 0,
  created_by uuid,
  error_log text,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT edn_job_type_chk CHECK (job_type IN ('single','batch'))
);

CREATE INDEX IF NOT EXISTS idx_edn_jobs_status ON public.edn_generation_jobs (status);

DROP TRIGGER IF EXISTS trg_edn_generation_jobs_updated_at ON public.edn_generation_jobs;
CREATE TRIGGER trg_edn_generation_jobs_updated_at
BEFORE UPDATE ON public.edn_generation_jobs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.edn_generation_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read jobs" ON public.edn_generation_jobs;
CREATE POLICY "Public can read jobs"
ON public.edn_generation_jobs
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Service role can write jobs" ON public.edn_generation_jobs;
CREATE POLICY "Service role can write jobs"
ON public.edn_generation_jobs
FOR ALL
USING ((auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');