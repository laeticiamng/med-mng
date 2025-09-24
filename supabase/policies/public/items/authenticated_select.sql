-- Restrict catalog reads to authenticated users only.
DROP POLICY IF EXISTS items_select ON public.items;
CREATE POLICY items_select ON public.items
  FOR SELECT TO authenticated
  USING (true);
