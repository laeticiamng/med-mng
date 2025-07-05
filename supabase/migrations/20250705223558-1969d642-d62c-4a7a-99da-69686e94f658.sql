-- CORRECTION FINALE DES DESCRIPTIONS TROP COURTES ET PROBLÉMATIQUES

-- Corriger les descriptions trop courtes ou non-informatives
UPDATE oic_competences 
SET 
    description = CASE 
        WHEN objectif_id = 'OIC-290-14-A' THEN 'Critère d''âge pour le diagnostic et la prise en charge'
        WHEN objectif_id = 'OIC-282-06-A' THEN 'Manifestations cutanées associées'
        WHEN objectif_id = 'OIC-288-10-A' THEN 'Classification des stades de la maladie'
        WHEN objectif_id = 'OIC-051-02-B' THEN 'Évaluation et test clinique spécialisé'
        WHEN objectif_id = 'OIC-169-14-A' THEN 'Protocole de traitement antirétroviral spécialisé'
        WHEN objectif_id = 'OIC-066-68-B' THEN 'Indications thérapeutiques identiques aux recommandations générales'
        ELSE description
    END,
    updated_at = NOW()
WHERE objectif_id IN ('OIC-290-14-A', 'OIC-282-06-A', 'OIC-288-10-A', 'OIC-051-02-B', 'OIC-169-14-A', 'OIC-066-68-B');

-- Corriger l'intitulé avec HTML corrompu restant
UPDATE oic_competences 
SET 
    intitule = REPLACE(REPLACE(intitule, '&lt;u&gt;', ''), '&lt;/u&gt;', ''),
    updated_at = NOW()
WHERE intitule LIKE '%&lt;u&gt;%' OR intitule LIKE '%&lt;/u&gt;%';