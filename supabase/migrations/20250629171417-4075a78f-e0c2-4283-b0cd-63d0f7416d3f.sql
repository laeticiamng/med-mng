
-- Migration complète pour finaliser IC-1 à IC-5 avec tous les contenus
-- Basée sur le sommaire officiel et les fiches E-LiSA

-- 1. COMPLÉTER IC-1 : La relation médecin-malade
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "theme": "IC-1 Rang A - Fondamentaux de la relation médecin-malade",
    "sections": [
      {
        "titre": "Définition de la relation médecin-malade",
        "contenu": "Relation interpersonnelle asymétrique entre médecin et patient, caractérisée par un déséquilibre de connaissances et une vulnérabilité du patient",
        "exemple": "Consultation médicale où le médecin détient l''expertise technique tandis que le patient est en situation de vulnérabilité",
        "piege": "Ne pas confondre asymétrie factuelle avec paternalisme - l''asymétrie est structurelle"
      },
      {
        "titre": "Principaux déterminants de la relation",
        "contenu": "Facteurs influençant la qualité : communication, confiance, compétence, disponibilité, empathie",
        "exemple": "Temps accordé, qualité d''écoute, clarté des explications, respect des valeurs du patient",
        "piege": "Négliger l''importance des facteurs non-techniques dans la relation"
      },
      {
        "titre": "Corrélats cliniques",
        "contenu": "Liens entre qualité de la relation et résultats cliniques : adhésion thérapeutique, satisfaction, guérison",
        "exemple": "Meilleure adhésion au traitement quand la relation est de qualité, diminution de l''anxiété du patient",
        "piege": "Penser que seule la technique médicale influence les résultats cliniques"
      }
    ]
  }',
  paroles_musicales = ARRAY[
    'Rang A - La relation médecin-malade commence par l''écoute
    Dans le silence du cabinet, deux âmes se rencontrent
    L''une fragile et inquiète, l''autre sachante et bienveillante
    Asymétrie des savoirs mais égalité des cœurs
    
    Empathie clinique, distance professionnelle
    Comprendre sans se perdre, soigner sans juger
    Alliance thérapeutique, confiance mutuelle
    La guérison naît de cette relation sincère
    
    Communication adaptée, verbale et non-verbale
    Chaque geste compte, chaque mot porte
    L''information délivrée avec délicatesse
    Respecter les représentations du patient',
    
    'Rang B - Approfondissement relationnel
    Mécanismes de défense face à l''annonce difficile
    Déni, colère, négociation, tristesse
    Le soignant accompagne chaque étape
    
    Entretien motivationnel, changement de comportement
    Motivation intrinsèque, ambivalence explorée
    Processus de Prochaska, stades respectés
    Du pré-contemplatif à l''action maintenue
    
    Ajustement au stress, stratégies de coping
    Chaque patient trouve sa voie d''adaptation
    Le médecin guide sans imposer sa vision
    Humanité et technique enfin réconciliées'
  ],
  quiz_questions = '{
    "questions": [
      {
        "question": "Qu''est-ce qui caractérise la relation médecin-malade ?",
        "options": ["Symétrie parfaite", "Asymétrie structurelle", "Relation d''égal à égal", "Domination médicale"],
        "correct": 1,
        "explication": "L''asymétrie est inhérente à la relation du fait de la différence de connaissances et de la vulnérabilité du patient",
        "rang": "A"
      },
      {
        "question": "Quels sont les principaux déterminants de la relation médecin-malade ?",
        "options": ["Communication, confiance, compétence", "Technique médicale uniquement", "Diplômes et expérience", "Statut social"],
        "correct": 0,
        "explication": "Les déterminants incluent communication, confiance, compétence, disponibilité et empathie",
        "rang": "A"
      },
      {
        "question": "Que désigne l''empathie clinique ?",
        "options": ["Identification totale au patient", "Compassion excessive", "Compréhension avec distance professionnelle", "Indifférence contrôlée"],
        "correct": 2,
        "explication": "L''empathie clinique combine compréhension émotionnelle et maintien d''une distance professionnelle",
        "rang": "A"
      },
      {
        "question": "Qu''est-ce que l''alliance thérapeutique ?",
        "options": ["Soumission du patient", "Collaboration active autour d''objectifs partagés", "Autorité médicale", "Relation amicale"],
        "correct": 1,
        "explication": "L''alliance thérapeutique est une collaboration entre patient et soignant autour d''objectifs de soins partagés",
        "rang": "A"
      },
      {
        "question": "Les représentations de la maladie influencent-elles l''adhésion thérapeutique ?",
        "options": ["Non, seule la technique compte", "Oui, directement", "Parfois", "Uniquement chez les patients difficiles"],
        "correct": 1,
        "explication": "Les représentations du patient sur sa maladie influencent directement son adhésion et l''évolution",
        "rang": "A"
      },
      {
        "question": "Quels sont les stades du processus de changement selon Prochaska ?",
        "options": ["Déni, colère, acceptation", "Pré-contemplation, contemplation, action, maintien", "Analyse, synthèse, action", "Diagnostic, traitement, guérison"],
        "correct": 1,
        "explication": "Le modèle de Prochaska décrit les stades : pré-contemplation, contemplation, détermination, action, maintien",
        "rang": "B"
      },
      {
        "question": "Qu''est-ce que l''entretien motivationnel ?",
        "options": ["Technique de persuasion", "Exploration de l''ambivalence pour renforcer la motivation intrinsèque", "Conseil directif", "Éducation thérapeutique"],
        "correct": 1,
        "explication": "L''entretien motivationnel explore l''ambivalence pour faire émerger la motivation intrinsèque au changement",
        "rang": "B"
      }
    ]
  }'
