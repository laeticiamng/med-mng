-- 🎯 CORRECTION FINALE PRÉCISE DES 36 DERNIERS PROBLÈMES

-- 1. CORRIGER TOUS LES LIENS HTTP ET RÉFÉRENCES WEB
UPDATE oic_competences 
SET 
    description = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(description, '<nowiki>https?://[^<]*</nowiki>', '', 'g'), -- Supprimer les liens nowiki
                    'https?://[^)\s\]<]+', '', 'g'), -- Supprimer toutes les URLs
                '<ref[^>]*>[^<]*</ref>', '', 'g'), -- Supprimer les références
            '\[https?://[^\]]*\]', '', 'g'), -- Supprimer les liens entre crochets  
        '<ref[^>]*>https?://[^<]*</ref>', '', 'g'), -- Supprimer les refs avec URLs
    '\s+', ' ', 'g'), -- Normaliser les espaces multiples
    updated_at = NOW()
WHERE description LIKE '%http%';

-- 2. CORRIGER LES INTITULÉS AVEC DES CROCHETS SPÉCIAUX
UPDATE oic_competences 
SET 
    intitule = CASE 
        WHEN objectif_id = 'OIC-267-23-A' THEN 'Hyponatrémie : Natrémie inférieure à 135 mmol/L'
        WHEN objectif_id = 'OIC-267-29-A' THEN 'Hypernatrémie : Natrémie supérieure à 145 mmol/L'  
        WHEN objectif_id = 'OIC-294-18-A' THEN 'Accès à une équipe de soins de support'
        ELSE intitule
    END,
    updated_at = NOW()
WHERE objectif_id IN ('OIC-267-23-A', 'OIC-267-29-A', 'OIC-294-18-A');

-- 3. NETTOYAGE FINAL DES ARTEFACTS RESTANTS
UPDATE oic_competences 
SET 
    description = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(description, '<gallery[^>]*>.*?</gallery>', '', 'gs'), -- Supprimer les galeries
        'vignette\|[^|]*\|[^|]*', '', 'g'), -- Supprimer les vignettes
    'source HAS\s*:\s*', '', 'g'), -- Supprimer "source HAS :"
    intitule = REGEXP_REPLACE(
        REGEXP_REPLACE(intitule, '\[modifier \| modifier le wikicode\]', '', 'g'), -- Supprimer les liens wiki
    '={2,}', '', 'g'), -- Supprimer les signes = multiples
    updated_at = NOW()
WHERE description LIKE '%<gallery%' OR description LIKE '%vignette%' OR description LIKE '%source HAS%' 
   OR intitule LIKE '%modifier%' OR intitule LIKE '%==%';