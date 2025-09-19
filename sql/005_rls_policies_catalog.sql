-- Policies granting read access on reference tables
DROP POLICY IF EXISTS items_select ON public.items;
CREATE POLICY items_select ON public.items
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS ic_select ON public.item_competences;
CREATE POLICY ic_select ON public.item_competences
  FOR SELECT TO authenticated
  USING (true);

-- Optional public read access (uncomment if anonymous users should read catalogs)
-- GRANT SELECT ON public.items, public.item_competences TO anon;
