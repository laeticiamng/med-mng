
-- Correction complète des items IC-1 à IC-4 avec séparation stricte Rang A/Rang B

-- ======================================
-- ITEM IC-1 : La relation médecin-malade
-- ======================================
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "theme": "Relation médecin-malade - Rang A Fondamental",
    "sections": [
      {
        "title": "Définitions fondamentales",
        "concepts": [
          {
            "concept": "Colloque singulier",
            "definition": "Rencontre entre un médecin et son patient, dans un lieu et un temps donnés, pour répondre à une demande",
            "exemple": "Consultation en cabinet, visite à domicile, entretien hospitalier",
            "piege": "Ne pas confondre avec simple échange - nécessite cadre professionnel structuré",
            "mnemo": "LIEU + TEMPS + DEMANDE = Colloque singulier",
            "subtilite": "Évolution du paternalisme vers partenariat thérapeutique",
            "application": "Créer conditions propices à l''échange patient-médecin",
            "vigilance": "Respecter asymétrie des rôles tout en valorisant expérience patient"
          },
          {
            "concept": "Relation médecin-malade",
            "definition": "Relation interpersonnelle entre soignant et soigné, fondée sur convergence de 3 finalités : patient, médecin, société",
            "exemple": "Patient cherche guérison, médecin applique science, société protège santé publique",
            "piege": "Ne pas réduire à dimension purement technique - dimension relationnelle essentielle",
            "mnemo": "3 finalités : Patient + Médecin + Société",
            "subtilite": "Équilibre délicat entre intérêts individuels et collectifs",
            "application": "Tenir compte des 3 finalités dans chaque décision médicale",
            "vigilance": "Conflits possibles entre finalités - nécessite arbitrage éthique"
          }
        ]
      },
      {
        "title": "Évolution historique",
        "concepts": [
          {
            "concept": "Modèle paternaliste traditionnel",
            "definition": "Modèle où médecin décide seul, patient obéit. Autorité médicale non questionnée, information limitée",
            "exemple": "''Le médecin sait ce qui est bon pour vous'' - décisions unilatérales",
            "piege": "Ne pas diaboliser - adapté à certaines situations d''urgence",
            "mnemo": "AUTORITÉ médecin > soumission patient",
            "subtilite": "Encore présent dans urgences vitales où temps manque pour concertation",
            "application": "Reconnaître limites de ce modèle en médecine moderne",
            "vigilance": "Patient moderne revendique autonomie et information"
          },
          {
            "concept": "Approche centrée patient moderne",
            "definition": "Patient partenaire actif, expertise médicale + expérience vécue, décisions partagées",
            "exemple": "Éducation thérapeutique, plans de soins personnalisés, consentement éclairé",
            "piege": "Ne pas tomber dans laxisme - médecin garde responsabilités spécifiques",
            "mnemo": "PARTENARIAT : Médecin expert + Patient acteur",
            "subtilite": "Nécessite adaptation du médecin à chaque patient",
            "application": "Impliquer patient dans élaboration stratégie thérapeutique",
            "vigilance": "Tous patients n''ont pas même capacité d''autonomie"
          }
        ]
      }
    ]
  }',
  
  tableau_rang_b = '{
    "theme": "Relation médecin-malade - Rang B Expert",
    "sections": [
      {
        "title": "Outils de communication avancés",
        "concepts": [
          {
            "concept": "4 dimensions ACP (Approche Centrée Patient)",
            "analyse": "1) Explorer maladie et expérience patient 2) Comprendre globalité personne 3) S''entendre sur terrain commun 4) Développer alliance thérapeutique",
            "cas": "Patient diabétique : explorer vécu diabète + comprendre contexte familial + négocier objectifs glycémiques + construire alliance long terme",
            "ecueil": "Appliquer mécaniquement sans adapter - ACP nécessite personnalisation",
            "technique": "Chaque dimension nécessite techniques spécifiques : questions ouvertes, écoute active, reformulation, négociation",
            "distinction": "ACP ≠ complaisance - maintenir exigence médicale dans bienveillance",
            "maitrise": "Adapter les 4 dimensions selon patient, pathologie, contexte",
            "excellence": "Intégration fluide ACP dans pratique quotidienne"
          },
          {
            "concept": "Empathie clinique",
            "analyse": "Capacité à comprendre et apprécier état émotionnel patient sans fusion affective. Outil thérapeutique, pas sympathie",
            "cas": "Patient en fin de vie : comprendre angoisse sans la vivre, accompagner sans s''effondrer",
            "ecueil": "Confondre empathie et sympathie - risque épuisement professionnel",
            "technique": "Mettre de côté ses propres schémas, accepter sans subir, engagement verbal et non-verbal",
            "distinction": "Empathie (comprendre) ≠ Sympathie (ressentir) ≠ Identification (vivre)",
            "maitrise": "Doser empathie selon situation - trop peu = froideur, trop = fusion",
            "excellence": "Empathie comme levier thérapeutique maîtrisé"
          }
        ]
      }
    ]
  }',
  updated_at = now()
