-- Vider toutes les paroles existantes pour les régénérer avec la nouvelle structure 4 couplets + refrains
UPDATE edn_items_complete 
SET paroles_musicales = NULL 
WHERE paroles_musicales IS NOT NULL;