WHERE item_code = 'IC-1';

-- 2. COMPLÉTER IC-2 : Les valeurs professionnelles
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "theme": "IC-2 Rang A - Valeurs professionnelles du médecin",
    "sections": [
      {
        "titre": "Identifier les professionnels de santé",
        "contenu": "Cartographie complète des acteurs : professionnels règlementés et leurs compétences spécifiques dans l''organisation sanitaire",
        "exemple": "Médecins spécialistes, généralistes, chirurgiens-dentistes, sages-femmes, pharmaciens, infirmiers selon leurs rôles",
        "piege": "Confondre les professionnels règlementés avec les autres acteurs ou méconnaître les compétences spécifiques"
      },
      {
        "titre": "Définition de la pratique médicale",
        "contenu": "Activité professionnelle du médecin intégrant diagnostic, traitement, prévention dans un cadre scientifique et relationnel",
        "exemple": "Consultation médicale, diagnostic, prescription thérapeutique, suivi des patients, prévention",
        "piege": "Réduire la pratique médicale à la dimension technique seule en négligeant l''aspect relationnel"
      },
      {
        "titre": "Signification de l''éthique",
        "contenu": "Réflexion philosophique sur l''action juste et appropriée, questionnement moral face aux dilemmes médicaux",
        "exemple": "Questionnement éthique face aux dilemmes : acharnement thérapeutique, fin de vie, conflits d''intérêts",
        "piege": "Confondre éthique personnelle et éthique professionnelle ou séparer éthique et pratique"
      }
    ]
  }',
  tableau_rang_b = '{
    "theme": "IC-2 Rang B - Organisation et régulation professionnelle",
    "sections": [
      {
        "titre": "Organisation des professionnels de santé",
        "contenu": "Organisation statutaire : fonctionnaires, salariés, libéraux, mixtes, avec réglementations spécifiques",
        "exemple": "Médecins hospitaliers (PH, MCU-PH), médecins libéraux (secteur 1/2), salariés cliniques privées",
        "piege": "Méconnaître la diversité des statuts ou leurs implications juridiques et économiques"
      },
      {
        "titre": "Rôle des ordres professionnels",
        "contenu": "Instances de régulation : inscription, discipline, surveillance déontologique, organisation territoriale",
        "exemple": "CNOM, conseils départementaux, procédures disciplinaires, veille déontologique",
        "piege": "Sous-estimer le pouvoir disciplinaire des ordres ou méconnaître leur organisation"
      }
    ]
  }',
  paroles_musicales = ARRAY[
    'Rang A - Les valeurs du médecin, piliers de notre profession
    Respect de la dignité humaine, premier commandement
    Non-malfaisance et bienfaisance, équilibre délicat
    Justice et équité pour tous nos patients
    
    Autonomie respectée, consentement éclairé
    Secret professionnel, confiance préservée
    Intégrité et probité, honneur de la profession
    Éthique médicale, conscience et réflexion
    
    Déontologie codifiée, devoirs énoncés
    Confraternité respectée, entraide partagée
    La médecine est un art autant qu''une science
    Servir l''humanité avec humilité et excellence',
    
    'Rang B - Organisation professionnelle, régulation nécessaire
    Conseil de l''Ordre, gardien de nos valeurs
    Discipline et surveillance, protection du public
    Statuts divers, exercice pluriel
    
    Libéral ou salarié, hospitalier ou ambulatoire
    Chaque mode d''exercice a ses contraintes
    Régulation étatique croissante, contrôles renforcés
    Équilibre entre autonomie et encadrement
    
    Formation continue, compétences actualisées
    Évaluation des pratiques, amélioration constante
    La profession s''organise pour mieux servir
    Tradition et modernité réconciliées'
  ],
  quiz_questions = '{
    "questions": [
      {
        "question": "Qu''est-ce qui caractérise la pratique médicale ?",
        "options": ["Technique pure", "Activité intégrant diagnostic, traitement, prévention et relation", "Prescriptions uniquement", "Examens cliniques"],
        "correct": 1,
        "explication": "La pratique médicale intègre diagnostic, traitement, prévention dans un cadre scientifique et relationnel",
        "rang": "A"
      },
      {
        "question": "Quelle est la différence entre valeurs et normes professionnelles ?",
        "options": ["Aucune différence", "Valeurs = principes, Normes = règles concrètes", "Normes = principes, Valeurs = règles", "Valeurs uniquement personnelles"],
        "correct": 1,
        "explication": "Les valeurs sont des principes fondamentaux, les normes sont des règles concrètes traduisant ces valeurs",
        "rang": "A"
      },
      {
        "question": "Que signifie l''éthique médicale ?",
        "options": ["Règles imposées", "Réflexion philosophique sur l''action juste", "Lois médicales", "Traditions anciennes"],
        "correct": 1,
        "explication": "L''éthique est une réflexion philosophique sur l''action juste face aux dilemmes médicaux",
        "rang": "A"
      },
      {
        "question": "Quels sont les principes de la médecine fondée sur les preuves ?",
        "options": ["Opinion d''expert", "Meilleures preuves scientifiques + expertise clinique", "Tradition médicale", "Intuition clinique"],
        "correct": 1,
        "explication": "L''EBM combine les meilleures preuves scientifiques avec l''expertise clinique et les préférences du patient",
        "rang": "A"
      },
      {
        "question": "Que sont les principes déontologiques ?",
        "options": ["Conseils optionnels", "Devoirs professionnels codifiés obligatoires", "Suggestions éthiques", "Traditions informelles"],
        "correct": 1,
        "explication": "La déontologie fixe les devoirs professionnels codifiés et obligatoires",
        "rang": "A"
      },
      {
        "question": "Quels sont les différents statuts d''exercice médical ?",
        "options": ["Uniquement libéral", "Fonctionnaire, salarié, libéral, mixte", "Seulement hospitalier", "Privé uniquement"],
        "correct": 1,
        "explication": "Les médecins peuvent être fonctionnaires, salariés, libéraux ou avoir un statut mixte",
        "rang": "B"
      },
      {
        "question": "Quel est le rôle du Conseil de l''Ordre des médecins ?",
        "options": ["Formation médicale", "Inscription, discipline, surveillance déontologique", "Recherche médicale", "Gestion hospitalière"],
        "correct": 1,
        "explication": "L''Ordre assure l''inscription, la discipline et la surveillance déontologique des médecins",
        "rang": "B"
      }
    ]
  }'
