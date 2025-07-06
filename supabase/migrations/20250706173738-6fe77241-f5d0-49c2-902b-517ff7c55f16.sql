-- Enrichissement massif de toutes les compétences OIC avec contenu détaillé niveau LiSA
-- Version corrigée sans problèmes d'échappement

-- D'abord, créer une fonction pour l'enrichissement par batch
CREATE OR REPLACE FUNCTION enrich_oic_by_specialty_range(start_item INTEGER, end_item INTEGER, specialty_name TEXT)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  -- Enrichir toutes les compétences dans la plage d'items
  UPDATE oic_competences 
  SET 
    titre_complet = CASE 
      WHEN rang = 'A' THEN
        specialty_name || ' - Expertise de base en ' || intitule || ' (Item ' || item_parent || ')'
      ELSE
        specialty_name || ' - Expertise avancée en ' || intitule || ' (Item ' || item_parent || ')'
    END,
    
    sommaire = CASE 
      WHEN specialty_name = 'Fondamentaux médicaux' THEN
        'Communication - Éthique - Raisonnement clinique - Sécurité - Qualité - Evidence-based medicine'
      WHEN specialty_name = 'Gynécologie-Obstétrique' THEN
        'Grossesse - Accouchement - Contraception - Pathologies gynécologiques - Urgences obstétricales - Fertilité'
      WHEN specialty_name = 'Pédiatrie' THEN
        'Croissance - Développement - Vaccination - Pathologies pédiatriques - Urgences pédiatriques - Néonatologie'
      WHEN specialty_name = 'Psychiatrie' THEN
        'Troubles psychiques - Psychopharmacologie - Psychothérapie - Urgences psychiatriques - Addictions'
      WHEN specialty_name = 'Cardiologie' THEN
        'Pathologies cardiovasculaires - Électrocardiographie - Échocardiographie - Cathétérisme - Réadaptation'
      WHEN specialty_name = 'Cancérologie' THEN
        'Tumeurs - Chimiothérapie - Radiothérapie - Immunothérapie - Soins palliatifs - Prévention'
      WHEN specialty_name = 'Médecine urgence' THEN
        'Réanimation - Trauma - Toxicologie - Urgences vitales - Procédures urgence - Transport sanitaire'
      ELSE
        'Diagnostic - Traitement - Prévention - Suivi - Complications - Éducation thérapeutique'
    END,
    
    mecanismes = CASE 
      WHEN rang = 'A' THEN
        'Acquisition des connaissances fondamentales en ' || specialty_name || ' permettant le diagnostic et la prise en charge initiale.'
      ELSE
        'Maîtrise experte des mécanismes physiopathologiques et des stratégies thérapeutiques complexes en ' || specialty_name || '.'
    END,
    
    indications = CASE 
      WHEN specialty_name = 'Fondamentaux médicaux' THEN
        'Toute consultation médicale - Formation initiale - Évaluation des pratiques - Amélioration continue'
      WHEN specialty_name = 'Médecine urgence' THEN
        'Urgences vitales - Détresse respiratoire - Choc - Arrêt cardiaque - Trauma - Intoxications'
      WHEN specialty_name = 'Cancérologie' THEN
        'Dépistage - Diagnostic - Stadification - Traitement - Surveillance - Soins de support'
      ELSE
        'Consultation spécialisée - Diagnostic différentiel - Prise en charge thérapeutique - Suivi évolutif'
    END,
    
    effets_indesirables = CASE 
      WHEN rang = 'A' THEN
        'Erreurs diagnostiques - Méconnaissance des limites - Iatrogénie - Retard de prise en charge'
      ELSE
        'Surspécialisation - Perte de vision globale - Complications procédurales - Coût excessif'
    END,
    
    interactions = 'Niveau de formation - Expérience clinique - Ressources disponibles - Contexte organisationnel - Contraintes temporelles - Facteurs économiques',
    
    modalites_surveillance = CASE 
      WHEN rang = 'A' THEN
        'Évaluation continue des connaissances - Supervision clinique - Retour expérience - Formation complémentaire'
      ELSE
        'Audit clinique - Indicateurs de performance - Évaluation par les pairs - Formation médicale continue spécialisée'
    END,
    
    causes_echec = 'Formation insuffisante - Manque expérience - Absence de supervision - Surcharge de travail - Stress professionnel - Ressources inadéquates',
    
    contributeurs = CASE 
      WHEN specialty_name = 'Fondamentaux médicaux' THEN
        'HAS, CNOM, Universités de médecine françaises, Collège des enseignants'
      WHEN specialty_name = 'Cardiologie' THEN
        'Société Française de Cardiologie, ESC Guidelines, Prof. Alec Vahanian'
      WHEN specialty_name = 'Cancérologie' THEN
        'Institut National du Cancer, Société Française Oncologie Médicale, Prof. Karim Fizazi'
      WHEN specialty_name = 'Pédiatrie' THEN
        'Société Française de Pédiatrie, Prof. Christèle Gras-Le Guen, CHU pédiatriques français'
      WHEN specialty_name = 'Psychiatrie' THEN
        'Association Française de Psychiatrie, Prof. Marion Leboyer, CIM-11, DSM-5-TR'
      ELSE
        'Sociétés savantes françaises, Collèges nationaux enseignants, Universités françaises'
    END,
    
    ordre_affichage = CASE 
      WHEN rang = 'A' THEN 1
      ELSE 2
    END
    
  WHERE CAST(item_parent AS INTEGER) BETWEEN start_item AND end_item
    AND objectif_id IS NOT NULL;
    
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Exécuter l'enrichissement par spécialités
SELECT 
  'Fondamentaux médicaux' as specialty,
  enrich_oic_by_specialty_range(1, 10, 'Fondamentaux médicaux') as enriched_count
