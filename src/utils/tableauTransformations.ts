/**
 * Transforme la structure tableau avec objectifs/competences_cles/situations_cliniques
 * en format sections compatible avec les composants TableauRangA/B
 */
export const transformTableauToSections = (tableauData: any, itemCode: string, title: string, rang: 'A' | 'B') => {
  console.log(`🔧 Transformation pour ${itemCode} Rang ${rang}:`, tableauData);
  
  if (!tableauData || typeof tableauData !== 'object') {
    console.log(`⚠️ ${itemCode}: Pas de données tableau`);
    return null;
  }

  // Si sections existe déjà et n'est pas vide, retourner tel quel
  if (tableauData.sections && Array.isArray(tableauData.sections) && tableauData.sections.length > 0) {
    console.log(`✅ ${itemCode}: Sections déjà présentes (${tableauData.sections.length})`);
    return tableauData;
  }

  console.log(`🔄 ${itemCode}: Création de sections à partir des champs existants`);
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
        niveau: comp.niveau || ''
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
        niveau: comp.niveau || 'Expert'
      })),
      keywords: []
    });
  }

  // Si aucune section n'a été créée, retourner le tableau original
  if (sections.length === 0) {
    console.log(`⚠️ ${itemCode}: Aucune section créée, retour données originales`);
    return tableauData;
  }

  const transformed = {
    title: tableauData.title || `${itemCode} Rang ${rang} - ${title}`,
    subtitle: tableauData.subtitle,
    sections: sections
  };
  
  console.log(`✅ ${itemCode}: ${sections.length} sections créées avec succès`);
  return transformed;
};