WHERE item_code = 'IC-2';

-- 3. COMPLÉTER IC-3 : Raisonnement et démarche scientifique
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "theme": "IC-3 Rang A - Fondamentaux du raisonnement médical",
    "sections": [
      {
        "titre": "Démarche hypothético-déductive",
        "contenu": "Processus logique : observation → hypothèses → vérification → conclusion",
        "exemple": "Face à une douleur thoracique : hypothèses (infarctus, embolie, pneumothorax) → examens → diagnostic",
        "piege": "Confirmation bias : chercher uniquement ce qui confirme la première hypothèse"
      },
      {
        "titre": "Raisonnement clinique structuré",
        "contenu": "Méthode systématique d''analyse des données cliniques pour aboutir au diagnostic",
        "exemple": "Anamnèse structurée, examen physique méthodique, synthèse diagnostique",
        "piege": "Sauter des étapes ou se précipiter vers le diagnostic"
      },
      {
        "titre": "Médecine basée sur les preuves",
        "contenu": "Intégration des meilleures preuves scientifiques, expertise clinique et préférences du patient",
        "exemple": "Utilisation de guidelines basées sur méta-analyses pour décisions thérapeutiques",
        "piege": "Appliquer aveuglément les preuves sans adaptation au cas particulier"
      }
    ]
  }',
  tableau_rang_b = '{
    "theme": "IC-3 Rang B - Expertise en raisonnement médical",
    "sections": [
      {
        "titre": "Biais cognitifs en médecine",
        "contenu": "Erreurs systématiques de raisonnement : ancrage, disponibilité, confirmation, représentativité",
        "exemple": "Biais d''ancrage : rester fixé sur le premier diagnostic évoqué",
        "piege": "Ne pas reconnaître ses propres biais cognitifs"
      },
      {
        "titre": "Méthodologie de la recherche clinique",
        "contenu": "Essais randomisés, études observationnelles, méta-analyses, niveaux de preuve",
        "exemple": "Essai randomisé contrôlé en double aveugle versus étude cas-témoins",
        "piege": "Confondre corrélation et causalité"
      }
    ]
  }',
  paroles_musicales = ARRAY[
    'Rang A - Le raisonnement médical, art de la déduction
    Observation rigoureuse, première étape cruciale
    Hypothèses multiples, esprit ouvert toujours
    Vérification méthodique, preuves recherchées
    
    Anamnèse détaillée, écoute du patient
    Examen physique complet, sémiologie maîtrisée
    Synthèse diagnostique, logique respectée
    De l''hypothèse à la certitude, chemin balisé
    
    Médecine basée sur les preuves, science et conscience
    Littérature évaluée, expertise clinique
    Préférences du patient, triangle équilibré
    Décision éclairée, soin personnalisé',
    
    'Rang B - Expertise du raisonnement, pièges évités
    Biais cognitifs nombreux, vigilance requise
    Ancrage dangereux, confirmation aveugle
    Disponibilité trompeuse, représentativité fausse
    
    Méthodologie rigoureuse, recherche structurée
    Randomisation contrôlée, double aveugle
    Méta-analyses puissantes, preuves synthétisées
    Niveaux de preuve hiérarchisés, force graduée
    
    Corrélation n''est pas causalité, nuance importante
    Erreur de raisonnement, diagnostic manqué
    L''humilité du savant, doute constructif
    Science et art médical, alliance féconde'
  ],
  quiz_questions = '{
    "questions": [
      {
        "question": "Qu''est-ce que la démarche hypothético-déductive ?",
        "options": ["Diagnostic immédiat", "Observation → hypothèses → vérification → conclusion", "Intuition clinique", "Examen systématique"],
        "correct": 1,
        "explication": "La démarche hypothético-déductive suit un processus logique d''observation, formulation d''hypothèses, vérification et conclusion",
        "rang": "A"
      },
      {
        "question": "Que comprend la médecine basée sur les preuves ?",
        "options": ["Preuves scientifiques uniquement", "Preuves + expertise + préférences patient", "Guidelines uniquement", "Expérience personnelle"],
        "correct": 1,
        "explication": "L''EBM intègre les meilleures preuves scientifiques, l''expertise clinique et les préférences du patient",
        "rang": "A"
      },
      {
        "question": "Qu''est-ce que le raisonnement clinique structuré ?",
        "options": ["Diagnostic rapide", "Méthode systématique d''analyse des données cliniques", "Intuition médicale", "Protocole figé"],
        "correct": 1,
        "explication": "Le raisonnement clinique structuré est une méthode systématique pour analyser les données et aboutir au diagnostic",
        "rang": "A"
      },
      {
        "question": "Qu''est-ce que l''épidémiologie clinique ?",
        "options": ["Étude des épidémies", "Application des méthodes épidémiologiques à la pratique clinique", "Statistiques hospitalières", "Surveillance sanitaire"],
        "correct": 1,
        "explication": "L''épidémiologie clinique applique les méthodes épidémiologiques pour éclairer les décisions cliniques",
        "rang": "A"
      },
      {
        "question": "Qu''est-ce que la validité interne d''une étude ?",
        "options": ["Généralisation possible", "Absence de biais méthodologiques", "Grande taille d''échantillon", "Résultats significatifs"],
        "correct": 1,
        "explication": "La validité interne garantit que les résultats ne sont pas dus à des biais méthodologiques",
        "rang": "A"
      },
      {
        "question": "Qu''est-ce que le biais d''ancrage ?",
        "options": ["Erreur de calcul", "Fixation sur la première hypothèse diagnostique", "Manque d''expérience", "Oubli d''informations"],
        "correct": 1,
        "explication": "Le biais d''ancrage consiste à rester fixé sur la première hypothèse diagnostique émise",
        "rang": "B"
      },
      {
        "question": "Quelle est la différence entre corrélation et causalité ?",
        "options": ["Aucune différence", "Corrélation = association, Causalité = lien de cause à effet", "Corrélation plus forte", "Causalité temporaire"],
        "correct": 1,
        "explication": "La corrélation montre une association statistique, la causalité implique un lien de cause à effet",
        "rang": "B"
      }
    ]
  }'
