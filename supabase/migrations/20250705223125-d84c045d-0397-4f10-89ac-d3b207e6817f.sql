-- CORRECTION MASSIVE ET DIRECTE DES DONNÉES OIC
-- Cette migration corrige tous les problèmes de qualité des données en une seule fois

DO $$
DECLARE
    total_fixed INTEGER := 0;
    batch_size INTEGER := 1000;
    current_batch INTEGER := 0;
BEGIN
    RAISE NOTICE 'DÉBUT DE LA CORRECTION MASSIVE DES DONNÉES OIC';
    
    -- Correction des entités HTML corrompues
    UPDATE oic_competences 
    SET 
        description = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            COALESCE(description, ''),
            '&lt;', '<'),
            '&gt;', '>'),
            '&nbsp;', ' '),
            '&amp;', '&'),
            '&quot;', '"'),
        updated_at = NOW()
    WHERE description LIKE '%&lt;%' 
       OR description LIKE '%&gt;%' 
       OR description LIKE '%&nbsp;%'
       OR description LIKE '%&amp;%'
       OR description LIKE '%&quot;%';
    
    GET DIAGNOSTICS current_batch = ROW_COUNT;
    total_fixed := total_fixed + current_batch;
    RAISE NOTICE 'Entités HTML corrigées: %', current_batch;
    
    -- Correction des intitulés avec liens MediaWiki
    UPDATE oic_competences 
    SET 
        intitule = REGEXP_REPLACE(
            REGEXP_REPLACE(intitule, '\[\[([^\]|]+)(?:\|([^\]]+))?\]\]', COALESCE('\2', '\1'), 'g'),
            '^\d+\.\s*', '', 'g'),
        updated_at = NOW()
    WHERE intitule LIKE '%[[%]]%';
    
    GET DIAGNOSTICS current_batch = ROW_COUNT;
    total_fixed := total_fixed + current_batch;
    RAISE NOTICE 'Intitulés corrigés: %', current_batch;
    
    -- Correction des fragments incomplets (commençant par - ou *)
    UPDATE oic_competences 
    SET 
        description = CASE 
            WHEN LENGTH(TRIM(description)) < 50 THEN 
                'Compétence relative à : ' || LTRIM(description, '-*• ')
            ELSE 
                LTRIM(description, '-*• ')
        END,
        updated_at = NOW()
    WHERE (description LIKE '-%' OR description LIKE '*%' OR description LIKE '•%')
      AND description IS NOT NULL;
    
    GET DIAGNOSTICS current_batch = ROW_COUNT;
    total_fixed := total_fixed + current_batch;
    RAISE NOTICE 'Fragments reconstruits: %', current_batch;
    
    -- Correction des descriptions vides
    UPDATE oic_competences 
    SET 
        description = 'Compétence OIC ' || objectif_id || ' - ' || COALESCE(intitule, 'Item ' || item_parent),
        updated_at = NOW()
    WHERE description IS NULL 
       OR TRIM(description) = '' 
       OR description = '<br />';
    
    GET DIAGNOSTICS current_batch = ROW_COUNT;
    total_fixed := total_fixed + current_batch;
    RAISE NOTICE 'Descriptions vides corrigées: %', current_batch;
    
    -- Nettoyage final des balises HTML résiduelles
    UPDATE oic_competences 
    SET 
        description = REGEXP_REPLACE(
            REGEXP_REPLACE(description, '<br\s*/?>', E'\n', 'gi'),
            E'^\n+|\n+$', '', 'g'),
        updated_at = NOW()
    WHERE description LIKE '%<br%>%' OR description LIKE '%<BR%>%';
    
    GET DIAGNOSTICS current_batch = ROW_COUNT;
    total_fixed := total_fixed + current_batch;
    RAISE NOTICE 'Balises HTML nettoyées: %', current_batch;
    
    RAISE NOTICE 'CORRECTION MASSIVE TERMINÉE - Total corrigé: %', total_fixed;
END $$;