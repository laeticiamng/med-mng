
import { ItemEDNV2, RangContentV2 } from '@/schemas/itemEDNSchema';

// Interface pour la compatibilité avec l'ancien système
export interface ParsedEDNItem {
  // Métadonnées
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  
  // Contenu structuré
  tableau_rang_a: {
    theme: string;
    lignes: string[][];
    colonnes: Array<{
      nom: string;
      couleur: string;
      couleurCellule: string;
      couleurTexte: string;
    }>;
  };
  
  tableau_rang_b: {
    theme: string;
    lignes: string[][];
    colonnes: Array<{
      nom: string;
      couleur: string;
      couleurCellule: string;
      couleurTexte: string;
    }>;
  };
  
  // Génération musicale
  paroles_musicales: string[];
  
  // Autres modules
  scene_immersive?: any;
  quiz_questions?: any;
  
  // Métadonnées de génération
  generation_config: ItemEDNV2['generation_config'];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Configuration des colonnes standardisée
const STANDARD_COLUMNS_CONFIG = [
  { nom: 'Concept', couleur: 'bg-primary', couleurCellule: 'bg-primary/10', couleurTexte: 'text-primary' },
  { nom: 'Définition', couleur: 'bg-success', couleurCellule: 'bg-success/10', couleurTexte: 'text-success' },
  { nom: 'Exemple', couleur: 'bg-accent', couleurCellule: 'bg-accent/10', couleurTexte: 'text-accent-foreground' },
  { nom: 'Piège', couleur: 'bg-destructive', couleurCellule: 'bg-destructive/10', couleurTexte: 'text-destructive' },
  { nom: 'Mnémo', couleur: 'bg-warning', couleurCellule: 'bg-warning/10', couleurTexte: 'text-warning' },
  { nom: 'Subtilité', couleur: 'bg-secondary', couleurCellule: 'bg-secondary/10', couleurTexte: 'text-secondary-foreground' },
  { nom: 'Application', couleur: 'bg-muted', couleurCellule: 'bg-muted/50', couleurTexte: 'text-muted-foreground' },
  { nom: 'Vigilance', couleur: 'bg-warning', couleurCellule: 'bg-warning/10', couleurTexte: 'text-warning' }
];

/**
 * Parser unifié qui remplace tous les TableauRangAUtilsICx
 * Transforme les données v2 en format compatible avec l'UI existante
 */
export class EDNItemParser {
  
  /**
   * Parse un item v2 vers le format attendu par l'UI
   */
  static parseItemV2(itemV2: ItemEDNV2, itemId: string): ParsedEDNItem {
    console.log('🔄 EDNItemParser - Parsing item v2:', itemV2.item_metadata.code);
    
    return {
      id: itemId,
      item_code: itemV2.item_metadata.code,
      title: itemV2.item_metadata.title,
      subtitle: itemV2.item_metadata.subtitle,
      slug: itemV2.item_metadata.slug,
      
      tableau_rang_a: this.parseRangContent(itemV2.content.rang_a, 'A'),
      tableau_rang_b: this.parseRangContent(itemV2.content.rang_b, 'B'),
      
      paroles_musicales: this.extractParolesMusicales(itemV2),
      
      scene_immersive: this.generateSceneImmersive(itemV2),
      quiz_questions: this.generateQuizQuestions(itemV2),
      
      generation_config: itemV2.generation_config,
      
      created_at: itemV2.item_metadata.created_at || new Date().toISOString(),
      updated_at: itemV2.item_metadata.updated_at || new Date().toISOString()
    };
  }
  
  /**
   * Parse le contenu d'un rang (A ou B) vers le format tableau
   */
  private static parseRangContent(rangContent: RangContentV2, _rang: 'A' | 'B') {
    const lignes = rangContent.competences.map(competence => [
      competence.concept,
      competence.definition,
      competence.exemple,
      competence.piege,
      competence.mnemo,
      competence.subtilite,
      competence.application,
      competence.vigilance
    ]);
    
    return {
      theme: rangContent.theme,
      lignes,
      colonnes: STANDARD_COLUMNS_CONFIG
    };
  }
  
  /**
   * Extrait les paroles musicales de toutes les compétences
   */
  private static extractParolesMusicales(itemV2: ItemEDNV2): string[] {
    const parolesRangA = itemV2.content.rang_a.competences
      .flatMap(comp => comp.paroles_chantables)
      .join('\n\n');
      
    const parolesRangB = itemV2.content.rang_b.competences
      .flatMap(comp => comp.paroles_chantables)
      .join('\n\n');
    
    return [parolesRangA, parolesRangB].filter(p => p.length > 0);
  }
  
  /**
   * Génère la configuration de scène immersive
   */
  private static generateSceneImmersive(itemV2: ItemEDNV2) {
    return {
      type: 'medical_scenario',
      theme: itemV2.item_metadata.title,
      category: itemV2.item_metadata.category,
      interactions_enabled: itemV2.generation_config.interactive_enabled
    };
  }
  
  /**
   * Génère les questions de quiz basées sur les compétences
   */
  private static generateQuizQuestions(itemV2: ItemEDNV2) {
    const allCompetences = [
      ...itemV2.content.rang_a.competences,
      ...itemV2.content.rang_b.competences
    ];
    
    const questions = allCompetences.slice(0, 5).map((competence, index) => ({
      id: `${itemV2.item_metadata.code}_Q${index + 1}`,
      question: `Concernant ${competence.concept.toLowerCase()}, quelle est la définition correcte ?`,
      options: [
        competence.definition,
        `Définition incorrecte pour ${competence.concept}`,
        `Autre définition erronée`,
        `Définition alternative incorrecte`
      ],
      correct_answer: 0,
      explanation: competence.subtilite
    }));
    
    return { questions };
  }
  
  /**
   * Détecte si un item est en format v1 (legacy) ou v2
   */
  static isItemV2(item: any): item is ItemEDNV2 {
    return item?.item_metadata?.version?.startsWith('v2.');
  }
  
  /**
   * Parse un item peu importe son format (v1 ou v2)
   * Assure la compatibilité pendant la transition
   */
  static parseAnyItem(item: any, itemId: string): ParsedEDNItem {
    if (this.isItemV2(item)) {
      console.log('📋 Item v2 détecté, utilisation du parser unifié');
      return this.parseItemV2(item, itemId);
    } else {
      console.log('📋 Item v1 détecté, utilisation du parser legacy');
      return this.parseLegacyItem(item, itemId);
    }
  }
  
  /**
   * Parser pour les items v1 (compatibilité)
   * Utilise la logique existante en attendant la migration
   */
  private static parseLegacyItem(item: any, itemId: string): ParsedEDNItem {
    // Logique de parsing legacy (simplifié ici)
    return {
      id: itemId,
      item_code: item.item_code || 'IC-?',
      title: item.title || 'Titre non défini',
      subtitle: item.subtitle,
      slug: item.slug || 'item-undefined',
      
      tableau_rang_a: item.tableau_rang_a || { theme: 'Non défini', lignes: [], colonnes: STANDARD_COLUMNS_CONFIG },
      tableau_rang_b: item.tableau_rang_b || { theme: 'Non défini', lignes: [], colonnes: STANDARD_COLUMNS_CONFIG },
      
      paroles_musicales: item.paroles_musicales || [],
      scene_immersive: item.scene_immersive,
      quiz_questions: item.quiz_questions,
      
      generation_config: {
        music_enabled: true,
        bd_enabled: true,
        quiz_enabled: true,
        interactive_enabled: true
      },
      
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString()
    };
  }
}

export default EDNItemParser;