WHERE item_code = 'IC-3';

-- 4. COMPLÉTER IC-4 : Sécurité du patient et gestion des risques
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "theme": "IC-4 Rang A - Fondamentaux de la sécurité patient",
    "sections": [
      {
        "titre": "Définition de la Qualité en santé",
        "contenu": "Démarche d''amélioration continue : 7 dimensions SPEC-AEC (Sécurité, Pertinence, Efficacité, Continuité, Acceptabilité, Efficience, Continuité)",
        "exemple": "Certification HAS avec évaluation des 7 dimensions qualité",
        "piege": "Confondre qualité et sécurité - la sécurité n''est qu''une dimension"
      },
      {
        "titre": "Définition de la Sécurité patient",
        "contenu": "Absence d''atteinte inutile associée aux soins (OMS). Maximisation bénéfices ET minimisation risques",
        "exemple": "Prévention chutes, erreurs médicamenteuses, infections nosocomiales",
        "piege": "Oublier que sécurité = maximisation bénéfices ET minimisation risques"
      },
      {
        "titre": "Événements Indésirables Associés aux Soins (EIAS)",
        "contenu": "Événements ayant entraîné ou auraient pu entraîner un préjudice patient. 5 niveaux de gravité, 40-50% évitables",
        "exemple": "Niveau 1: erreur rattrapée. Niveau 5: séquelles irréversibles",
        "piege": "Sous-estimer EIAS mineurs révélateurs de failles système"
      }
    ]
  }',
  tableau_rang_b = '{
    "theme": "IC-4 Rang B - Expertise en sécurité patient",
    "sections": [
      {
        "titre": "Impact économique des EIAS",
        "contenu": "Coût direct: +7j hospitalisation, +5000€. Coût indirect: productivité. 760M€/an France",
        "exemple": "Infection nosocomiale prolonge séjour de 7 jours et coûte 5000€ supplémentaires",
        "piege": "Sous-estimer impact économique global dépassant coûts médicaux directs"
      },
      {
        "titre": "Mécanismes de résistance bactérienne",
        "contenu": "Transmission horizontale plasmides (80-90%) vs verticale chromosomique. Réservoirs spécifiques",
        "exemple": "SARM transmission manuportée, BLSE digestives résistance plasmidique",
        "piege": "Négliger transmission horizontale plasmidique majoritaire"
      }
    ]
  }',
  paroles_musicales = ARRAY[
    'Rang A - La sécurité du patient, priorité absolue
    Sept dimensions de la qualité, SPEC-AEC notre guide
    Sécurité, pertinence, efficacité d''abord
    Continuité, acceptabilité, efficience ensuite
    
    Événements indésirables, cinquante pour cent évitables
    Cinq niveaux de gravité, classification précise
    Du mineur au catastrophique, vigilance constante
    Signalement obligatoire, apprentissage collectif
    
    Hygiène des mains, geste salvateur
    Friction hydro-alcoolique, vingt à trente secondes
    Sept temps respectés, technique maîtrisée
    Prévention infections, responsabilité partagée',
    
    'Rang B - Expertise sécurité, impact économique
    Sept cent soixante millions, coût annuel français
    Sept jours de plus, cinq mille euros perdus
    Coûts indirects cachés, productivité impactée
    
    Résistances bactériennes, transmission horizontale
    Quatre-vingts pour cent plasmides, échange génétique
    SARM cutané, BLSE digestif
    Réservoirs distincts, précautions adaptées
    
    Structures françaises, surveillance organisée
    ANSM nationale, ARS territoriale
    Réseaux de surveillance, données partagées
    Sécurité collective, engagement de tous'
  ],
  quiz_questions = '{
    "questions": [
      {
        "question": "Quelles sont les 7 dimensions de la qualité en santé ?",
        "options": ["Technique uniquement", "SPEC-AEC", "Coût-efficacité", "Satisfaction patient"],
        "correct": 1,
        "explication": "Les 7 dimensions sont : Sécurité, Pertinence, Efficacité, Continuité, Acceptabilité, Efficience, Continuité",
        "rang": "A"
      },
      {
        "question": "Que signifie la sécurité du patient selon l''OMS ?",
        "options": ["Absence totale de risque", "Absence d''atteinte inutile associée aux soins", "Perfection technique", "Satisfaction maximale"],
        "correct": 1,
        "explication": "La sécurité patient est l''absence d''atteinte inutile ou potentielle associée aux soins de santé",
        "rang": "A"
      },
      {
        "question": "Combien y a-t-il de niveaux de gravité des EIAS ?",
        "options": ["3 niveaux", "5 niveaux", "7 niveaux", "10 niveaux"],
        "correct": 1,
        "explication": "Il y a 5 niveaux de gravité des EIAS, du niveau 1 (mineur) au niveau 5 (catastrophique)",
        "rang": "A"
      },
      {
        "question": "Quel pourcentage d''EIAS sont considérés comme évitables ?",
        "options": ["10-20%", "40-50%", "70-80%", "90-100%"],
        "correct": 1,
        "explication": "40 à 50% des EIAS sont considérés comme évitables par amélioration du système",
        "rang": "A"
      },
      {
        "question": "Quelle est la technique de référence pour l''hygiène des mains ?",
        "options": ["Lavage au savon", "Friction hydro-alcoolique", "Désinfection chimique", "Gants uniquement"],
        "correct": 1,
        "explication": "La friction hydro-alcoolique est la technique de référence, 20-30s en 7 temps",
        "rang": "A"
      },
      {
        "question": "Quel est le coût économique annuel des EIAS en France ?",
        "options": ["100M€", "760M€", "1,2Md€", "2Md€"],
        "correct": 1,
        "explication": "Le coût économique des EIAS est estimé à 760 millions d''euros par an en France",
        "rang": "B"
      },
      {
        "question": "Quel est le mécanisme principal de transmission des résistances bactériennes ?",
        "options": ["Mutation chromosomique", "Transmission horizontale plasmidique (80-90%)", "Sélection naturelle", "Contamination environnementale"],
        "correct": 1,
        "explication": "80 à 90% des résistances sont transmises horizontalement par des plasmides",
        "rang": "B"
      }
    ]
  }'
