-- CORRECTION FINALE DU DERNIER PROBLÈME HTML
UPDATE oic_competences 
SET 
    description = REPLACE(REPLACE(description, '&nbsp;', ' '), '  ', ' '),
    intitule = REPLACE(REPLACE(intitule, '&nbsp;', ' '), '  ', ' '),
    updated_at = NOW()
WHERE objectif_id = 'OIC-187-12-A';