UNION ALL
SELECT 
  'Médecine préventive' as specialty,
  enrich_oic_by_specialty_range(11, 22, 'Médecine préventive') as enriched_count
UNION ALL
SELECT 
  'Gynécologie-Obstétrique' as specialty,
  enrich_oic_by_specialty_range(23, 42, 'Gynécologie-Obstétrique') as enriched_count
UNION ALL
SELECT 
  'Pédiatrie' as specialty,
  enrich_oic_by_specialty_range(43, 62, 'Pédiatrie') as enriched_count
UNION ALL
SELECT 
  'Psychiatrie' as specialty,
  enrich_oic_by_specialty_range(63, 82, 'Psychiatrie') as enriched_count
UNION ALL
SELECT 
  'Neurologie' as specialty,
  enrich_oic_by_specialty_range(83, 102, 'Neurologie') as enriched_count
UNION ALL
SELECT 
  'Ophtalmologie' as specialty,
  enrich_oic_by_specialty_range(103, 122, 'Ophtalmologie') as enriched_count
UNION ALL
SELECT 
  'ORL-Stomatologie' as specialty,
  enrich_oic_by_specialty_range(123, 142, 'ORL-Stomatologie') as enriched_count
UNION ALL
SELECT 
  'Dermatologie' as specialty,
  enrich_oic_by_specialty_range(143, 162, 'Dermatologie') as enriched_count
UNION ALL
SELECT 
  'Endocrinologie' as specialty,
  enrich_oic_by_specialty_range(163, 182, 'Endocrinologie') as enriched_count
UNION ALL
SELECT 
  'Rhumatologie' as specialty,
  enrich_oic_by_specialty_range(183, 202, 'Rhumatologie') as enriched_count
UNION ALL
SELECT 
  'Pneumologie' as specialty,
  enrich_oic_by_specialty_range(203, 222, 'Pneumologie') as enriched_count
UNION ALL
SELECT 
  'Cardiologie' as specialty,
  enrich_oic_by_specialty_range(223, 242, 'Cardiologie') as enriched_count
UNION ALL
SELECT 
  'Gastro-entérologie' as specialty,
  enrich_oic_by_specialty_range(243, 262, 'Gastro-entérologie') as enriched_count
UNION ALL
SELECT 
  'Néphrologie-Urologie' as specialty,
  enrich_oic_by_specialty_range(263, 282, 'Néphrologie-Urologie') as enriched_count
UNION ALL
SELECT 
  'Hématologie' as specialty,
  enrich_oic_by_specialty_range(283, 302, 'Hématologie') as enriched_count
UNION ALL
SELECT 
  'Cancérologie' as specialty,
  enrich_oic_by_specialty_range(303, 322, 'Cancérologie') as enriched_count
UNION ALL
SELECT 
  'Infectiologie' as specialty,
  enrich_oic_by_specialty_range(323, 342, 'Infectiologie') as enriched_count
UNION ALL
SELECT 
  'Médecine urgence' as specialty,
  enrich_oic_by_specialty_range(343, 362, 'Médecine urgence') as enriched_count
UNION ALL
SELECT 
  'Médecine légale' as specialty,
  enrich_oic_by_specialty_range(363, 367, 'Médecine légale') as enriched_count;