WHERE item_code = 'IC-4';

-- 5. COMPLÉTER IC-5 : Organisation du système de santé
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "theme": "IC-5 Rang A - Fondamentaux de l''organisation du système de santé",
    "sections": [
      {
        "titre": "Architecture du système de santé français",
        "contenu": "Organisation complexe : État, Assurance maladie, professionnels, établissements, patients",
        "exemple": "Ministère de la Santé, CNAM, ARS, établissements publics/privés, médecine libérale",
        "piege": "Sous-estimer la complexité des interactions entre acteurs"
      },
      {
        "titre": "Financement du système de santé",
        "contenu": "Sécurité sociale, complémentaires, reste à charge. Financement mixte public-privé",
        "exemple": "Remboursement CPAM 70%, mutuelle 25%, reste à charge 5%",
        "piege": "Croire à un financement purement public ou purement privé"
      },
      {
        "titre": "Parcours de soins coordonnés",
        "contenu": "Médecin traitant, coordination ville-hôpital, continuité des soins",
        "exemple": "Déclaration médecin traitant, orientation spécialisée, suivi coordonné",
        "piege": "Négliger l''importance de la coordination dans l''efficacité du système"
      }
    ]
  }',
  tableau_rang_b = '{
    "theme": "IC-5 Rang B - Expertise organisation système de santé",
    "sections": [
      {
        "titre": "Gouvernance territoriale de la santé",
        "contenu": "ARS, CPAM, collectivités territoriales, démocratie sanitaire",
        "exemple": "Projet régional de santé, contrats locaux de santé, conseils territoriaux",
        "piege": "Méconnaître les compétences respectives des acteurs territoriaux"
      },
      {
        "titre": "Évaluation et régulation du système",
        "contenu": "HAS, ANSM, indicateurs de performance, certification, accréditation",
        "exemple": "Certification V2020, indicateurs IQSS, recommandations HAS",
        "piege": "Sous-estimer l''importance des mécanismes de régulation"
      }
    ]
  }',
  paroles_musicales = ARRAY[
    'Rang A - Organisation complexe, système français
    État providence, sécurité sociale
    Assurance maladie, solidarité nationale
    Parcours coordonnés, soins organisés
    
    Médecin traitant, pivot central
    Orientation spécialisée, expertise ciblée
    Ville et hôpital, complémentarité
    Continuité des soins, qualité préservée
    
    Financement mixte, équilibre fragile
    Public et privé, responsabilités partagées
    Accessibilité universelle, égalité des chances
    Système solidaire, santé pour tous',
    
    'Rang B - Gouvernance territoriale, acteurs multiples
    ARS régionales, pilotage territorial
    CPAM départementales, gestion locale
    Collectivités engagées, politiques publiques
    
    Démocratie sanitaire, participation citoyenne
    Conseils territoriaux, voix des usagers
    Projets régionaux, planification stratégique
    Contrats locaux, actions coordonnées
    
    HAS évalue, ANSM surveille
    Certification qualité, standards respectés
    Indicateurs performance, mesure objective
    Régulation constante, amélioration continue'
  ],
  quiz_questions = '{
    "questions": [
      {
        "question": "Quels sont les principaux acteurs du système de santé français ?",
        "options": ["État uniquement", "État, Assurance maladie, professionnels, établissements, patients", "Hôpitaux uniquement", "Médecins libéraux"],
        "correct": 1,
        "explication": "Le système de santé français implique État, Assurance maladie, professionnels, établissements et patients",
        "rang": "A"
      },
      {
        "question": "Comment est financé le système de santé français ?",
        "options": ["100% public", "Financement mixte : Sécurité sociale + complémentaires + reste à charge", "100% privé", "Impôts uniquement"],
        "correct": 1,
        "explication": "Le financement est mixte : Sécurité sociale, complémentaires santé et reste à charge patient",
        "rang": "A"
      },
      {
        "question": "Qu''est-ce que le parcours de soins coordonnés ?",
        "options": ["Hospitalisation", "Organisation autour du médecin traitant avec coordination ville-hôpital", "Urgences", "Spécialistes uniquement"],
        "correct": 1,
        "explication": "Le parcours coordonné s''organise autour du médecin traitant avec coordination ville-hôpital",
        "rang": "A"
      },
      {
        "question": "Qu''est-ce que la médecine de ville ?",
        "options": ["Hôpitaux urbains", "Exercice médical ambulatoire hors établissement", "Centres de santé", "Cliniques privées"],
        "correct": 1,
        "explication": "La médecine de ville désigne l''exercice médical ambulatoire en dehors des établissements",
        "rang": "A"
      },
      {
        "question": "Quel est le rôle de l''Assurance maladie ?",
        "options": ["Soigner les patients", "Financer et réguler l''offre de soins", "Former les médecins", "Construire hôpitaux"],
        "correct": 1,
        "explication": "L''Assurance maladie finance les soins et régule l''offre de soins",
        "rang": "A"
      },
      {
        "question": "Que sont les ARS ?",
        "options": ["Hôpitaux régionaux", "Agences Régionales de Santé pilotant la politique de santé territoriale", "Assurances privées", "Associations médicales"],
        "correct": 1,
        "explication": "Les ARS sont les Agences Régionales de Santé qui pilotent la politique de santé sur leur territoire",
        "rang": "B"
      },
      {
        "question": "Qu''est-ce que la démocratie sanitaire ?",
        "options": ["Élections médicales", "Participation des usagers aux décisions de santé", "Vote des patients", "Référendums santé"],
        "correct": 1,
        "explication": "La démocratie sanitaire permet la participation des usagers aux décisions concernant la santé",
        "rang": "B"
      }
    ]
  }'
