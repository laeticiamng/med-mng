import {
  DATE_VERIFICATION_PILOTE as DATE,
  VERIFICATEUR_PILOTE as PAR,
  type QuestionMemo,
} from './types';

/**
 * IC-160 « Tétanos » — item PREMIUM à peu de compétences (3 de rang A, 1 de rang B).
 * Pilote : 6 questions de rang A, 2 de rang B.
 */
const PUBMED_TETANOS = [
  {
    reference: 'Connan & Popoff, Curr Top Microbiol Immunol 2017 (PubMed 28879524) — la toxine tétanique bloque la libération de glycine/GABA dans les interneurones inhibiteurs ; transport axonal rétrograde par un motoneurone',
    lien: 'https://doi.org/10.1007/82_2017_50',
  },
  {
    reference: 'Surana et al., Toxicon 2017 (PubMed 29031941) — la toxine tétanique est transcytosée des motoneurones vers les interneurones inhibiteurs ; la toxine botulique agit à la jonction neuromusculaire',
    lien: 'https://doi.org/10.1016/j.toxicon.2017.10.008',
  },
];

const TABLEAU_PLAIE = [
  {
    reference:
      'Avis du HCSP (mai 2013), tableau « Conduite à tenir immédiate en cas de plaie », repris par Vaccination Info Service et mesvaccins.net : plaie mineure propre, non à jour → une dose de vaccin ; plaie majeure ou tellurique, non à jour → immunoglobuline tétanique humaine 250 UI dans un bras et vaccin dans l’autre ; « à jour » = dose depuis moins de 20 ans avant 65 ans, moins de 10 ans après (extraits restitués par moteur de recherche ; documents officiels inaccessibles depuis l’environnement de travail)',
    lien: 'https://vaccination-info-service.fr/content/download/1343/14681/version/1/file/TABLEAU_tetanos_Conduite+a%CC%80+tenir.pdf',
  },
];

