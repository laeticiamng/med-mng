/**
 * Transforme la structure tableau avec objectifs/competences_cles/situations_cliniques
 * en format sections compatible avec les composants TableauRangA/B
 */
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
  if (normalizedTableau.objectifs && Array.isArray(normalizedTableau.objectifs) && normalizedTableau.objectifs.length > 0) {
    sections.push({
      title: "Objectifs pédagogiques",
      content: normalizedTableau.objectifs.join('\n• '),
      keywords: []
    });
  }

  // Section 2 : Compétences clés
  if (normalizedTableau.competences_cles && Array.isArray(normalizedTableau.competences_cles) && normalizedTableau.competences_cles.length > 0) {
    sections.push({
      title: "Compétences clés",
      content: "",
      competences: normalizedTableau.competences_cles.map((comp: any) => ({
        competence_id: comp.niveau || comp.id || 'N/A',
        concept: comp.competence || comp.titre || comp.intitule || '',
        definition: comp.description || '',
        exemple: comp.exemple || '',
        application: comp.application || '',
        niveau: comp.niveau || '',
        // Format compatible avec TableauCompetencesOICOptimized
        intitule: comp.competence || comp.titre || comp.intitule || '',
        description: comp.description || '',
        objectif_id: comp.niveau || comp.id || 'N/A',
        rubrique: comp.rubrique || 'Compétence Clé',
        titre_complet: comp.competence || comp.titre || comp.intitule || '',
        sommaire: comp.description?.substring(0, 150) || ''
      })),
      keywords: []
    });
  }

  // Section 3 : Situations cliniques
  if (normalizedTableau.situations_cliniques && Array.isArray(normalizedTableau.situations_cliniques) && normalizedTableau.situations_cliniques.length > 0) {
    sections.push({
      title: "Situations cliniques",
      content: normalizedTableau.situations_cliniques.join('\n• '),
      keywords: []
    });
  }

  // Section 4 : Cas complexes (pour Rang B)
  if (rang === 'B' && normalizedTableau.cas_complexes && Array.isArray(normalizedTableau.cas_complexes) && normalizedTableau.cas_complexes.length > 0) {
    sections.push({
      title: "Cas complexes",
      content: normalizedTableau.cas_complexes.join('\n• '),
      keywords: []
    });
  }

  // Section 5 : Compétences expertes (pour Rang B)
  if (rang === 'B' && normalizedTableau.competences_expertes && Array.isArray(normalizedTableau.competences_expertes) && normalizedTableau.competences_expertes.length > 0) {
    sections.push({
      title: "Compétences expertes",
      content: "",
      competences: normalizedTableau.competences_expertes.map((comp: any) => ({
        competence_id: comp.niveau || 'Expert',
        concept: comp.expertise || comp.competence || '',
        definition: comp.description || '',
        niveau: comp.niveau || 'Expert',
        // Format compatible avec TableauCompetencesOICOptimized
        intitule: comp.expertise || comp.competence || '',
        description: comp.description || '',
        objectif_id: comp.niveau || 'Expert',
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
    console.warn('⚠️ Impossible de parser un JSONB stringifié:', error);
    return null;
  }
};
