CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS id uuid;

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS slug text;

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS title text;

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.items
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.items
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.items
  ALTER COLUMN title SET NOT NULL;

ALTER TABLE public.items
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.items
  ALTER COLUMN created_at SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE public.items
    ADD CONSTRAINT items_slug_key UNIQUE (slug);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.item_competences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  rang text NOT NULL,
  label text NOT NULL,
  idx int NOT NULL DEFAULT 0
);

ALTER TABLE public.item_competences
  ADD COLUMN IF NOT EXISTS id uuid;

ALTER TABLE public.item_competences
  ADD COLUMN IF NOT EXISTS item_id uuid;

ALTER TABLE public.item_competences
  ADD COLUMN IF NOT EXISTS rang text;

ALTER TABLE public.item_competences
  ADD COLUMN IF NOT EXISTS label text;

ALTER TABLE public.item_competences
  ADD COLUMN IF NOT EXISTS idx int DEFAULT 0;

ALTER TABLE public.item_competences
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.item_competences
  ALTER COLUMN item_id SET NOT NULL;

ALTER TABLE public.item_competences
  ALTER COLUMN rang SET NOT NULL;

ALTER TABLE public.item_competences
  ALTER COLUMN label SET NOT NULL;

ALTER TABLE public.item_competences
  ALTER COLUMN idx SET DEFAULT 0;

ALTER TABLE public.item_competences
  ALTER COLUMN idx SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE public.item_competences
    ADD CONSTRAINT item_competences_pkey PRIMARY KEY (id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE public.item_competences
    ADD CONSTRAINT item_competences_rang_check CHECK (rang IN ('A', 'B'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE public.item_competences
    ADD CONSTRAINT item_competences_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE public.item_competences
    ADD CONSTRAINT item_competences_unique UNIQUE (item_id, rang, idx);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE OR REPLACE VIEW public.item_with_competences AS
SELECT
  i.id AS item_id,
  i.slug,
  i.title,
  i.description,
  COALESCE(
    jsonb_agg(
      jsonb_build_object('rang', c.rang, 'idx', c.idx, 'label', c.label)
      ORDER BY c.rang, c.idx
    )
    FILTER (WHERE c.id IS NOT NULL),
    '[]'::jsonb
  ) AS competences
FROM public.items i
LEFT JOIN public.item_competences c ON c.item_id = i.id
GROUP BY i.id;
