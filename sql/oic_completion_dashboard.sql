-- Vue dashboard pour monitoring de la complétion OIC
-- À exécuter dans Supabase SQL Editor pour suivi des complétions

CREATE OR REPLACE VIEW oic_completion_dashboard AS
SELECT 
  -- Statistiques globales
  COUNT(*) as total_competences,
  COUNT(CASE WHEN description IS NOT NULL AND length(description) > 50 THEN 1 END) as descriptions_presentes,
  COUNT(CASE WHEN completion_status = 'updated' THEN 1 END) as auto_updated,
  COUNT(CASE WHEN completion_status = 'skipped_empty' THEN 1 END) as skipped_empty,
  COUNT(CASE WHEN completion_status = 'skipped_error' THEN 1 END) as skipped_error,
  COUNT(CASE WHEN completion_status IS NULL THEN 1 END) as non_traites,
  
  -- Taux de complétion
  ROUND(
    COUNT(CASE WHEN description IS NOT NULL AND length(description) > 50 THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as taux_completion_pct,
  
  -- Dernière mise à jour
  MAX(completion_updated_at) as derniere_completion,
  
  -- Erreurs HTTP fréquentes
  COUNT(CASE WHEN completion_last_http = 404 THEN 1 END) as erreurs_404,
  COUNT(CASE WHEN completion_last_http = 403 THEN 1 END) as erreurs_403,
  COUNT(CASE WHEN completion_last_http = 500 THEN 1 END) as erreurs_500,
  
  -- Répartition par rang
  COUNT(CASE WHEN rang = 'A' THEN 1 END) as total_rang_a,
  COUNT(CASE WHEN rang = 'B' THEN 1 END) as total_rang_b,
  COUNT(CASE WHEN rang = 'A' AND description IS NOT NULL AND length(description) > 50 THEN 1 END) as rang_a_completes,
  COUNT(CASE WHEN rang = 'B' AND description IS NOT NULL AND length(description) > 50 THEN 1 END) as rang_b_completes

FROM public.backup_oic_competences;

-- Vue détaillée pour investigation des erreurs
CREATE OR REPLACE VIEW oic_completion_errors AS
SELECT 
  objectif_id,
  intitule,
  rang,
  item_parent,
  completion_status,
  completion_last_http,
  completion_last_error,
  completion_updated_at,
  url_source,
  CASE 
    WHEN completion_last_http = 404 THEN 'Page introuvable'
    WHEN completion_last_http = 403 THEN 'Accès refusé (auth?)'
    WHEN completion_last_http = 500 THEN 'Erreur serveur LiSA'
    WHEN completion_last_error LIKE '%timeout%' THEN 'Timeout réseau'
    WHEN completion_last_error LIKE '%missing_url%' THEN 'URL manquante'
    ELSE completion_last_error
  END as error_category
FROM public.backup_oic_competences
WHERE completion_status = 'skipped_error'
ORDER BY completion_updated_at DESC;

-- Requête pour identifier les candidats à retraitement
CREATE OR REPLACE VIEW oic_completion_retry_candidates AS
SELECT 
  objectif_id,
  intitule,
  rang,
  item_parent,
  completion_last_http,
  completion_last_error,
  completion_updated_at,
  url_source
FROM public.backup_oic_competences
WHERE (
  -- Erreurs temporaires à retenter
  completion_status = 'skipped_error' 
  AND (
    completion_last_http IN (503, 502, 429) -- erreurs serveur temporaires
    OR completion_last_error LIKE '%timeout%'
    OR completion_updated_at < NOW() - INTERVAL '24 hours' -- anciennes erreurs à retenter
  )
)
OR (
  -- Descriptions trop courtes qui pourraient avoir été améliorées
  completion_status = 'skipped_empty' 
  AND completion_updated_at < NOW() - INTERVAL '7 days'
)
ORDER BY completion_updated_at ASC;

-- Commentaires d'utilisation
COMMENT ON VIEW oic_completion_dashboard IS 'Dashboard global de la complétion automatique OIC depuis LiSA';
COMMENT ON VIEW oic_completion_errors IS 'Vue détaillée des erreurs de complétion pour investigation';
COMMENT ON VIEW oic_completion_retry_candidates IS 'Candidats pour relance automatique de complétion';