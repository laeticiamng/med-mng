
-- Correction de l'item IC-2 : Valeurs professionnelles du médecin
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "Rang A - Fondamentaux des valeurs professionnelles",
    "theme": "Valeurs professionnelles médicales",
    "colonnes": ["Valeur cardinale", "Définition", "Application pratique", "Enjeu déontologique", "Exemple concret"],
    "lignes": [
      ["Responsabilité", "Obligation de répondre de ses actes médicaux", "Assumer les conséquences de ses décisions thérapeutiques", "Principe fondamental du code de déontologie", "Médecin assumant une erreur diagnostique et organisant la prise en charge corrective"],
      ["Compassion", "Capacité à comprendre et partager la souffrance du patient", "Accompagnement humain dans la maladie", "Dimension relationnelle du soin", "Soutien émotionnel lors d''annonce de maladie grave"],
      ["Probité", "Honnêteté et intégrité dans l''exercice professionnel", "Transparence dans les relations avec patients et confrères", "Éviter conflits d''intérêts", "Refus d''avantages financiers de laboratoires pharmaceutiques"],
      ["Indépendance", "Liberté de jugement médical sans influence externe", "Préservation de l''autonomie décisionnelle", "Protection contre pressions économiques", "Prescription basée uniquement sur l''indication médicale"],
      ["Confraternité", "Solidarité et respect entre professionnels de santé", "Collaboration interprofessionnelle constructive", "Éviter dénigrement de confrères", "Soutien collégial en cas de difficulté professionnelle"],
      ["Discrétion", "Respect absolu du secret médical", "Protection de la confidentialité des informations patient", "Obligation légale et déontologique", "Non-divulgation d''informations médicales même en famille"]
    ]
  }',
  
  tableau_rang_b = '{
    "title": "Rang B - Organisation et régulation professionnelle",
    "theme": "Instances et mécanismes de régulation",
    "colonnes": ["Instance", "Rôle principal", "Mécanisme d''action", "Sanction possible", "Exemple d''intervention"],
    "lignes": [
      ["Ordre National des Médecins", "Contrôle déontologique de la profession", "Chambre disciplinaire", "Blâme à interdiction d''exercer", "Sanction pour manquement au secret médical"],
      ["Conseil National de l''Ordre", "Élaboration du code de déontologie", "Rédaction et mise à jour des règles", "Avis et recommandations", "Actualisation des règles sur télémédecine"],
      ["Haute Autorité de Santé", "Évaluation des pratiques professionnelles", "Recommandations de bonnes pratiques", "Non-conformité aux RBP", "Évaluation des pratiques en cardiologie"],
      ["Agences Régionales de Santé", "Organisation territoriale des soins", "Autorisation et contrôle établissements", "Fermeture ou restriction d''activité", "Contrôle qualité dans un EHPAD"],
      ["Commissions médicales d''établissement", "Régulation interne hospitalière", "Évaluation des pratiques internes", "Mesures correctives", "Analyse d''événements indésirables"],
      ["Sociétés savantes", "Promotion de l''excellence scientifique", "Formation et recherche", "Exclusion de la société", "Congrès de formation médicale continue"]
    ]
  }',
  
  updated_at = now()
WHERE item_code = 'IC-2';