WHERE item_code = 'IC-5';

-- 6. Ajouter les interactions et récompenses manquantes pour tous les items
UPDATE edn_items_immersive 
SET 
  interaction_config = '{
    "type": "drag_drop",
    "title": "Associez les concepts clés",
    "items": [
      {"id": "empathie", "text": "Empathie clinique", "category": "concept"},
      {"id": "asymetrie", "text": "Asymétrie structurelle", "category": "concept"},
      {"id": "alliance", "text": "Alliance thérapeutique", "category": "concept"},
      {"id": "def_empathie", "text": "Comprendre avec distance professionnelle", "category": "definition"},
      {"id": "def_asymetrie", "text": "Déséquilibre de connaissances médecin/patient", "category": "definition"},
      {"id": "def_alliance", "text": "Collaboration autour d''objectifs partagés", "category": "definition"}
    ],
    "pairs": [
      {"concept": "empathie", "definition": "def_empathie"},
      {"concept": "asymetrie", "definition": "def_asymetrie"},
      {"concept": "alliance", "definition": "def_alliance"}
    ]
  }',
  reward_messages = '{
    "bronze": "Bravo ! Vous maîtrisez les bases de la relation médecin-malade.",
    "silver": "Excellent ! Votre compréhension de la relation thérapeutique est solide.",
    "gold": "Parfait ! Vous êtes un expert de la relation médecin-malade."
  }'
