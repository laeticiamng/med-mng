// Parser OIC amélioré avec analyseur HTML robuste
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

export interface EnhancedOicCompetence {
  objectif_id: string;
  intitule: string;
  item_parent: string;
  rang: string;
  rubrique: string;
  description?: string;
  ordre?: number;
  url_source: string;
  titre_complet?: string;
  sommaire?: string;
  mecanismes?: string;
  indications?: string;
  effets_indesirables?: string;
  interactions?: string;
  modalites_surveillance?: string;
  causes_echec?: string;
  contributeurs?: string;
  hash_content?: string;
  date_import?: string;
  extraction_status?: string;
}

// Parser DOM robuste
const parser = new DOMParser();

// Mapping enrichi des rubriques médicales
const ENHANCED_RUBRIQUES_MAP: Record<string, string> = {
  '01': 'Génétique médicale',
  '02': 'Immunopathologie et inflammation', 
  '03': 'Inflammation et cicatrisation',
  '04': 'Oncologie et cancérologie',
  '05': 'Pharmacologie clinique',
  '06': 'Douleur et analgésie',
  '07': 'Santé publique et épidémiologie',
  '08': 'Thérapeutique et surveillance',
  '09': 'Médecine d\'urgence',
  '10': 'Gériatrie et vieillissement',
  '11': 'Interprétation et diagnostic',
  '12': 'Cardiologie',
  '13': 'Pneumologie',
  '14': 'Gastro-entérologie',
  '15': 'Néphrologie',
  '16': 'Endocrinologie',
  '17': 'Neurologie',
  '18': 'Psychiatrie',
  '19': 'Gynécologie-Obstétrique',
  '20': 'Pédiatrie'
};

export function parseEnhancedOICContent(page: any): EnhancedOicCompetence | null {
  try {
    const title = page.title;
    
    // Extraction robuste du contenu depuis différents formats
    let content = extractContent(page);
    if (!content) {
      console.warn(`⚠️ Pas de contenu pour ${title}`);
      return null;
    }
    
    // Extraire l'identifiant OIC avec validation robuste
    const oicMatch = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
    if (!oicMatch) {
      console.warn(`⚠️ Format de titre OIC non conforme: ${title}`);
      return null;
    }
    
    const [objectif_id, item_parent, rubrique_code, rang, ordre_str] = oicMatch;
    
    // Parser le contenu HTML/WikiText de manière robuste
    const parsedContent = parseContentStructure(content);
    
    // Extraire l'intitulé avec méthodes multiples
    const intitule = extractIntitule(content, parsedContent, title);
    
    // Extraire la description enrichie
    const description = extractEnhancedDescription(content, parsedContent);
    
    // Extraire les sections médicales spécialisées
    const medicalSections = extractMedicalSections(content, parsedContent);
    
    return {
      objectif_id,
      intitule: cleanText(intitule).substring(0, 500),
      item_parent,
      rang,
      rubrique: ENHANCED_RUBRIQUES_MAP[rubrique_code] || `Spécialité médicale ${rubrique_code}`,
      description: cleanText(description).substring(0, 1000),
      ordre: parseInt(ordre_str),
      url_source: `https://livret.uness.fr/lisa/2025/${encodeURIComponent(title)}`,
      titre_complet: medicalSections.titre_complet,
      sommaire: medicalSections.sommaire,
      mecanismes: medicalSections.mecanismes,
      indications: medicalSections.indications,
      effets_indesirables: medicalSections.effets_indesirables,
      interactions: medicalSections.interactions,
      modalites_surveillance: medicalSections.modalites_surveillance,
      causes_echec: medicalSections.causes_echec,
      contributeurs: medicalSections.contributeurs,
      date_import: new Date().toISOString(),
      extraction_status: 'enhanced'
    };
    
  } catch (error) {
    console.error('❌ Erreur parsing OIC amélioré:', error);
    return null;
  }
}

function extractContent(page: any): string {
  // Méthodes multiples d'extraction de contenu
  const contentSources = [
    () => page.revisions?.[0]?.slots?.main?.content,
    () => page.revisions?.[0]?.['*'],
    () => page.revisions?.[0]?.content,
    () => page.content,
    () => page.wikitext
  ];
  
  for (const getContent of contentSources) {
    try {
      const content = getContent();
      if (content && typeof content === 'string' && content.trim()) {
        return content;
      }
    } catch (e) {
      continue;
    }
  }
  
  return '';
}

function parseContentStructure(content: string): any {
  try {
    // Tenter de parser comme HTML
    if (content.includes('<') && content.includes('>')) {
      const doc = parser.parseFromString(content, 'text/html');
      if (doc) {
        return {
          type: 'html',
          document: doc,
          text: doc.textContent || ''
        };
      }
    }
    
    // Parser comme WikiText
    return {
      type: 'wikitext',
      content: content,
      text: content
    };
  } catch (error) {
    console.warn('⚠️ Erreur parsing structure:', error);
    return {
      type: 'text',
      content: content,
      text: content
    };
  }
}

