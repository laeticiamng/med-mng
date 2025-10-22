-- Migration: Correction des rubriques OIC pour cohérence médicale
-- Objectif: Remplacer les rubriques génériques par des rubriques médicales pertinentes

-- 1. IC-1 : La relation médecin-malade → Rubriques "Communication" et "Éthique"
UPDATE backup_oic_competences 
SET rubrique = CASE 
  WHEN objectif_id IN ('OIC-001-01-A', 'OIC-001-02-A', 'OIC-001-09-A', 'OIC-001-13-A', 'OIC-001-14-A') THEN 'Communication Médicale'
  WHEN objectif_id IN ('OIC-001-03-A', 'OIC-001-04-A', 'OIC-001-05-A', 'OIC-001-15-A') THEN 'Éthique & Relation Soignant'
  WHEN objectif_id IN ('OIC-001-06-A', 'OIC-001-08-A') THEN 'Annonce & Information Patient'
  WHEN objectif_id IN ('OIC-001-07-A', 'OIC-001-10-A', 'OIC-001-11-A', 'OIC-001-12-A') THEN 'Changement & Alliance Thérapeutique'
  ELSE rubrique
END
WHERE item_parent = '001';

-- 2. Ajouter un commentaire pour traçabilité
COMMENT ON COLUMN backup_oic_competences.rubrique IS 'Rubrique médicale thématique - Corrigée pour cohérence pédagogique';

-- 3. Créer une vue pour vérifier les rubriques par item
CREATE OR REPLACE VIEW v_oic_rubriques_summary AS
SELECT 
  item_parent,
  rang,
  rubrique,
  COUNT(*) as nb_competences,
  array_agg(objectif_id ORDER BY objectif_id) as objectifs
FROM backup_oic_competences
GROUP BY item_parent, rang, rubrique
ORDER BY item_parent, rang, rubrique;