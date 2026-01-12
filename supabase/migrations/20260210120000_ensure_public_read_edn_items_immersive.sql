-- Ensure public read access remains available on edn_items_immersive
ALTER TABLE public.edn_items_immersive ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'edn_items_immersive'
      AND cmd = 'SELECT'
      AND (roles IS NULL OR roles = '{public}'::text[])
  ) THEN
    CREATE POLICY "Public can read EDN items"
      ON public.edn_items_immersive
      FOR SELECT
      TO public
      USING (true);
  END IF;
END$$;
