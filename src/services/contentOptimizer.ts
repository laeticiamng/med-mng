// Service d'optimisation automatique du contenu pour améliorer l'expérience utilisateur

import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';
import { contentQualityAnalyzer } from './contentQualityAnalyzer';

interface OptimizationResult {
  itemCode: string;
  optimized: boolean;
  changes: string[];
  newQualityScore: number;
  error?: string;
}

class ContentOptimizer {

  // Optimise automatiquement les paroles musicales de mauvaise qualité
  async optimizeLyrics(itemCode: string): Promise<OptimizationResult> {
    try {
      const { data: item, error } = await supabase
        .from('edn_items_complete')
        .select('*')
        .eq('item_code', itemCode)
        .single();

      if (error || !item) {
        throw new Error(`Item ${itemCode} non trouvé`);
      }

      const changes: string[] = [];
      let optimized = false;

      // Analyser la qualité actuelle
      const currentAnalysis = await contentQualityAnalyzer.analyzeEdnItem(itemCode);
      
      if (currentAnalysis.lyricsQuality < 60) {
        // Identifier les concepts médicaux pour les nouvelles paroles
        const medicalConcepts = await this.extractMedicalConcepts(item);
        
        // Générer de nouvelles paroles optimisées
        const newLyrics = this.generateOptimizedLyrics(itemCode, item.title, medicalConcepts);
        
        // Mettre à jour dans la base de données
        const { error: updateError } = await supabase
          .from('edn_items_complete')
          .update({ 
            paroles_musicales: newLyrics,
            updated_at: new Date().toISOString()
          })
          .eq('item_code', itemCode);

        if (updateError) {
          throw updateError;
        }

        changes.push('Paroles musicales réécrites pour être plus chantables');
        changes.push('Structure musicale ajoutée (couplets/refrains)');
        changes.push('Vocabulaire médical simplifié et mémorisable');
        optimized = true;
      }

      // Nouvelle analyse pour vérifier l'amélioration
      const newAnalysis = await contentQualityAnalyzer.analyzeEdnItem(itemCode);

      return {
        itemCode,
        optimized,
        changes,
        newQualityScore: newAnalysis.overallQuality,
      };

    } catch (error) {
      logger.error(`Erreur optimisation paroles ${itemCode}`, {
        component: 'ContentOptimizer',
        action: 'optimizeLyrics',
        metadata: { itemCode, error }
      });

      return {
        itemCode,
        optimized: false,
        changes: [],
        newQualityScore: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  // Extrait les concepts médicaux clés d'un item
  private async extractMedicalConcepts(item: any): Promise<string[]> {
    const concepts: string[] = [];
    
    // Extraire des mots-clés du titre
    const titleWords = item.title
      .toLowerCase()
      .replace(/[^a-zà-ÿ\s]/g, '')
      .split(' ')
      .filter((word: string) => word.length > 3)
      .slice(0, 3);
    
    concepts.push(...titleWords);

    // Récupérer des concepts des compétences associées
    const { data: competences } = await supabase
      .from('oic_competences')
      .select('intitule, description')
      .eq('item_parent', item.item_code.replace('IC-', ''))
      .limit(3);

    if (competences) {
      for (const comp of competences) {
        if (comp.intitule) {
          const compWords = comp.intitule
            .toLowerCase()
            .replace(/[^a-zà-ÿ\s]/g, '')
            .split(' ')
            .filter((word: string) => word.length > 4)
            .slice(0, 2);
          concepts.push(...compWords);
        }
      }
    }

    // Retourner les 4 concepts les plus pertinents
    return [...new Set(concepts)].slice(0, 4);
  }

  // Génère des paroles optimisées et chantables
  private generateOptimizedLyrics(itemCode: string, title: string, medicalConcepts: string[]): string[] {
    const cleanTitle = title.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim().substring(0, 40);
    const concepts = medicalConcepts.map(c => c.charAt(0).toUpperCase() + c.slice(1));
    
    // Template de paroles chantables et mémorisables
    const lyrics = [
      `[Introduction]`,
      `${itemCode} - ${cleanTitle}`,
      `Je dois bien comprendre et retenir`,
      ``,
      `[Couplet 1]`,
      `${concepts[0] || 'Diagnostic'} précis et ${concepts[1] || 'traitement'} adapté`,
      `Voici les bases que je dois maîtriser`,
      `Pour chaque patient que je vais soigner`,
      `L'excellence médicale, je vais l'appliquer`,
      ``,
      `[Refrain]`,
      `${itemCode}, item essentiel`,
      `Chaque notion compte et me rend plus sûr`,
      `Je mémorise bien, j'applique avec soin`,
      `Pour mes patients, c'est mon devoir médical`,
      ``,
      `[Couplet 2]`,
      `${concepts[2] || 'Prévention'} active et ${concepts[3] || 'suivi'} régulier`,
      `Complètent ma formation d'aujourd'hui`,
      `L'approche globale du patient, c'est la clé`,
      `De la médecine que je veux pratiquer`,
      ``,
      `[Refrain]`,
      `${itemCode}, item essentiel`,
      `Chaque notion compte et me rend plus sûr`,
      `Je mémorise bien, j'applique avec soin`,
      `Pour mes patients, c'est mon devoir médical`,
      ``,
      `[Conclusion]`,
      `${cleanTitle}`,
      `Maintenant je sais, je peux avancer !`
    ];

    return lyrics;
  }

  // Nettoie et optimise les compétences mal formatées
  async optimizeCompetences(itemParent: string): Promise<OptimizationResult> {
    try {
      const { data: competences, error } = await supabase
        .from('oic_competences')
        .select('*')
        .eq('item_parent', itemParent);

      if (error || !competences) {
        throw new Error(`Compétences pour item ${itemParent} non trouvées`);
      }

      const changes: string[] = [];
      let optimized = false;

      for (const competence of competences) {
        let needsUpdate = false;
        const updates: any = {};

        // Nettoyer le HTML mal formaté
        if (competence.description?.includes('&nbsp;') || competence.description?.includes('<br')) {
          updates.description = this.cleanHtmlContent(competence.description);
          needsUpdate = true;
          changes.push('HTML nettoyé dans les descriptions');
        }

        // Améliorer les descriptions trop courtes
        if (competence.description && competence.description.length < 20) {
          updates.description = this.expandShortDescription(competence.description, competence.intitule);
          needsUpdate = true;
          changes.push('Descriptions courtes enrichies');
        }

        // Raccourcir les descriptions trop longues
        if (competence.description && competence.description.length > 600) {
          updates.description = this.shortenLongDescription(competence.description);
          needsUpdate = true;
          changes.push('Descriptions longues raccourcies');
        }

        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('oic_competences')
            .update(updates)
            .eq('objectif_id', competence.objectif_id);

          if (updateError) {
            logger.error(`Erreur mise à jour compétence ${competence.objectif_id}`, {
              component: 'ContentOptimizer',
              metadata: { updateError }
            });
          } else {
            optimized = true;
          }
        }
      }

      return {
        itemCode: `IC-${itemParent}`,
        optimized,
        changes: [...new Set(changes)], // Supprimer les doublons
        newQualityScore: 0, // À recalculer
      };

    } catch (error) {
      logger.error(`Erreur optimisation compétences ${itemParent}`, {
        component: 'ContentOptimizer',
        action: 'optimizeCompetences',
        metadata: { itemParent, error }
      });

      return {
        itemCode: `IC-${itemParent}`,
        optimized: false,
        changes: [],
        newQualityScore: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  // Nettoie le contenu HTML mal formaté
  private cleanHtmlContent(content: string): string {
    return content
      .replace(/&nbsp;/g, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Enrichit les descriptions trop courtes
  private expandShortDescription(description: string, title: string): string {
    const cleanDesc = this.cleanHtmlContent(description);
    const cleanTitle = title?.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim();
    
    if (cleanDesc.length < 20) {
      return `${cleanDesc}. Cette compétence concernant "${cleanTitle}" nécessite une maîtrise des concepts fondamentaux et de leur application pratique en contexte clinique.`;
    }
    
    return cleanDesc;
  }

  // Raccourcit les descriptions trop longues
  private shortenLongDescription(description: string): string {
    const cleanDesc = this.cleanHtmlContent(description);
    
    if (cleanDesc.length > 600) {
      // Couper au niveau d'une phrase complète
      const sentences = cleanDesc.split('. ');
      let result = '';
      
      for (const sentence of sentences) {
        if ((result + sentence + '. ').length <= 400) {
          result += sentence + '. ';
        } else {
          break;
        }
      }
      
      return result.trim() || cleanDesc.substring(0, 400) + '...';
    }
    
    return cleanDesc;
  }

  // Optimise tous les items de faible qualité automatiquement
  async optimizeAllLowQualityContent(): Promise<{
    processed: number;
    optimized: number;
    failed: number;
    results: OptimizationResult[];
  }> {
    try {
      // Analyser d'abord le contenu pour identifier les items problématiques
      const analysis = await contentQualityAnalyzer.analyzeAllContent();
      const results: OptimizationResult[] = [];
      let optimized = 0;
      let failed = 0;

      logger.info('Début de l\'optimisation automatique du contenu', {
        component: 'ContentOptimizer',
        action: 'optimizeAllLowQualityContent',
        metadata: { 
          lowQualityItems: analysis.lowQualityItems.length,
          averageQuality: analysis.averageQuality 
        }
      });

      for (const item of analysis.lowQualityItems) {
        try {
          // Optimiser les paroles si nécessaire
          if (item.lyricsQuality < 60) {
            const lyricsResult = await this.optimizeLyrics(item.itemCode);
            results.push(lyricsResult);
            
            if (lyricsResult.optimized) {
              optimized++;
            } else if (lyricsResult.error) {
              failed++;
            }
          }

          // Optimiser les compétences si nécessaire
          if (item.competencesQuality < 70) {
            const itemParent = item.itemCode.replace('IC-', '');
            const competencesResult = await this.optimizeCompetences(itemParent);
            
            if (competencesResult.optimized) {
              optimized++;
            } else if (competencesResult.error) {
              failed++;
            }
          }

          // Attendre un peu pour éviter de surcharger la base
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          logger.error(`Erreur optimisation item ${item.itemCode}`, {
            component: 'ContentOptimizer',
            metadata: { error }
          });
          failed++;
        }
      }

      logger.info('Optimisation automatique terminée', {
        component: 'ContentOptimizer',
        metadata: { 
          processed: analysis.lowQualityItems.length,
          optimized,
          failed
        }
      });

      return {
        processed: analysis.lowQualityItems.length,
        optimized,
        failed,
        results
      };

    } catch (error) {
      logger.error('Erreur optimisation globale du contenu', {
        component: 'ContentOptimizer',
        action: 'optimizeAllLowQualityContent',
        metadata: { error }
      });
      throw error;
    }
  }
}

export const contentOptimizer = new ContentOptimizer();