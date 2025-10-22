-- Correction du problème SECURITY DEFINER sur la vue
-- La vue v_oic_rubriques_summary ne devrait pas avoir SECURITY DEFINER

DROP VIEW IF EXISTS v_oic_rubriques_summary;

CREATE OR REPLACE VIEW v_oic_rubriques_summary 
WITH (security_invoker = true)
AS
SELECT 
  item_parent,
  rang,
  rubrique,
  COUNT(*) as nb_competences,
  array_agg(objectif_id ORDER BY objectif_id) as objectifs
FROM backup_oic_competences
GROUP BY item_parent, rang, rubrique
ORDER BY item_parent, rang, rubrique;