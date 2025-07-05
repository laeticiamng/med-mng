-- 🎯 CORRECTION ULTRA-PRÉCISE DES 41 DERNIERS PROBLÈMES

-- 1. CORRIGER LES 3 FRAGMENTS AVEC ASTÉRISQUES/PUCES
UPDATE oic_competences 
SET 
    description = CASE 
        WHEN objectif_id = 'OIC-261-17-B' THEN 'Syndrome néphritique aigu parfois très mal toléré, avec une consommation du complément avec baisse du C3.'
        WHEN objectif_id = 'OIC-091-07-A' THEN 'Traumatisme crânien compliqué : hématome extradural, sous-dural, contusion cérébrale.'
        WHEN objectif_id = 'OIC-091-08-A' THEN 'Sciatique paralysante, autres atteintes uniradiculaires compressives périphériques.'
        ELSE description
    END,
    updated_at = NOW()
WHERE objectif_id IN ('OIC-261-17-B', 'OIC-091-07-A', 'OIC-091-08-A');

-- 2. NETTOYER TOUS LES ARTEFACTS DE RÉFÉRENCES RESTANTS
UPDATE oic_competences 
SET 
    description = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(description, '</?big[^>]*>', '', 'g'), -- Supprimer balises big
                    '</?u[^>]*>', '', 'g'), -- Supprimer balises u (soulignement)
                '·\s*', '', 'g'), -- Supprimer puces ·
            '\*\s*', '', 'g'), -- Supprimer astérisques isolés
        '==+', '', 'g'), -- Supprimer signes = multiples
    '\s+', ' ', 'g'), -- Normaliser espaces multiples
    updated_at = NOW()
WHERE description LIKE '%<big%' OR description LIKE '%<u%' OR description LIKE '%·%' OR 
      description LIKE '%*%' OR description LIKE '%==%';

-- 3. CORRECTION FINALE DES CAS SPÉCIFIQUES PROBLÉMATIQUES
UPDATE oic_competences 
SET 
    description = TRIM(REGEXP_REPLACE(description, '^[*•·\s]+|[*•·\s]+$', '', 'g')),
    intitule = TRIM(REGEXP_REPLACE(intitule, '^['']+|['']+$', '', 'g')),
    updated_at = NOW()
WHERE description ~ '^[*•·\s]+' OR description ~ '[*•·\s]+$' OR 
      intitule LIKE '''%''' OR intitule LIKE '%''';

-- 4. NETTOYAGE ULTIME DES DERNIERS ARTEFACTS
UPDATE oic_competences 
SET 
    description = REGEXP_REPLACE(
        REGEXP_REPLACE(description, 'néant\|', '', 'g'), -- Supprimer "néant|"
    '\s+', ' ', 'g'),
    updated_at = NOW()
WHERE description LIKE '%néant|%';