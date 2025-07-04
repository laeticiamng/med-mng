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
    // Le contenu peut être dans slots.main.content (format moderne) ou dans revisions[0]['*'] (format ancien)
    const content = page.revisions?.[0]?.slots?.main?.content || page.revisions?.[0]?.['*'] || '';
    
    if (!content) {
      console.warn(`⚠️ Pas de contenu pour ${title}`);
      return null;
    }
    
    // Extraire l'identifiant OIC
    const match = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
    if (!match) {
      console.warn(`⚠️ Format de titre non conforme: ${title}`);
      return null;
    }
    
    const [objectif_id, item_parent, rubrique_code, rang, ordre_str] = match;
    
    // Extraire l'intitulé depuis le wikitext - plusieurs patterns possibles
    let intitule = title;
    const intitulePatterns = [
      /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
      /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/,
      /'''(.+?)'''/,
      /<th[^>]*>[Ii]ntitulé<\/th>\s*<td[^>]*>([^<]+)/
    ];
    
    for (const pattern of intitulePatterns) {
      const intituleMatch = pattern.exec(content);
      if (intituleMatch && intituleMatch[1].trim()) {
        intitule = intituleMatch[1].trim();
        break;
      }
    }
    
    // Extraire la description - plusieurs patterns possibles
    let description = '';
    const descPatterns = [
      /\|\s*[Dd]escription\s*=\s*([^\n\|]+)/,
      /\|\s*[Dd]éfinition\s*=\s*([^\n\|]+)/,
      /<th[^>]*>[Dd]escription<\/th>\s*<td[^>]*>([^<]+)/,
      /\n\n(.+?)(?=\n\n|\[\[|$)/s // Premier paragraphe
    ];
    
    for (const pattern of descPatterns) {
      const descMatch = pattern.exec(content);
      if (descMatch && descMatch[1].trim()) {
        description = descMatch[1].trim().replace(/\[\[(.+?)\]\]/g, '$1');
        break;
      }
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