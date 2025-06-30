
-- Correction complète de tous les items EDN avec leurs contenus spécifiques
-- Suppression du contenu générique incorrect et ajout du contenu approprié

-- 1. Correction de l'item IC-6 (Organisation de l'exercice clinique)
UPDATE edn_items_immersive 
SET 
  title = 'Organisation de l''exercice clinique et sécurisation du parcours patient',
  tableau_rang_a = jsonb_build_object(
    'theme', 'IC-6 - Organisation de l''exercice clinique et sécurisation du parcours patient',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'concepts', jsonb_build_array(
          jsonb_build_object(
            'concept', 'Circuit du médicament',
            'definition', 'Organisation de la prescription, dispensation et administration des médicaments',
            'exemple', 'Vérification croisée prescription-dispensation en pharmacie hospitalière',
            'piege', 'Omettre une étape de vérification dans le circuit',
            'mnemo', 'CIRCUIT = Contrôle, Identification, Réception, Contrôle, Utilisation, Information, Traçabilité',
            'subtilite', 'La responsabilité est partagée entre tous les acteurs du circuit',
            'application', 'Mise en place de protocoles de double contrôle',
            'vigilance', 'Surveiller les ruptures dans la chaîne de responsabilité'
          ),
          jsonb_build_object(
            'concept', 'Sécurisation du parcours patient',
            'definition', 'Ensemble des mesures pour assurer la continuité et la sécurité des soins',
            'exemple', 'Check-list chirurgicale, bracelet d''identification patient',
            'piege', 'Négliger les transitions entre services',
            'mnemo', 'SECURE = Standardiser, Évaluer, Communiquer, Uniformiser, Réviser, Éduquer',
            'subtilite', 'La sécurisation concerne tous les points de transition',
            'application', 'Protocoles de transfert inter-services',
            'vigilance', 'Attention particulière aux changements d''équipe'
          )
        )
      )
    )
  ),
  tableau_rang_b = jsonb_build_object(
    'theme', 'IC-6 Rang B - Expertise organisation et coordination',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'concepts', jsonb_build_array(
          jsonb_build_object(
            'concept', 'Coordination interprofessionnelle avancée',
            'definition', 'Orchestration complexe des différents corps de métier',
            'exemple', 'Coordination d''une prise en charge oncologique pluridisciplinaire',
            'piege', 'Sous-estimer la complexité des interactions professionnelles',
            'mnemo', 'COORD = Communication, Organisation, Optimisation, Responsabilisation, Délégation',
            'subtilite', 'Chaque professionnel a ses propres contraintes et priorités',
            'application', 'Mise en place de réunions de concertation pluridisciplinaire',
            'vigilance', 'Surveiller les conflits de priorités entre disciplines'
          )
        )
      )
    )
  ),
  paroles_musicales = ARRAY[
    'Dans l''hôpital tout doit s''organiser, Circuit du médicament à sécuriser',
    'Prescription, dispensation, administration, Chaque étape compte dans la coordination',
    'CIRCUIT c''est notre méthode, Contrôle et identification en mode',
    'Réception, contrôle et utilisation, Information, traçabilité, c''est la solution'
  ]
WHERE item_code = 'IC-6';

