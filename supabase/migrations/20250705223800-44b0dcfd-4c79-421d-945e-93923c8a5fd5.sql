-- CORRECTION ULTIME DES 6 DERNIERS PROBLÈMES
UPDATE oic_competences 
SET 
    intitule = REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(intitule, '\[https?://[^]]*\s*([^\]]*)\]', '\1', 'g'), -- Extraire le texte des liens
        'https?://[^\s]*', '', 'g'), -- Supprimer les URLs restantes
    '\s+', ' ', 'g'), -- Normaliser les espaces multiples
    updated_at = NOW()
WHERE intitule LIKE '%http%' OR intitule LIKE '%[%]%';