
-- Vérification de l'existence et structure des données
SELECT 
  item_code,
  title,
  CASE WHEN tableau_rang_a IS NOT NULL THEN 'EXISTE' ELSE 'ABSENT' END as rang_a_existe,
  CASE WHEN tableau_rang_b IS NOT NULL THEN 'EXISTE' ELSE 'ABSENT' END as rang_b_existe,
  -- Vérifier la structure des données
  CASE 
    WHEN tableau_rang_a IS NOT NULL THEN jsonb_typeof(tableau_rang_a)
    ELSE 'N/A'
  END as type_rang_a
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5')
ORDER BY item_code;

-- Mise à jour de l'item IC-5 avec un contenu unique sur la relation médecin-patient
UPDATE edn_items_immersive 
SET 
  title = 'La relation médecin-patient',
  subtitle = 'Communication et éthique relationnelle',
  pitch_intro = 'Explorez les fondements de la relation thérapeutique : communication, empathie, consentement éclairé. Une immersion dans l''art de la relation soignant-soigné, pilier de la médecine moderne.',
  tableau_rang_a = '{
    "title": "Rang A - Fondamentaux relationnels",
    "theme": "Relation médecin-patient",
    "colonnes": ["Concept", "Définition", "Exemple", "Piège", "Application"],
    "lignes": [
      ["Communication thérapeutique", "Échange verbal et non-verbal structuré visant à établir une relation de confiance et à faciliter le processus de soins", "Reformulation des inquiétudes du patient, écoute active lors de l''annonce diagnostique", "Ne pas confondre information et communication - l''information est unidirectionnelle", "Adapter le registre de langue, utiliser des supports visuels, vérifier la compréhension"],
      ["Consentement éclairé", "Accord libre et informé du patient après explication des bénéfices, risques et alternatives thérapeutiques", "Signature du consentement opératoire après explication détaillée des risques", "Obtenir une signature ne suffit pas - il faut s''assurer de la compréhension réelle", "Procédure en 3 temps : information, réflexion, décision libre"],
      ["Empathie médicale", "Capacité à comprendre et partager les émotions du patient tout en gardant la distance thérapeutique nécessaire", "Reconnaître la détresse d''un patient anxieux sans se laisser submerger", "Confondre empathie et sympathie - l''empathie garde la distance professionnelle", "Technique du reflet émotionnel et de la validation des sentiments"],
      ["Annonce diagnostique", "Communication structurée d''un diagnostic, particulièrement quand il s''agit de mauvaises nouvelles", "Protocole SPIKES pour annoncer un cancer : Setting, Perception, Invitation, Knowledge, Emotions, Strategy", "Annoncer trop brutalement ou au contraire éviter l''annonce par peur", "Préparation du cadre, évaluation des attentes, annonce progressive et accompagnement"]
    ]
  }',
  tableau_rang_b = '{
    "title": "Rang B - Maîtrise relationnelle avancée",
    "theme": "Relation médecin-patient expert",
    "colonnes": ["Concept Expert", "Analyse Approfondie", "Cas Complexe", "Écueil Subtil", "Maîtrise Technique"],
    "lignes": [
      ["Transfert et contre-transfert", "Phénomènes psychologiques inconscients influençant la relation thérapeutique : projections du patient sur le médecin et réactions émotionnelles du médecin", "Patient agressif rappelant au médecin son propre père autoritaire, générant une réaction de rejet", "Nier l''existence de ces phénomènes ou les laisser influencer les décisions médicales", "Supervision régulière, analyse des réactions émotionnelles, formation à la psychologie médicale"],
      ["Communication en situation de crise", "Gestion de la communication lors de conflits, erreurs médicales ou situations d''urgence émotionnelle", "Gestion de l''agressivité familiale après complication post-opératoire inattendue", "Adopter une posture défensive ou au contraire accepter tous les reproches", "Technique de désescalade, reconnaissance sans culpabilisation, proposition de solutions constructives"],
      ["Médiation interculturelle", "Adaptation de la communication aux différences culturelles, religieuses et sociales des patients", "Prise en charge d''une patiente de culture musulmane refusant l''examen par un médecin homme", "Imposer sa vision ou céder sans réflexion aux demandes culturelles", "Négociation respectueuse, recherche de compromis médicalement acceptables, médiation culturelle"],
      ["Éthique de la vulnérabilité", "Prise en charge spécifique des patients en situation de vulnérabilité : mineurs, personnes âgées, handicap mental", "Obtention du consentement chez une personne avec déficience intellectuelle légère", "Infantiliser ou au contraire ne pas adapter l''approche à la vulnérabilité", "Évaluation de la capacité de discernement, implication de la personne de confiance, adaptation pédagogique"]
    ]
  }',
  updated_at = now()
WHERE item_code = 'IC-5';

-- Vérification que l'item IC-4 a bien son contenu spécifique (qualité et sécurité des soins)
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "Rang A - Bases qualité-sécurité",
    "theme": "Qualité et sécurité des soins",
    "colonnes": ["Concept", "Définition", "Exemple", "Piège", "Application"],
    "lignes": [
      ["Événement indésirable", "Événement défavorable pour le patient, consécutif aux soins et non lié à l''évolution naturelle de la maladie", "Chute d''un patient hospitalisé, erreur de médicament, infection nosocomiale", "Confondre événement indésirable et faute professionnelle", "Déclaration systématique, analyse des causes, mesures correctives"],
      ["Culture sécurité", "Ensemble des valeurs, attitudes et comportements partagés qui privilégient la sécurité du patient", "Équipe qui encourage la déclaration des erreurs sans sanctions punitives", "Croire qu''il suffit de former pour changer la culture", "Leadership visible, communication ouverte, apprentissage par l''erreur"],
      ["Identitovigilance", "Processus visant à sécuriser l''identification du patient à toutes les étapes de sa prise en charge", "Vérification systématique identité avant acte : nom, prénom, date de naissance", "Se contenter de demander le nom sans vérifier", "Double contrôle, bracelet d''identification, procédures standardisées"],
      ["Conciliation médicamenteuse", "Processus formalisé de transmission et de vérification des traitements médicamenteux lors des transitions de soins", "Bilan médicamenteux exhaustif à l''admission puis à la sortie d''hospitalisation", "Oublier les médicaments sans ordonnance ou les compléments alimentaires", "Entretien pharmaceutique, implication du patient, transmission structurée"]
    ]
  }',
  updated_at = now()
WHERE item_code = 'IC-4';
