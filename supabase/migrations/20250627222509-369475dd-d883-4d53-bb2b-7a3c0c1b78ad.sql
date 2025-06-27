
-- Mise à jour complète de tous les items IC-1 à IC-5 avec les contenus conformes aux fiches E-LiSA

-- Mise à jour de l'item IC-1 : La relation médecin-malade (15 compétences Rang A)
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "Rang A - Fondamentaux de la relation médecin-malade",
    "theme": "La relation médecin-malade",
    "colonnes": ["Compétence E-LiSA", "Définition", "Application pratique", "Exemple concret", "Point de vigilance"],
    "lignes": [
      ["Connaître les devoirs du médecin", "Obligations déontologiques et légales du médecin envers ses patients", "Respect des principes du code de déontologie", "Secret médical, information du patient, continuité des soins", "Ne pas confondre obligations légales et recommandations"],
      ["Connaître les droits du malade", "Droits fondamentaux du patient dans le système de soins", "Information, consentement, refus de soins, accès au dossier", "Droit à l''information claire et loyale sur son état", "Respecter les droits même en cas de refus de soins"],
      ["Établir une relation de confiance", "Construction d''une alliance thérapeutique solide", "Communication empathique et professionnelle", "Écoute active, respect de la personne, confidentialité", "Éviter la familiarité excessive ou la distance froide"],
      ["Communiquer avec le patient et son entourage", "Adaptation de la communication selon le contexte", "Langage adapté, vérification de la compréhension", "Annonce diagnostic, explication traitement, soutien famille", "Adapter le niveau de langage sans être condescendant"],
      ["Gérer les situations difficiles", "Gestion des conflits et tensions dans la relation soignant-soigné", "Techniques de désescalade, médiation", "Patient agressif, famille inquiète, refus de soins", "Rester professionnel tout en étant humain"],
      ["Respecter la confidentialité", "Protection des informations médicales du patient", "Secret médical absolu sauf exceptions légales", "Non-divulgation à la famille sans accord patient", "Connaître les exceptions légales au secret médical"],
      ["Obtenir le consentement éclairé", "Information préalable et accord libre du patient", "Explication des risques, bénéfices, alternatives", "Consentement opératoire, traitement, examens", "S''assurer de la réelle compréhension du patient"],
      ["Respecter la dignité du patient", "Préservation de la dignité humaine en toutes circonstances", "Respect de l''intimité, de la pudeur, des convictions", "Examen clinique respectueux, soins en fin de vie", "Maintenir la dignité même dans les situations dégradées"],
      ["Gérer l''annonce d''une maladie grave", "Techniques d''annonce adaptées et humanisées", "Protocole d''annonce, soutien psychologique", "Annonce cancer, maladie chronique, pronostic", "Adapter le rythme à la capacité d''écoute du patient"],
      ["Accompagner la fin de vie", "Soins palliatifs et accompagnement des mourants", "Soulagement de la douleur, soutien moral", "Soins de confort, présence, aide aux proches", "Distinguer acharnement thérapeutique et soins appropriés"],
      ["Prendre en compte les aspects culturels", "Adaptation aux différences culturelles et religieuses", "Respect des croyances, adaptation des soins", "Pratiques religieuses, habitudes alimentaires", "Éviter les stéréotypes tout en respectant les différences"],
      ["Gérer la douleur du patient", "Évaluation et traitement adapté de la douleur", "Échelles d''évaluation, traitements multimodaux", "Douleur aiguë, chronique, procédures douloureuses", "Ne pas sous-estimer la douleur exprimée par le patient"],
      ["Informer sur les traitements", "Explication claire des modalités thérapeutiques", "Bénéfices, risques, alternatives, surveillance", "Posologie, effets secondaires, interactions", "Vérifier la compréhension et l''observance"],
      ["Respecter l''autonomie du patient", "Respect du droit à l''autodétermination", "Participation aux décisions, choix éclairés", "Refus de traitement, demande d''arrêt", "Concilier autonomie et bienfaisance médicale"],
      ["Assurer la continuité des soins", "Organisation du suivi et des transitions", "Coordination entre professionnels, transmission", "Sortie d''hospitalisation, suivi ambulatoire", "Éviter les ruptures dans la prise en charge"]
    ]
  }',
  
  tableau_rang_b = '{
    "title": "Rang B - Approfondissements (Non applicable pour IC-1)",
    "theme": "Pas de compétences Rang B pour cet item selon E-LiSA",
    "colonnes": ["Information", "Précisions"],
    "lignes": [
      ["Item IC-1", "Toutes les 15 compétences sont classées en Rang A selon la fiche E-LiSA officielle"]
    ]
  }',
  
  pitch_intro = 'Maîtrisez les 15 compétences fondamentales de la relation médecin-malade selon la fiche E-LiSA officielle. Un parcours complet pour développer une relation thérapeutique de qualité, respectueuse et efficace.',
  
  updated_at = now()
