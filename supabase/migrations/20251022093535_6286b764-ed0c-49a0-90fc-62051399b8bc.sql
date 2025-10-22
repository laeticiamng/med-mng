-- Nettoyage des tables doublons et optimisation

-- 1. Supprimer les anciennes tables backup qui ne sont plus nécessaires
DROP TABLE IF EXISTS backup_edn_items_immersive CASCADE;
DROP TABLE IF EXISTS backup_edn_items_immersive_final CASCADE;

-- 2. Supprimer l'ancienne table edn_items si elle n'est plus utilisée
DROP TABLE IF EXISTS edn_items CASCADE;

-- 3. Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_edn_items_immersive_item_code 
  ON edn_items_immersive(item_code);

CREATE INDEX IF NOT EXISTS idx_backup_oic_competences_item_parent 
  ON backup_oic_competences(item_parent, rang);

CREATE INDEX IF NOT EXISTS idx_edn_items_immersive_sections_a 
  ON edn_items_immersive USING gin ((tableau_rang_a->'sections'));

CREATE INDEX IF NOT EXISTS idx_edn_items_immersive_sections_b 
  ON edn_items_immersive USING gin ((tableau_rang_b->'sections'));

-- 4. Commentaires pour documentation
COMMENT ON TABLE edn_items_immersive IS 'Table principale contenant tous les items EDN avec leur contenu pédagogique complet';
COMMENT ON TABLE backup_oic_competences IS 'Compétences OIC officielles de référence (4872 compétences)';
COMMENT ON TABLE edn_items_complete IS 'Vue synthétique des items EDN avec métriques de complétude';
