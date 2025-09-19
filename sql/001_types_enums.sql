DO $$
BEGIN
  CREATE TYPE public.music_mode AS ENUM ('A', 'B', 'AB');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE DOMAIN public.ms AS integer CHECK (VALUE >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