WHERE item_code = 'IC-1';

-- Mise à jour de l'item IC-2 : Valeurs professionnelles du médecin (7 Rang A + 2 Rang B = 9 compétences)
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "Rang A - Valeurs professionnelles fondamentales",
    "theme": "Valeurs professionnelles du médecin",
    "colonnes": ["Valeur E-LiSA", "Définition", "Application concrète", "Manifestation pratique", "Dérive à éviter"],
    "lignes": [
      ["Responsabilité professionnelle", "Obligation de répondre de ses actes médicaux", "Assumer les conséquences de ses décisions", "Reconnaissance d''erreur, mesures correctives", "Fuir ses responsabilités ou rejeter la faute"],
      ["Compassion et empathie", "Capacité à comprendre et partager la souffrance", "Accompagnement humain dans la maladie", "Écoute attentive, présence réconfortante", "Fausse compassion ou distance excessive"],
      ["Probité et honnêteté", "Intégrité morale dans l''exercice professionnel", "Transparence avec patients et confrères", "Aveu d''ignorance, refus de corruption", "Mensonge, dissimulation, arrangements"],
      ["Indépendance professionnelle", "Liberté de jugement sans influence externe", "Décisions basées sur l''intérêt du patient", "Refus de pressions commerciales ou administratives", "Soumission aux intérêts économiques"],
      ["Confraternité médicale", "Solidarité et respect entre professionnels", "Collaboration constructive et bienveillante", "Soutien mutuel, transmission de savoir", "Dénigrement de confrères, concurrence déloyale"],
      ["Respect du secret médical", "Protection absolue de la confidentialité", "Non-divulgation des informations patient", "Silence professionnel, discrétion totale", "Bavardages, indiscrétions, violations"],
      ["Engagement dans la formation", "Participation à l''amélioration des connaissances", "Formation continue, enseignement", "Congrès, lectures, tutorat d''étudiants", "Stagnation intellectuelle, refus d''évoluer"]
    ]
  }',
  
  tableau_rang_b = '{
    "title": "Rang B - Organisation et régulation de la profession",
    "theme": "Structures professionnelles et déontologiques",
    "colonnes": ["Structure E-LiSA", "Rôle principal", "Mécanisme d''action", "Pouvoir de sanction", "Exemple d''intervention"],
    "lignes": [
      ["Ordre National des Médecins", "Veille déontologique de la profession médicale", "Contrôle disciplinaire par chambres régionales", "Sanctions du simple avertissement à l''interdiction d''exercer", "Sanction pour violation du secret médical ou incompétence"],
      ["Instances de régulation", "Contrôle de la qualité et de l''éthique médicale", "Évaluation des pratiques et recommandations", "Mesures d''amélioration ou restrictions d''exercice", "Audit de pratiques, formation obligatoire en cas de défaillance"]
    ]
  }',
  
  updated_at = now()
