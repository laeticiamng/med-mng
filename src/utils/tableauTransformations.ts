/**
 * Transforme la structure tableau avec objectifs/competences_cles/situations_cliniques
 * en format sections compatible avec les composants TableauRangA/B
 */
export const transformTableauToSections = (tableauData: any, itemCode: string, title: string, rang: 'A' | 'B') => {
  if (!tableauData || typeof tableauData !== 'object') {
    return null;
  }

  // Si sections existe déjà et n'est pas vide, retourner tel quel
  if (tableauData.sections && Array.isArray(tableauData.sections) && tableauData.sections.length > 0) {
    return tableauData;
  }

  const sections = [];

  // Section 1 : Objectifs pédagogiques
  if (tableauData.objectifs && Array.isArray(tableauData.objectifs) && tableauData.objectifs.length > 0) {
    sections.push({
      title: "Objectifs pédagogiques",
      content: tableauData.objectifs.join('\n• '),
      keywords: []
    });
  }

  // Section 2 : Compétences clés
  if (tableauData.competences_cles && Array.isArray(tableauData.competences_cles) && tableauData.competences_cles.length > 0) {
    sections.push({
      title: "Compétences clés",
      content: "",
      competences: tableauData.competences_cles.map((comp: any) => ({
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
  if (tableauData.situations_cliniques && Array.isArray(tableauData.situations_cliniques) && tableauData.situations_cliniques.length > 0) {
    sections.push({
      title: "Situations cliniques",
      content: tableauData.situations_cliniques.join('\n• '),
      keywords: []
    });
  }

  // Section 4 : Cas complexes (pour Rang B)
  if (rang === 'B' && tableauData.cas_complexes && Array.isArray(tableauData.cas_complexes) && tableauData.cas_complexes.length > 0) {
    sections.push({
      title: "Cas complexes",
      content: tableauData.cas_complexes.join('\n• '),
      keywords: []
    });
  }

  // Section 5 : Compétences expertes (pour Rang B)
  if (rang === 'B' && tableauData.competences_expertes && Array.isArray(tableauData.competences_expertes) && tableauData.competences_expertes.length > 0) {
    sections.push({
      title: "Compétences expertes",
      content: "",
      competences: tableauData.competences_expertes.map((comp: any) => ({
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
    return tableauData;
  }

  return {
    title: tableauData.title || `${itemCode} Rang ${rang} - ${title}`,
    subtitle: tableauData.subtitle,
    sections: sections
  };
};