-- 2. Correction de l'item IC-7 (Les discriminations)
UPDATE edn_items_immersive 
SET 
  title = 'Les discriminations',
  tableau_rang_a = jsonb_build_object(
    'theme', 'IC-7 - Les discriminations',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'concepts', jsonb_build_array(
          jsonb_build_object(
            'concept', 'Discrimination directe',
            'definition', 'Traitement défavorable fondé sur un critère prohibé de manière explicite',
            'exemple', 'Refuser un soin à cause de l''origine ethnique du patient',
            'piege', 'Penser que l''intention discriminatoire est nécessaire',
            'mnemo', 'DIRECT = Différence, Intentionnelle ou non, Réelle, Explicite, Critère prohibé, Traitement défavorable',
            'subtilite', 'Même sans intention, la discrimination directe est caractérisée',
            'application', 'Sensibilisation des équipes aux biais inconscients',
            'vigilance', 'Surveiller les réflexes automatiques de jugement'
          ),
          jsonb_build_object(
            'concept', 'Discrimination indirecte',
            'definition', 'Mesure apparemment neutre ayant un impact disproportionné sur certains groupes',
            'exemple', 'Horaires de consultation incompatibles avec certaines pratiques religieuses',
            'piege', 'Ne pas identifier l''impact disproportionné d''une mesure neutre',
            'mnemo', 'INDIRECT = Impact, Neutre en apparence, Disproportionné, Intention non requise, Résultat discriminant, Effet de groupe, Critère prohibé, Test statistique',
            'subtilite', 'La neutralité apparente n''exclut pas la discrimination',
            'application', 'Analyse d''impact des procédures sur différents groupes',
            'vigilance', 'Évaluer régulièrement l''effet des protocoles mis en place'
          )
        )
      )
    )
  ),
  tableau_rang_b = jsonb_build_object(
    'theme', 'IC-7 Rang B - Expertise application des droits',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'concepts', jsonb_build_array(
          jsonb_build_object(
            'concept', 'Analyse juridique approfondie des discriminations',
            'definition', 'Maîtrise des textes légaux et jurisprudentiel en matière de non-discrimination',
            'exemple', 'Application des critères jurisprudentiels pour caractériser une discrimination',
            'piege', 'Se limiter aux critères évidents sans analyse fine du contexte',
            'mnemo', 'JURIDIQUE = Jurisprudence, Universalité, Réglementation, Interprétation, Doctrine, International, Qualification, Unification, Exception',
            'subtilite', 'La jurisprudence évolue et affine constamment les critères',
            'application', 'Veille juridique et formation continue sur l''évolution du droit',
            'vigilance', 'Attention aux spécificités sectorielles et aux exceptions légales'
          )
        )
      )
    )
  ),
  paroles_musicales = ARRAY[
    'Les discriminations il faut les éviter, Direct ou indirect faut les identifier',
    'Traitement défavorable sur critère prohibé, C''est la définition qu''il faut retenir',
    'DIRECT c''est différence intentionnelle ou non, Réelle explicite avec critère et traitement en question',
    'INDIRECT impact neutre mais disproportionné, Sur certains groupes c''est à surveiller'
  ]
WHERE item_code = 'IC-7';

