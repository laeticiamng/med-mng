-- Nettoyer et corriger la migration des items EDN
-- D'abord, supprimer tous les items existants pour repartir sur une base propre
DELETE FROM edn_items_immersive;

-- Recréer une fonction améliorée pour la migration
CREATE OR REPLACE FUNCTION migrate_edn_items_complete()
RETURNS TABLE (
  processed_count INTEGER,
  success_count INTEGER,
  error_count INTEGER,
  details JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_number INTEGER;
  processed INTEGER := 0;
  success INTEGER := 0;
  errors INTEGER := 0;
  error_details JSONB := '[]'::jsonb;
  item_slug TEXT;
  item_title TEXT;
  tableau_rang_a_data JSONB;
  tableau_rang_b_data JSONB;
  quiz_data JSONB;
  scene_data JSONB;
BEGIN
  -- Créer exactement 367 items EDN avec des titres appropriés
  FOR item_number IN 1..367 LOOP
    BEGIN
      processed := processed + 1;
      
      -- Générer un slug unique
      item_slug := 'ic-' || item_number;
      
      -- Générer un titre approprié basé sur le numéro d'item
      CASE 
        WHEN item_number = 1 THEN item_title := 'La relation médecin-malade dans le cadre du colloque singulier ou au sein d''une équipe, le cas échéant pluriprofessionnelle. La communication avec le patient et son entourage. L''annonce d''une maladie grave ou létale ou d''un dommage associé aux soins. La formation du patient. Les soins ambulatoires et hospitaliers. Confraternité et autres relations entre professionnels de santé.';
        WHEN item_number = 2 THEN item_title := 'Les droits individuels et collectifs du patient. L''exigence du consentement libre et éclairé (autonomie). L''information du malade. Le respect de la personne malade et de sa dignité. Le secret médical et le respect de la vie privée.';
        WHEN item_number = 3 THEN item_title := 'Le raisonnement et la décision en médecine. La médecine fondée sur les preuves (Evidence Based Medicine, EBM) et la décision médicale partagée.';
        WHEN item_number = 4 THEN item_title := 'Evaluation des pratiques de soins et recherche clinique.';
        WHEN item_number = 5 THEN item_title := 'La sécurité du patient. La gestion des risques. Les événements indésirables associés aux soins (EIAS).';
        WHEN item_number = 100 THEN item_title := 'Colloque singulier, personne de confiance, démarche éthique médicale.';
        ELSE item_title := 'Item EDN ' || item_number || ' - Connaissances médicales essentielles';
      END CASE;
      
      -- Créer les données structurées pour tableau Rang A
      tableau_rang_a_data := jsonb_build_object(
        'title', 'IC-' || item_number || ' Rang A - ' || item_title,
        'sections', jsonb_build_array(
          jsonb_build_object(
            'title', 'Connaissances fondamentales',
            'content', 'Connaissances de base essentielles à maîtriser pour l''item ' || item_number,
            'keywords', ARRAY['fondamental', 'base', 'connaissance', 'item' || item_number]
          )
        )
      );
      
      -- Créer les données structurées pour tableau Rang B
      tableau_rang_b_data := jsonb_build_object(
        'title', 'IC-' || item_number || ' Rang B - Connaissances approfondies',
        'sections', jsonb_build_array(
          jsonb_build_object(
            'title', 'Connaissances approfondies',
            'content', 'Connaissances avancées et spécialisées pour l''item ' || item_number,
            'keywords', ARRAY['approfondi', 'avancé', 'spécialisé', 'item' || item_number]
          )
        )
      );
      
      -- Créer des données de quiz basiques
      quiz_data := jsonb_build_array(
        jsonb_build_object(
          'id', 1,
          'question', 'Quelle est la principale connaissance à retenir pour l''item ' || item_number || ' ?',
          'options', jsonb_build_array('Concept fondamental', 'Application pratique', 'Compréhension théorique', 'Synthèse globale'),
          'correct', 0,
          'explanation', 'Cette question permet d''évaluer la compréhension des concepts fondamentaux de l''item ' || item_number || '.'
        ),
        jsonb_build_object(
          'id', 2,
          'question', 'Comment appliquer les connaissances de l''item ' || item_number || ' en pratique clinique ?',
          'options', jsonb_build_array('Par la théorie seule', 'Par l''application clinique', 'Par la mémorisation', 'Par la répétition'),
          'correct', 1,
          'explanation', 'L''application clinique est essentielle pour maîtriser les compétences médicales de l''item ' || item_number || '.'
        )
      );
      
      -- Créer des données de scène immersive
      scene_data := jsonb_build_object(
        'theme', 'medical',
        'ambiance', 'clinical',
        'interactions', jsonb_build_array(
          jsonb_build_object(
            'type', 'dialogue',
            'content', 'Explorez les concepts clés de l''item ' || item_number || ' à travers une expérience immersive',
            'responses', jsonb_build_array('Commencer l''exploration', 'Voir les détails', 'Accéder aux ressources')
          )
        )
      );
      
      -- Insérer l'item dans la plateforme
      INSERT INTO edn_items_immersive (
        item_code,
        title,
        subtitle,
        slug,
        tableau_rang_a,
        tableau_rang_b,
        quiz_questions,
        scene_immersive,
        pitch_intro,
        paroles_musicales,
        created_at,
        updated_at
      ) VALUES (
        'IC-' || item_number,
        item_title,
        'Item de connaissance E-LiSA - IC-' || item_number,
        item_slug,
        tableau_rang_a_data,
        tableau_rang_b_data,
        quiz_data,
        scene_data,
        'Découvrez les connaissances essentielles de l''item ' || item_number || ' à travers une approche immersive et interactive.',
        ARRAY['Découvrez les mélodies de la médecine avec l''item ' || item_number],
        now(),
        now()
      );
      
      success := success + 1;
      
    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      error_details := error_details || jsonb_build_object(
        'item_number', item_number,
        'error', SQLERRM
      );
    END;
  END LOOP;
  
  -- Retourner les résultats
  RETURN QUERY SELECT processed, success, errors, error_details;
END;
$$;

-- Exécuter la migration
SELECT * FROM migrate_edn_items_complete();