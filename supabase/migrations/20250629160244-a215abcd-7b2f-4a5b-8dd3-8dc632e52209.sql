
-- Corriger l'intégration des 5 items IC-1 à IC-5 avec syntaxe JSON correcte
-- D'abord, vérifier l'état actuel
SELECT item_code, title, slug FROM edn_items_immersive WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5') ORDER BY item_code;

-- Créer/corriger IC-1 avec JSON correct
INSERT INTO edn_items_immersive (
  item_code, slug, title, subtitle, pitch_intro
) VALUES (
  'IC-1',
  'relation-medecin-malade',
  'La relation médecin-malade',
  '15 connaissances E-LiSA fondamentales',
  'Au cœur de la médecine se trouve une relation unique entre le soignant et le soigné. Cette relation thérapeutique repose sur la confiance, l''empathie, la communication et le respect mutuel.'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  pitch_intro = EXCLUDED.pitch_intro,
  updated_at = now();

-- Mettre à jour IC-1 avec les données JSON
UPDATE edn_items_immersive SET
  tableau_rang_a = '{"theme": "Relation médecin-malade - 15 connaissances E-LiSA", "sections": [{"title": "Communication thérapeutique", "content": "La communication est au cœur de la relation médecin-malade"}, {"title": "Consentement éclairé", "content": "Information claire sur traitements, bénéfices et risques"}, {"title": "Secret médical", "content": "Protection des informations personnelles du patient"}, {"title": "Autonomie du patient", "content": "Respect des choix et valeurs du patient"}, {"title": "Annonce diagnostique", "content": "Compétences spécifiques pour annonce de diagnostic"}]}',
  paroles_musicales = ARRAY['Dans le silence du cabinet deux âmes se rencontrent', 'Entre confiance et respect naît la relation soignante', 'Écouter comprendre accompagner avec bienveillance'],
  scene_immersive = '{"setting": "Cabinet médical", "characters": [{"name": "Dr. Dubois", "role": "Médecin", "description": "Praticien expérimenté"}], "scenario": "Consultation avec annonce de résultats"}',
  quiz_questions = '{"questions": [{"question": "Quels sont les 4 principes fondamentaux de la bioéthique médicale ?", "options": ["Autonomie bienfaisance non-malfaisance justice", "Confidentialité respect empathie compétence"], "correct": 0}]}',
  reward_messages = '{"completion": "Félicitations ! Vous maîtrisez les fondements de la relation médecin-malade"}'
WHERE item_code = 'IC-1';

-- Créer/corriger IC-4 
INSERT INTO edn_items_immersive (
  item_code, slug, title, subtitle, pitch_intro
) VALUES (
  'IC-4',
  'qualite-securite-soins',
  'Qualité et sécurité des soins',
  'Démarche qualité - EIAS - Gestion des risques',
  'La qualité et la sécurité des soins constituent le socle de l''excellence médicale moderne.'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  pitch_intro = EXCLUDED.pitch_intro,
  updated_at = now();

-- Mettre à jour IC-4 avec données structurées
UPDATE edn_items_immersive SET
  tableau_rang_a = '{"theme": "IC-4 Rang A - Qualité et sécurité des soins", "sections": [{"title": "Démarche qualité", "content": "Amélioration continue des pratiques professionnelles"}, {"title": "EIAS", "content": "Événements indésirables associés aux soins"}, {"title": "Gestion des risques", "content": "Identification évaluation et maîtrise des risques"}, {"title": "Infections associées aux soins", "content": "Prévention et contrôle des IAS"}]}',
  tableau_rang_b = '{"theme": "IC-4 Rang B - Expertise qualité", "sections": [{"title": "Certification", "content": "Évaluation externe des établissements"}, {"title": "Indicateurs qualité", "content": "Outils de mesure et pilotage"}, {"title": "Culture sécurité", "content": "Valeurs et comportements sécuritaires"}]}',
  paroles_musicales = ARRAY['Dans les couloirs blancs où résonne l''espoir', 'Chaque geste compte chaque protocole a son histoire', 'La qualité se mesure la sécurité se cultive'],
  scene_immersive = '{"setting": "Hôpital moderne", "characters": [{"name": "Dr. Lefort", "role": "Responsable qualité"}], "scenario": "Analyse événement indésirable"}',
  quiz_questions = '{"questions": [{"question": "Que signifie EIAS ?", "options": ["Événement Indésirable Associé aux Soins", "Évaluation Interne des Actes"], "correct": 0}]}',
  reward_messages = '{"completion": "Excellent ! Vous maîtrisez la qualité et sécurité des soins"}'
WHERE item_code = 'IC-4';

-- Créer/corriger IC-5
INSERT INTO edn_items_immersive (
  item_code, slug, title, subtitle, pitch_intro
) VALUES (
  'IC-5',
  'organisation-systeme-sante',
  'Organisation du système de santé',
  'Architecture et fonctionnement du système français',
  'Le système de santé français est complexe. Explorez son architecture et ses rouages.'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  pitch_intro = EXCLUDED.pitch_intro,
  updated_at = now();

-- Mettre à jour IC-5 avec données
UPDATE edn_items_immersive SET
  tableau_rang_a = '{"theme": "IC-5 Rang A - Organisation système santé", "sections": [{"title": "Architecture", "content": "Trois secteurs ambulatoire hospitalier médico-social"}, {"title": "Parcours de soins", "content": "Organisation autour du médecin traitant"}, {"title": "Financement", "content": "Sécurité sociale complémentaires reste à charge"}, {"title": "Gouvernance", "content": "Pilotage national régional territorial"}]}',
  tableau_rang_b = '{"theme": "IC-5 Rang B - Expertise organisation", "sections": [{"title": "Planification sanitaire", "content": "Schémas régionaux adaptation offre besoins"}, {"title": "Régulation", "content": "Contrôle dépenses évaluation pratiques"}, {"title": "Innovations", "content": "Télémédecine maisons santé coordination"}]}',
  paroles_musicales = ARRAY['Du village à la métropole un réseau se dessine', 'Médecins hôpitaux tous unis dans la mission', 'ARS CPAM CHU sigles d''un système qui veille'],
  scene_immersive = '{"setting": "Agence Régionale de Santé", "characters": [{"name": "Dr. Moreau", "role": "Directeur ARS"}], "scenario": "Planification sanitaire territoriale"}',
  quiz_questions = '{"questions": [{"question": "Que signifie ARS ?", "options": ["Agence Régionale de Santé", "Association Représentants Santé"], "correct": 0}]}',
  reward_messages = '{"completion": "Bravo ! Vous comprenez l''organisation du système de santé français"}'
WHERE item_code = 'IC-5';