WHERE item_code = 'IC-1';

UPDATE edn_items_immersive 
SET 
  interaction_config = '{
    "type": "drag_drop",
    "title": "Classez les valeurs et normes professionnelles",
    "items": [
      {"id": "bienfaisance", "text": "Bienfaisance", "category": "valeur"},
      {"id": "justice", "text": "Justice", "category": "valeur"},
      {"id": "autonomie", "text": "Autonomie", "category": "valeur"},
      {"id": "consentement", "text": "Consentement éclairé", "category": "norme"},
      {"id": "secret", "text": "Secret professionnel", "category": "norme"},
      {"id": "competence", "text": "Obligation de compétence", "category": "norme"}
    ],
    "categories": ["valeur", "norme"]
  }',
  reward_messages = '{
    "bronze": "Bien joué ! Vous comprenez les valeurs professionnelles.",
    "silver": "Très bien ! Vous distinguez valeurs et normes.",
    "gold": "Parfait ! Vous êtes un expert des valeurs médicales."
  }'
WHERE item_code = 'IC-2';

UPDATE edn_items_immersive 
SET 
  interaction_config = '{
    "type": "drag_drop",
    "title": "Ordonnez les étapes du raisonnement médical",
    "items": [
      {"id": "observation", "text": "Observation clinique", "order": 1},
      {"id": "hypotheses", "text": "Formulation d''hypothèses", "order": 2},
      {"id": "verification", "text": "Vérification par examens", "order": 3},
      {"id": "diagnostic", "text": "Diagnostic final", "order": 4}
    ],
    "type": "sequence"
  }',
  reward_messages = '{
    "bronze": "Bravo ! Vous suivez la démarche diagnostique.",
    "silver": "Excellent ! Votre raisonnement est structuré.",
    "gold": "Parfait ! Vous maîtrisez le raisonnement médical."
  }'
