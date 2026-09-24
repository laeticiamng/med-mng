/**
 * Transforme la structure tableau avec objectifs/competences_cles/situations_cliniques
 * en format sections compatible avec les composants TableauRangA/B
 */
/**
 * Certaines colonnes JSONB peuvent arriver sous forme de chaîne au lieu d'un
 * tableau. On les ramène toujours à un tableau plutôt que de sauter la section
 * en silence (l'objectif disparaissait alors de l'écran sans message).
 */
const versListe = (valeur: unknown): unknown[] => {
  if (Array.isArray(valeur)) return valeur;
  if (typeof valeur === 'string' && valeur.trim() !== '') return [valeur];
  return [];
};

export const transformTableauToSections = (tableauData: any, itemCode: string, title: string, rang: 'A' | 'B') => {
  const normalizedTableau = normalizeTableauData(tableauData);

  if (!normalizedTableau) {
    return null;
  }

  // Si sections existe déjà et n'est pas vide, retourner tel quel
  if (normalizedTableau.sections && Array.isArray(normalizedTableau.sections) && normalizedTableau.sections.length > 0) {
    return normalizedTableau;
  }

  const sections = [];

  // Section 1 : Objectifs pédagogiques
  const objectifs = versListe(normalizedTableau.objectifs);
  if (objectifs.length > 0) {
    sections.push({
      title: "Objectifs pédagogiques",
      // `join('\n• ')` laissait le premier objectif sans puce (481 cas sur les
      // 734 tableaux de la table canonique). On préfixe chaque ligne.
      content: objectifs.map((o: unknown) => `• ${String(o)}`).join('\n'),
      keywords: []
    });
  }

  // Section 2 : Compétences clés
  if (normalizedTableau.competences_cles && Array.isArray(normalizedTableau.competences_cles) && normalizedTableau.competences_cles.length > 0) {
    sections.push({
      title: "Compétences clés",
      content: "",
      competences: normalizedTableau.competences_cles.map((comp: any) => ({
        // Le code OIC (`objectif_id`, ex. OIC-001-03-A) est la seule référence
        // opposable au référentiel UNESS. Il était écrasé par `niveau`
        // (« Fondamental », « Avancé »…) : les 1114 compétences de la table
        // canonique perdaient leur code. On le conserve, `niveau` ne sert plus
        // que de repli.
        competence_id: comp.objectif_id || comp.niveau || comp.id || 'N/A',
        concept: comp.competence || comp.titre || comp.intitule || '',
        definition: comp.description || '',
        exemple: comp.exemple || '',
        application: comp.application || '',
        niveau: comp.niveau || '',
        // Format compatible avec TableauCompetencesOICOptimized
        intitule: comp.competence || comp.titre || comp.intitule || '',
        description: comp.description || '',
        objectif_id: comp.objectif_id || comp.niveau || comp.id || 'N/A',
        rubrique: comp.rubrique || 'Compétence Clé',
        titre_complet: comp.competence || comp.titre || comp.intitule || '',
        sommaire: comp.description?.substring(0, 150) || ''
      })),
      keywords: []
    });
  }

  // Section 3 : Situations cliniques
  const situations = versListe(normalizedTableau.situations_cliniques);
  if (situations.length > 0) {
    sections.push({
      title: "Situations cliniques",
      content: situations.map((v: unknown) => `• ${String(v)}`).join('\n'),
      keywords: []
    });
  }

  // Section 4 : Cas complexes (pour Rang B)
  const casComplexes = versListe(normalizedTableau.cas_complexes);
  if (rang === 'B' && casComplexes.length > 0) {
    sections.push({
      title: "Cas complexes",
      content: casComplexes.map((v: unknown) => `• ${String(v)}`).join('\n'),
      keywords: []
    });
  }

  // Section 5 : Compétences expertes (pour Rang B)
  if (rang === 'B' && normalizedTableau.competences_expertes && Array.isArray(normalizedTableau.competences_expertes) && normalizedTableau.competences_expertes.length > 0) {
    sections.push({
      title: "Compétences expertes",
      content: "",
      competences: normalizedTableau.competences_expertes.map((comp: any) => ({
        competence_id: comp.objectif_id || comp.niveau || 'Expert',
        concept: comp.expertise || comp.competence || '',
        definition: comp.description || '',
        niveau: comp.niveau || 'Expert',
        // Format compatible avec TableauCompetencesOICOptimized
        intitule: comp.expertise || comp.competence || '',
        description: comp.description || '',
        objectif_id: comp.objectif_id || comp.niveau || 'Expert',
        rubrique: 'Expertise Avancée',
        titre_complet: comp.expertise || comp.competence || '',
        sommaire: comp.description?.substring(0, 150) || ''
      })),
      keywords: []
    });
  }

  // Si aucune section n'a été créée, retourner le tableau original
  if (sections.length === 0) {
    return normalizedTableau;
  }

  return {
    title: normalizedTableau.title || `${itemCode} Rang ${rang} - ${title}`,
    subtitle: normalizedTableau.subtitle,
    sections: sections
  };
};

