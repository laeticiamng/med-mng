-- MED MNG : les colonnes competences_count_rang_a / competences_count_rang_b
-- d'edn_items_complete doivent refléter les compétences OIC réelles (LiSA 2026).
-- 11 items annonçaient 8 à 10 compétences de rang B alors que LiSA n'en publie
-- aucune pour eux (IC-1, 29, 48, 59, 137, 140, 164, 180, 212, 269, 330).
-- Recalcul générique et idempotent à partir d'oic_competences (identifiants
-- au format OIC-nnn-nn-R ; les lignes techniques IC-n-A/B sont ignorées).
UPDATE public.edn_items_complete e
SET competences_count_rang_a = COALESCE(c.a, 0),
    competences_count_rang_b = COALESCE(c.b, 0)
FROM (
  SELECT (substring(objectif_id FROM '^OIC-(\d{3})-'))::int AS item_num,
         count(*) FILTER (WHERE objectif_id ~ '-A$') AS a,
         count(*) FILTER (WHERE objectif_id ~ '-B$') AS b
  FROM public.oic_competences
  WHERE objectif_id ~ '^OIC-\d{3}-\d{2}-[AB]$'
  GROUP BY 1
) c
WHERE (substring(e.item_code FROM '^IC-(\d+)$'))::int = c.item_num
  AND (COALESCE(e.competences_count_rang_a, -1) <> COALESCE(c.a, 0)
    OR COALESCE(e.competences_count_rang_b, -1) <> COALESCE(c.b, 0));
