-- ========================================================
-- AUDIT SÉCURITE MED-MNG - CRÉATION SYSTÈME DE MONITORING
-- ========================================================

-- 1. Créer la table d'audit de sécurité
CREATE TABLE public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_type TEXT NOT NULL, -- 'KEY_DETECTED', 'KEY_REMOVED', 'FUNCTION_SCANNED', 'TABLE_CLEANED'
    severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    location TEXT NOT NULL, -- table.column, function_name, file_path
    finding_type TEXT NOT NULL, -- 'HARDCODED_JWT', 'API_KEY', 'SERVICE_ROLE', 'BEARER_TOKEN'
    description TEXT NOT NULL,
    sensitive_data_hash TEXT, -- Hash de la donnée sensible pour traçabilité
    action_taken TEXT NOT NULL, -- 'REMOVED', 'ANONYMIZED', 'FLAGGED', 'REVIEWED'
    audited_by TEXT DEFAULT 'SYSTEM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index pour recherche rapide
CREATE INDEX idx_security_audit_severity ON public.security_audit_log(severity, created_at);
CREATE INDEX idx_security_audit_type ON public.security_audit_log(audit_type, created_at);

-- 2. Activer RLS sur la table d'audit
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Politique restrictive - seuls les admins peuvent voir les logs de sécurité
CREATE POLICY "Admins seuls peuvent voir les audits de sécurité" 
ON public.security_audit_log 
FOR ALL
USING (false); -- Bloque tout accès par défaut