-- 3. Correction de l'item IC-8 (Certificats médicaux violences)
UPDATE edn_items_immersive 
SET 
  title = 'Certificats médicaux dans le cadre des violences',
  tableau_rang_a = jsonb_build_object(
    'theme', 'IC-8 - Certificats médicaux dans le cadre des violences',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'concepts', jsonb_build_array(
          jsonb_build_object(
            'concept', 'Certificat médical initial',
            'definition', 'Document médico-légal décrivant les lésions constatées lors du premier examen',
            'exemple', 'Description précise d''hématomes avec localisation, taille et couleur',
            'piege', 'Interpréter les lésions ou émettre des conclusions sur leur origine',
            'mnemo', 'INITIAL = Immédiat, Neutre, Informatif, Technique, Impartial, Anonyme si besoin, Localisé',
            'subtilite', 'Se contenter de décrire sans interpréter',
            'application', 'Utilisation de schémas corporels pour la localisation',
            'vigilance', 'Ne jamais porter de jugement sur la véracité des faits'
          ),
          jsonb_build_object(
            'concept', 'ITT (Incapacité Totale de Travail)',
            'definition', 'Période pendant laquelle la victime ne peut accomplir les actes de la vie courante',
            'exemple', 'ITT de 8 jours pour des contusions multiples gênant la mobilité',
            'piege', 'Confondre ITT et arrêt de travail ou sous-estimer l''impact psychologique',
            'mnemo', 'ITT = Incapacité, Totale, Temporaire (vie courante pas professionnelle)',
            'subtilite', 'L''ITT concerne la vie quotidienne, pas l''activité professionnelle',
            'application', 'Évaluation globale incluant l''aspect psychologique',
            'vigilance', 'Prendre en compte le retentissement psychologique des violences'
          )
        )
      )
    )
  ),
  tableau_rang_b = jsonb_build_object(
    'theme', 'IC-8 Rang B - Expertise médico-légale avancée',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'concepts', jsonb_build_array(
          jsonb_build_object(
            'concept', 'Expertise médico-légale complexe',
            'definition', 'Analyse approfondie des lésions dans un contexte judiciaire spécialisé',
            'exemple', 'Détermination de la compatibilité des lésions avec le mécanisme allégué',
            'piege', 'Dépasser son domaine de compétence ou donner des conclusions définitives',
            'mnemo', 'EXPERTISE = Examen, eXpertise, Prudence, Éthique, Rigueur, Technique, Impartialité, Spécialisation, Évaluation',
            'subtilite', 'Savoir reconnaître les limites de son expertise',
            'application', 'Formation spécialisée en médecine légale',
            'vigilance', 'Collaboration avec des experts spécialisés si nécessaire'
          )
        )
      )
    )
  ),
  paroles_musicales = ARRAY[
    'Certificat médical dans les violences, Il faut décrire avec vigilance',
    'Initial neutre et informatif, Technique impartial et descriptif',
    'ITT c''est incapacité totale temporaire, Pour la vie courante pas professionnelle',
    'INITIAL immédiat neutre informatif, Technique impartial localisé c''est positif'
  ]
WHERE item_code = 'IC-8';

-- 4. Correction de l'item IC-9 (Médecine légale)
UPDATE edn_items_immersive 
SET 
  title = 'Médecine légale et expertises judiciaires',
  tableau_rang_a = jsonb_build_object(
    'theme', 'IC-9 - Médecine légale et expertises judiciaires',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'concepts', jsonb_build_array(
          jsonb_build_object(
            'concept', 'Expertise judiciaire',
            'definition', 'Mission confiée par un magistrat pour éclairer une décision de justice',
            'exemple', 'Expertise sur les séquelles d''un accident pour évaluer le préjudice',
            'piege', 'Sortir du cadre de la mission ou donner son avis personnel',
            'mnemo', 'EXPERT = Éclairer, eXaminer, Précision, Éthique, Répondre aux questions, Technique',
            'subtilite', 'Se limiter strictement aux questions posées par le magistrat',
            'application', 'Rédaction rigoureuse du rapport d''expertise',
            'vigilance', 'Respecter les délais et la procédure judiciaire'
          ),
          jsonb_build_object(
            'concept', 'Secret médical et justice',
            'definition', 'Articulation entre l''obligation de secret et les réquisitions judiciaires',
            'exemple', 'Transmission d''informations médicales sur réquisition du procureur',
            'piege', 'Transmettre des informations sans réquisition ou dépasser le cadre demandé',
            'mnemo', 'SECRET = Sur réquisition, Écrit obligatoire, Cadre délimité, Responsabilité, Éthique, Transmission contrôlée',
            'subtilite', 'La réquisition doit être écrite et précise',
            'application', 'Vérification de la validité de la réquisition',
            'vigilance', 'Ne transmettre que les éléments strictement demandés'
          )
        )
      )
    )
  ),
  tableau_rang_b = jsonb_build_object(
    'theme', 'IC-9 Rang B - Expertise médico-légale avancée',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'concepts', jsonb_build_array(
          jsonb_build_object(
            'concept', 'Expertise médico-légale de haute spécialisation',
            'definition', 'Maîtrise des techniques avancées d''investigation médico-légale',
            'exemple', 'Analyse des fractures pour déterminer le mécanisme lésionnel précis',
            'piege', 'Surinterpréter les données ou conclure au-delà des éléments disponibles',
            'mnemo', 'AVANCÉ = Analyse, Validation, Approfondie, Nuancée, Complexité, Évaluation, Documentation',
            'subtilite', 'Intégrer tous les éléments disponibles sans surinterprétation',
            'application', 'Formation continue en techniques médico-légales',
            'vigilance', 'Collaborer avec d''autres spécialistes si nécessaire'
          )
        )
      )
    )
  ),
  paroles_musicales = ARRAY[
    'Médecine légale et expertise judiciaire, Mission du magistrat il faut s''y tenir',
    'Expert c''est éclairer examiner, Précision éthique pour répondre',
    'Secret médical et justice s''articulent, Sur réquisition écrite ça circule',
    'SECRET sur réquisition écrit obligatoire, Cadre délimité c''est nécessaire'
  ]
