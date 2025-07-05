-- 🏥 CORRECTION SPÉCIALISÉE DES ICONOGRAPHIES MÉDICALES

-- Corriger les descriptions vides d'iconographies médicales avec des descriptions appropriées
UPDATE oic_competences 
SET 
    description = CASE 
        -- Iconographies radiologiques
        WHEN intitule LIKE '%Radiographie%' AND description = '' THEN 'Analyse radiologique : ' || SUBSTRING(intitule FROM 1 FOR 80) || '. Compétence d''interprétation d''imagerie médicale.'
        WHEN intitule LIKE '%IRM%' AND description = '' THEN 'Imagerie par résonance magnétique : ' || SUBSTRING(intitule FROM 1 FOR 80) || '. Compétence d''interprétation IRM.'
        WHEN intitule LIKE '%Scanner%' AND description = '' THEN 'Imagerie tomodensitométrique : ' || SUBSTRING(intitule FROM 1 FOR 80) || '. Compétence d''interprétation scanographique.'
        
        -- Iconographies cliniques
        WHEN intitule LIKE '%Photographie%' AND description = '' THEN 'Iconographie clinique : ' || SUBSTRING(intitule FROM 1 FOR 80) || '. Compétence de reconnaissance visuelle diagnostique.'
        WHEN intitule LIKE '%Iconographie%' AND description = '' THEN 'Documentation visuelle : ' || SUBSTRING(intitule FROM 1 FOR 80) || '. Compétence d''identification clinique.'
        WHEN intitule LIKE '%Exemple%' AND description = '' THEN 'Cas clinique illustré : ' || SUBSTRING(intitule FROM 1 FOR 80) || '. Compétence d''analyse de cas.'
        
        -- Autres cas spéciaux
        WHEN intitule LIKE '%Figure%' AND description = '' THEN 'Schéma médical : ' || SUBSTRING(intitule FROM 1 FOR 80) || '. Compétence de compréhension schématique.'
        WHEN intitule LIKE '%arbre décisionnel%' AND description = '' THEN 'Algorithme diagnostique : ' || SUBSTRING(intitule FROM 1 FOR 80) || '. Compétence de raisonnement clinique structuré.'
        WHEN intitule LIKE '%Reconnaître%' AND description = '' THEN 'Compétence de reconnaissance : ' || SUBSTRING(intitule FROM 1 FOR 80) || '. Capacité d''identification diagnostique.'
        
        -- Cas génériques pour descriptions vides
        WHEN description = '' OR description IS NULL THEN 'Compétence spécialisée OIC ' || objectif_id || ' : ' || SUBSTRING(COALESCE(intitule, 'Item ' || item_parent), 1, 80)
        
        ELSE description
    END,
    updated_at = NOW()
WHERE description = '' OR description IS NULL;

-- Corriger les descriptions trop courtes (< 10 caractères)
UPDATE oic_competences 
SET 
    description = 'Compétence OIC ' || objectif_id || ' : ' || SUBSTRING(COALESCE(intitule, 'Item ' || item_parent || ' rang ' || rang), 1, 100),
    updated_at = NOW()
WHERE LENGTH(COALESCE(description, '')) < 10 AND LENGTH(COALESCE(description, '')) > 0;

-- Supprimer définitivement tous les artefacts de références
UPDATE oic_competences 
SET 
    description = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(description, '</?ref[^>]*>', '', 'g'), -- Supprimer toutes les balises ref
        '\[[^\]]*\]', '', 'g'), -- Supprimer tous les crochets
    '\s+', ' ', 'g'), -- Normaliser les espaces
    updated_at = NOW()
WHERE description LIKE '%ref%' OR description LIKE '%[%';