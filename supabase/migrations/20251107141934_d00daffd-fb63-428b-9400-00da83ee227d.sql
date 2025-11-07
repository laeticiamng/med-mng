-- Migration pour corriger les fonctions sans search_path défini
-- Cette migration ajoute SET search_path = public à toutes les fonctions identifiées lors de l'audit de sécurité

DO $$
DECLARE
  function_record RECORD;
  functions_updated INTEGER := 0;
BEGIN
  -- Liste des fonctions à corriger
  FOR function_record IN 
    SELECT 
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as function_args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN (
      'update_applied_recommendations_updated_at',
      'update_recommendation_alerts_updated_at',
      'update_performance_alerts_updated_at',
      'handle_updated_at',
      'calculate_recommendation_impact',
      'check_recommendation_alerts',
      'get_category_effectiveness_scores',
      'update_edn_items_updated_at',
      'update_edn_competences_updated_at',
      'update_edn_objectifs_updated_at',
      'update_edn_sections_updated_at',
      'update_edn_ue_updated_at',
      'update_ecos_scenarios_updated_at',
      'update_ecos_stations_updated_at',
      'update_ecos_questions_updated_at',
      'update_extraction_logs_updated_at',
      'update_extraction_tasks_updated_at',
      'update_audit_logs_updated_at',
      'update_content_generation_logs_updated_at',
      'update_ia_tasks_updated_at',
      'update_ia_quota_updated_at',
      'update_songs_updated_at',
      'update_playlists_updated_at',
      'update_playlist_songs_updated_at',
      'update_music_analytics_updated_at',
      'update_lyrics_sync_updated_at',
      'update_subscriptions_updated_at',
      'update_profiles_updated_at',
      'update_user_preferences_updated_at',
      'update_notification_logs_updated_at',
      'update_notification_templates_updated_at',
      'update_webhooks_updated_at',
      'update_data_quality_logs_updated_at',
      'sync_edn_tables'
    )
  LOOP
    BEGIN
      -- Construire et exécuter la commande ALTER FUNCTION
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = public',
        function_record.schema_name,
        function_record.function_name,
        function_record.function_args
      );
      
      functions_updated := functions_updated + 1;
      
      RAISE NOTICE 'Fonction corrigée : %.%(%)', 
        function_record.schema_name,
        function_record.function_name,
        function_record.function_args;
        
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Impossible de corriger la fonction %.% : %', 
          function_record.schema_name,
          function_record.function_name,
          SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migration de sécurité terminée';
  RAISE NOTICE 'Nombre de fonctions corrigées : %', functions_updated;
  RAISE NOTICE 'Protection contre les injections de schéma activée';
  RAISE NOTICE '============================================';
END $$;