WHERE item_code = 'IC-3';

UPDATE edn_items_immersive 
SET 
  interaction_config = '{
    "type": "drag_drop",
    "title": "Classez les mesures de sécurité patient",
    "items": [
      {"id": "hygiene", "text": "Hygiène des mains", "category": "prevention"},
      {"id": "signalement", "text": "Signalement EIAS", "category": "detection"},
      {"id": "analyse", "text": "Analyse des causes", "category": "analyse"},
      {"id": "amelioration", "text": "Plan d''amélioration", "category": "action"}
    ],
    "sequence": ["prevention", "detection", "analyse", "action"]
  }',
  reward_messages = '{
    "bronze": "Bien ! Vous connaissez la sécurité patient.",
    "silver": "Très bien ! Vous maîtrisez la gestion des risques.",
    "gold": "Parfait ! Vous êtes expert en sécurité patient."
  }'
WHERE item_code = 'IC-4';

UPDATE edn_items_immersive 
SET 
  interaction_config = '{
    "type": "drag_drop",
    "title": "Organisez les acteurs du système de santé",
    "items": [
      {"id": "ministere", "text": "Ministère de la Santé", "level": "national"},
      {"id": "ars", "text": "ARS", "level": "regional"},
      {"id": "cpam", "text": "CPAM", "level": "departemental"},
      {"id": "etablissement", "text": "Établissements de santé", "level": "local"}
    ],
    "hierarchy": ["national", "regional", "departemental", "local"]
  }',
  reward_messages = '{
    "bronze": "Bravo ! Vous comprenez l''organisation sanitaire.",
    "silver": "Excellent ! Vous maîtrisez les niveaux de gouvernance.",
    "gold": "Parfait ! Vous êtes expert du système de santé."
  }'
WHERE item_code = 'IC-5';
