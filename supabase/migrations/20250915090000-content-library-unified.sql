-- Create study notes table for personalized annotations
CREATE TABLE IF NOT EXISTS public.study_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  item_code text,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  last_reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_study_notes_user_created_at ON public.study_notes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_notes_tags ON public.study_notes USING gin (tags);

ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'study_notes'
      AND policyname = 'Users manage own study notes'
  ) THEN
    CREATE POLICY "Users manage own study notes"
      ON public.study_notes
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

CREATE TRIGGER set_study_notes_updated_at
  BEFORE UPDATE ON public.study_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Content library collections
CREATE TABLE IF NOT EXISTS public.content_library_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT content_library_collections_unique_name UNIQUE (user_id, lower(name))
);

ALTER TABLE public.content_library_collections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'content_library_collections'
      AND policyname = 'Users manage own collections'
  ) THEN
    CREATE POLICY "Users manage own collections"
      ON public.content_library_collections
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

CREATE TRIGGER set_content_library_collections_updated_at
  BEFORE UPDATE ON public.content_library_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Content library items linking all resource types
CREATE TABLE IF NOT EXISTS public.content_library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('track', 'edn', 'qcm', 'note')),
  resource_identifier text NOT NULL,
  source_table text NOT NULL,
  title text NOT NULL,
  description text,
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_favorite boolean NOT NULL DEFAULT false,
  last_accessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(array_to_string(tags, ' '), '')), 'C')
  ) STORED,
  CONSTRAINT content_library_items_unique_resource UNIQUE (user_id, resource_type, resource_identifier)
);

CREATE INDEX IF NOT EXISTS idx_content_library_items_search ON public.content_library_items USING gin (search_vector);
CREATE INDEX IF NOT EXISTS idx_content_library_items_tags ON public.content_library_items USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_content_library_items_user_created_at ON public.content_library_items(user_id, created_at DESC);

ALTER TABLE public.content_library_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'content_library_items'
      AND policyname = 'Users manage own library items'
  ) THEN
    CREATE POLICY "Users manage own library items"
      ON public.content_library_items
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

CREATE TRIGGER set_content_library_items_updated_at
  BEFORE UPDATE ON public.content_library_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Junction table between library items and collections
