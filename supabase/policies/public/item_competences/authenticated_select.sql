-- Restrict competence catalog reads to authenticated users only.
DROP POLICY IF EXISTS ic_select ON public.item_competences;
CREATE POLICY ic_select ON public.item_competences
  FOR SELECT TO authenticated
  USING (true);