-- Correction de l'item IC-3 : Raisonnement et décision en médecine
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "Rang A - Fondamentaux du raisonnement médical",
    "theme": "Raisonnement et décision médicale",
    "colonnes": ["Concept", "Définition", "Application", "Avantage", "Limite"],
    "lignes": [
      ["Evidence-Based Medicine", "Médecine fondée sur les preuves scientifiques", "Intégration données-expérience-patient", "Objectivité décisionnelle", "Manque de preuves pour cas rares"],
      ["Démarche PICOT", "Patient-Intervention-Comparator-Outcome-Time", "Formulation de questions cliniques précises", "Structure de recherche efficace", "Rigidité pour situations complexes"],
      ["Raisonnement hypothético-déductif", "Génération d''hypothèses puis tests", "Démarche diagnostique classique", "Méthode systématique", "Biais de confirmation possible"],
      ["Reconnaissance archétypale", "Identification de patterns familiers", "Diagnostic rapide par expérience", "Efficacité temporelle", "Risque d''erreur par généralisation"],
      ["Arbre décisionnel", "Algorithme de prise de décision", "Protocoles de soins standardisés", "Reproductibilité des décisions", "Inadaptation aux cas atypiques"],
      ["Analyse coût-efficacité", "Évaluation économique des interventions", "Choix thérapeutiques rationnels", "Optimisation des ressources", "Dimension éthique questionnée"]
    ]
  }',
  
  tableau_rang_b = '{
    "title": "Rang B - Outils avancés d''aide à la décision",
    "theme": "Systèmes d''aide et analyse complexe",
    "colonnes": ["Outil avancé", "Principe", "Domaine d''application", "Bénéfice", "Prérequis"],
    "lignes": [
      ["Intelligence artificielle médicale", "Algorithmes d''apprentissage automatique", "Aide au diagnostic et pronostic", "Analyse de données massives", "Validation clinique rigoureuse"],
      ["Médecine personnalisée", "Adaptation aux caractéristiques génétiques", "Oncologie et pharmacogénétique", "Thérapies ciblées", "Tests génomiques accessibles"],
      ["Simulation médicale", "Reproduction virtuelle de situations cliniques", "Formation et évaluation", "Apprentissage sans risque patient", "Équipements technologiques"],
      ["Télémédecine décisionnelle", "Consultation à distance avec outils d''aide", "Déserts médicaux et urgences", "Accès aux soins amélioré", "Infrastructures numériques"],
      ["Biomarqueurs prédictifs", "Indicateurs biologiques de réponse", "Médecine de précision", "Stratification des patients", "Validation analytique"],
      ["Registres de données", "Bases de données cliniques structurées", "Surveillance épidémiologique", "Evidence en vraie vie", "Standardisation des données"]
    ]
  }',
  
  updated_at = now()
WHERE item_code = 'IC-3';

-- Correction de l'item IC-4 : Qualité et sécurité des soins
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "Rang A - Fondamentaux qualité-sécurité",
    "theme": "Qualité et sécurité des soins",
    "colonnes": ["Dimension", "Définition", "Indicateur", "Méthode d''évaluation", "Exemple pratique"],
    "lignes": [
      ["Sécurité des soins", "Prévention des événements indésirables", "Taux d''infections nosocomiales", "Signalement et analyse", "Check-list chirurgicale pré-opératoire"],
      ["Efficacité clinique", "Capacité à produire les résultats escomptés", "Mortalité ajustée", "Études comparatives", "Protocoles de prise en charge standardisés"],
      ["Satisfaction patient", "Perception de la qualité par l''usager", "Enquêtes de satisfaction", "Questionnaires validés", "Amélioration de l''accueil et information"],
      ["Continuité des soins", "Coordination entre professionnels", "Taux de réadmissions", "Traçabilité du parcours", "Liaison ville-hôpital structurée"],
      ["Accessibilité", "Facilité d''accès aux soins appropriés", "Délais de rendez-vous", "Analyse des parcours", "Permanence des soins organisée"],
      ["Pertinence", "Adéquation entre besoins et réponse", "Conformité aux recommandations", "Audit de pratiques", "Prescription rationnelle d''antibiotiques"]
    ]
  }',
  
  tableau_rang_b = '{
    "title": "Rang B - Méthodes avancées d''amélioration",
    "theme": "Amélioration continue et innovation",
    "colonnes": ["Méthode", "Principe", "Application", "Résultat attendu", "Facteur de succès"],
    "lignes": [
      ["Lean Healthcare", "Élimination des gaspillages", "Optimisation des flux patients", "Réduction des délais", "Engagement des équipes"],
      ["Revue de Morbi-Mortalité", "Analyse collective des cas complexes", "Apprentissage par l''erreur", "Culture sécurité renforcée", "Non-sanction et confidentialité"],
      ["Simulation haute-fidélité", "Reproduction réaliste de situations", "Formation aux gestes critiques", "Compétences techniques améliorées", "Débriefing structuré"],
      ["Accréditation des équipes", "Évaluation externe volontaire", "Spécialités à haut risque", "Excellence reconnue", "Engagement sur la durée"],
      ["Intelligence collective", "Mobilisation des savoirs distribués", "Résolution de problèmes complexes", "Innovation organisationnelle", "Leadership facilitateur"],
      ["Benchmarking clinique", "Comparaison avec les meilleures pratiques", "Identification d''axes d''amélioration", "Performance comparative", "Données fiables et comparables"]
    ]
  }',
  
  updated_at = now()
WHERE item_code = 'IC-4';

-- L'item IC-5 reste inchangé car il a déjà été corrigé correctement
-- Vérification finale que tous les contenus sont maintenant appropriés
SELECT 
  item_code,
  title,
  tableau_rang_a->>'theme' as theme_a,
  tableau_rang_b->>'theme' as theme_b
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5')
ORDER BY item_code;
