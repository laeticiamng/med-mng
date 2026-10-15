import {
  DATE_VERIFICATION_PILOTE as DATE,
  VERIFICATEUR_PILOTE as PAR,
  type QuestionMemo,
} from './types';

/**
 * IC-217 « Syndrome mononucléosique » — item PREMIUM de taille moyenne
 * (3 compétences de rang A utilisées, 3 de rang B). Pilote : 6 questions de
 * rang A, 3 de rang B.
 */
const PUBMED_AMINOPENICILLINES = [
  {
    reference:
      'Chovel-Sella et al., Pediatrics 2013 (PubMed 23589810) — éruption chez 29,5 % des enfants atteints de mononucléose traités par amoxicilline, contre environ 90 % rapportés historiquement avec l’ampicilline',
    lien: 'https://doi.org/10.1542/peds.2012-1575',
  },
];
const SOURCES_MNI_TEST = [
  {
    reference:
      'Sylvester et al., « Infectious Mononucleosis: Rapid Evidence Review », Am Fam Physician 2023 (PubMed 36689975) — test hétérophile : sensibilité 87 %, spécificité 91 %, faux négatifs chez l’enfant de moins de 5 ans et chez l’adulte la première semaine ; sérologie VCA plus sensible et plus spécifique',
    lien: 'https://pubmed.ncbi.nlm.nih.gov/36689975/',
  },
  {
    reference:
      'CDC, « Laboratory Testing for Epstein-Barr Virus (EBV) » (2024) : le Monospot (anticorps hétérophiles) donne des faux positifs et des faux négatifs, souvent négatif chez le jeune enfant (extrait restitué par moteur de recherche, page non ouverte)',
    lien: 'https://www.cdc.gov/epstein-barr/php/laboratories/',
  },
  {
    reference:
      'Field & Dwyer, Pathology 1996 (PubMed 8912361) — les tests hétérophiles ne doivent servir qu’au dépistage (sensibilité < 50 % chez l’enfant, 80–90 % chez l’adulte) ; la détection des IgM anti-EBV est le test le plus utile',
    lien: 'https://doi.org/10.1080/00313029600169144',
  },
];
const PUBMED_DRESS = [
  {
    reference:
      'Ramirez et al., Microorganisms 2023 (PubMed 36838310) — DRESS associé surtout aux anticonvulsivants, à l’allopurinol et à des antibiotiques (sulfamides, vancomycine)',
    lien: 'https://doi.org/10.3390/microorganisms11020346',
  },
];

