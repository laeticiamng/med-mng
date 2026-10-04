-- Décision CEO (03.10.2026) : retrait des compétences de rang B absentes du référentiel EDN
-- (identifiants OIC-xxx-01-B-nn non officiels) sur 10 items sans rang B officiel :
-- IC-1, 29, 48, 59, 137, 140, 164, 180, 212, 330 (liste des doyens 2021 + import LiSA 2026).
-- IC-269 non touché (preuve incertaine). Sauvegarde intégrale avant retrait. Appliqué le 03.10.2026.
CREATE TABLE IF NOT EXISTS public.mm_sauvegarde_rang_b_hors_referentiel (
  table_source TEXT NOT NULL, item_code TEXT NOT NULL, competences_oic_rang_b JSONB, tableau_rang_b JSONB,
  competences_count_rang_b INTEGER, competences_count_total INTEGER, sauvegarde_le TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mm_sauvegarde_rang_b_hors_referentiel ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mm_sauvegarde_rang_b_hors_referentiel FROM anon, authenticated;
-- (copie des 10 + 10 lignes puis mise à NULL de competences_oic_rang_b / tableau_rang_b et compteurs
--  recalculés dans edn_items_complete et edn_items_immersive — déjà exécuté, non rejoué ici)