WHERE item_code = 'IC-2';

-- Mise à jour de l'item IC-3 : Raisonnement et décision en médecine (12 Rang A + 11 Rang B = 23 compétences)
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "Rang A - Fondamentaux du raisonnement médical",
    "theme": "Raisonnement et décision en médecine",
    "colonnes": ["Compétence E-LiSA", "Définition", "Application pratique", "Outil/Méthode", "Limitation principale"],
    "lignes": [
      ["Evidence-Based Medicine (EBM)", "Médecine fondée sur les meilleures preuves disponibles", "Intégration preuves-expérience-préférences patient", "Méta-analyses, essais contrôlés randomisés", "Manque de preuves pour situations rares"],
      ["Niveaux de preuve", "Hiérarchisation de la qualité des données scientifiques", "Classification des recommandations selon leur solidité", "Échelle GRADE, pyramide des preuves", "Application rigide sans adaptation clinique"],
      ["Raisonnement hypothético-déductif", "Génération d''hypothèses puis tests diagnostiques", "Démarche diagnostique systématique", "Anamnèse orientée, examens ciblés", "Biais de confirmation, tunnel vision"],
      ["Reconnaissance de formes", "Identification rapide de patterns cliniques", "Diagnostic par comparaison à des cas connus", "Expérience clinique, archétypes", "Erreur par généralisation abusive"],
      ["Démarche diagnostique", "Processus structuré de recherche diagnostique", "Interrogatoire-examen-examens complémentaires", "Arbres décisionnels, protocoles", "Rigidité face aux présentations atypiques"],
      ["Prise de décision partagée", "Association du patient aux choix thérapeutiques", "Information-délibération-décision commune", "Outils d''aide à la décision patient", "Paternalisme médical ou abandon du patient"],
      ["Gestion de l''incertitude", "Acceptation et gestion des zones d''ombre", "Communication de l''incertitude au patient", "Probabilités, intervalles de confiance", "Paralysie décisionnelle ou fausse certitude"],
      ["Analyse de la littérature", "Évaluation critique des publications médicales", "Lecture critique d''articles scientifiques", "Grilles de lecture, formation méthodologique", "Acceptation aveugle ou rejet systématique"],
      ["Utilisation de scores", "Application d''outils pronostiques validés", "Aide à la décision par quantification du risque", "Scores de gravité, calculateurs de risque", "Application mécanique sans réflexion clinique"],
      ["Technologies d''aide", "Utilisation d''outils informatiques d''assistance", "Systèmes d''aide à la décision clinique", "Logiciels médicaux, intelligence artificielle", "Substitution de l''outil au raisonnement"],
      ["Raisonnement éthique", "Intégration des considérations éthiques", "Balance bénéfices-risques dans le contexte", "Comités d''éthique, principes bioéthiques", "Technicisme sans dimension humaine"],
      ["Communication des décisions", "Transmission claire des choix thérapeutiques", "Explication du raisonnement au patient", "Pédagogie médicale, support visuel", "Jargon médical incompréhensible"]
    ]
  }',
  
  tableau_rang_b = '{
    "title": "Rang B - Outils avancés et méthodes expertes",
    "theme": "Méthodes avancées de raisonnement et décision",
    "colonnes": ["Méthode avancée E-LiSA", "Principe", "Domaine d''application", "Avantage spécifique", "Prérequis technique"],
    "lignes": [
      ["Analyse décisionnelle formelle", "Modélisation mathématique des choix", "Décisions complexes multi-critères", "Objectivation des préférences", "Formation en analyse décisionnelle"],
      ["Méta-analyse et revues systématiques", "Synthèse quantitative de la littérature", "Établissement de recommandations", "Niveau de preuve maximal", "Compétences méthodologiques avancées"],
      ["Modélisation prédictive", "Utilisation d''algorithmes prédictifs", "Pronostic et stratification des risques", "Personnalisation des soins", "Données de qualité et outils informatiques"],
      ["Intelligence artificielle médicale", "Apprentissage automatique appliqué", "Aide au diagnostic et à la décision", "Traitement de données massives", "Infrastructure technologique"],
      ["Simulation et modélisation", "Reproduction virtuelle de scénarios", "Formation et test de stratégies", "Apprentissage sans risque", "Plateformes de simulation"],
      ["Recherche translationnelle", "Passage de la recherche à la pratique", "Innovation thérapeutique", "Accélération des découvertes", "Partenariats recherche-clinique"],
      ["Évaluation médico-économique", "Analyse coûts-efficacité des interventions", "Optimisation des ressources", "Rationalisation des choix", "Compétences en économie de la santé"],
      ["Médecine personnalisée", "Adaptation aux caractéristiques individuelles", "Thérapies ciblées", "Optimisation thérapeutique", "Tests génomiques et biomarqueurs"],
      ["Systèmes complexes", "Approche systémique des problèmes", "Pathologies multifactorielles", "Vision globale intégrée", "Pensée systémique développée"],
      ["Analyse de big data", "Exploitation de grandes bases de données", "Recherche en vie réelle", "Détection de signaux faibles", "Compétences en data science"],
      ["Télémédecine avancée", "Consultations et diagnostics à distance", "Accès aux soins optimisé", "Dépassement des barrières géographiques", "Technologies de communication"]
    ]
  }',
  
  updated_at = now()
