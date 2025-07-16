-- 🔄 FUSION DES 3 TABLES EN UNE TABLE COMPLÈTE
-- Création d'une table unifiée contenant toutes les données des tables EDN et OIC

-- Créer la nouvelle table fusionnée
CREATE TABLE IF NOT EXISTS public.edn_items_complete (
  -- Champs principaux de edn_items_immersive
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  slug text NOT NULL UNIQUE,
  pitch_intro text,
  
  -- Données immersives
  tableau_rang_a jsonb,
  tableau_rang_b jsonb,
  quiz_questions jsonb,
  scene_immersive jsonb,
  paroles_musicales text[],
  interaction_config jsonb,
  audio_ambiance jsonb,
  visual_ambiance jsonb,
  reward_messages jsonb,
  payload_v2 jsonb,
  
  -- Compétences OIC intégrées
  competences_oic_rang_a jsonb DEFAULT '[]'::jsonb,
  competences_oic_rang_b jsonb DEFAULT '[]'::jsonb,
  competences_count_total integer DEFAULT 0,
  competences_count_rang_a integer DEFAULT 0,
  competences_count_rang_b integer DEFAULT 0,
  
  -- Métadonnées enrichies
  specialite text,
  domaine_medical text,
  niveau_complexite text DEFAULT 'intermediaire',
  mots_cles text[],
  tags_medicaux text[],
  
  -- Statut et validation
  status text DEFAULT 'active',
  is_validated boolean DEFAULT false,
  validation_date timestamp with time zone,
  completeness_score integer DEFAULT 0,
  
  -- Données de sauvegarde intégrées
  backup_data jsonb DEFAULT '{}'::jsonb,
  migration_notes text,
  
  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Fonction pour fusionner toutes les données
CREATE OR REPLACE FUNCTION public.merge_all_tables_into_complete()
RETURNS TABLE(
  processed_items integer,
  integrated_competences integer,
  backup_items_restored integer,
  total_unified_records integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  backup_record RECORD;
  competence_record RECORD;
  processed integer := 0;
  competences_integrated integer := 0;
  backup_restored integer := 0;
  item_number text;
  oic_rang_a jsonb := '[]'::jsonb;
  oic_rang_b jsonb := '[]'::jsonb;
  specialite_determined text;
  domaine_determined text;
  mots_cles_array text[];
  completeness integer;
BEGIN
  -- 1. Insérer tous les items de edn_items_immersive
  FOR item_record IN 
    SELECT * FROM edn_items_immersive ORDER BY item_code
  LOOP
    processed := processed + 1;
    
    -- Extraire le numéro d'item pour les compétences OIC
    item_number := LPAD(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)')::INTEGER::TEXT, 3, '0');
    
    -- Réinitialiser les tableaux OIC
    oic_rang_a := '[]'::jsonb;
    oic_rang_b := '[]'::jsonb;
    
    -- Récupérer les compétences OIC Rang A depuis backup_oic_competences
    SELECT jsonb_agg(
      jsonb_build_object(
        'objectif_id', objectif_id,
        'intitule', intitule,
        'description', description,
        'rubrique', rubrique,
        'rang', rang,
        'ordre', ordre,
        'url_source', url_source,
        'extraction_status', extraction_status,
        'hash_content', hash_content,
        'raw_json', raw_json
      )
    ) INTO oic_rang_a
    FROM backup_oic_competences
    WHERE item_parent = item_number AND rang = 'A';
    
    -- Récupérer les compétences OIC Rang B
    SELECT jsonb_agg(
      jsonb_build_object(
        'objectif_id', objectif_id,
        'intitule', intitule,
        'description', description,
        'rubrique', rubrique,
        'rang', rang,
        'ordre', ordre,
        'url_source', url_source,
        'extraction_status', extraction_status,
        'hash_content', hash_content,
        'raw_json', raw_json
      )
    ) INTO oic_rang_b
    FROM backup_oic_competences
    WHERE item_parent = item_number AND rang = 'B';
    
    -- Si pas de compétences trouvées, utiliser des tableaux vides
    IF oic_rang_a IS NULL THEN oic_rang_a := '[]'::jsonb; END IF;
    IF oic_rang_b IS NULL THEN oic_rang_b := '[]'::jsonb; END IF;
    
    competences_integrated := competences_integrated + 
      jsonb_array_length(oic_rang_a) + jsonb_array_length(oic_rang_b);
    
    -- Déterminer la spécialité médicale selon le numéro d'item
    CASE 
      WHEN SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)')::INTEGER BETWEEN 1 AND 10 THEN
        specialite_determined := 'Fondamentaux médicaux';
        domaine_determined := 'Relation thérapeutique';
      WHEN SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)')::INTEGER BETWEEN 23 AND 46 THEN
        specialite_determined := 'Gynécologie-Obstétrique';
        domaine_determined := 'Santé de la femme';
      WHEN SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)')::INTEGER BETWEEN 47 AND 57 THEN
        specialite_determined := 'Pédiatrie';
        domaine_determined := 'Santé de l''enfant';
      WHEN SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)')::INTEGER BETWEEN 60 AND 80 THEN
        specialite_determined := 'Psychiatrie';
        domaine_determined := 'Santé mentale';
      WHEN SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)')::INTEGER BETWEEN 91 AND 110 THEN
        specialite_determined := 'Neurologie';
        domaine_determined := 'Système nerveux';
      WHEN SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)')::INTEGER BETWEEN 221 AND 239 THEN
        specialite_determined := 'Cardiologie';
        domaine_determined := 'Système cardiovasculaire';
      WHEN SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)')::INTEGER BETWEEN 290 AND 320 THEN
        specialite_determined := 'Cancérologie';
        domaine_determined := 'Oncologie médicale';
      WHEN SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)')::INTEGER BETWEEN 331 AND 367 THEN
        specialite_determined := 'Médecine d''urgence';
        domaine_determined := 'Urgences et réanimation';
      ELSE
        specialite_determined := 'Médecine générale';
        domaine_determined := 'Médecine générale';
    END CASE;
    
    -- Générer les mots-clés à partir du titre
    mots_cles_array := string_to_array(
      lower(regexp_replace(item_record.title, '[^a-zA-ZÀ-ÿ\s]', '', 'g')), 
      ' '
    );
    
    -- Calculer le score de complétude (sur 100)
    completeness := (
      CASE WHEN item_record.tableau_rang_a IS NOT NULL THEN 20 ELSE 0 END +
      CASE WHEN item_record.tableau_rang_b IS NOT NULL THEN 20 ELSE 0 END +
      CASE WHEN item_record.quiz_questions IS NOT NULL THEN 15 ELSE 0 END +
      CASE WHEN item_record.scene_immersive IS NOT NULL THEN 15 ELSE 0 END +
      CASE WHEN item_record.paroles_musicales IS NOT NULL AND array_length(item_record.paroles_musicales, 1) > 0 THEN 10 ELSE 0 END +
      CASE WHEN jsonb_array_length(oic_rang_a) > 0 THEN 10 ELSE 0 END +
      CASE WHEN jsonb_array_length(oic_rang_b) > 0 THEN 10 ELSE 0 END
    );
    
    -- Insérer dans la table unifiée
    INSERT INTO edn_items_complete (
      id, item_code, title, subtitle, slug, pitch_intro,
      tableau_rang_a, tableau_rang_b, quiz_questions, scene_immersive,
      paroles_musicales, interaction_config, audio_ambiance, visual_ambiance,
      reward_messages, payload_v2,
      competences_oic_rang_a, competences_oic_rang_b,
      competences_count_total, competences_count_rang_a, competences_count_rang_b,
      specialite, domaine_medical, mots_cles,
      tags_medicaux, is_validated, completeness_score,
      migration_notes, created_at, updated_at
    ) VALUES (
      item_record.id, item_record.item_code, item_record.title, 
      item_record.subtitle, item_record.slug, item_record.pitch_intro,
      item_record.tableau_rang_a, item_record.tableau_rang_b, 
      item_record.quiz_questions, item_record.scene_immersive,
      item_record.paroles_musicales, item_record.interaction_config,
      item_record.audio_ambiance, item_record.visual_ambiance,
      item_record.reward_messages, item_record.payload_v2,
      oic_rang_a, oic_rang_b,
      jsonb_array_length(oic_rang_a) + jsonb_array_length(oic_rang_b),
      jsonb_array_length(oic_rang_a), jsonb_array_length(oic_rang_b),
      specialite_determined, domaine_determined, mots_cles_array,
      ARRAY[specialite_determined, domaine_determined, item_record.item_code],
      (completeness >= 80), completeness,
      'Migré depuis edn_items_immersive avec compétences OIC intégrées le ' || now()::text,
      item_record.created_at, now()
    )
    ON CONFLICT (item_code) DO UPDATE SET
      competences_oic_rang_a = EXCLUDED.competences_oic_rang_a,
      competences_oic_rang_b = EXCLUDED.competences_oic_rang_b,
      competences_count_total = EXCLUDED.competences_count_total,
      competences_count_rang_a = EXCLUDED.competences_count_rang_a,
      competences_count_rang_b = EXCLUDED.competences_count_rang_b,
      specialite = EXCLUDED.specialite,
      domaine_medical = EXCLUDED.domaine_medical,
      completeness_score = EXCLUDED.completeness_score,
      updated_at = now();
  END LOOP;
  
  -- 2. Intégrer les données de backup_edn_items_immersive si différentes
  FOR backup_record IN 
    SELECT * FROM backup_edn_items_immersive 
    WHERE item_code NOT IN (SELECT item_code FROM edn_items_complete)
  LOOP
    backup_restored := backup_restored + 1;
    
    INSERT INTO edn_items_complete (
      item_code, title, subtitle, slug, pitch_intro,
      tableau_rang_a, tableau_rang_b, paroles_musicales,
      backup_data, migration_notes, status
    ) VALUES (
      backup_record.item_code, 
      COALESCE(backup_record.title, 'Item restauré depuis backup'),
      backup_record.subtitle, backup_record.slug, backup_record.pitch_intro,
      backup_record.tableau_rang_a, backup_record.tableau_rang_b,
      backup_record.paroles_musicales,
      to_jsonb(backup_record),
      'Restauré depuis backup_edn_items_immersive le ' || now()::text,
      'restored_from_backup'
    )
    ON CONFLICT (item_code) DO NOTHING;
  END LOOP;
  
  RETURN QUERY SELECT 
    processed, 
    competences_integrated, 
    backup_restored,
    (SELECT COUNT(*)::integer FROM edn_items_complete);
END;
$$;

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_edn_items_complete_item_code ON edn_items_complete(item_code);
CREATE INDEX IF NOT EXISTS idx_edn_items_complete_specialite ON edn_items_complete(specialite);
CREATE INDEX IF NOT EXISTS idx_edn_items_complete_status ON edn_items_complete(status);
CREATE INDEX IF NOT EXISTS idx_edn_items_complete_completeness ON edn_items_complete(completeness_score);
CREATE INDEX IF NOT EXISTS idx_edn_items_complete_tags ON edn_items_complete USING GIN(tags_medicaux);
CREATE INDEX IF NOT EXISTS idx_edn_items_complete_mots_cles ON edn_items_complete USING GIN(mots_cles);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_edn_items_complete_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_edn_items_complete_updated_at
  BEFORE UPDATE ON edn_items_complete
  FOR EACH ROW
  EXECUTE FUNCTION update_edn_items_complete_updated_at();

-- Activer RLS sur la nouvelle table
ALTER TABLE edn_items_complete ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour permettre la lecture publique
CREATE POLICY "Allow public read access to complete EDN items" 
ON edn_items_complete 
FOR SELECT 
USING (true);

-- Exécuter la fusion
SELECT * FROM public.merge_all_tables_into_complete();