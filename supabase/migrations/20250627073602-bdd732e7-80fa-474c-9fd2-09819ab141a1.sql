
-- Créer une table pour stocker les items EDN complets avec leur contenu immersif
CREATE TABLE IF NOT EXISTS public.edn_items_immersive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  item_code TEXT NOT NULL, -- ex: IC-1
  pitch_intro TEXT,
  visual_ambiance JSONB, -- couleurs, typo, textures
  audio_ambiance JSONB, -- style musical, prompts
  tableau_rang_a JSONB, -- tableau 8x5 rang A
  tableau_rang_b JSONB, -- tableau 8x5 rang B
  scene_immersive JSONB, -- description scène graphique
  paroles_musicales TEXT[],
  interaction_config JSONB, -- config du jeu glisser-déposer
  quiz_questions JSONB, -- questions QCM, QRU, TCS, QROC, ZAP
  reward_messages JSONB, -- messages selon score
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insérer l'item "La relation médecin-malade"
INSERT INTO public.edn_items_immersive (
  slug,
  title,
  subtitle,
  item_code,
  pitch_intro,
  visual_ambiance,
  audio_ambiance,
  tableau_rang_a,
  tableau_rang_b,
  scene_immersive,
  paroles_musicales,
  interaction_config,
  quiz_questions,
  reward_messages
) VALUES (
  'relation-medecin-malade',
  'La relation médecin-malade dans le cadre du colloque singulier',
  'Item IC-1 - Fondements de la relation thérapeutique',
  'IC-1',
  'Tu n''es pas ta maladie, je ne suis pas qu''un médecin : c''est entre nous que ça se passe. La relation médecin-patient, c''est plus qu''un acte médical. C''est un espace partagé, où se construisent confiance, alliance et humanité.',
  '{
    "palette": ["crème", "doré pâle", "bleu pastel"],
    "typographie": ["serif doux", "sans serif élégant"],
    "texture": ["lin", "coton", "papier naturel"],
    "animation": "halo lumineux pulsant doucement",
    "decor": ["silhouettes patient/médecin", "bureau", "lumière chaude"]
  }',
  '{
    "style": "lo-fi piano avec basses douces",
    "emotion": "apaisement, lien humain, cocon thérapeutique",
    "prompt": "warm lofi piano with ambient background, comforting medical interaction",
    "duree": "4 minutes"
  }',
  '{
    "theme": "Fondements essentiels de la relation médecin-malade",
    "colonnes": ["Définition relation", "Déterminants clés", "Corrélats cliniques", "Approche centrée patient", "Représentations maladie", "Communication verbale", "Communication non-verbale", "Empathie clinique"],
    "lignes": [
      ["Rencontre médecin/patient, partenariat, pas seulement biomédical", "Finalités croisées : patient / médecin / société", "Impact sur diagnostic, observance, suivi", "4 dimensions : écoute, contexte, alliance, décision partagée", "Vision propre à chaque acteur influencée par le vécu", "Questions ouvertes, reformulation, clarté", "Silences, regard, posture, voix, environnement", "Compréhension sans fusion, attitude soignante ajustée"],
      ["Historique : modèle paternaliste → modèle participatif", "Éthique (respect), social (langue, culture), psycho (humeur, stress)", "Amélioration biocliniques maladies chroniques", "Respect des 2 expertises : médicale et vécue", "Modèle subjectif influençant comportement et traitement", "Entretien adapté au niveau éducatif du patient", "70 % du message est non-verbal", "Outil clé dans la relation thérapeutique"],
      ["Complémentarité patient/médecin", "Empathie + écoute = levier communication", "Renforce qualité de vie perçue", "Compréhension globale du patient", "Prendre conscience des différences de perception", "Structure d''entretien : intro, exploration, reformulation, clôture", "Toucher soignant, gestuelle, sourire", "Protection du médecin (≠ sympathie)"],
      ["Processus évolutif, consultation après consultation", "Affecte la manière dont l''info est reçue et interprétée", "Mène à une relation thérapeutique solide", "Partage de décisions thérapeutiques", "Influence les attentes du patient", "Adaptation au contexte : urgence / annonce", "Adapter distance, proximité, rythme", "Fait partie de l''apprentissage soignant"],
      ["Clé de la prise en charge personnalisée", "Nécessite adaptation constante", "Diminue les erreurs médicales", "Base du partenariat de soins", "Indispensable lors de l''annonce", "Interdépendance avec le non-verbal", "Attitude corporelle > mots parfois", "Ancrée dans la pratique clinique moderne"]
    ]
  }',
  '{
    "theme": "Outils pratiques + dimensions complexes",
    "colonnes": ["Coping / stress", "Mécanismes de défense", "Processus de changement", "Entretien motivationnel", "Alliance thérapeutique", "Annonce de mauvaise nouvelle", "Suivi post-annonce", "Réflexivité soignant"],
    "lignes": [
      ["Stratégies adaptatives face au stress : coping (conscient/inconscient)", "Projection, déni, régression, déplacement, isolation", "Précontemplation → contemplation → action → rechute", "Méthode centrée patient, vise engagement actif", "Coopération à long terme, confiance construite", "Préparation / annonce / post-consultation", "Nécessité d''étapes progressives", "Se remettre en question après chaque consultation"],
      ["Permet maîtrise de l''impact émotionnel", "Varient selon patient, proches, soignants", "Modèle circulaire de Prochaska", "Objectif partagé + autonomie du patient", "Pilier des soins chroniques", "Le patient entend peu à la 1ère annonce", "Entretien de suivi essentiel", "Adaptation constante à chaque patient"],
      ["Physio + psycho = réaction adaptative", "Peuvent empêcher compréhension", "Repérer le stade motivationnel pour adapter", "Facilitation, pas injonction", "Transforme la relation en outil thérapeutique", "Impact traumatique majeur possible", "Soutien psychologique + récapitulatif", "Débriefing interprofessionnel recommandé"],
      ["Intervention = adapter posture soignante", "Conscients ou non", "Lien entre changement et éducation thérapeutique", "Nécessite posture d''écoute active", "Relation = outil de soin", "Nécessite adaptation au patient + contexte", "Reformuler les éléments, assurer compréhension", "Positionnement éthique + écoute"],
      ["Soignant = acteur du climat relationnel", "Peuvent influencer choix et réactions", "Cibler bon moment, éviter résistance", "Dialogue stratégique + validation", "Solidifie alliance thérapeutique dans la durée", "Communication ajustée à chaque instant", "Assurer continuité entre consultations", "Formation continue recommandée"]
    ]
  }',
  '{
    "description": "salle tamisée avec lumière chaude, 2 silhouettes (patient & médecin) en discussion",
    "mots_cles": ["confiance", "écoute", "partenariat", "respect"],
    "effet": "halo pulsant, ambiance rassurante, scroll lent"
  }',
  ARRAY[
    'Pas juste un soin, mais une main tendue, Dans la relation, les mots comptent plus que nus. Le patient sent, le médecin capte, Dans ce lien, chaque silence s''adapte.',
    'Alliance, pas soumission, Empathie sans confusion, Quand je dis, tu reçois, Quand tu parles, je vois.'
  ],
  '{
    "type": "glisser-déposer",
    "description": "Associer chaque phrase à son concept clé",
    "exemples": [
      {"phrase": "Je comprends que c''est difficile", "concept": "Empathie"},
      {"phrase": "Que ressentez-vous ?", "concept": "Question ouverte"},
      {"phrase": "Si je comprends bien...", "concept": "Reformulation"}
    ],
    "feedback": "succès avec halo lumineux + son doux"
  }',
  '{
    "qcm": [
      {
        "question": "Quelles sont les 4 dimensions de l''approche centrée sur le patient ?",
        "options": ["Écoute, contexte, alliance, décision partagée", "Diagnostic, traitement, suivi, évaluation", "Anamnèse, examen, prescription, conseil"],
        "correct": 0
      },
      {
        "question": "Quel pourcentage du message est non-verbal ?",
        "options": ["50%", "60%", "70%", "80%"],
        "correct": 2
      }
    ],
    "qru": [
      {
        "question": "Quel mécanisme de défense correspond au refus inconscient d''une réalité ?",
        "reponse": "déni"
      },
      {
        "question": "Citez le modèle de changement comportemental de Prochaska",
        "reponse": "précontemplation → contemplation → action → rechute"
      }
    ],
    "qroc": [
      {
        "question": "Citez 2 bénéfices cliniques prouvés d''une bonne relation médecin-patient",
        "points_cles": ["amélioration observance", "diminution erreurs médicales", "renforce qualité de vie", "amélioration biocliniques"]
      }
    ],
    "zap": [
      {
        "affirmation": "Le médecin doit imposer les mêmes mots à tous les patients pour l''annonce.",
        "correct": false,
        "justification": "L''annonce doit être adaptée à chaque patient selon son contexte, niveau éducatif et capacité de compréhension"
      }
    ]
  }',
  '{
    "10": "Tu maîtrises l''art de la relation thérapeutique. Une vraie force humaine 🧠✨",
    "8-9": "Presque parfait. Reviens relire le lien, pas seulement les mots.",
    "< 8": "Écoute à nouveau… le silence parle plus que tu ne le crois."
  }'
);

-- Ajouter une politique RLS pour permettre la lecture publique
ALTER TABLE public.edn_items_immersive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to EDN items" 
  ON public.edn_items_immersive 
  FOR SELECT 
  USING (true);