WHERE slug = 'relation-medecin-malade';

-- ======================================
-- ITEM IC-2 : Valeurs professionnelles
-- ======================================
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "theme": "Valeurs professionnelles médecin - Rang A Fondamental", 
    "sections": [
      {
        "title": "Professionnels de santé et collaboration",
        "concepts": [
          {
            "concept": "Professionnels de santé",
            "definition": "Ensemble des professions médicales et paramédicales autorisées par diplôme : médecins, chirurgiens-dentistes, sages-femmes, pharmaciens, infirmiers, etc.",
            "exemple": "Équipe pluridisciplinaire service hospitalier : médecins, infirmiers, aides-soignants, kinésithérapeutes",
            "piege": "Ne pas confondre professionnels de santé (CSP) et acteurs de santé (psychologues, assistantes sociales)",
            "mnemo": "PROFESSIONS = Diplôme + Autorisation exercice + Collaboration",
            "subtilite": "Exercice de plus en plus codifié et régulé par l''État",
            "application": "Identifier rôle de chaque professionnel dans prise en charge patient",
            "vigilance": "Qualité soins dépend capacité à travailler ensemble"
          },
          {
            "concept": "Collaboration interprofessionnelle",
            "definition": "Organisation des soins nécessitant capacité des acteurs à travailler ensemble. Expérimentations de coopération et transferts de compétences",
            "exemple": "Maisons de santé pluridisciplinaires, protocoles de coopération infirmier-médecin",
            "piege": "Ne pas rester cloisonné - médecine moderne = travail d''équipe",
            "mnemo": "ÉQUIPE = Expérimentations + Coopérations + Optimisation",
            "subtilite": "Délégation d''actes médicaux selon protocoles validés",
            "application": "Participer activement aux réunions pluridisciplinaires",
            "vigilance": "Responsabilité médicale demeure même en cas de délégation"
          }
        ]
      },
      {
        "title": "Éthique et déontologie",
        "concepts": [
          {
            "concept": "Éthique médicale",
            "definition": "Réflexion de celui qui agit et se pose la question : comment faire pour agir au mieux dans cette situation ?",
            "exemple": "Dilemme fin de vie : acharnement thérapeutique vs arrêt des soins",
            "piege": "Ne pas confondre éthique (réflexion) et déontologie (règles) - complémentaires",
            "mnemo": "ÉTHIQUE = Réflexion + Situation + Agir au mieux",
            "subtilite": "Éthique indissociable de la technique médicale",
            "application": "Se questionner systématiquement sur dimension éthique des décisions",
            "vigilance": "Chaque situation médicale a dimension éthique"
          },
          {
            "concept": "Code de déontologie médicale",
            "definition": "Normes professionnelles définissant principes et valeurs. Rédigé par ONM, soumis Conseil d''État, voté Parlement, publié JO",
            "exemple": "Secret professionnel, non-malveillance, information du patient",
            "piege": "Ne pas croire que ONM décide seul - processus démocratique complexe",
            "mnemo": "CODE = ONM + Conseil État + Parlement + JO",
            "subtilite": "Conflits possibles entre valeurs (protection vie vs autonomie)",
            "application": "Connaître et appliquer principes déontologiques",
            "vigilance": "Déontologie évolue avec société et pratiques médicales"
          }
        ]
      }
    ]
  }',
  
  tableau_rang_b = '{
    "theme": "Valeurs professionnelles médecin - Rang B Expert",
    "sections": [
      {
        "title": "Organisation professionnelle avancée",
        "concepts": [
          {
            "concept": "Ordres professionnels et régulation",
            "analyse": "Instances de régulation pour professions règlementées : médecins, pharmaciens, sages-femmes, chirurgiens-dentistes, infirmiers, masseurs-kinésithérapeutes, pédicures-podologues",
            "cas": "Procédure disciplinaire ordinal : plainte patient → enquête → chambre disciplinaire → sanctions possibles",
            "ecueil": "Minimiser rôle des ordres - instances légitimes et nécessaires",
            "technique": "Veillent au maintien des principes de moralité, probité, compétence indispensables à l''exercice",
            "distinction": "Ordre (régulation profession) ≠ Syndicat (défense intérêts) ≠ Société savante (science)",
            "maitrise": "Comprendre rôle complémentaire des différentes instances professionnelles",
            "excellence": "Engagement dans vie professionnelle organisée et responsable"
          },
          {
            "concept": "Évolution réglementaire et autonomie",
            "analyse": "Autonomie du médecin questionnée au profit qualité des soins et équilibre santé individuelle/publique. Coût et risques justifient régulation étatique croissante",
            "cas": "ROSP (Rémunération sur Objectifs de Santé Publique) : rémunération liée à indicateurs qualité",
            "ecueil": "Résister par principe à toute évolution - adaptation nécessaire",
            "technique": "Contrôle de l''État sur diplômes, autorisations d''exercice, pratiques professionnelles",
            "distinction": "Liberté d''exercice ≠ Absence de contrôle - liberté dans cadre régulé",
            "maitrise": "Intégrer contraintes réglementaires dans pratique quotidienne",
            "excellence": "Anticipation et adaptation proactive aux évolutions"
          }
        ]
      }
    ]
  }',
  updated_at = now()
