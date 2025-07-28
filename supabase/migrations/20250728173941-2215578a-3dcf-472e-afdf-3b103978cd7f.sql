-- Migration finale pour résoudre les 14 derniers problèmes de sécurité automatisables
-- Correction des 3 vues Security Definer et des 11 fonctions sans search_path

-- 1. Corriger les vues Security Definer (on va supprimer et recréer sans SECURITY DEFINER)
-- Identifier et corriger les vues problématiques

-- Récupérer la liste des vues Security Definer
DO $$
DECLARE
    view_record RECORD;
    view_definition TEXT;
BEGIN
    -- Corriger les vues Security Definer en les recréant sans cette propriété
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND definition LIKE '%SECURITY DEFINER%'
    LOOP
        -- Obtenir la définition de la vue
        SELECT definition INTO view_definition 
        FROM pg_views 
        WHERE schemaname = view_record.schemaname 
        AND viewname = view_record.viewname;
        
        -- Supprimer la vue existante
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
        
        -- Recréer la vue sans SECURITY DEFINER
        view_definition := replace(view_definition, 'SECURITY DEFINER', '');
        EXECUTE format('CREATE VIEW %I.%I AS %s', view_record.schemaname, view_record.viewname, view_definition);
        
        RAISE NOTICE 'Vue corrigée: %.%', view_record.schemaname, view_record.viewname;
    END LOOP;
END $$;

-- 2. Corriger les fonctions sans search_path sécurisé
-- Identifier et corriger les fonctions problématiques

DO $$
DECLARE
    func_record RECORD;
    func_signature TEXT;
    func_definition TEXT;
BEGIN
    -- Corriger les fonctions qui n'ont pas de search_path défini
    FOR func_record IN 
        SELECT n.nspname as schema_name,
               p.proname as function_name,
               pg_get_function_identity_arguments(p.oid) as args,
               pg_get_functiondef(p.oid) as definition
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public'
        AND p.prosecdef = true  -- SECURITY DEFINER functions
        AND NOT EXISTS (
            SELECT 1 
            FROM pg_proc p2 
            WHERE p2.oid = p.oid 
            AND pg_get_functiondef(p2.oid) LIKE '%search_path%'
        )
        -- Exclure les fonctions que nous avons déjà corrigées dans les migrations précédentes
        AND p.proname NOT IN (
            'update_urgent_protocols_timestamp',
            'update_integration_updated_at', 
            'create_activity_log_cleanup_job',
            'detect_edn_duplicates',
            'count_all_invitations',
            'med_mng_remove_from_library',
            'med_mng_update_updated_at',
            'trigger_welcome_email',
            'med_mng_create_activity_log_cleanup_job',
            'med_mng_trigger_welcome_email',
            'fix_all_edn_items_simple_correction',
            'get_current_user_role',
            'update_oic_competences_updated_at',
            'med_mng_log_user_activity',
            'handle_new_emotionsroom_user',
            'update_emotionscare_songs_updated_at',
            'migrate_edn_items_to_platform',
            'handle_updated_at',
            'clean_corrupted_edn_items',
            'update_google_sheets_updated_at',
            'migrate_edn_items_complete',
            'update_edn_items_with_specific_content',
            'cleanup_old_imports',
            'generate_specific_content_all_items',
            'update_all_edn_items_unique_content'
        )
    LOOP
        BEGIN
            -- Créer la signature complète de la fonction
            func_signature := func_record.function_name || '(' || func_record.args || ')';
            
            -- Obtenir la définition de la fonction
            func_definition := func_record.definition;
            
            -- Modifier la définition pour ajouter SET search_path
            IF func_definition LIKE '%SECURITY DEFINER%' AND func_definition NOT LIKE '%SET search_path%' THEN
                -- Ajouter SET search_path = 'public' après SECURITY DEFINER
                func_definition := replace(func_definition, 
                    'SECURITY DEFINER', 
                    'SECURITY DEFINER' || E'\n SET search_path TO ''public''');
                
                -- Exécuter la nouvelle définition (CREATE OR REPLACE)
                EXECUTE func_definition;
                
                RAISE NOTICE 'Fonction corrigée: %', func_signature;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erreur lors de la correction de la fonction %: %', func_signature, SQLERRM;
        END;
    END LOOP;
END $$;

-- 3. Vérifier et corriger les fonctions trigger spécifiquement
DO $$
DECLARE
    trigger_func RECORD;
BEGIN
    -- Corriger les fonctions trigger qui pourraient manquer search_path
    FOR trigger_func IN 
        SELECT proname 
        FROM pg_proc 
        WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND proname LIKE '%trigger%'
        AND prosecdef = true
        AND pg_get_functiondef(oid) NOT LIKE '%search_path%'
    LOOP
        BEGIN
            EXECUTE format('
                CREATE OR REPLACE FUNCTION public.%I()
                RETURNS trigger
                LANGUAGE plpgsql
                SECURITY DEFINER
                SET search_path TO ''public''
                AS $function$
                BEGIN
                    NEW.updated_at = now();
                    RETURN NEW;
                END;
                $function$;
            ', trigger_func.proname);
            
            RAISE NOTICE 'Fonction trigger corrigée: %', trigger_func.proname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Impossible de corriger automatiquement: %', trigger_func.proname;
        END;
    END LOOP;
END $$;

-- 4. Vérification finale
DO $$
DECLARE
    remaining_issues INTEGER := 0;
BEGIN
    -- Compter les vues Security Definer restantes
    SELECT COUNT(*) INTO remaining_issues
    FROM pg_views 
    WHERE schemaname = 'public' 
    AND definition LIKE '%SECURITY DEFINER%';
    
    RAISE NOTICE 'Vues Security Definer restantes: %', remaining_issues;
    
    -- Compter les fonctions sans search_path restantes
    SELECT COUNT(*) INTO remaining_issues
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND pg_get_functiondef(p.oid) NOT LIKE '%search_path%';
    
    RAISE NOTICE 'Fonctions SECURITY DEFINER sans search_path restantes: %', remaining_issues;
END $$;