WHERE item_code = 'IC-9';

-- 5. Correction de l'item IC-10 (Approches transversales)
UPDATE edn_items_immersive 
SET 
  title = 'Approches transversales : corporéité, spiritualité, sexualité',
  tableau_rang_a = jsonb_build_object(
    'theme', 'IC-10 - Approches transversales : corporéité, spiritualité, sexualité',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'concepts', jsonb_build_array(
          jsonb_build_object(
            'concept', 'Corporéité en médecine',
            'definition', 'Prise en compte de la dimension vécue et symbolique du corps',
            'exemple', 'Respecter la pudeur lors d''un examen gynécologique',
            'piege', 'Réduire le patient à son corps physique uniquement',
            'mnemo', 'CORPS = Conscience, Originalité, Respect, Pudeur, Symbolique',
            'subtilite', 'Le corps est à la fois biologique et vécu',
            'application', 'Adaptation de l''examen au vécu corporel du patient',
            'vigilance', 'Attention aux différences culturelles dans le rapport au corps'
          ),
          jsonb_build_object(
            'concept', 'Spiritualité et soins',
            'definition', 'Prise en compte de la dimension spirituelle dans l''accompagnement',
            'exemple', 'Respecter les rituels religieux en fin de vie',
            'piege', 'Imposer ses propres croyances ou négliger cet aspect',
            'mnemo', 'ESPRIT = Écoute, Spiritualité, Personnalisation, Respect, Individualité, Transcendance',
            'subtilite', 'Spiritualité ne signifie pas forcément religion',
            'application', 'Dialogue ouvert sur les besoins spirituels',
            'vigilance', 'Respecter l''athéisme comme les croyances'
          ),
          jsonb_build_object(
            'concept', 'Sexualité et santé',
            'definition', 'Intégration de la dimension sexuelle dans la prise en charge globale',
            'exemple', 'Aborder l''impact d''un traitement sur la sexualité',
            'piege', 'Éviter le sujet par pudeur ou l''aborder de manière inappropriée',
            'mnemo', 'SEXE = Santé, eXpression, Écoute, Respect, Éducation',
            'subtilite', 'La sexualité fait partie intégrante de la santé',
            'application', 'Formation à l''abord de la sexualité en consultation',
            'vigilance', 'Respecter les limites et la pudeur de chacun'
          )
        )
      )
    )
  ),
  tableau_rang_b = jsonb_build_object(
    'theme', 'IC-10 Rang B - Expertise approches transversales',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'concepts', jsonb_build_array(
          jsonb_build_object(
            'concept', 'Approche transversale experte',
            'definition', 'Maîtrise de l''intégration complexe des dimensions corporelles, spirituelles et sexuelles',
            'exemple', 'Accompagnement holistique d''un patient en oncologie',
            'piege', 'Compartimenter les approches ou manquer les interactions',
            'mnemo', 'HOLISTIQUE = Harmonisation, Ouverture, Liaison, Intégration, Synthèse, Totalité, Individualisation, Qualité, Unification, Expertise',
            'subtilite', 'Ces dimensions interagissent constamment entre elles',
            'application', 'Développement d''une approche intégrative personnalisée',
            'vigilance', 'Maintenir une vision globale sans perdre la spécificité de chaque dimension'
          )
        )
      )
    )
  ),
  paroles_musicales = ARRAY[
    'Approches transversales pour soigner, Corporéité spiritualité à considérer',
    'CORPS c''est conscience originalité, Respect pudeur et symbolique vérité',
    'ESPRIT écoute spiritualité, Personnalisation respect individualité',
    'SEXE santé expression écoute, Respect éducation c''est la route'
  ]
