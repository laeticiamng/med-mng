
-- Vérifier si l'item IC-2 existe déjà et le corriger si nécessaire
INSERT INTO edn_items_immersive (
  id,
  slug,
  item_code,
  title,
  subtitle,
  pitch_intro,
  visual_ambiance,
  audio_ambiance,
  tableau_rang_a,
  tableau_rang_b,
  scene_immersive,
  paroles_musicales,
  interaction_config,
  quiz_questions,
  reward_messages,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'valeurs-professionnelles-medecin',
  'IC-2',
  'Les valeurs professionnelles du médecin',
  'Fiche LiSA',
  'Découvrez les valeurs cardinales qui guident la pratique médicale moderne : responsabilité, compassion, probité... Une exploration immersive des principes éthiques et déontologiques qui fondent l''exercice médical au sein d''équipes pluridisciplinaires.',
  '{"theme": "medical_ethics", "colors": ["blue", "green", "amber"], "mood": "professional"}',
  '{"style": "classical", "tempo": "moderate", "instruments": ["piano", "strings"]}',
  '{
    "title": "Rang A - Fondamentaux",
    "sections": [
      {"title": "Identifier les professionnels et leurs rôles", "content": "Quel que soit leur mode d''exercice, les médecins collaborent avec de nombreux acteurs de santé. La qualité des soins et la sécurité des patients dépendent de l''organisation des soins et de la capacité des acteurs à travailler ensemble."},
      {"title": "Définition de la pratique médicale et éthique", "content": "La pratique médicale est une activité technique et relationnelle qui répond aux besoins de santé. L''éthique désigne la réflexion : comment agir au mieux dans cette situation ?"},
      {"title": "Normes et valeurs professionnelles", "content": "Les valeurs décrivent ce qui est souhaitable. Les normes traduisent ces valeurs en principes concrets. Valeurs cardinales : responsabilité, compassion, probité, indépendance..."},
      {"title": "Organisation et régulation", "content": "Le coût et les risques ont justifié une régulation étatique. L''autonomie du médecin est questionnée au profit de la qualité des soins et de l''équilibre santé individuelle/publique."},
      {"title": "Médecine fondée sur les preuves", "content": "L''EBM promeut une pratique conforme aux données scientifiques, interprétées par l''expérience et appliquées dans le respect des préférences du patient."},
      {"title": "Déontologie et conflits", "content": "Le code de déontologie définit les normes professionnelles. Conflits de valeurs vs conflits d''intérêts : protection de la vie vs autonomie du patient."}
    ]
  }',
  '{
    "title": "Rang B - Approfondissements",
    "sections": [
      {"title": "Organisation des professionnels de santé", "content": "Chaque profession exerce une activité codifiée avec autorisation d''exercice par diplôme. Collaboration organisée en hôpitaux et maisons de santé."},
      {"title": "Rôle des ordres professionnels", "content": "Instances de régulation pour médecins, pharmaciens, infirmiers... Veillent à la moralité, probité, compétence et relations confraternelles."}
    ]
  }',
  '{
    "setting": "Hôpital universitaire moderne",
    "characters": [
      {"name": "Dr. Leroy", "role": "Médecin senior", "description": "Incarnation des valeurs professionnelles"},
      {"name": "Équipe soignante", "role": "Professionnels de santé", "description": "Collaboration interprofessionnelle"}
    ],
    "scenario": "Une journée dans un service hospitalier illustrant les valeurs professionnelles en action"
  }',
  ARRAY[
    'Dans les couloirs de l''hôpital, résonne l''écho des pas',
    'Chaque professionnel porte en lui les valeurs sacrées',
    'Responsabilité, compassion, probité sincère',
    'Font de la médecine un art, une science claire',
    'L''équipe pluridisciplinaire unie dans l''action',
    'Transforme chaque soin en noble mission'
  ],
  '{
    "type": "value_matching",
    "title": "Associez les valeurs aux situations",
    "items": [
      {"value": "Responsabilité", "situation": "Assumer les conséquences de ses actes médicaux"},
      {"value": "Compassion", "situation": "Accompagner la souffrance du patient"},
      {"value": "Probité", "situation": "Agir avec honnêteté et intégrité"},
      {"value": "Indépendance", "situation": "Préserver son jugement médical"}
    ]
  }',
  '{
    "questions": [
      {
        "question": "Quelles sont les valeurs cardinales de la profession médicale ?",
        "options": ["Rentabilité, efficacité, rapidité", "Responsabilité, compassion, probité", "Individualisme, compétition, excellence", "Autorité, prestige, pouvoir"],
        "correct": 1,
        "explanation": "Les valeurs cardinales incluent la responsabilité, la compassion, la probité, le respect de l''autonomie, l''indépendance, la discrétion, la confraternité."
      },
      {
        "question": "Que désigne l''éthique en médecine ?",
        "options": ["Un ensemble de règles fixes", "La réflexion sur comment agir au mieux", "Les obligations légales", "Les protocoles hospitaliers"],
        "correct": 1,
        "explanation": "L''éthique désigne la réflexion de celui qui agit et se pose la question : comment faire pour agir au mieux dans cette situation ?"
      }
    ]
  }',
  '{
    "completion": "Félicitations ! Vous maîtrisez les valeurs professionnelles médicales.",
    "badges": ["Éthique médicale", "Valeurs professionnelles", "Déontologie"]
  }',
  now(),
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  pitch_intro = EXCLUDED.pitch_intro,
  tableau_rang_a = EXCLUDED.tableau_rang_a,
  tableau_rang_b = EXCLUDED.tableau_rang_b,
  updated_at = now();