-- 3. Fonction pour enregistrer les findings de sécurité
CREATE OR REPLACE FUNCTION public.log_security_finding(
    _audit_type TEXT,
    _severity TEXT,
    _location TEXT,
    _finding_type TEXT,
    _description TEXT,
    _sensitive_data TEXT DEFAULT NULL,
    _action_taken TEXT DEFAULT 'FLAGGED',
    _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    audit_id UUID;
    data_hash TEXT;
BEGIN
    -- Créer un hash de la donnée sensible si fournie (sans la stocker en clair)
    IF _sensitive_data IS NOT NULL THEN
        data_hash := encode(digest(_sensitive_data, 'sha256'), 'hex');
    END IF;
    
    INSERT INTO public.security_audit_log 
    (audit_type, severity, location, finding_type, description, sensitive_data_hash, action_taken, metadata)
    VALUES 
    (_audit_type, _severity, _location, _finding_type, _description, data_hash, _action_taken, _metadata)
    RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$;

-- 4. Scanner automatique pour détecter les patterns dangereux
CREATE OR REPLACE FUNCTION public.scan_for_security_violations()
RETURNS TABLE(
    table_name TEXT,
    column_name TEXT,
    suspicious_data_count BIGINT,
    sample_finding TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
    query_text TEXT;
    result_count BIGINT;
    sample_text TEXT;
BEGIN
    -- Scanner les colonnes textuelles pour des patterns suspects
    FOR rec IN 
        SELECT t.table_name, c.column_name, c.data_type
        FROM information_schema.tables t
        JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = t.table_schema
        WHERE t.table_schema = 'public' 
        AND c.data_type IN ('text', 'character varying', 'jsonb')
        AND t.table_type = 'BASE TABLE'
    LOOP
        -- Construire la requête de détection pour ce champ
        query_text := format('
            SELECT COUNT(*), 
                   COALESCE(LEFT(%I::text, 50), '''') as sample
            FROM %I 
            WHERE %I::text ~* ''(sk-[a-zA-Z0-9]{20,}|eyJ[a-zA-Z0-9._-]+|bearer\s+[a-zA-Z0-9._-]+|api[_-]?key[''"\s]*[:=][''"\s]*[a-zA-Z0-9._-]{10,})''',
            rec.column_name, rec.table_name, rec.column_name
        );
        
        -- Exécuter la requête de détection
        BEGIN
            EXECUTE query_text INTO result_count, sample_text;
            
            IF result_count > 0 THEN
                -- Enregistrer le finding
                PERFORM public.log_security_finding(
                    'SCAN_DETECTION',
                    'HIGH',
                    rec.table_name || '.' || rec.column_name,
                    'POTENTIAL_KEY_PATTERN',
                    'Pattern de clé détecté dans ' || rec.table_name || '.' || rec.column_name,
                    sample_text,
                    'FLAGGED',
                    jsonb_build_object('count', result_count, 'scan_date', now())
                );
                
                -- Retourner le résultat
                table_name := rec.table_name;
                column_name := rec.column_name;
                suspicious_data_count := result_count;
                sample_finding := sample_text;
                RETURN NEXT;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Log l'erreur mais continue le scan
            PERFORM public.log_security_finding(
                'SCAN_ERROR',
                'LOW',
                rec.table_name || '.' || rec.column_name,
                'SCAN_FAILED',
                'Erreur lors du scan: ' || SQLERRM,
                NULL,
                'ERROR_LOGGED'
            );
        END;
    END LOOP;
END;
$$;

-- 5. Vue de synthèse des violations de sécurité
CREATE OR REPLACE VIEW public.security_violations_summary AS
SELECT 
    severity,
    finding_type,
    COUNT(*) as violation_count,
    COUNT(CASE WHEN resolved_at IS NULL THEN 1 END) as unresolved_count,
    MAX(created_at) as last_detection,
    array_agg(DISTINCT location ORDER BY location) as affected_locations
FROM public.security_audit_log
GROUP BY severity, finding_type
ORDER BY 
    CASE severity 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        ELSE 4 
    END,
    violation_count DESC;

-- 6. Immédiatement logger les violations CRITIQUES détectées
DO $$
BEGIN
    -- Logger la clé JWT hardcodée détectée
    PERFORM public.log_security_finding(
        'KEY_DETECTED',
        'CRITICAL',
        'supabase/functions/auto-extract-oic/index.ts',
        'HARDCODED_JWT',
        'Clé JWT Supabase hardcodée trouvée dans le code source - EXPOSITION CRITIQUE',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***',
        'IMMEDIATE_REMOVAL_REQUIRED',
        jsonb_build_object('detection_date', now(), 'risk_level', 'MAXIMUM')
    );
    
    -- Logger les multiples références aux clés service
    PERFORM public.log_security_finding(
        'KEY_DETECTED',
        'HIGH',
        'Multiple Edge Functions',
        'SERVICE_ROLE_USAGE',
        'Multiples références à SUPABASE_SERVICE_ROLE_KEY dans les fonctions edge',
        NULL,
        'REVIEW_REQUIRED',
        jsonb_build_object('functions_count', 15, 'detection_date', now())
    );
    
    -- Logger les références aux clés API
    PERFORM public.log_security_finding(
        'KEY_DETECTED',
        'HIGH',
        'Edge Functions',
        'API_KEY_REFERENCES',
        'Références aux clés API tierces (OpenAI, Suno) dans les fonctions',
        NULL,
        'ENVIRONMENT_VALIDATION_REQUIRED',
        jsonb_build_object('apis', ARRAY['OPENAI_API_KEY', 'SUNO_API_KEY'], 'detection_date', now())
    );
END;
$$;

-- 7. Fonction de nettoyage d'urgence
CREATE OR REPLACE FUNCTION public.emergency_security_cleanup()
RETURNS TABLE(
    cleaned_table TEXT,
    cleaned_column TEXT,
    records_affected BIGINT,
    cleanup_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Cette fonction sera complétée avec les actions de nettoyage spécifiques
    -- basées sur les findings de l'audit
    
    RETURN QUERY SELECT 
        'placeholder'::TEXT as cleaned_table,
        'placeholder'::TEXT as cleaned_column,
        0::BIGINT as records_affected,
        'INITIALIZATION'::TEXT as cleanup_type;
END;
$$;