WHERE item_code = 'IC-3';

-- Mise à jour de l'item IC-4 : Qualité et sécurité des soins (20 Rang A + 32 Rang B = 52 compétences)
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "Rang A - Fondamentaux qualité-sécurité",
    "theme": "Qualité et sécurité des soins",
    "colonnes": ["Concept E-LiSA", "Définition", "Indicateur", "Méthode d''évaluation", "Application pratique"],
    "lignes": [
      ["Définition de la qualité", "Aptitude à satisfaire les exigences : efficacité, sécurité, respect", "Indicateurs multidimensionnels", "Évaluation selon référentiels", "Amélioration continue des pratiques"],
      ["Définition de la sécurité", "Absence de dommage évitable au patient", "Taux d''événements indésirables", "Signalement et analyse des incidents", "Mise en place de barrières préventives"],
      ["Événements indésirables associés aux soins", "Dommages liés aux soins plutôt qu''à la maladie", "Classification par gravité", "Déclaration systématique", "Analyse des causes et mesures correctives"],
      ["Culture sécurité", "État d''esprit organisationnel favorisant la sécurité", "Enquêtes de culture", "Évaluation comportementale", "Formation et sensibilisation des équipes"],
      ["Gestion des risques", "Identification et maîtrise des dangers", "Cartographie des risques", "Analyse prospective", "Plans de prévention et de gestion"],
      ["Amélioration continue", "Démarche permanente d''optimisation", "Cycles PDCA", "Audit et réévaluation", "Projets d''amélioration ciblés"],
      ["Indicateurs qualité", "Mesures objectives de la performance", "Tableau de bord", "Collecte et analyse systématiques", "Pilotage par les indicateurs"],
      ["Accréditation", "Évaluation externe de la qualité", "Certification par organismes", "Audit externe", "Mise en conformité avec référentiels"],
      ["Certification", "Reconnaissance officielle de la qualité", "Labels de qualité", "Processus de validation", "Maintien des standards"],
      ["Évaluation des pratiques", "Analyse de la conformité aux recommandations", "Audit clinique", "Comparaison aux bonnes pratiques", "Formation et mise à niveau"],
      ["Signalement des événements", "Déclaration des incidents et accidents", "Systèmes de reporting", "Analyse des déclarations", "Retour d''expérience organisé"],
      ["Analyse des causes", "Recherche des facteurs contributifs", "Méthode d''analyse systémique", "Investigation approfondie", "Mesures correctives ciblées"],
      ["Prévention des infections", "Lutte contre les infections associées aux soins", "Surveillance épidémiologique", "Mesures d''hygiène", "Protocoles de prévention"],
      ["Bon usage du médicament", "Utilisation rationnelle des thérapeutiques", "Indicateurs de prescription", "Conciliation médicamenteuse", "Éviter erreurs et interactions"],
      ["Sécurité du patient", "Protection contre les risques évitables", "Barrières de sécurité", "Check-lists et protocoles", "Prévention des erreurs humaines"],
      ["Qualité des soins", "Excellence dans la prise en charge", "Satisfaction patient", "Mesure des résultats", "Optimisation du parcours de soins"],
      ["Formation à la sécurité", "Développement des compétences sécuritaires", "Programmes de formation", "Simulation et cas pratiques", "Maintien des compétences"],
      ["Communication sécurisée", "Transmission fiable des informations", "Protocoles de communication", "Outils de transmission", "Éviter les malentendus"],
      ["Travail en équipe", "Collaboration multidisciplinaire efficace", "Dynamique d''équipe", "Communication interprofessionnelle", "Coordination des soins"],
      ["Gestion des urgences", "Organisation de la réponse aux situations critiques", "Procédures d''urgence", "Plans de crise", "Réactivité et efficacité"]
    ]
  }',
  
  tableau_rang_b = '{
    "title": "Rang B - Méthodes avancées et expertise",
    "theme": "Approches expertes en qualité-sécurité",
    "colonnes": ["Méthode experte E-LiSA", "Principe avancé", "Application spécialisée", "Bénéfice attendu", "Expertise requise"],
    "lignes": [
      ["Analyse probabiliste des risques", "Modélisation mathématique des dangers", "Évaluation quantitative des risques", "Priorisation objective des actions", "Statistiques et modélisation"],
      ["Méthodes Lean Healthcare", "Élimination des gaspillages dans les soins", "Optimisation des processus", "Efficience et qualité", "Formation aux méthodes Lean"],
      ["Six Sigma médical", "Réduction de la variabilité des processus", "Amélioration de la reproductibilité", "Standardisation des pratiques", "Certification Six Sigma"],
      ["Analyse des modes de défaillance", "AMDEC appliquée aux soins", "Prévention proactive des erreurs", "Anticipation des dysfonctionnements", "Méthodologie AMDEC"],
      ["Facteurs humains", "Ergonomie cognitive appliquée", "Adaptation des systèmes à l''humain", "Réduction de l''erreur humaine", "Psychologie cognitive"],
      ["Simulation haute-fidélité", "Reproduction réaliste de situations", "Formation aux situations critiques", "Apprentissage sans risque", "Technologies de simulation"],
      ["Revue de morbi-mortalité", "Analyse collective des cas complexes", "Apprentissage par l''expérience", "Culture d''amélioration", "Animation de groupes"],
      ["Benchmarking clinique", "Comparaison avec les meilleures pratiques", "Identification des écarts", "Amélioration par comparaison", "Analyses comparatives"],
      ["Accréditation des équipes", "Certification volontaire d''excellence", "Reconnaissance de l''expertise", "Amélioration continue", "Démarche qualité approfondie"],
      ["Gestion électronique", "Systèmes d''information qualité", "Traçabilité numérique", "Automatisation des contrôles", "Compétences informatiques"],
      ["Intelligence artificielle qualité", "IA appliquée à la sécurité", "Détection automatique d''anomalies", "Surveillance continue", "Technologies IA"],
      ["Analyse prédictive", "Anticipation des événements indésirables", "Prévention précoce", "Intervention avant l''incident", "Modélisation prédictive"],
      ["Méthodes participatives", "Implication des patients dans la qualité", "Co-construction de l''amélioration", "Centrage sur l''usager", "Animation participative"],
      ["Approche systémique", "Vision globale des interactions", "Compréhension des interdépendances", "Solutions intégrées", "Pensée systémique"],
      ["Évaluation médico-économique", "Analyse coût-efficacité de la qualité", "Optimisation des ressources", "Rentabilité de la qualité", "Économie de la santé"],
      ["Certification ISO", "Standards internationaux de qualité", "Reconnaissance internationale", "Harmonisation des pratiques", "Normes ISO spécialisées"],
      ["Métrologie médicale", "Mesure et étalonnage des équipements", "Fiabilité des mesures", "Traçabilité métrologique", "Compétences métrologiques"],
      ["Vigilances sanitaires", "Surveillance des produits de santé", "Détection des signaux", "Alerte et communication", "Pharmacovigilance experte"],
      ["Recherche en qualité", "Études scientifiques sur l''amélioration", "Production de connaissances", "Evidence-based quality", "Méthodologie de recherche"],
      ["Leadership qualité", "Animation des démarches d''amélioration", "Conduite du changement", "Mobilisation des équipes", "Management de la qualité"],
      ["Innovation organisationnelle", "Nouvelles approches d''organisation", "Transformation des pratiques", "Amélioration disruptive", "Capacité d''innovation"],
      ["Éthique et qualité", "Intégration des considérations éthiques", "Qualité éthique des soins", "Respect des valeurs", "Réflexion éthique"],
      ["Communication de crise", "Gestion de la communication en cas d''incident", "Préservation de la confiance", "Transparence contrôlée", "Communication de crise"],
      ["Audit qualité avancé", "Évaluation approfondie des pratiques", "Diagnostic organisationnel", "Recommandations expertes", "Techniques d''audit"],
      ["Formation des formateurs", "Développement des compétences pédagogiques", "Démultiplication de la formation", "Professionnalisation formation", "Pédagogie pour adultes"],
      ["Analyse de la littérature qualité", "Veille scientifique spécialisée", "Intégration des innovations", "Mise à jour des pratiques", "Recherche bibliographique"],
      ["Coopération internationale", "Échanges de bonnes pratiques", "Harmonisation internationale", "Apprentissage croisé", "Ouverture internationale"],
      ["Développement durable", "Intégration des enjeux environnementaux", "Qualité environnementale", "Responsabilité sociétale", "Développement durable"],
      ["Télémédecine sécurisée", "Qualité et sécurité à distance", "Standards de télémédecine", "Qualité des soins distants", "Technologies sécurisées"],
      ["Simulation organisationnelle", "Modélisation des organisations", "Test de scénarios", "Optimisation organisationnelle", "Modélisation complexe"],
      ["Méta-analyse qualité", "Synthèse des données d''amélioration", "Evidence-based improvement", "Recommandations synthétiques", "Méta-analyse spécialisée"],
      ["Prospective qualité", "Anticipation des évolutions", "Adaptation aux changements", "Vision stratégique", "Méthodes prospectives"]
    ]
  }',
  
  updated_at = now()