export const normalizeTableauData = (tableauData: any) => {
  const parsedTableau = parseJsonValue(tableauData);
  if (!parsedTableau || typeof parsedTableau !== 'object') {
    return null;
  }

  if ('sections' in parsedTableau) {
    const parsedSections = parseJsonValue((parsedTableau as { sections?: unknown }).sections);
    if (Array.isArray(parsedSections)) {
      return {
        ...(parsedTableau as Record<string, unknown>),
        sections: parsedSections
      };
    }
  }

  return parsedTableau;
};

const parseJsonValue = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    if (import.meta.env.DEV) console.warn('⚠️ Impossible de parser un JSONB stringifié:', error);
    return null;
  }
};

/**
 * `oic_competences` contient 5606 lignes, dont 734 qui ne sont PAS des
 * compétences : une ligne d'en-tête par item et par rang (`IC-1-A`,
 * `IC-330-B`…), au libellé générique (« Item EDN 330 - Compétence médicale
 * spécialisée »). Affichées telles quelles, elles ajoutaient une fausse
 * compétence en tête de chaque tableau — et, pour les 11 items sans aucune
 * compétence de rang B en base, elles étaient la seule ligne affichée alors
 * que la fiche annonçait « Rang B : 10 ».
 *
 * Une vraie compétence du référentiel UNESS porte un identifiant de la forme
 * OIC-<item sur 3 chiffres>-<numéro sur 2 chiffres>-<A|B>.
 */
const FORMAT_CODE_OIC = /^OIC-\d{3}-\d{2}-[AB]$/;

export const estCompetenceOICReelle = (objectifId?: string | null): boolean =>
  FORMAT_CODE_OIC.test((objectifId ?? '').trim());

/**
 * `edn_items_complete.quiz_questions` contient exactement 3 questions pour
 * chacun des 367 items, soit 1101 questions — mais seulement 3 jeux de
 * réponses distincts au total : d'un item à l'autre, seul le numéro change.
 *
 *   « Quelle est la compétence principale de rang A pour l'item 99 ? »
 *   → Connaissances théoriques de base / Application clinique pratique /
 *     Recherche et innovation / Enseignement et formation
 *
 * Aucune de ces questions ne porte de contenu médical : ce sont des gabarits.
 * Les 1101 questions stockées correspondent aux trois motifs ci-dessous
 * (vérifié : 1101/1101). On ne les propose pas comme quiz pédagogique ; le
 * quiz est alors reconstruit depuis les compétences OIC réelles de l'item.
 */
const GABARITS_QUIZ_GENERIQUE = [
  /^Quelle est la compétence principale de rang [AB] pour l'item \d+\s*\?$/,
  /^Dans le contexte de l'item \d+, quelle approche thérapeutique est privilégiée\s*\?$/,
  /^Quel est l'objectif principal de rang [AB] pour l'item \d+\s*\?$/,
];

export const estQuestionQuizGenerique = (question?: string | null): boolean => {
  const texte = (question ?? '').trim();
  if (!texte) return true;
  return GABARITS_QUIZ_GENERIQUE.some((motif) => motif.test(texte));
};

/**
 * `edn_items_complete.scene_immersive` est rempli pour les 367 items, mais avec
 * un gabarit unique dont seul le numéro d'item varie :
 *
 *   titre     : « Simulation clinique interactive - Item 99 »
 *   contexte  : « Environnement hospitalier virtuel avec patient simulé » (367/367 identique)
 *   scenarios : « Patient présentant une pathologie typique de l'item 99 »
 *   objectifs : les 4 mêmes phrases pour les 367 items
 *
 * Aucune pathologie, aucun signe, aucune conduite à tenir : ce n'est pas une
 * scène clinique. Vérifié : 367/367 correspondent au gabarit. On préfère
 * afficher « en préparation » plutôt qu'une simulation qui n'en est pas.
 */
const TITRE_SCENE_GABARIT = /^Simulation clinique interactive - Item \d+$/;
const CONTEXTE_SCENE_GABARIT = 'Environnement hospitalier virtuel avec patient simulé';

export const sceneImmersiveEstGenerique = (scene: unknown): boolean => {
  if (!scene || typeof scene !== 'object') return true;
  const s = scene as { titre?: unknown; contexte?: unknown };
  const titre = typeof s.titre === 'string' ? s.titre.trim() : '';
  const contexte = typeof s.contexte === 'string' ? s.contexte.trim() : '';
  return TITRE_SCENE_GABARIT.test(titre) && contexte === CONTEXTE_SCENE_GABARIT;
};
