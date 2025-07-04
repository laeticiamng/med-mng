// Parser pour les pages OIC
export interface OicCompetence {
  objectif_id: string;
  intitule: string;
  item_parent: string;
  rang: string;
  rubrique: string;
  description?: string;
  ordre?: number;
  url_source: string;
  hash_content?: string;
}

// Mapping des rubriques
const RUBRIQUES_MAP: Record<string, string> = {
  '01': 'Génétique',
  '02': 'Immunopathologie', 
  '03': 'Inflammation',
  '04': 'Cancérologie',
  '05': 'Pharmacologie',
  '06': 'Douleur',
  '07': 'Santé publique',
  '08': 'Thérapeutique',
  '09': 'Urgences',
  '10': 'Vieillissement',
  '11': 'Interprétation'
};

export function parseOICContent(page: any): OicCompetence | null {
  try {
    const title = page.title;
    const content = page.revisions?.[0]?.['*'] || '';
    
    // Extraire l'identifiant OIC
    const match = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
    if (!match) return null;
    
    const [objectif_id, item_parent, rubrique_code, rang, ordre_str] = match;
    
    // Extraire l'intitulé depuis le wikitext
    let intitule = title;
    const intituleMatch = content.match(/\|\s*Intitulé\s*=\s*([^\n\|]+)/i) || 
                         content.match(/<th[^>]*>Intitulé<\/th>\s*<td[^>]*>([^<]+)/i);
    if (intituleMatch) {
      intitule = intituleMatch[1].trim();
    }
    
    // Extraire la description
    let description = '';
    const descMatch = content.match(/\|\s*Description\s*=\s*([^\n\|]+)/i) ||
                     content.match(/<th[^>]*>Description<\/th>\s*<td[^>]*>([^<]+)/i);
    if (descMatch) {
      description = descMatch[1].trim();
    }
    
    return {
      objectif_id,
      intitule,
      item_parent,
      rang,
      rubrique: RUBRIQUES_MAP[rubrique_code] || 'Autre',
      description,
      ordre: parseInt(ordre_str),
      url_source: `https://livret.uness.fr/lisa/2025/${encodeURIComponent(title)}`,
      date_import: new Date().toISOString(),
      extraction_status: 'complete'
    };
    
  } catch (error) {
    console.error('Erreur parsing:', error);
    return null;
  }
}