CREATE TABLE IF NOT EXISTS public.content_library_collection_items (
  collection_id uuid NOT NULL REFERENCES public.content_library_collections(id) ON DELETE CASCADE,
  library_item_id uuid NOT NULL REFERENCES public.content_library_items(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (collection_id, library_item_id)
);

ALTER TABLE public.content_library_collection_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'content_library_collection_items'
      AND policyname = 'Users manage own collection items'
  ) THEN
    CREATE POLICY "Users manage own collection items"
      ON public.content_library_collection_items
      USING (
        EXISTS (
          SELECT 1
          FROM public.content_library_collections c
          WHERE c.id = content_library_collection_items.collection_id
            AND c.user_id = auth.uid()
        )
        AND EXISTS (
          SELECT 1
          FROM public.content_library_items i
          WHERE i.id = content_library_collection_items.library_item_id
            AND i.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.content_library_collections c
          WHERE c.id = content_library_collection_items.collection_id
            AND c.user_id = auth.uid()
        )
        AND EXISTS (
          SELECT 1
          FROM public.content_library_items i
          WHERE i.id = content_library_collection_items.library_item_id
            AND i.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Unified content catalog view
DROP VIEW IF EXISTS public.content_library_catalog;

CREATE VIEW public.content_library_catalog AS
WITH track_segments AS (
  SELECT
    ls.track_id,
    COUNT(*) AS segment_count,
    MIN(ls.start_ms) AS first_start_ms,
    MAX(ls.end_ms) AS last_end_ms,
    jsonb_agg(
      jsonb_build_object(
        'idx', ls.idx,
        'text', ls.text,
        'start_ms', ls.start_ms,
        'end_ms', ls.end_ms,
        'role', ls.role
      )
      ORDER BY ls.idx
    ) FILTER (WHERE ls.idx <= 4) AS preview_segments,
    string_agg(ls.text, ' / ' ORDER BY ls.idx)
      FILTER (WHERE ls.idx <= 2) AS preview_text
  FROM public.lyrics_segments ls
  GROUP BY ls.track_id
), generated_tracks AS (
  SELECT
    g.id,
    g.user_id,
    g.item_id,
    g.title,
    g.mode,
    g.style,
    g.duration,
    g.status,
    g.metadata,
    g.created_at,
    g.updated_at,
    g.image_url,
    g.stream_url,
    g.audio_url,
    g.openai_prompt_hash,
    g.suno_job_id,
    g.generation_status,
    ei.item_code,
    ei.slug,
    ei.title AS item_title
  FROM public.generated_music_tracks g
  JOIN public.edn_items_immersive ei ON ei.id = g.item_id
), comic_entries AS (
  SELECT
    c.id,
    c.item_id,
    c.comic_panels,
    c.generated_at,
    c.created_at,
    c.updated_at,
    ei.slug,
    ei.title AS item_title
  FROM public.med_mng_content_ai c
  LEFT JOIN public.edn_items_immersive ei ON ei.item_code = c.item_id
)
SELECT
  'track'::text AS resource_type,
  t.id::text AS resource_identifier,
  t.user_id AS owner_id,
  false AS is_public,
  'generated_music_tracks'::text AS source_table,
  COALESCE(NULLIF(t.title, ''), CONCAT('Mix ', t.item_code, ' – ', t.mode)) AS title,
  CONCAT('Mode ', t.mode, ' · Style ', t.style) AS description,
  array_remove(ARRAY[t.item_code, t.mode, t.style, t.item_title], NULL) AS tags,
  jsonb_build_object(
    'item_id', t.item_id,
    'item_code', t.item_code,
    'item_slug', t.slug,
    'item_title', t.item_title,
    'mode', t.mode,
    'style', t.style,
    'duration_seconds', t.duration,
    'status', t.status,
    'generation_status', t.generation_status,
    'suno_job_id', t.suno_job_id,
    'openai_prompt_hash', t.openai_prompt_hash,
    'has_audio', t.audio_url IS NOT NULL OR t.stream_url IS NOT NULL,
    'stream_url', t.stream_url,
    'audio_url', t.audio_url,
    'image_url', t.image_url,
    'segment_count', COALESCE(ts.segment_count, 0)
  ) AS metadata,
  t.created_at,
  t.updated_at
FROM generated_tracks t
LEFT JOIN track_segments ts ON ts.track_id = t.id
UNION ALL
SELECT
  'lyrics'::text AS resource_type,
  t.id::text AS resource_identifier,
  t.user_id AS owner_id,
  false AS is_public,
  'lyrics_segments'::text AS source_table,
  COALESCE(NULLIF(t.title, ''), CONCAT('Segments ', t.item_code)) || ' – Lyrics' AS title,
  CASE
    WHEN ts.segment_count > 0 THEN CONCAT(ts.segment_count, ' segments synchronisés')
    ELSE 'Segments non synchronisés'
  END AS description,
  array_remove(ARRAY[t.item_code, t.mode, t.style, t.item_title], NULL) AS tags,
  jsonb_build_object(
    'item_id', t.item_id,
    'item_code', t.item_code,
    'item_slug', t.slug,
    'item_title', t.item_title,
    'mode', t.mode,
    'style', t.style,
    'segment_count', COALESCE(ts.segment_count, 0),
    'preview_segments', COALESCE(ts.preview_segments, '[]'::jsonb),
    'preview_text', ts.preview_text,
    'has_segments', COALESCE(ts.segment_count, 0) > 0,
    'first_start_ms', ts.first_start_ms,
    'last_end_ms', ts.last_end_ms
  ) AS metadata,
  t.created_at,
  t.updated_at
FROM generated_tracks t
LEFT JOIN track_segments ts ON ts.track_id = t.id
UNION ALL
SELECT
  'edn'::text AS resource_type,
  e.item_code AS resource_identifier,
  NULL::uuid AS owner_id,
  true AS is_public,
  'edn_unified_materialized'::text AS source_table,
  e.title,
  COALESCE(e.specialite, '') || CASE WHEN e.domaine_medical IS NOT NULL THEN ' · ' || e.domaine_medical ELSE '' END AS description,
  array_remove(array_cat(COALESCE(e.tags_medicaux, ARRAY[]::text[]), ARRAY[e.slug, e.specialite, e.domaine_medical, e.item_code]), NULL) AS tags,
  jsonb_build_object(
    'item_code', e.item_code,
    'item_slug', e.slug,
    'rang_a', e.rang_a_competence_count,
    'rang_b', e.rang_b_competence_count,
    'valeurs_professionnelles', e.valeurs_professionnelles,
    'oic', e.competences_oic
  ) AS metadata,
  e.created_at,
  e.updated_at
FROM public.edn_unified_materialized e
UNION ALL
SELECT
  'qcm'::text AS resource_type,
  qs.id::text AS resource_identifier,
  qs.user_id AS owner_id,
  false AS is_public,
  'med_mng_qcm_sessions'::text AS source_table,
  CONCAT('QCM ', qs.item_id) AS title,
  CASE WHEN qs.score IS NOT NULL THEN CONCAT('Score ', qs.score, '%') ELSE NULL END AS description,
  array_remove(ARRAY[qs.type, qs.item_id], NULL) AS tags,
  jsonb_build_object(
    'item_code', qs.item_id,
    'question_count', COALESCE(jsonb_array_length((qs.questions)::jsonb), 0),
    'completed_at', qs.completed_at,
    'errors', qs.errors
  ) AS metadata,
  qs.created_at,
  qs.updated_at
FROM public.med_mng_qcm_sessions qs
UNION ALL
SELECT
  'note'::text AS resource_type,
  n.id::text AS resource_identifier,
  n.user_id AS owner_id,
  false AS is_public,
  'study_notes'::text AS source_table,
  n.title,
  left(n.content, 180) AS description,
  array_remove(array_cat(COALESCE(n.tags, ARRAY[]::text[]), ARRAY[n.item_code]), NULL) AS tags,
  jsonb_build_object(
    'item_code', n.item_code,
    'last_reviewed_at', n.last_reviewed_at,
    'preview', left(n.content, 400)
  ) AS metadata,
  n.created_at,
  n.updated_at
FROM public.study_notes n
UNION ALL
SELECT
  'comic'::text AS resource_type,
  c.id::text AS resource_identifier,
  NULL::uuid AS owner_id,
  true AS is_public,
  'med_mng_content_ai'::text AS source_table,
  COALESCE(
    CASE
      WHEN jsonb_typeof(c.comic_panels) = 'object' THEN c.comic_panels->>'title'
      WHEN jsonb_typeof(c.comic_panels) = 'array' THEN (c.comic_panels->0->>'title')
    END,
    CONCAT('BD ', c.item_id)
  ) AS title,
  CONCAT('Bande dessinée pédagogique · ', COALESCE(c.item_id, '')) AS description,
  array_remove(ARRAY[c.item_id, c.item_title], NULL) AS tags,
  jsonb_build_object(
    'item_code', c.item_id,
    'item_slug', c.slug,
    'item_title', c.item_title,
    'panel_count', CASE
      WHEN jsonb_typeof(c.comic_panels) = 'array' THEN jsonb_array_length(c.comic_panels)
      WHEN jsonb_typeof(c.comic_panels) = 'object' THEN jsonb_array_length(COALESCE(c.comic_panels->'panels', '[]'::jsonb))
      ELSE 0
    END,
    'preview_image', CASE
      WHEN jsonb_typeof(c.comic_panels) = 'array' THEN c.comic_panels->0->>'image'
      ELSE (c.comic_panels->'panels'->0->>'image')
    END,
    'preview_dialogue', CASE
      WHEN jsonb_typeof(c.comic_panels) = 'array' THEN c.comic_panels->0->>'dialogue'
      ELSE (c.comic_panels->'panels'->0->>'dialogue')
    END,
    'generated_at', c.generated_at
  ) AS metadata,
  c.created_at,
  c.updated_at
FROM comic_entries c
WHERE c.comic_panels IS NOT NULL;

-- Helper to fetch user-centric library entries with filters
CREATE OR REPLACE FUNCTION public.get_content_library(
  p_search text DEFAULT NULL,
  p_types text[] DEFAULT NULL,
  p_only_favorites boolean DEFAULT false,
  p_collection_id uuid DEFAULT NULL,
  p_sort text DEFAULT 'recent',
  p_limit integer DEFAULT 24,
  p_offset integer DEFAULT 0,
  p_item_code text DEFAULT NULL,
  p_mode text DEFAULT NULL,
  p_style text DEFAULT NULL
) RETURNS TABLE (
  resource_type text,
  resource_identifier text,
  title text,
  description text,
  tags text[],
  metadata jsonb,
  source_table text,
  created_at timestamptz,
  updated_at timestamptz,
  is_favorite boolean,
  in_library boolean,
  collections jsonb,
  owner_id uuid,
  is_public boolean,
  saved_at timestamptz,
  total_count bigint
) SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_user uuid := auth.uid();
  search_query tsquery;
BEGIN
  IF current_user IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;

  IF p_search IS NOT NULL AND length(trim(p_search)) > 0 THEN
    search_query := websearch_to_tsquery('french', p_search);
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT *
    FROM public.content_library_catalog
    WHERE (owner_id IS NULL OR owner_id = current_user)
  ), annotated AS (
    SELECT
      b.resource_type,
      b.resource_identifier,
      b.title,
      b.description,
      b.tags,
      b.metadata,
      b.source_table,
      b.created_at,
      b.updated_at,
      b.owner_id,
      b.is_public,
      li.id AS library_item_id,
      li.is_favorite,
      li.created_at AS saved_at,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name))
        FILTER (WHERE c.id IS NOT NULL),
        '[]'::json
      ) AS collections
    FROM base b
    LEFT JOIN public.content_library_items li
      ON li.user_id = current_user
     AND li.resource_type = b.resource_type
     AND li.resource_identifier = b.resource_identifier
    LEFT JOIN public.content_library_collection_items lci
      ON lci.library_item_id = li.id
    LEFT JOIN public.content_library_collections c
      ON c.id = lci.collection_id
    GROUP BY
      b.resource_type,
      b.resource_identifier,
      b.title,
      b.description,
      b.tags,
      b.metadata,
      b.source_table,
      b.created_at,
      b.updated_at,
      b.owner_id,
      b.is_public,
      li.id,
      li.is_favorite,
      li.created_at
  )
  SELECT
    a.resource_type,
    a.resource_identifier,
    a.title,
    a.description,
    a.tags,
    a.metadata,
    a.source_table,
    a.created_at,
    a.updated_at,
    COALESCE(a.is_favorite, false),
    a.library_item_id IS NOT NULL AS in_library,
    a.collections,
    a.owner_id,
    a.is_public,
    a.saved_at,
    COUNT(*) OVER() AS total_count
  FROM annotated a
  WHERE (p_types IS NULL OR array_length(p_types, 1) IS NULL OR a.resource_type = ANY(p_types))
    AND (NOT p_only_favorites OR COALESCE(a.is_favorite, false))
    AND (p_collection_id IS NULL OR EXISTS (
      SELECT 1
      FROM jsonb_array_elements(a.collections) elem
      WHERE (elem->>'id')::uuid = p_collection_id
    ))
    AND (search_query IS NULL OR (
      to_tsvector('french', COALESCE(a.title, '') || ' ' || COALESCE(a.description, '') || ' ' || COALESCE(array_to_string(a.tags, ' '), '')) @@ search_query
    ))
    AND (p_item_code IS NULL OR lower(COALESCE(a.metadata->>'item_code', '')) = lower(p_item_code))
    AND (p_mode IS NULL OR lower(COALESCE(a.metadata->>'mode', '')) = lower(p_mode))
    AND (p_style IS NULL OR lower(COALESCE(a.metadata->>'style', '')) = lower(p_style))
  ORDER BY
    CASE WHEN p_sort = 'alphabetical' THEN lower(a.title) END ASC,
    CASE WHEN p_sort = 'recent' THEN COALESCE(a.saved_at, a.created_at) END DESC,
    CASE WHEN p_sort = 'type' THEN a.resource_type END ASC,
    a.title
  LIMIT GREATEST(p_limit, 1)
  OFFSET GREATEST(p_offset, 0);
