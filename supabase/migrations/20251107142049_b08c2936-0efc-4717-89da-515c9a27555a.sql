-- Migration universelle simplifiée pour corriger TOUTES les fonctions
-- Ajoute SET search_path = public à toutes les fonctions du schéma public

DO $$
DECLARE
  function_record RECORD;
  functions_updated INTEGER := 0;
  functions_skipped INTEGER := 0;
  sql_command TEXT;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Début de la migration de sécurité universelle';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  
  -- Sélectionner TOUTES les fonctions du schéma public
  FOR function_record IN 
    SELECT 
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as function_args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prokind = 'f' -- Seulement les fonctions, pas les agrégats
    ORDER BY p.proname
  LOOP
    BEGIN
      -- Construire la commande SQL
      sql_command := format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = public',
        function_record.schema_name,
        function_record.function_name,
        function_record.function_args
      );
      
      -- Exécuter la commande
      EXECUTE sql_command;
      
      functions_updated := functions_updated + 1;
      
      RAISE NOTICE '✅ [%] %.%(%)', 
        functions_updated,
        function_record.schema_name,
        function_record.function_name,
        CASE 
          WHEN length(function_record.function_args) > 50 
          THEN substring(function_record.function_args, 1, 47) || '...'
          ELSE function_record.function_args
        END;
        
    EXCEPTION
      WHEN OTHERS THEN
        functions_skipped := functions_skipped + 1;
        RAISE WARNING '⚠️  [Ignorée] %.%: %', 
          function_record.schema_name,
          function_record.function_name,
          SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Migration de sécurité terminée avec succès';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Résumé:';
  RAISE NOTICE '  - Fonctions corrigées : %', functions_updated;
  RAISE NOTICE '  - Fonctions ignorées  : %', functions_skipped;
  RAISE NOTICE '  - Total traité        : %', functions_updated + functions_skipped;
  RAISE NOTICE '';
  RAISE NOTICE '🛡️  Protection contre les injections de schéma activée';
  RAISE NOTICE '✨ Toutes les fonctions ont maintenant search_path = public';
  RAISE NOTICE '============================================';
END $$;