function extractIntitule(content: string, parsedContent: any, title: string): string {
  const intitulePatterns = [
    // WikiText patterns
    /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
    /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/,
    /'''(.+?)'''/,
    
    // HTML patterns
    /<th[^>]*>(?:[Ii]ntitulé|[Tt]itre)<\/th>\s*<td[^>]*>([^<]+)/,
    /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/,
    
    // Structure patterns
    /==\s*(.+?)\s*==/,
    /^\s*\*\s*(.+?)$/m,
    
    // Fallback patterns
    /^([^\n]{10,100})$/m
  ];
  
  for (const pattern of intitulePatterns) {
    const match = pattern.exec(content);
    if (match && match[1] && match[1].trim()) {
      const extracted = match[1].trim();
      if (extracted.length > 5 && extracted.length < 500) {
        return extracted;
      }
    }
  }
  
  // Extraction depuis DOM si disponible
  if (parsedContent.type === 'html' && parsedContent.document) {
    const headingElements = parsedContent.document.querySelectorAll('h1, h2, h3, .title, .intitule');
    for (const el of headingElements) {
      const text = el.textContent?.trim();
      if (text && text.length > 5 && text.length < 500) {
        return text;
      }
    }
  }
  
  return title;
}

function extractEnhancedDescription(content: string, parsedContent: any): string {
  const descriptionPatterns = [
    // WikiText patterns
    /\|\s*[Dd]escription\s*=\s*([^\n\|]+)/,
    /\|\s*[Dd]éfinition\s*=\s*([^\n\|]+)/,
    /\|\s*[Rr]ésumé\s*=\s*([^\n\|]+)/,
    
    // HTML patterns  
    /<th[^>]*>(?:[Dd]escription|[Dd]éfinition)<\/th>\s*<td[^>]*>([^<]+)/,
    /<p[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)<\/p>/,
    
    // Content patterns
    /\n\n(.{50,500})(?=\n\n|\[\[|==|$)/s,
    /^\s*([A-ZÀÁÂÃÄÅ][^.!?]{50,300}[.!?])/m
  ];
  
  for (const pattern of descriptionPatterns) {
    const match = pattern.exec(content);
    if (match && match[1] && match[1].trim()) {
      const extracted = match[1].trim();
      if (extracted.length > 20 && extracted.length < 1000) {
        return extracted;
      }
    }
  }
  
  // Extraction depuis DOM si disponible
  if (parsedContent.type === 'html' && parsedContent.document) {
    const descElements = parsedContent.document.querySelectorAll('p, .description, .summary');
    for (const el of descElements) {
      const text = el.textContent?.trim();
      if (text && text.length > 20 && text.length < 1000) {
        return text;
      }
    }
  }
  
  return '';
}

function extractMedicalSections(content: string, parsedContent: any): any {
  const sections = {
    titre_complet: '',
    sommaire: '',
    mecanismes: '',
    indications: '',
    effets_indesirables: '',
    interactions: '',
    modalites_surveillance: '',
    causes_echec: '',
    contributeurs: ''
  };
  
  // Patterns pour les sections médicales spécialisées
  const sectionPatterns = {
    mecanismes: [
      /(?:Mécanisme|Physiopathologie|Pathogenèse)[^:]*:?\s*([^§\n]{50,800})/is,
      /==\s*(?:Mécanisme|Physiopathologie|Pathogenèse)\s*==\s*([^=]{50,800})/is
    ],
    indications: [
      /(?:Indication|Diagnostic|Critère)[^:]*:?\s*([^§\n]{50,800})/is,
      /==\s*(?:Indication|Diagnostic|Critères)\s*==\s*([^=]{50,800})/is
    ],
    effets_indesirables: [
      /(?:Effet.+indésirable|Complication|Risque)[^:]*:?\s*([^§\n]{50,800})/is,
      /==\s*(?:Effets|Complications|Risques)\s*==\s*([^=]{50,800})/is
    ],
    interactions: [
      /(?:Interaction|Contre-indication|Précaution)[^:]*:?\s*([^§\n]{50,800})/is,
      /==\s*(?:Interactions|Contre-indications)\s*==\s*([^=]{50,800})/is
    ],
    modalites_surveillance: [
      /(?:Surveillance|Suivi|Monitoring)[^:]*:?\s*([^§\n]{50,800})/is,
      /==\s*(?:Surveillance|Suivi)\s*==\s*([^=]{50,800})/is
    ]
  };
  
  // Extraire chaque section
  for (const [sectionName, patterns] of Object.entries(sectionPatterns)) {
    for (const pattern of patterns) {
      const match = pattern.exec(content);
      if (match && match[1] && match[1].trim()) {
        sections[sectionName as keyof typeof sections] = cleanText(match[1].trim()).substring(0, 500);
        break;
      }
    }
  }
  
  return sections;
}

function cleanText(text: string): string {
  if (!text) return '';
  
  return text
    // Nettoyer le WikiText
    .replace(/\[\[(.+?)\|(.+?)\]\]/g, '$2')  // Liens avec texte alternatif
    .replace(/\[\[(.+?)\]\]/g, '$1')         // Liens simples
    .replace(/'''(.+?)'''/g, '$1')           // Gras
    .replace(/''(.+?)''/g, '$1')             // Italique
    .replace(/{{.+?}}/g, '')                 // Templates
    .replace(/<ref.*?\/>/g, '')              // Références
    .replace(/<ref.*?>.*?<\/ref>/g, '')      // Références avec contenu
    .replace(/<.*?>/g, '')                   // Balises HTML
    .replace(/\s+/g, ' ')                    // Espaces multiples
    .replace(/^\s+|\s+$/g, '')               // Espaces de début/fin
    .replace(/[^\w\s\-\.,;:!?()\[\]]/g, '')  // Caractères spéciaux
    .trim();
}