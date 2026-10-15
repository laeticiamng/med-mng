import {
  DATE_VERIFICATION_PILOTE as DATE,
  VERIFICATEUR_PILOTE as PAR,
  type QuestionMemo,
} from './types';

/**
 * IC-247 « Diabète de types 1 et 2 » — item d’ESSAI GRATUIT, riche (31 compétences).
 * Pilote : 8 questions de rang A, 3 de rang B.
 *
 * Volontairement NON utilisés (voir docs/quiz-memorisation/REGISTRE-VERIFICATION.md) :
 * mortalité « rénale » du DT1 (débattue), « coma calme / coma agité » (repère non
 * absolu), glucagon contre-indiqué sous sulfamide (non retrouvé en source primaire),
 * posologie d’insuline du coma hyperosmolaire (valeur douteuse), seuils de
 * dépistage du DT2 (bornes incohérentes entre 247-03-A et 247-04-A).
 */
const HAS_DT2_2025 = [
  {
    reference:
      'HAS, « Parcours de soins du patient adulte vivant avec un diabète de type 2 — 14 messages clés » (07/2025) : diagnostic sur une glycémie veineuse à jeun ≥ 1,26 g/L confirmée par un second dosage (extrait restitué par moteur de recherche, document à rouvrir lors de la relecture)',
    lien: 'https://www.has-sante.fr/upload/docs/application/pdf/2025-07/parcours_de_soins_du_patient_adulte_vivant_avec_un_diabete_de_type_2_-_14_messages_cles_pour_ameliorer_votre_pratique.pdf',
  },
];