WHERE item_code = 'IC-4';

-- Mise à jour de l'item IC-5 : Responsabilités médicales (12 Rang A + 3 Rang B = 15 compétences)
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "Rang A - Fondamentaux des responsabilités médicales",
    "theme": "Responsabilités médicales",
    "colonnes": ["Responsabilité E-LiSA", "Nature juridique", "Juridiction compétente", "Sanctions possibles", "Exemple typique"],
    "lignes": [
      ["Responsabilité civile", "Obligation de réparer le dommage causé", "Tribunal de Grande Instance", "Dommages et intérêts", "Erreur diagnostique avec préjudice patient"],
      ["Responsabilité pénale", "Sanction des infractions pénales", "Tribunal correctionnel", "Amende et emprisonnement", "Homicide involontaire par négligence"],
      ["Responsabilité administrative", "Faute de service public", "Tribunal administratif", "Indemnisation par l''hôpital", "Dysfonctionnement organisationnel"],
      ["Responsabilité ordinale", "Contrôle déontologique", "Chambre disciplinaire", "Sanctions ordinales", "Violation du secret médical"],
      ["Faute médicale", "Manquement aux obligations professionnelles", "Appréciation judiciaire", "Responsabilité engagée", "Non-respect des bonnes pratiques"],
      ["Aléa thérapeutique", "Risque inhérent imprévisible", "Distinction avec la faute", "Pas de responsabilité", "Complication imprévisible malgré soins appropriés"],
      ["Information du patient", "Obligation d''information sur les risques", "Responsabilité si défaut", "Indemnisation possible", "Absence d''information sur risques opératoires"],
      ["Consentement éclairé", "Accord libre et informé", "Responsabilité si défaut", "Nullité de l''acte", "Intervention sans consentement valable"],
      ["Secret médical", "Obligation de confidentialité", "Sanctions multiples", "Pénales et ordinales", "Divulgation d''informations confidentielles"],
      ["Obligation de moyens", "Mise en œuvre de moyens appropriés", "Standard de soins", "Faute si moyens insuffisants", "Soins consciencieux selon l''art médical"],
      ["Obligation de résultat", "Garantie d''un résultat", "Cas particuliers", "Responsabilité de plein droit", "Prothèse défectueuse, infection nosocomiale"],
      ["Assurance responsabilité", "Couverture obligatoire des risques", "Obligation légale", "Sanctions professionnelles", "Défaut d''assurance RC professionnelle"]
    ]
  }',
  
  tableau_rang_b = '{
    "title": "Rang B - Aspects complexes et spécialisés",
    "theme": "Responsabilités médicales avancées",
    "colonnes": ["Aspect complexe E-LiSA", "Analyse juridique approfondie", "Cas particuliers", "Jurisprudence", "Expertise requise"],
    "lignes": [
      ["Responsabilité du fait d''autrui", "Responsabilité pour faute de collaborateurs", "Médecin chef de service, responsabilité hiérarchique", "Engagement pour faute d''interne ou collaborateur", "Analyse des liens hiérarchiques et délégation"],
      ["Cumul des responsabilités", "Articulation entre différents ordres", "Cumul civil-pénal-administratif-ordinal", "Même fait, sanctions multiples possibles", "Coordination des procédures judiciaires"],
      ["Prescription des actions", "Délais pour agir en responsabilité", "10 ans en civil, 6 ans en administratif", "Point de départ : consolidation du dommage", "Calcul précis des délais de prescription"]
    ]
  }',
  
  updated_at = now()
