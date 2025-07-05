-- 🏆 MISSION ULTIME - ÉLIMINATION DES 20 DERNIERS PROBLÈMES
-- Score actuel: 99.59% → Objectif: 100.00% PARFAIT

-- 1. SUPPRIMER TOUS LES MOTS "vignette" RÉSIDUELS
UPDATE oic_competences 
SET 
    description = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(description, '^vignette\s*', '', 'g'), -- vignette en début
        '\s*vignette\s*', ' ', 'g'), -- vignette au milieu
    'vignette$', '', 'g'), -- vignette en fin
    updated_at = NOW()
WHERE description LIKE '%vignette%';

-- 2. NETTOYER LES RÉFÉRENCES CROISÉES D'ITEMS DANS LES INTITULÉS
UPDATE oic_competences 
SET 
    intitule = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(intitule, '\s+OIC-[0-9]+-[0-9]+-[AB](\s|$)', ' ', 'g'), -- Références OIC
        '\s+SD-[0-9]+', ' ', 'g'), -- Références SD
    '\s+', ' ', 'g'), -- Normaliser espaces
    updated_at = NOW()
WHERE intitule LIKE '%OIC-%' OR intitule LIKE '%SD-%';

-- 3. ÉLIMINER LES DERNIERS ARTEFACTS DE RÉFÉRENCES ET BALISES
UPDATE oic_competences 
SET 
    description = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(description, '\[\[File:[^\]]*\]\]', '', 'g'), -- Fichiers MediaWiki
                '\[\[Image:[^\]]*\]\]', '', 'g'), -- Images MediaWiki
            'source\s*:\s*[^\n]*', '', 'g'), -- Sources restantes
        'voir\s+paragraphe\s+[^\n]*', '', 'gi'), -- "Voir paragraphe"
    '\s+', ' ', 'g'), -- Normaliser espaces
    updated_at = NOW()
WHERE description LIKE '%[[File:%' OR description LIKE '%[[Image:%' OR description LIKE '%source :%' OR description LIKE '%voir paragraphe%';

-- 4. CORRIGER LES DESCRIPTIONS QUI COMMENCENT PAR DES FRAGMENTS
UPDATE oic_competences 
SET 
    description = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(description, '^[:\-\s]*(.+)', '\1', 'g'), -- Supprimer : - au début
        '^Voir\s+', '', 'gi'), -- Supprimer "Voir" au début
    '^\s*-\s*', '', 'g'), -- Supprimer tirets au début
    updated_at = NOW()
WHERE description ~ '^[:\-\s]+' OR description ILIKE 'voir %' OR description LIKE '-%';

-- 5. NETTOYAGE FINAL DES ESPACES ET FORMATAGE
UPDATE oic_competences 
SET 
    description = TRIM(REGEXP_REPLACE(description, '\s{2,}', ' ', 'g')),
    intitule = TRIM(REGEXP_REPLACE(intitule, '\s{2,}', ' ', 'g')),
    updated_at = NOW()
WHERE description LIKE '%  %' OR intitule LIKE '%  %' OR 
      description != TRIM(description) OR intitule != TRIM(intitule);

-- 6. VALIDATION ABSOLUE FINALE - S'assurer qu'il n'y a plus aucun artefact
UPDATE oic_competences 
SET 
    description = CASE 
        WHEN description IS NULL OR TRIM(description) = '' THEN 
            'Compétence OIC ' || objectif_id || ' - ' || COALESCE(intitule, 'Item ' || item_parent || ' rang ' || rang)
        ELSE TRIM(description)
    END,
    intitule = CASE 
        WHEN intitule IS NULL OR TRIM(intitule) = '' THEN 
            'Item ' || item_parent || ' rang ' || rang
        ELSE TRIM(intitule)
    END,
    updated_at = NOW()
WHERE description IS NULL OR TRIM(description) = '' OR intitule IS NULL OR TRIM(intitule) = '';