export const QUESTIONS_IC_247: QuestionMemo[] = [
  {
    id: 'M247-A1',
    itemCode: 'IC-247',
    rang: 'A',
    objectifId: 'OIC-247-03-A',
    type: 'qcm',
    question: 'À partir de quelle glycémie veineuse à jeun, retrouvée à deux reprises, parle-t-on de diabète ?',
    options: ['≥ 1,00 g/L', '≥ 1,10 g/L', '≥ 1,26 g/L', '≥ 1,40 g/L'],
    indexCorrect: 2,
    explication: 'Diabète : glycémie veineuse à jeun ≥ 1,26 g/L (7 mmol/L), à deux reprises.',
    verification: {
      statut: 'verifie_source_externe',
      extraitReferentiel: 'Glycémie veineuse à jeun ≥ 1,26 g/l à deux reprises.',
      sourcesExternes: HAS_DT2_2025,
      reponseCorrecte: '≥ 1,26 g/L',
      justification:
        'Seuil officiel (7 mmol/L), confirmé par la HAS. 1,00 et 1,10 g/L sont en dessous du seuil (1,10–1,26 : zone où l’HGPO est indiquée) ; 1,40 g/L est supérieur au seuil et n’est pas le seuil diagnostique.',
      notes:
        'La compétence 247-04-A écrit « > 1.26 » alors que 247-03-A écrit « ≥ 1,26 » : la question suit 247-03-A et 247-01-A (« supérieure à 1,26 g/l »). Divergence à signaler aux éditeurs du référentiel.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M247-A2',
    itemCode: 'IC-247',
    rang: 'A',
    objectifId: 'OIC-247-03-A',
    type: 'qcm',
    question: 'Dans quelle situation réalise-t-on une hyperglycémie provoquée par voie orale (HGPO) ?',
    options: [
      'Glycémie à jeun ≥ 1,40 g/L à deux reprises',
      'Glycémie à jeun < 0,90 g/L',
      'Diabète déjà confirmé par deux glycémies à jeun ≥ 1,26 g/L',
      'Glycémie à jeun entre 1,10 et 1,26 g/L',
    ],
    indexCorrect: 3,
    explication: 'L’HGPO est indiquée lorsque la glycémie à jeun est entre 1,10 et 1,26 g/L (6 à 7 mmol/L), et pendant la grossesse.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel: 'glycémie à jeun, entre 1,10 et 1,26 g/l [6 à 7 mmol/l]',
      sourcesExternes: [],
      reponseCorrecte: 'Glycémie à jeun entre 1,10 et 1,26 g/L',
      justification:
        'Texte officiel (indications : grossesse, glycémie à jeun entre 1,10 et 1,26 g/L). Les options ≥ 1,40 g/L et ≥ 1,26 g/L confirmée posent déjà le diagnostic sans HGPO ; < 0,90 g/L est normal.',
      notes: 'Non recoupé par une source externe : la recherche du 15.10.2026 n’a pas restitué le passage HAS sur l’HGPO.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M247-A3',
    itemCode: 'IC-247',
    rang: 'A',
    objectifId: 'OIC-247-03-A',
    type: 'rappel',
    question: 'Lors d’une HGPO, à partir de quelle glycémie à 2 heures le diagnostic de diabète est-il posé ?',
    reponse: '≥ 2 g/L (11 mmol/L) deux heures après la charge orale.',
    explication: 'HGPO : glycémie à 2 heures ≥ 2 g/L (11 mmol/L). Même seuil devant un patient symptomatique en urgence.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel:
        'la glycémie 2 heures après charge orale est supérieure ou égale à 2 g/l [11 mmol/l]',
      sourcesExternes: [],
      reponseCorrecte: '≥ 2 g/L (11 mmol/L)',
      justification: 'Texte officiel ; la phrase « même seuil en urgence » vient du point 4/ de la même compétence.',
      notes: 'Des supports secondaires (extraits de recherche) donnent le même seuil ; aucun document primaire ouvert.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M247-A4',
    itemCode: 'IC-247',
    rang: 'A',
    objectifId: 'OIC-247-02-A',
    type: 'qcm',
    question: 'Quel profil est celui d’un diabète de type 1 au diagnostic ?',
    options: [
      'Début lent, hyperglycémie souvent < 2 g/L, cétose souvent absente',
      'Obésité abdominale et antécédents familiaux fréquents',
      'Début rapide, hyperglycémie > 3 g/L, cétose souvent présente',
      'Complications dégénératives présentes dans 50 % des cas',
    ],
    indexCorrect: 2,
    explication: 'Diabète de type 1 : début rapide, hyperglycémie > 3 g/L au diagnostic, cétose souvent présente, poids normal ou amaigrissement.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel: 'début rapide, hyperglycémie au diagnostic > 3 g/L, cétose souvent présente',
      sourcesExternes: [],
      reponseCorrecte: 'Début rapide, hyperglycémie > 3 g/L, cétose souvent présente',
      justification:
        'Texte officiel (CEEDMM 2019). Les trois distracteurs sont les caractéristiques du diabète de type 2 dans la même compétence.',
      notes: 'Profil « typique » : des formes atypiques existent (la HAS demande un avis spécialisé si présentation inhabituelle).',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M247-A5',
    itemCode: 'IC-247',
    rang: 'A',
    objectifId: 'OIC-247-02-A',
    type: 'rappel',
    question: 'Quelle est la cause principale de mortalité dans le diabète de type 2 ?',
    reponse: 'Les maladies cardiovasculaires.',
    explication: 'Dans le diabète de type 2, les maladies cardiovasculaires sont la première cause de mortalité.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel: 'cause principale de mortalité : maladies cardiovasculaires',
      sourcesExternes: [],
      reponseCorrecte: 'Les maladies cardiovasculaires',
      justification: 'Texte officiel. L’affirmation parallèle du référentiel pour le DT1 (insuffisance rénale) est volontairement omise : débattue.',
      notes: 'Aucune source externe fiable retrouvée par la requête PubMed du 15.10.2026 (un résultat non pertinent a été écarté).',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M247-A6',
    itemCode: 'IC-247',
    rang: 'A',
    objectifId: 'OIC-247-25-A',
    type: 'qcm',
    question: 'Hypoglycémie chez un patient inconscient : que faut-il éviter ?',
    options: [
      'Le resucrage par la bouche',
      'Le glucagon par voie intramusculaire ou sous-cutanée',
      'Le glucose intraveineux, à l’hôpital',
      'Le glucagon par voie nasale',
    ],
    indexCorrect: 0,
    explication: 'Chez un patient inconscient, pas d’ingestion orale : risque de fausse route. Le resucrage passe par une voie injectable ou nasale.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel: 'pas d\'ingestion orale: risque de fausse route+++',
      sourcesExternes: [],
      reponseCorrecte: 'Le resucrage par la bouche',
      justification:
        'Texte officiel. Les trois autres voies sont celles que le référentiel propose. L’explication reste volontairement générale : la réserve « glucagon et sulfamide hypoglycémiant » n’a pas été retrouvée en source primaire (voir registre).',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M247-A7',
    itemCode: 'IC-247',
    rang: 'A',
    objectifId: 'OIC-247-25-A',
    type: 'rappel',
    question: 'Patient conscient en hypoglycémie : quel resucrage ?',
    reponse: '15 g de sucre (3 morceaux), un soda ou des bonbons.',
    explication: 'Patient conscient : ingestion de 15 g de sucre (3 morceaux), de soda ou de bonbons.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel: 'Ingestion de sucre (15 g= 3 morceaux), ou soda ou bonbons',
      sourcesExternes: [],
      reponseCorrecte: '15 g de sucre (3 morceaux), soda ou bonbons',
      justification: 'Recopie le texte officiel.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M247-A8',
    itemCode: 'IC-247',
    rang: 'A',
    objectifId: 'OIC-247-25-A',
    type: 'qcm',
    question: 'Parmi ces traitements, lequel est une source classique d’hypoglycémie ?',
    options: [
      'La metformine',
      'Un sulfamide hypoglycémiant',
      'Un inhibiteur de la DPP-4 (gliptine)',
      'Un inhibiteur du SGLT2 (gliflozine)',
    ],
    indexCorrect: 1,
    explication: 'Les médicaments source d’hypoglycémie sont les sulfamides, les glinides et l’insuline.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel: 'connaître les médicaments source d\'hypoglycémie: sulfamide, glinide, insuline',
      sourcesExternes: [],
      reponseCorrecte: 'Un sulfamide hypoglycémiant',
      justification:
        'Texte officiel. Les trois distracteurs ne figurent pas dans la liste et sont réputés peu hypoglycémiants en monothérapie (connaissance générale, non recoupée ici).',
      notes: 'Formulation « source classique » choisie pour ne pas affirmer qu’aucun autre traitement ne peut contribuer à une hypoglycémie.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M247-B1',
    itemCode: 'IC-247',
    rang: 'B',
    objectifId: 'OIC-247-08-B',
    type: 'qcm',
    question: 'Quel auto-anticorps est un marqueur du diabète de type 1 ?',
    options: ['Anti-GAD', 'Anti-TPO', 'Anti-transglutaminase', 'Anti-cellules pariétales'],
    indexCorrect: 0,
    explication:
      'Marqueurs du diabète de type 1 : anti-îlots (ICA), anti-GAD, anti-IA2, anti-ZnT8 et anti-insuline (chez l’enfant). Les autres signent des maladies auto-immunes associées (thyroïde, maladie cœliaque, atrophie gastrique).',
    verification: {
      statut: 'verifie_source_externe',
      extraitReferentiel: 'anti-GAD (décarboxylase de l\'acide glutamique)',
      sourcesExternes: [
        {
          reference:
            'Thomas et al., Diabetes Care 2023 (PubMed 36802355) — le diabète de type 1 est défini par ≥ 2 auto-anticorps parmi anti-GAD, anti-IA-2 et anti-ZnT8',
          lien: 'https://doi.org/10.2337/dc22-2159',
        },
      ],
      reponseCorrecte: 'Anti-GAD',
      justification:
        'Anti-GAD : marqueur du DT1 (référentiel et PubMed 36802355). Anti-TPO, anti-transglutaminase et anti-cellules pariétales sont les anticorps des maladies associées citées par le référentiel (thyroïdopathies, maladie cœliaque, atrophie gastrique) : connaissance générale d’immunologie, non recoupée ici.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M247-B2',
    itemCode: 'IC-247',
    rang: 'B',
    objectifId: 'OIC-247-09-B',
    type: 'rappel',
    question: 'Quelles deux anomalies caractérisent le diabète de type 2 ?',
    reponse: 'Une insulinorésistance et une altération de l’insulinosécrétion (insulinopénie relative).',
    explication:
      'L’insulinorésistance est favorisée par la sédentarité et l’alimentation excessive ; l’insulinosécrétion s’altère sous l’effet de la prédisposition génétique, de la glucotoxicité et de la lipotoxicité.',
    verification: {
      statut: 'verifie_source_externe',
      extraitReferentiel:
        'Il est lié à une altération des capacités d\'insulinosécrétion (insulinopénie relative) et à une insulinorésistance.',
      sourcesExternes: [
        {
          reference:
            'Galicia-Garcia et al., Int J Mol Sci 2020 (PubMed 32872570) — le DT2 résulte d’une sécrétion d’insuline défectueuse des cellules β et d’une réponse tissulaire insuffisante à l’insuline',
          lien: 'https://doi.org/10.3390/ijms21176275',
        },
      ],
      reponseCorrecte: 'Insulinorésistance + altération de l’insulinosécrétion',
      justification: 'Mécanisme identique dans le référentiel et dans la revue PubMed 32872570.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M247-B3',
    itemCode: 'IC-247',
    rang: 'B',
    objectifId: 'OIC-247-29-B',
    type: 'qcm',
    question: 'Quel soluté utilise-t-on pour la réhydratation initiale d’une acidocétose diabétique ?',
    options: [
      'Du glucosé à 5 %',
      'Du sérum salé isotonique (NaCl 0,9 %)',
      'Des bicarbonates de sodium systématiques',
      'De l’eau par voie orale uniquement',
    ],
    indexCorrect: 1,
    explication:
      'Premiers gestes : voie veineuse périphérique et réhydratation par sérum salé isotonique 0,9 %, avec recherche d’un facteur déclenchant (ECG, foyer infectieux).',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel: 'Réhydratation sérum sale 0.9%',
      sourcesExternes: [],
      reponseCorrecte: 'Du sérum salé isotonique (NaCl 0,9 %)',
      justification:
        'Texte officiel. Le glucosé 5 % n’est pas le soluté de réhydratation initial (le glucosé 10 % n’est ajouté que lorsque la glycémie est < 2,5 g/L avec cétonémie positive). Bicarbonates et voie orale seule ne sont pas des premiers gestes du référentiel.',
      notes:
        'Le reste de la compétence (débit d’insuline, seuil de kaliémie) n’est volontairement pas interrogé : à recouper avant tout usage.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
];