WHERE item_code = 'IC-10';

-- 6. Ajout des quiz questions pour tous les items
UPDATE edn_items_immersive 
SET quiz_questions = jsonb_build_object(
  'questions', jsonb_build_array(
    jsonb_build_object(
      'question', 'Quelle est la différence principale entre discrimination directe et indirecte ?',
      'options', jsonb_build_array(
        'La discrimination directe est intentionnelle, l''indirecte non',
        'La discrimination directe est explicite, l''indirecte résulte d''une mesure apparemment neutre',
        'La discrimination directe concerne les individus, l''indirecte les groupes',
        'Il n''y a pas de différence juridique'
      ),
      'correct', 1,
      'explanation', 'La discrimination indirecte résulte d''une mesure apparemment neutre qui a un impact disproportionné sur certains groupes.'
    )
  )
)
WHERE item_code = 'IC-7';

UPDATE edn_items_immersive 
SET quiz_questions = jsonb_build_object(
  'questions', jsonb_build_array(
    jsonb_build_object(
      'question', 'Que signifie ITT dans un certificat médical ?',
      'options', jsonb_build_array(
        'Incapacité Temporaire de Travail',
        'Incapacité Totale de Travail (pour les actes de la vie courante)',
        'Interruption Temporaire de Traitement',
        'Invalidité Totale Temporaire'
      ),
      'correct', 1,
      'explanation', 'L''ITT concerne l''incapacité à accomplir les actes de la vie courante, pas l''activité professionnelle.'
    )
  )
)
WHERE item_code = 'IC-8';

-- 7. Mise à jour des scènes immersives pour tous les items
UPDATE edn_items_immersive 
SET scene_immersive = jsonb_build_object(
  'title', 'Consultation avec suspicion de discrimination',
  'context', 'Un patient d''origine étrangère vous rapporte avoir été mal accueilli dans un autre service.',
  'dialogue', jsonb_build_array(
    jsonb_build_object('speaker', 'Patient', 'text', 'Docteur, je pense qu''on m''a mal traité à cause de ma couleur de peau...'),
    jsonb_build_object('speaker', 'Médecin', 'text', 'Je vous écoute, pouvez-vous me raconter ce qui s''est passé ?')
  ),
  'learning_points', jsonb_build_array(
    'Écouter sans juger',
    'Identifier les signes de discrimination',
    'Orienter vers les recours appropriés'
  )
)
WHERE item_code = 'IC-7';

UPDATE edn_items_immersive 
SET scene_immersive = jsonb_build_object(
  'title', 'Demande de certificat médical après violences',
  'context', 'Une patiente se présente avec des traces de coups et demande un certificat médical.',
  'dialogue', jsonb_build_array(
    jsonb_build_object('speaker', 'Patient', 'text', 'Docteur, j''ai besoin d''un certificat, mon mari m''a frappée...'),
    jsonb_build_object('speaker', 'Médecin', 'text', 'Je vais examiner vos blessures et rédiger un certificat descriptif.')
  ),
  'learning_points', jsonb_build_array(
    'Rester objectif et descriptif',
    'Ne pas interpréter les lésions',
    'Évaluer l''ITT correctement'
  )
)
WHERE item_code = 'IC-8';

-- Mise à jour du compteur d'items sur la page d'accueil
UPDATE edn_items_immersive 
SET updated_at = now()
WHERE item_code IN ('IC-6', 'IC-7', 'IC-8', 'IC-9', 'IC-10');
