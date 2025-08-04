-- Vider toutes les paroles existantes pour les régénérer avec du contenu spécifique
UPDATE edn_items_complete 
SET paroles_musicales = NULL 
WHERE paroles_musicales IS NOT NULL;