WHERE item_code = 'IC-5';

-- Vérification finale des mises à jour
SELECT 
  item_code,
  title,
  -- Compter les compétences Rang A
  CASE 
    WHEN tableau_rang_a IS NOT NULL AND tableau_rang_a->'lignes' IS NOT NULL THEN 
      jsonb_array_length(tableau_rang_a->'lignes')
    ELSE 0
  END as nb_competences_rang_a,
  -- Compter les compétences Rang B
  CASE 
    WHEN tableau_rang_b IS NOT NULL AND tableau_rang_b->'lignes' IS NOT NULL THEN 
      jsonb_array_length(tableau_rang_b->'lignes')
    ELSE 0
  END as nb_competences_rang_b,
  -- Total
  CASE 
    WHEN tableau_rang_a IS NOT NULL AND tableau_rang_a->'lignes' IS NOT NULL AND
         tableau_rang_b IS NOT NULL AND tableau_rang_b->'lignes' IS NOT NULL THEN 
      jsonb_array_length(tableau_rang_a->'lignes') + jsonb_array_length(tableau_rang_b->'lignes')
    WHEN tableau_rang_a IS NOT NULL AND tableau_rang_a->'lignes' IS NOT NULL THEN 
      jsonb_array_length(tableau_rang_a->'lignes')
    ELSE 0
  END as total_competences
FROM edn_items_immersive 
WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5')
ORDER BY item_code;