export const QUESTIONS_IC_217: QuestionMemo[] = [
  {
    id: 'M217-A1',
    itemCode: 'IC-217',
    rang: 'A',
    objectifId: 'OIC-217-01-A',
    type: 'qcm',
    question: 'Quelle définition correspond à un syndrome mononucléosique ?',
    options: [
      'Plus de 50 % de polynucléaires neutrophiles, avec au moins 10 % de cellules blastiques',
      'Une lymphopénie, avec au moins 10 % de lymphocytes activés au frottis',
      'Plus de 50 % d’éléments mononucléés, avec au moins 10 % de lymphocytes activés',
      'Moins de 50 % d’éléments mononucléés, avec une hyperéosinophilie nette',
    ],
    indexCorrect: 2,
    explication:
      'Plus de 50 % d’éléments mononucléés parmi les leucocytes (hyperlymphocytose), et au moins 10 % de lymphocytes activés sur le frottis.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel:
        'présence de plus de 50% d’éléments mononucléés (lymphocytes et monocytes) parmi les leucocytes sur la numération formule sanguine … et ≥ 10% de lymphocytes activés sur le frottis sanguin',
      sourcesExternes: [],
      reponseCorrecte: 'Plus de 50 % d’éléments mononucléés, avec au moins 10 % de lymphocytes activés',
      justification:
        'Reprend la définition officielle. Les distracteurs inversent la lignée (neutrophiles, blastes), le sens (lymphopénie, moins de 50 %) ou la cause (éosinophilie).',
      notes:
        'Un support de cours (Pilly étudiant ECN 2020, item 217, extrait de recherche web) donne « plus de 10 % » de lymphocytes activés : la borne (≥ ou >) varie selon les sources, la question ne repose pas dessus.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M217-A2',
    itemCode: 'IC-217',
    rang: 'A',
    objectifId: 'OIC-217-05-A',
    type: 'qcm',
    question: 'Quelle est la cause la plus fréquente de syndrome mononucléosique ?',
    options: ['La primo-infection à EBV', 'La primo-infection à CMV', 'La toxoplasmose', 'La primo-infection à VIH'],
    indexCorrect: 0,
    explication:
      'L’EBV est en cause dans environ 80 % des syndromes mononucléosiques ; le CMV, dans environ 10 %.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel: 'Majorité des syndromes mononucléosiques = primo-infection à Epstein Barr virus (EBV).',
      sourcesExternes: [],
      reponseCorrecte: 'La primo-infection à EBV',
      justification:
        'Texte officiel (80 % EBV, 10 % CMV). Les trois autres étiologies infectieuses sont réelles mais moins fréquentes.',
      notes: 'Pourcentages (80 % / 10 %) non recoupés par une source externe.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M217-A3',
    itemCode: 'IC-217',
    rang: 'A',
    objectifId: 'OIC-217-05-A',
    type: 'qcm',
    question: 'Au cours d’une mononucléose infectieuse, une éruption survient surtout après la prise de quelle classe d’antibiotiques ?',
    options: [
      'Les macrolides et les lincosamides',
      'Les aminopénicillines',
      'Les fluoroquinolones et les nitro-imidazolés',
      'Les tétracyclines et les aminosides',
    ],
    indexCorrect: 1,
    explication:
      'L’éruption maculo-papuleuse survient surtout après une aminopénicilline (ampicilline, amoxicilline).',
    verification: {
      statut: 'verifie_source_externe',
      extraitReferentiel:
        'éruption maculo-papuleuse (survenant le plus souvent après l’administration d’ampicilline)',
      sourcesExternes: PUBMED_AMINOPENICILLINES,
      reponseCorrecte: 'Les aminopénicillines',
      justification:
        'Le référentiel cite l’ampicilline ; l’étude PubMed 23589810 montre que l’amoxicilline (même classe) est l’antibiotique le plus associé à l’éruption. La question porte donc sur la classe, pas sur une molécule.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M217-A4',
    itemCode: 'IC-217',
    rang: 'A',
    objectifId: 'OIC-217-05-A',
    type: 'rappel',
    question: 'Quelle anomalie hépatique est fréquente dans la primo-infection à EBV ?',
    reponse: 'Le plus souvent une cytolyse (transaminases élevées), habituellement sans cholestase.',
    explication: 'Cytolyse hépatique fréquente : élévation des transaminases, habituellement sans cholestase. Une cholestase reste possible, plus rarement.',
    verification: {
      statut: 'bloque',
      motifBlocage:
        'La réponse « habituellement sans cholestase » qualifie le référentiel (« sans cholestase associée ») d’après une revue externe (PMC3660095) non ouverte depuis l’environnement. À recouper sur cette source puis reclasser en verifie_source_externe, ou revenir au texte du référentiel.',
      extraitReferentiel: 'Cytolyse hépatique fréquente (élévation des transaminases sans cholestase associée)',
      sourcesExternes: [],
      reponseCorrecte: 'Cytolyse hépatique, habituellement sans cholestase',
      justification: 'Recopie le texte officiel.',
      notes:
        'Revue Codex (42b97ab) : le référentiel écrit « sans cholestase associée » ; une cholestase survient dans une minorité de cas d’EBV (revue PMC3660095 citée par Codex, non ouverte) : formulation qualifiée (« habituellement », « le plus souvent »).',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M217-A5',
    itemCode: 'IC-217',
    rang: 'A',
    objectifId: 'OIC-217-05-A',
    type: 'qcm',
    question: 'MNI test (hétérophile) négatif chez un enfant, mononucléose toujours suspectée : quel examen demander ?',
    options: [
      'Une biopsie ganglionnaire systématique',
      'Un myélogramme avec étude cytogénétique',
      'Une ponction lombaire avec analyse du LCR',
      'Une sérologie EBV',
    ],
    indexCorrect: 3,
    explication:
      'Anticorps hétérophiles non spécifiques de l’EBV : le MNI test ne confirme pas (faux négatifs chez le jeune enfant et la première semaine). La sérologie EBV spécifique est plus sensible et plus spécifique.',
    verification: {
      statut: 'verifie_source_externe',
      extraitReferentiel: 'MNI test ± sérologies EBV',
      sourcesExternes: SOURCES_MNI_TEST,
      reponseCorrecte: 'Une sérologie EBV',
      justification:
        'Le référentiel associe MNI test et sérologies EBV. Les sources PubMed montrent que le test hétérophile (MNI test) est un test d’orientation (sensibilité 87 %, spécificité 91 %, faux négatifs chez le jeune enfant et la première semaine) et que la sérologie EBV (VCA) est plus sensible et plus spécifique. Les trois distracteurs sont des examens invasifs non indiqués pour une suspicion de MNI.',
      notes:
        'Relecture Codex (a00f3fe) : le profil sérologique (IgM anti-VCA positives, anti-EBNA négatifs, délai de 2 à 4 mois) et la phrase sur les IgG anti-VCA ont été retirés, faute de source lue (page CDC non ouverte) ; l’explication ne contient plus que ce que couvrent les sources PubMed 36689975 et 8912361. Précisée une 3ᵉ fois (clôture technique) : la question distingue test hétérophile (non spécifique) et sérologie EBV spécifique, et vise le cas typique du MNI test négatif chez l’enfant (source CDC ajoutée). CORRIGÉ deux fois le 15.10.2026 : (1) revue scientifique — la version initiale reprenait « diagnostic de certitude : MNI test », formulation du référentiel qui surestime un test de dépistage ; (2) revue Codex — « MNI test » restait dans la réponse « confirmatoire » : la question porte désormais sur la sérologie EBV après un MNI test négatif ou douteux. Le point « PCR EBV sans indication chez l’immunocompétent » n’est toujours pas utilisé (non retrouvé en source externe).',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M217-A6',
    itemCode: 'IC-217',
    rang: 'A',
    objectifId: 'OIC-217-04-A',
    type: 'qcm',
    question: 'Quelle notion de l’interrogatoire oriente vers une toxoplasmose ?',
    options: [
      'Une exposition à des oiseaux de basse-cour',
      'Un contact avec un chat ou de la viande crue',
      'Un séjour récent en zone tropicale ou en forêt',
      'Une piqûre de tique après une promenade en forêt',
    ],
    indexCorrect: 1,
    explication:
      'Un contact avec un chat (ou des aliments souillés par un chat), ou la consommation de viande crue, est à rechercher.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel:
        'Contact avec un chat ou consommation d’aliments souillés par un chat, ou consommation de viande crue (toxoplasmose)',
      sourcesExternes: [],
      reponseCorrecte: 'Un contact avec un chat ou de la viande crue',
      justification:
        'Texte officiel. Les distracteurs ne figurent pas dans la liste des éléments de l’interrogatoire d’un syndrome mononucléosique.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M217-B1',
    itemCode: 'IC-217',
    rang: 'B',
    objectifId: 'OIC-217-02-B',
    type: 'qcm',
    question: 'Que montre le frottis sanguin d’un syndrome mononucléosique ?',
    options: [
      'De grands lymphocytes T activés hyperbasophiles, sans blaste',
      'Une prolifération de cellules blastiques avec hiatus de maturation',
      'Des hématies en faucille associées à des corps de Howell-Jolly',
      'Une neutrophilie avec myélémie et granulations toxiques',
    ],
    indexCorrect: 0,
    explication:
      'De grandes cellules mononucléées activées au cytoplasme hyperbasophile (lymphocytes T activés), sans cellule blastique ; les autres lignées sont normales.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel:
        'Cellules mononucléées activées, caractérisées par une grande taille et un cytoplasme hyperbasophile … Absence de cellules blastiques',
      sourcesExternes: [],
      reponseCorrecte: 'De grands lymphocytes T activés hyperbasophiles, sans blaste',
      justification:
        'Texte officiel. Blastes : absents par définition (diagnostic différentiel d’une hémopathie). Faucilles et myélémie : sans rapport avec le frottis du syndrome mononucléosique.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M217-B2',
    itemCode: 'IC-217',
    rang: 'B',
    objectifId: 'OIC-217-06-B',
    type: 'rappel',
    question: 'DRESS : citez des médicaments fréquemment en cause.',
    reponse: 'Antibiotiques (sulfamides, bêta-lactamines), anticonvulsivants, allopurinol.',
    explication:
      'Le DRESS est une cause non infectieuse de syndrome mononucléosique : éruption, polyadénopathies et fièvre, avec hyperéosinophilie et cytolyse hépatique.',
    verification: {
      statut: 'verifie_source_externe',
      extraitReferentiel:
        'Médicaments fréquemment incriminé : antibiotiques (sulfamides et béta-lactamines), anti-convulsivants et allopurinol',
      sourcesExternes: PUBMED_DRESS,
      reponseCorrecte: 'Antibiotiques (sulfamides, bêta-lactamines), anticonvulsivants, allopurinol',
      justification:
        'La revue PubMed 36838310 cite anticonvulsivants, allopurinol et antibiotiques (sulfamides, vancomycine). Les bêta-lactamines viennent du référentiel seul.',
      notes: 'Les bêta-lactamines ne figurent pas dans le résumé de la source externe : à recouper.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M217-B3',
    itemCode: 'IC-217',
    rang: 'B',
    objectifId: 'OIC-217-06-B',
    type: 'qcm',
    question: 'Quel signe biologique oriente vers un DRESS ?',
    options: [
      'Une neutropénie profonde',
      'Une cholestase ictérique isolée',
      'Une hyperéosinophilie',
      'Une thrombocytose majeure',
    ],
    indexCorrect: 2,
    explication:
      'Le DRESS associe une hyperéosinophilie, une atteinte hépatique (cytolytique, cholestatique ou mixte) et parfois une altération de la fonction rénale.',
    verification: {
      statut: 'bloque',
      motifBlocage:
        'L’explication affirme que l’atteinte hépatique du DRESS peut être cytolytique, cholestatique ou mixte : ce point ne figure ni dans l’extrait du référentiel ni dans la source citée (PubMed 36838310, médicaments en cause) ; sa source (revue PMC6448072, indiquée par la revue Codex) n’a pas pu être ouverte. À lire et citer, puis reclasser en verifie_source_externe ; ou revenir à une explication limitée à l’hyperéosinophilie.',
      extraitReferentiel: 'Hyperéosinophilie',
      sourcesExternes: PUBMED_DRESS,
      reponseCorrecte: 'Une hyperéosinophilie',
      justification:
        'L’éosinophilie fait partie du nom même du syndrome (Drug Reaction with Eosinophilia and Systemic Symptoms, PubMed 36838310) et du référentiel. Le distracteur « cholestase ictérique isolée » reste faux parce qu’il est isolé, sans éosinophilie ; il n’exclut pas une composante cholestatique du DRESS.',
      notes:
        'Revue Codex (82a6c1a) : la mention « sans cholestase » (spécifique à l’EBV dans le référentiel) est retirée du DRESS, dont l’atteinte hépatique peut être cytolytique, cholestatique ou mixte (revue PMC6448072 citée par Codex, non ouverte).',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
];