END;
$$;

-- Helper to ensure catalog entries are persisted for the user
CREATE OR REPLACE FUNCTION public.save_content_library_item(
  p_resource_type text,
  p_resource_identifier text,
  p_is_favorite boolean DEFAULT NULL,
  p_collection_ids uuid[] DEFAULT NULL
) RETURNS public.content_library_items
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_user uuid := auth.uid();
  catalog_row record;
  upserted public.content_library_items%ROWTYPE;
BEGIN
  IF current_user IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;

  SELECT *
  INTO catalog_row
  FROM public.content_library_catalog
  WHERE resource_type = p_resource_type
    AND resource_identifier = p_resource_identifier;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ressource introuvable dans le catalogue';
  END IF;

  IF catalog_row.owner_id IS NOT NULL AND catalog_row.owner_id <> current_user THEN
    RAISE EXCEPTION 'Ressource non autorisée pour cet utilisateur';
  END IF;

  INSERT INTO public.content_library_items (
    user_id,
    resource_type,
    resource_identifier,
    source_table,
    title,
    description,
    tags,
    metadata,
    is_favorite
  ) VALUES (
    current_user,
    p_resource_type,
    p_resource_identifier,
    catalog_row.source_table,
    catalog_row.title,
    catalog_row.description,
    catalog_row.tags,
    catalog_row.metadata,
    COALESCE(p_is_favorite, false)
  )
  ON CONFLICT (user_id, resource_type, resource_identifier)
  DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    metadata = EXCLUDED.metadata,
    updated_at = timezone('utc'::text, now()),
    is_favorite = CASE
      WHEN p_is_favorite IS NULL THEN public.content_library_items.is_favorite
      ELSE p_is_favorite
    END
  RETURNING * INTO upserted;

  IF p_collection_ids IS NOT NULL THEN
    -- ensure collections belong to the user
    PERFORM 1
    FROM unnest(p_collection_ids) cid
    LEFT JOIN public.content_library_collections c ON c.id = cid
    WHERE c.user_id <> current_user OR c.id IS NULL;

    IF FOUND THEN
      RAISE EXCEPTION 'Collection invalide ou non autorisée';
    END IF;

    INSERT INTO public.content_library_collection_items (collection_id, library_item_id)
    SELECT cid, upserted.id
    FROM unnest(p_collection_ids) AS cid
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN upserted;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_content_library_item(
  p_resource_type text,
  p_resource_identifier text
) RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_user uuid := auth.uid();
BEGIN
  IF current_user IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;

  DELETE FROM public.content_library_items
  WHERE user_id = current_user
    AND resource_type = p_resource_type
    AND resource_identifier = p_resource_identifier;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_library_item_to_collection(
  p_resource_type text,
  p_resource_identifier text,
  p_collection_id uuid
) RETURNS public.content_library_items
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_user uuid := auth.uid();
  item public.content_library_items%ROWTYPE;
