-- 🔧 CORRECTION DES EFFETS DE BORD DE MES NETTOYAGES PRÉCÉDENTS

-- 1. RECONSTRUIRE LES DESCRIPTIONS VIDÉES OU TROP COURTES APRÈS NETTOYAGE
UPDATE oic_competences 
SET 
    description = CASE 
        WHEN description IS NULL OR TRIM(description) = '' OR LENGTH(TRIM(description)) < 10 THEN
            CASE 
                WHEN intitule IS NOT NULL AND LENGTH(TRIM(intitule)) > 0 THEN 
                    'Compétence OIC ' || objectif_id || ' : ' || LEFT(TRIM(intitule), 100)
                ELSE 
                    'Compétence OIC ' || objectif_id || ' - Item ' || item_parent || ' (Rang ' || COALESCE(rang, 'A') || ')'
            END
        ELSE description
    END,
    updated_at = NOW()
WHERE description IS NULL OR TRIM(description) = '' OR LENGTH(TRIM(description)) < 10;

-- 2. NETTOYER LES RÉFÉRENCES ET CROCHETS RESTANTS DANS LES DESCRIPTIONS
UPDATE oic_competences 
SET 
    description = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(description, '<ref[^>]*>[^<]*</ref>', '', 'g'), -- Supprimer toutes les refs
            '\[[^\]]*\]', '', 'g'), -- Supprimer tous les crochets
        'vignette[^|]*\|[^|]*', '', 'g'), -- Supprimer les vignettes restantes
    '\s+', ' ', 'g'), -- Normaliser les espaces
    updated_at = NOW()
WHERE description LIKE '%ref%' OR description LIKE '%[%' OR description LIKE '%vignette%';

-- 3. NETTOYER LES INTITULÉS AVEC DES ARTEFACTS RESTANTS
UPDATE oic_competences 
SET 
    intitule = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(intitule, '\s*:\s*$', '', 'g'), -- Supprimer les ":" en fin
        '^\s*[=]+\s*', '', 'g'), -- Supprimer les "=" en début
    '\s+', ' ', 'g'), -- Normaliser les espaces
    updated_at = NOW()
WHERE intitule LIKE '%:%' OR intitule LIKE '%=%' OR intitule LIKE '% %';

-- 4. CORRECTION SPÉCIALE DES CAS PROBLÉMATIQUES IDENTIFIÉS
UPDATE oic_competences 
SET 
    description = TRIM(
        REGEXP_REPLACE(
            REGEXP_REPLACE(description, '^[:\-=\s]+', '', 'g'), -- Supprimer préfixes parasites
        '[:\-=\s]+$', '', 'g') -- Supprimer suffixes parasites
    ),
    updated_at = NOW()
WHERE description ~ '^[:\-=\s]+' OR description ~ '[:\-=\s]+$';