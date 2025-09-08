// ==========================================
// MED-MNG EDITOR UTILITIES - Utilitaires pour l'éditeur
// ==========================================

// Fonction helper pour créer des objets compatibles EDNItem
export function createCompatibleEDNItem(data: any): any {
  return {
    id: data.id || crypto.randomUUID(),
    item_code: data.item_code || 'DEFAULT',
    title: data.title || 'Sans titre',
    content: data.content || '',
    theme: data.theme,
    subtitle: data.subtitle,
    colonnes: data.colonnes,
    lignes: data.lignes,
    sections: data.sections,
    competences_oic: data.competences_oic,
    ...data // Spread pour garder toutes les propriétés
  };
}

// Fonction helper pour créer des objets compatibles ProcessingData
export function createCompatibleProcessingData(data: any): any {
  return {
    item_code: data.item_code || 'DEFAULT',
    rang: data.rang || 'A',
    content: data.content || [],
    processed_content: data.processed_content || [],
    theme: data.theme,
    title: data.title,
    ...data
  };
}

// Fonction helper pour créer des objets compatibles TableauData
export function createCompatibleTableauData(data: any): any {
  return {
    colonnes: Array.isArray(data.colonnes) 
      ? data.colonnes.map((col: any) => typeof col === 'string' 
          ? { id: col, titre: col, type: 'text' }
          : col
        )
      : [],
    lignes: data.lignes || [],
    metadata: data.metadata || {},
    ...data
  };
}

// Fonction helper pour normaliser les colonnes
export function normalizeColumns(colonnes: any[]): any[] {
  return colonnes.map(col => {
    if (typeof col === 'string') {
      return {
        id: col,
        titre: col,
        type: 'text' as const
      };
    }
    
    return {
      id: col.id || col.key || col.nom || crypto.randomUUID(),
      titre: col.titre || col.label || col.nom || 'Sans titre',
      type: col.type || 'text' as const,
      nom: col.nom,
      key: col.key,
      label: col.label,
      couleur: col.couleur,
      couleurCellule: col.couleurCellule,
      couleurTexte: col.couleurTexte,
      obligatoire: col.obligatoire,
      description: col.description,
      required: col.required,
      validation: col.validation,
      ...col
    };
  });
}