
-- Ajout des nouveaux items IC-10 et OIC-010-03-B
INSERT INTO public.edn_items_immersive (
  id,
  item_code,
  title,
  subtitle,
  slug,
  tableau_rang_a,
  tableau_rang_b,
  paroles_musicales,
  scene_immersive,
  quiz_questions,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'IC-10',
  'Approches transversales du corps',
  'Dimensions humaines du corps et impact sur l''expérience corporelle',
  'ic-10-approches-transversales-corps',
  '{
    "theme": "IC-10 Rang A - Approches transversales du corps",
    "sections": [{
      "concepts": [
        {
          "concept": "Dimensions humaines du corps",
          "definition": "Connaissance des différentes dimensions du corps : physique, genre, ancêtre, normes esthétiques",
          "exemple": "Prise en compte de l''identité de genre dans l''approche médicale",
          "piege": "Se limiter à la dimension purement biologique du corps",
          "mnemo": "CORPS : Culture, Origine, Représentation, Physique, Social",
          "subtilite": "Le corps est à la fois objet d''étude et vécu subjectif",
          "application": "Adapter l''examen clinique aux spécificités culturelles",
          "vigilance": "Respecter les différentes représentations du corps"
        },
        {
          "concept": "Choix des aliments adaptés",
          "definition": "Sélection d''aliments selon les critères de santé, culture et éthique",
          "exemple": "Respect des prescriptions alimentaires religieuses en milieu hospitalier",
          "piege": "Imposer un modèle alimentaire unique",
          "mnemo": "ALIMENT : Adaptation, Liberté, Identité, Médical, Éthique, Nutrition, Tradition",
          "subtilite": "L''alimentation engage l''identité culturelle et personnelle",
          "application": "Concertation avec le patient pour les choix alimentaires",
          "vigilance": "Équilibrer recommandations médicales et respect des croyances"
        },
        {
          "concept": "Corps dans les pratiques cliniques",
          "definition": "Intégration du regard médical dans l''approche du corps du patient",
          "exemple": "Examen respectueux de la pudeur selon les normes culturelles",
          "piege": "Standardiser l''approche sans tenir compte des spécificités",
          "mnemo": "CLINIQUE : Conscience, Liberté, Individualité, Norme, Inclusion, Question, Unique, Éthique",
          "subtilite": "Chaque patient a sa propre relation à son corps",
          "application": "Personnalisation de l''examen clinique",
          "vigilance": "Maintenir la qualité médicale tout en respectant les différences"
        }
      ]
    }]
  }',
  '{
    "theme": "IC-10 Rang B - Expertise des approches transversales",
    "sections": [{
      "concepts": [
        {
          "concept": "Analyse multidimensionnelle",
          "definition": "Approche intégrative des dimensions biologiques, psychologiques, sociales et culturelles",
          "exemple": "Évaluation complète d''un trouble alimentaire incluant tous les aspects",
          "piege": "Compartimenter les différentes approches",
          "mnemo": "MULTI : Médical, Unité, Liens, Transversal, Intégratif",
          "subtilite": "Les dimensions s''influencent mutuellement",
          "application": "Équipe pluridisciplinaire coordonnée",
          "vigilance": "Éviter la hiérarchisation des approches"
        }
      ]
    }]
  }',
  ARRAY[
    'Le corps humain, dimensions multiples, culturel et médical se lient',
    'Approche transversale, respectueuse et globale, pour soigner en conscience'
  ],
  '{
    "type": "multidisciplinary",
    "scenario": "Consultation transculturelle avec approche holistique du corps",
    "characters": ["Médecin", "Patient", "Médiateur culturel"],
    "interactions": ["Anamnèse culturelle", "Examen adapté", "Plan de soins personnalisé"]
  }',
  '{
    "questions": [
      {
        "question": "Quelles sont les principales dimensions à considérer dans l''approche transversale du corps ?",
        "options": ["Uniquement biologique", "Biologique, psychologique, sociale et culturelle", "Seulement médicale", "Exclusivement physique"],
        "correct": 1,
        "explanation": "L''approche transversale intègre toutes les dimensions de l''expérience corporelle"
      }
    ]
  }',
  now(),
  now()
),
(
  gen_random_uuid(),
  'OIC-010-03-B',
  'Connaître l''impact des différentes maladies sur l''expérience du corps',
  'Changements de l''identité, image du corps et répercussions psychologiques',
  'oic-010-03-b-impact-maladies-corps',
  '{
    "theme": "OIC-010-03-B Rang A - Impact des maladies sur l''expérience corporelle",
    "sections": [{
      "concepts": [
        {
          "concept": "Changements de l''identité corporelle",
          "definition": "Modifications de la perception de soi liées aux atteintes corporelles",
          "exemple": "Perte d''identité professionnelle après amputation chez un sportif",
          "piege": "Minimiser l''impact psychologique des changements physiques",
          "mnemo": "IDENTITÉ : Image, Dimension, Évolution, Narcissisme, Transformation, Individu, Temps, Émotion",
          "subtilite": "L''identité corporelle évolue tout au long de la vie",
          "application": "Accompagnement psychologique des changements corporels",
          "vigilance": "Anticiper les réactions d''adaptation à long terme"
        },
        {
          "concept": "Douleur et expérience corporelle",
          "definition": "Impact de la douleur sur la relation au corps et l''identité",
          "exemple": "Modification des activités quotidiennes due à la douleur chronique",
          "piege": "Se focaliser uniquement sur l''aspect somatique de la douleur",
          "mnemo": "DOULEUR : Dimension, Objectif, Unique, Limite, Expérience, Unique, Ressenti",
          "subtilite": "La douleur influence la totalité de l''expérience corporelle",
          "application": "Prise en charge globale de la douleur",
          "vigilance": "Évaluer l''impact sur la qualité de vie globale"
        },
        {
          "concept": "Corps humain et sciences sociales",
          "definition": "Approche sociologique et anthropologique du corps en médecine",
          "exemple": "Étude des représentations culturelles de la maladie",
          "piege": "Ignorer les déterminants sociaux de la santé",
          "mnemo": "SOCIAL : Société, Origine, Culture, Identité, Anthropologie, Liens",
          "subtilite": "Le corps médical est aussi un corps social",
          "application": "Intégration des sciences sociales en formation médicale",
          "vigilance": "Éviter le réductionnisme biomédical"
        }
      ]
    }]
  }',
  '{
    "theme": "OIC-010-03-B Rang B - Expertise de l''impact psychocorporel",
    "sections": [{
      "concepts": [
        {
          "concept": "Évaluation psychocorporelle avancée",
          "definition": "Assessment spécialisé des répercussions psychologiques des atteintes corporelles",
          "exemple": "Bilan complet post-mastectomie incluant image corporelle et sexualité",
          "piege": "Fragmenter l''évaluation entre spécialités",
          "mnemo": "ÉVALUATION : Exhaustive, Valide, Adaptée, Longitudinale, Unique, Approfondie, Totale, Intégrée, Objective, Nuancée",
          "subtilite": "L''évaluation doit être dynamique et répétée",
          "application": "Protocoles d''évaluation multidimensionnelle",
          "vigilance": "Adapter les outils aux spécificités de chaque patient"
        }
      ]
    }]
  }',
  ARRAY[
    'Corps malade, identité changée, accompagner le patient dans sa traversée',
    'Image de soi, douleur aussi, soigner le corps et l''âme à la fois'
  ],
  '{
    "type": "psychosomatic",
    "scenario": "Prise en charge d''un patient avec modification importante de l''image corporelle",
    "characters": ["Médecin", "Patient", "Psychologue", "Famille"],
    "interactions": ["Évaluation impact", "Soutien psychologique", "Adaptation sociale"]
  }',
  '{
    "questions": [
      {
        "question": "Quel est l''impact principal des maladies sur l''expérience du corps ?",
        "options": ["Uniquement physique", "Changement de l''identité corporelle et psychologique", "Seulement esthétique", "Exclusivement douloureux"],
        "correct": 1,
        "explanation": "Les maladies affectent profondément l''identité corporelle et ont des répercussions psychologiques majeures"
      }
    ]
  }',
  now(),
  now()
);