export const QUESTIONS_IC_160: QuestionMemo[] = [
  {
    id: 'M160-A1',
    itemCode: 'IC-160',
    rang: 'A',
    objectifId: 'OIC-160-04-A',
    type: 'qcm',
    question: 'Quel signe doit faire évoquer un tétanos, même si aucune plaie n’est retrouvée ?',
    options: ['Une fièvre élevée', 'Un trismus', 'Une éruption cutanée', 'Une paralysie flasque'],
    indexCorrect: 1,
    explication:
      'Tout trismus doit faire évoquer un tétanos, plaie retrouvée ou non. Devant un trismus isolé, pensez aussi à une arthrite temporo-mandibulaire ou à un abcès dentaire.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel: 'Le tétanos est à évoquer devant tout trismus , qu\'une plaie tétanigène soit identifiée ou non.',
      sourcesExternes: [],
      reponseCorrecte: 'Un trismus',
      justification:
        'Le référentiel énonce le trismus comme signe d’appel, plaie identifiée ou non. Fièvre : le tétanos évolue sans fièvre (même compétence). Éruption : aucun rapport. Paralysie flasque : tableau du botulisme, le tétanos donne une paralysie spastique (PubMed 28879524).',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M160-A2',
    itemCode: 'IC-160',
    rang: 'A',
    objectifId: 'OIC-160-04-A',
    type: 'rappel',
    question: 'Comment évolue typiquement un tétanos généralisé ?',
    reponse: 'Contraction généralisée d’évolution descendante, avec spasmes douloureux et dysautonomie.',
    explication:
      'Le trismus ouvre le tableau, puis la contraction gagne tout le corps de haut en bas. Pas de fièvre au début ; elle peut apparaître ensuite, notamment avec la dysautonomie.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel:
        'Le tétanos évolue ensuite le plus souvent vers une forme de contraction généralisée, d\'évolution descendante, avec des signes de dysautonomie, sans fièvre.',
      sourcesExternes: [],
      reponseCorrecte: 'Contraction généralisée, descendante, spasmes douloureux, dysautonomie',
      justification: 'Recopie le texte officiel ; aucune extrapolation clinique.',
      notes: 'Le référentiel écrit « sans fièvre » pour toute l’évolution. Revue du 15.10.2026 puis revue Codex : l’apyrexie est réservée au début (une fièvre peut apparaître avec la dysautonomie, selon les sources citées par Codex : CDC Pink Book, revue PMC7617864, non ouvertes ici) ; « spasmes douloureux » vient de OIC-160-01-B. Pas de source externe retrouvée dans la recherche du 15.10.2026 (requête PubMed sans résultat) : à recouper lors de la relecture médicale.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M160-A3',
    itemCode: 'IC-160',
    rang: 'A',
    objectifId: 'OIC-160-03-A',
    type: 'qcm',
    question: 'Plaie tétanigène majeure, vaccination non à jour : quelle conduite ?',
    options: [
      'Une dose de vaccin contenant la valence tétanique, sans immunoglobulines',
      'Des immunoglobulines tétaniques humaines seules, sans vaccin',
      'Immunoglobulines tétaniques 250 UI dans un bras, vaccin dans l’autre',
      'Aucune injection : nettoyer et désinfecter la plaie suffit',
    ],
    indexCorrect: 2,
    explication:
      'Plaie majeure et sujet non à jour : immunoglobulines tétaniques humaines 250 UI dans un bras, vaccin dans l’autre, puis mise à jour du programme vaccinal.',
    verification: {
      statut: 'verifie_source_externe',
      extraitReferentiel:
        'Dans un bras, immunoglobuline tétanique humaine 250 UI. Dans l’autre bras, administration d’une dose de vaccin contenant la valence tétanique.',
      sourcesExternes: TABLEAU_PLAIE,
      reponseCorrecte: 'Immunoglobulines tétaniques 250 UI dans un bras, vaccin dans l’autre',
      justification:
        'Tableau de conduite à tenir du référentiel (plaie majeure × non à jour). Vaccin seul : conduite de la plaie mineure. Immunoglobulines seules : omettent la vaccination. Aucune injection : conduite du sujet à jour.',
      notes:
        'Concordant entre le référentiel et l’avis HCSP 2013, toujours cité comme référence par les sources récentes consultées. Le calendrier vaccinal 2025 complet n’a pas pu être ouvert (domaine bloqué) : à confirmer sur le document officiel lors de la relecture médicale.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M160-A4',
    itemCode: 'IC-160',
    rang: 'A',
    objectifId: 'OIC-160-03-A',
    type: 'qcm',
    question: 'Plaie mineure et propre, vaccination non à jour : quelle conduite ?',
    options: [
      'Des immunoglobulines tétaniques humaines seules, sans vaccin',
      'Immunoglobulines tétaniques dans un bras, vaccin dans l’autre',
      'Aucune injection : préciser seulement la date du prochain rappel',
      'Une dose de vaccin contenant la valence tétanique',
    ],
    indexCorrect: 3,
    explication:
      'Plaie mineure et propre, sujet non à jour : une dose de vaccin contenant la valence tétanique suffit, sans immunoglobulines. Les immunoglobulines sont réservées aux plaies majeures.',
    verification: {
      statut: 'verifie_source_externe',
      extraitReferentiel: 'Administration immédiate d’une dose de vaccin contenant la valence tétanique.',
      sourcesExternes: TABLEAU_PLAIE,
      reponseCorrecte: 'Une dose de vaccin contenant la valence tétanique',
      justification:
        'Tableau du référentiel (plaie mineure et propre × non à jour). Immunoglobulines : réservées à la plaie majeure ou susceptible d’être tellurique. Aucune injection : conduite du sujet à jour.',
      notes: 'Même réserve que M160-A3 (calendrier vaccinal 2025 complet non ouvert).',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M160-A5',
    itemCode: 'IC-160',
    rang: 'A',
    objectifId: 'OIC-160-03-A',
    type: 'qcm',
    question: 'Quelle plaie pré-existante est une porte d’entrée non rare du tétanos ?',
    options: [
      'Une conjonctivite bactérienne récente',
      'Un ulcère de jambe d’origine vasculaire',
      'Une angine érythémateuse banale',
      'Une rhinite allergique saisonnière',
    ],
    indexCorrect: 1,
    explication:
      'Les plaies pré-existantes comptent, notamment les ulcères d’origine vasculaire : une porte d’entrée non rare, surtout chez le sujet âgé.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel: 'Il faut noter l\'importance des plaies pré-existantes, notamment les ulcères d\'origine vasculaire',
      sourcesExternes: [],
      reponseCorrecte: 'Un ulcère de jambe d’origine vasculaire',
      justification:
        'Le référentiel cite l’ulcère vasculaire. Les distracteurs sont des affections muqueuses sans plaie cutanée souillée par la terre.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M160-A6',
    itemCode: 'IC-160',
    rang: 'A',
    objectifId: 'OIC-160-03-A',
    type: 'rappel',
    question: 'Pourquoi ne peut-on pas éradiquer le tétanos à l’échelle mondiale ?',
    reponse: 'Parce que Clostridium tetani est une bactérie ubiquitaire des sols.',
    explication:
      'Clostridium tetani vit dans l’environnement (environ 30 % des sols). Seule la prévention est efficace : soin rapide des plaies et vaccination.',
    verification: {
      statut: 'conforme_referentiel',
      extraitReferentiel: 'Pas d\'éradication mondiale du tétanos possible car bactérie ubiquitaire des sols.',
      sourcesExternes: [],
      reponseCorrecte: 'Bactérie ubiquitaire des sols',
      justification: 'Recopie le texte officiel (compétences 03-A et 02-A pour les 30 % de sols).',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M160-B1',
    itemCode: 'IC-160',
    rang: 'B',
    objectifId: 'OIC-160-01-B',
    type: 'qcm',
    question: 'Dans la moelle épinière, quels neurones la tétanospasmine bloque-t-elle ?',
    options: [
      'Les fibres musculaires squelettiques',
      'Les neurones sensitifs ganglionnaires',
      'Les neurones moteurs de la jonction neuromusculaire',
      'Les interneurones inhibiteurs',
    ],
    indexCorrect: 3,
    explication:
      'La toxine remonte les motoneurones puis bloque les interneurones inhibiteurs : sans frein, le tonus musculaire augmente (spasmes). La jonction neuromusculaire est la cible de la toxine botulique.',
    verification: {
      statut: 'verifie_source_externe',
      extraitReferentiel: 'Internalisation dans les interneurones inhibiteurs',
      sourcesExternes: PUBMED_TETANOS,
      reponseCorrecte: 'Les interneurones inhibiteurs',
      justification:
        'Les deux revues PubMed (2017) décrivent le blocage de la libération de neurotransmetteurs inhibiteurs (glycine, GABA) dans les interneurones inhibiteurs. « Jonction neuromusculaire » : cible de la toxine botulique (paralysie flasque). Les deux autres options n’ont aucun rôle dans le mécanisme.',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
  {
    id: 'M160-B2',
    itemCode: 'IC-160',
    rang: 'B',
    objectifId: 'OIC-160-01-B',
    type: 'rappel',
    question: 'Quel trajet suit la tétanospasmine, de la plaie à son site d’action ?',
    reponse:
      'Sang, puis transport rétrograde dans les motoneurones périphériques, jusqu’au premier relais synaptique de la moelle, où elle entre dans les interneurones inhibiteurs.',
    explication:
      'Les interneurones inhibiteurs perdent leur action : le tonus musculaire augmente, avec spasmes douloureux et dysautonomie.',
    verification: {
      statut: 'verifie_source_externe',
      extraitReferentiel: 'Transport rétrograde via les motoneurones périphériques',
      sourcesExternes: PUBMED_TETANOS,
      reponseCorrecte: 'Sang → transport rétrograde (motoneurones) → relais synaptique médullaire → interneurones inhibiteurs',
      justification:
        'Trajet identique dans le référentiel et dans les revues PubMed 28879524 et 29031941.',
      notes:
        'Revérifié à la clôture technique, aucune erreur établie, réponse inchangée : la toxine est captée par les motoneurones (jonction neuromusculaire), transportée de façon rétrograde jusqu’aux motoneurones médullaires ou du tronc cérébral, puis transcytosée vers les interneurones inhibiteurs où elle bloque la libération de neurotransmetteurs (PubMed 29031941 et 28879524). Le passage sanguin vient du référentiel ; il est compatible (la toxine gagne la jonction neuromusculaire par voie lymphatique ou sanguine).',
      verifiePar: PAR,
      dateVerification: DATE,
    },
  },
];
