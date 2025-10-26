-- Permettre la lecture publique des compétences OIC
-- Ces données sont des compétences médicales UNESS publiques, non sensibles

CREATE POLICY "Allow public read access to OIC competences"
ON public.backup_oic_competences
FOR SELECT
TO public
USING (true);