BEGIN
  IF current_user IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;

  PERFORM 1
  FROM public.content_library_collections
  WHERE id = p_collection_id
    AND user_id = current_user;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Collection introuvable';
  END IF;

  item := public.save_content_library_item(p_resource_type, p_resource_identifier, NULL, ARRAY[p_collection_id]);
  RETURN item;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_library_item_from_collection(
  p_resource_type text,
  p_resource_identifier text,
  p_collection_id uuid
) RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_user uuid := auth.uid();
  item_id uuid;
BEGIN
  IF current_user IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;

  SELECT id
  INTO item_id
  FROM public.content_library_items
  WHERE user_id = current_user
    AND resource_type = p_resource_type
    AND resource_identifier = p_resource_identifier;

  IF item_id IS NULL THEN
    RETURN;
  END IF;

  DELETE FROM public.content_library_collection_items
  USING public.content_library_collections c
  WHERE content_library_collection_items.collection_id = c.id
    AND c.user_id = current_user
    AND content_library_collection_items.collection_id = p_collection_id
    AND content_library_collection_items.library_item_id = item_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_library_collection(
  p_name text,
  p_description text DEFAULT NULL
) RETURNS public.content_library_collections
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_user uuid := auth.uid();
  created public.content_library_collections%ROWTYPE;
BEGIN
  IF current_user IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;

  INSERT INTO public.content_library_collections (name, description, user_id)
  VALUES (p_name, p_description, current_user)
  ON CONFLICT (user_id, lower(name)) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now())
  RETURNING * INTO created;

  RETURN created;
END;
$$;
