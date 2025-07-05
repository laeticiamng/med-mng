-- CORRECTION FINALE DE TOUS LES PROBLÈMES RESTANTS

-- Nettoyer tous les intitulés avec HTML corrompu
UPDATE oic_competences 
SET 
    intitule = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(intitule, '&lt;[^&]*&gt;', '', 'g'), -- Supprimer toutes les balises HTML
                '&nbsp;', ' ', 'g'), -- Remplacer les espaces non-sécables
            '&gt;', '>', 'g'), -- Remplacer les >
        '&lt;', '<', 'g'), -- Remplacer les <
    '&amp;', '&', 'g'), -- Remplacer les &
    updated_at = NOW()
WHERE intitule LIKE '%&lt;%' OR intitule LIKE '%&gt;%' OR intitule LIKE '%&nbsp;%' OR intitule LIKE '%&amp;%';

-- Nettoyer les intitulés avec des liens complexes et les normaliser
UPDATE oic_competences 
SET 
    intitule = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(intitule, '\[https://[^\]]*\]', '', 'g'), -- Supprimer les liens
        '^\d+[\)\-\.]?\s*', ''), -- Supprimer la numérotation en début
    '^=+\s*', ''), -- Supprimer les signes = en début
    updated_at = NOW()
WHERE intitule LIKE '%http%' OR intitule LIKE '%[%]%' OR intitule ~ '^\d+[\)\-\.]' OR intitule LIKE '=%';

-- Améliorer les descriptions trop courtes (< 10 caractères)
UPDATE oic_competences 
SET 
    description = CASE 
        WHEN LENGTH(description) < 10 AND intitule IS NOT NULL AND LENGTH(intitule) > 0 THEN 
            'Compétence spécialisée : ' || LEFT(intitule, 60)
        WHEN LENGTH(description) < 10 THEN 
            'Compétence OIC ' || objectif_id || ' - Item ' || item_parent
        ELSE description
    END,
    updated_at = NOW()
WHERE LENGTH(COALESCE(description, '')) < 10;