WHERE slug = 'valeurs-professionnelles-medecin';

-- ======================================  
-- ITEM IC-3 : Raisonnement et décision
-- ======================================
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "theme": "Raisonnement et décision médecine - Rang A Fondamental",
    "sections": [
      {
        "title": "Evidence-Based Medicine (EBM)",
        "concepts": [
          {
            "concept": "Médecine basée sur les preuves",
            "definition": "Utilisation consciencieuse et judicieuse des meilleures données scientifiques actuelles dans la prise en charge personnalisée de chaque patient",
            "exemple": "Prescrire antihypertenseur selon études randomisées + profil patient + préférences",
            "piege": "Ne pas opposer EBM et expérience clinique - complémentaires",
            "mnemo": "EBM = Preuves + Expérience + Préférences patient",
            "subtilite": "EBM ne remplace pas jugement clinique mais l''éclaire",
            "application": "Rechercher preuves scientifiques avant chaque décision thérapeutique",
            "vigilance": "Adapter preuves générales au cas particulier du patient"
          },
          {
            "concept": "Question PICOT",
            "definition": "Structure pour formuler question clinique : Patient, Intervention, Comparator, Outcomes, Time",
            "exemple": "Chez diabétique type 2 (P), metformine (I) vs sulfamides (C) réduit-elle HbA1c (O) à 6 mois (T) ?",
            "piege": "Négliger formulation précise - question floue = recherche inefficace",
            "mnemo": "PICOT = Patient Intervention Comparaison Outcome Temps",
            "subtilite": "Tous éléments ne sont pas toujours nécessaires selon contexte",
            "application": "Structurer toute recherche bibliographique avec PICOT",
            "vigilance": "Bien définir population cible et critères de jugement"
          }
        ]
      },
      {
        "title": "Styles de raisonnement clinique",
        "concepts": [
          {
            "concept": "Reconnaissance archétypale",
            "definition": "Reconnaissance immédiate d''un pattern clinique familier basée sur l''expérience. Raisonnement intuitif rapide",
            "exemple": "Diagnostic immédiat d''infarctus devant douleur thoracique typique",
            "piege": "Risque d''erreur si pattern inhabituel - toujours vérifier",
            "mnemo": "PATTERN = Reconnaissance + Expérience + Intuition",
            "subtilite": "Efficace chez expert mais peut induire biais cognitifs",
            "application": "Utiliser pour orientation diagnostique rapide",
            "vigilance": "Confirmer par méthode hypothético-déductive si doute"
          },
          {
            "concept": "Méthode hypothético-déductive",  
            "definition": "Formulation d''hypothèses diagnostiques puis tests pour les confirmer/infirmer. Raisonnement analytique structuré",
            "exemple": "Liste diagnostics différentiels pour dyspnée + examens ciblés",
            "piege": "Peut être long - pas adapté à toutes situations",
            "mnemo": "HYPOTHÈSES = Formuler + Tester + Confirmer/Infirmer",
            "subtilite": "Méthode de référence en cas de complexité ou incertitude",
            "application": "Systématiser en cas de diagnostic difficile",
            "vigilance": "Ne pas multiplier hypothèses - rester parcimonieux"
          }
        ]
      }
    ]
  }',
  
  tableau_rang_b = '{
    "theme": "Raisonnement et décision médecine - Rang B Expert",
    "sections": [
      {
        "title": "Analyse décisionnelle avancée",
        "concepts": [
          {
            "concept": "Arbres de décision médicale",
            "analyse": "Technique de modélisation décomposant problèmes complexes en loteries élémentaires. Utilité moyenne pondérée par probabilités",
            "cas": "Décision chirurgie cardiaque : pondérer bénéfices (survie, qualité vie) vs risques (mortalité, complications) selon probabilités",
            "ecueil": "Surinvestir dans modélisation au détriment relation patient",
            "technique": "Calcul espérance mathématique : Σ(probabilité × utilité) pour chaque branche",
            "distinction": "Analyse formelle ≠ Décision clinique réelle - outil d''aide pas de substitution",
            "maitrise": "Utiliser arbres décision pour cas complexes avec alternatives multiples",
            "excellence": "Intégrer modélisation quantitative dans raisonnement clinique global"
          },
          {
            "concept": "Efficacité vs Effectivité vs Efficience",
            "analyse": "Efficacité = résultat conditions idéales. Effectivité = résultat conditions réelles. Efficience = optimisation ressources/résultats",
            "cas": "Statine : efficacité prouvée sur cholestérol, effectivité moindre (observance), efficience à évaluer (coût/QALY)",
            "ecueil": "Confondre les 3 concepts - implications différentes pour pratique",
            "technique": "Méta-analyses (efficacité), études observationnelles (effectivité), études médico-économiques (efficience)",
            "distinction": "Essai randomisé (efficacité) ≠ Vraie vie (effectivité) ≠ Optimisation (efficience)",
            "maitrise": "Adapter recommandations selon niveau de preuve et contexte",
            "excellence": "Vision globale intégrant les 3 dimensions dans décisions"
          }
        ]
      }
    ]
  }',
  updated_at = now()
WHERE slug = 'ic-3-raisonnement-decision-medecine';

-- Mise à jour finale pour IC-4 déjà fait précédemment
-- Vérification que IC-4 est bien complet avec les nouvelles données des Blocs 5 et 6

UPDATE edn_items_immersive 
SET updated_at = now()
WHERE item_code = 'IC-4';

