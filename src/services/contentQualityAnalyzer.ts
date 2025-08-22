// Service d'analyse de qualité du contenu pour optimiser l'expérience utilisateur

import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

interface ContentQualityScore {
  itemCode: string;
  title: string;
  lyricsQuality: number;
  competencesQuality: number;
  overallQuality: number;
  issues: string[];
  recommendations: string[];
}

interface LyricsAnalysis {
  isChantable: boolean;
  length: number;
  complexity: number;
  medicalRelevance: number;
  memorability: number;
  issues: string[];
}

class ContentQualityAnalyzer {
  
  // Analyse la qualité des paroles musicales
  private analyzeLyrics(lyrics: string[]): LyricsAnalysis {
    if (!lyrics || lyrics.length === 0) {
      return {
        isChantable: false,
        length: 0,
        complexity: 0,
        medicalRelevance: 0,
        memorability: 0,
        issues: ['Aucune parole trouvée']
      };
    }

    const fullText = lyrics.join(' ');
    const issues: string[] = [];
    
    // Vérification de la longueur (idéal: 50-200 caractères par ligne)
    const avgLineLength = fullText.length / lyrics.length;
    let lengthScore = 100;
    if (avgLineLength > 300) {
      lengthScore = 20;
      issues.push('Paroles trop longues pour être mémorisables');
    } else if (avgLineLength < 20) {
      lengthScore = 40;
      issues.push('Paroles trop courtes, manquent de substance');
    }

    // Vérification de la complexité (éviter les phrases trop complexes)
    const complexWords = fullText.match(/\b\w{12,}\b/g)?.length || 0;
    const complexityRatio = complexWords / fullText.split(' ').length;
    let complexityScore = 100;
    if (complexityRatio > 0.1) {
      complexityScore = 30;
      issues.push('Vocabulaire trop complexe pour une chanson médicale');
    }

    // Vérification du contenu médical vs poétique
    const medicalTerms = this.countMedicalTerms(fullText);
    const poeticTerms = this.countPoeticTerms(fullText);
    let medicalRelevanceScore = Math.min(100, (medicalTerms / (medicalTerms + poeticTerms + 1)) * 100);
    
    if (medicalRelevanceScore < 30) {
      issues.push('Contenu trop poétique, pas assez médical');
    }

    // Vérification de la structure chantable
    const hasStructure = fullText.includes('[Couplet') || fullText.includes('[Refrain');
    const isChantable = hasStructure && avgLineLength < 200 && complexityScore > 50;
    
    if (!isChantable) {
      if (!hasStructure) issues.push('Structure musicale manquante (couplets/refrains)');
      issues.push('Paroles non adaptées au chant médical');
    }

    // Vérification des mots-clés techniques non chantables
    const technicalKeywords = ['surveiller', 'analyser', 'étudier', 'maîtriser', 'comprendre', 'organiser'];
    const hasTechnicalKeywords = technicalKeywords.some(keyword => fullText.toLowerCase().includes(keyword));
    
    if (hasTechnicalKeywords) {
      issues.push('Contient des mots-clés techniques non chantables');
    }

    return {
      isChantable,
      length: lengthScore,
      complexity: complexityScore,
      medicalRelevance: medicalRelevanceScore,
      memorability: isChantable ? 80 : 20,
      issues
    };
  }

  private countMedicalTerms(text: string): number {
    const medicalTerms = [
      'patient', 'diagnostic', 'symptôme', 'traitement', 'maladie', 'médecin',
      'clinique', 'thérapie', 'pathologie', 'anatomie', 'physiologie', 'douleur',
      'infection', 'inflammation', 'chirurgie', 'médicament', 'prescription'
    ];
    return medicalTerms.filter(term => text.toLowerCase().includes(term)).length;
  }

  private countPoeticTerms(text: string): number {
    const poeticTerms = [
      'lumière', 'silence', 'étoile', 'voûte', 'manuscrit', 'palpite', 'souterraine',
      'ombre', 'mémoire', 'danse', 'écho', 'théâtre', 'intime', 'chair', 'sculpté',
      'rituel', 'partition', 'secrète', 'mystère', 'poème'
    ];
    return poeticTerms.filter(term => text.toLowerCase().includes(term)).length;
  }

  // Analyse la qualité des compétences
  private analyzeCompetences(competences: any[]): number {
    if (!competences || competences.length === 0) return 0;

    let totalScore = 0;
    let validCompetences = 0;

    for (const competence of competences) {
      let score = 100;
      const issues: string[] = [];

      // Vérification de la description
      if (!competence.description || competence.description.trim() === '') {
        score -= 50;
        issues.push('Description manquante');
      } else if (competence.description.includes('&nbsp;') || competence.description.includes('<br')) {
        score -= 30;
        issues.push('HTML mal formaté dans la description');
      } else if (competence.description.length < 20) {
        score -= 20;
        issues.push('Description trop courte');
      } else if (competence.description.length > 600) {
        score -= 20;
        issues.push('Description trop longue');
      }

      // Vérification du titre
      if (!competence.intitule || competence.intitule.trim() === '') {
        score -= 30;
        issues.push('Titre manquant');
      }

      totalScore += Math.max(0, score);
      validCompetences++;
    }

    return validCompetences > 0 ? totalScore / validCompetences : 0;
  }

  // Analyse complète d'un item EDN
  async analyzeEdnItem(itemCode: string): Promise<ContentQualityScore> {
    try {
      // Récupérer l'item complet
      const { data: item, error } = await supabase
        .from('edn_items_complete')
        .select('*')
        .eq('item_code', itemCode)
        .single();

      if (error || !item) {
        throw new Error(`Item ${itemCode} non trouvé`);
      }

      // Analyser les paroles
      const lyricsAnalysis = this.analyzeLyrics(item.paroles_musicales);
      
      // Récupérer et analyser les compétences
      const { data: competences } = await supabase
        .from('oic_competences')
        .select('*')
        .eq('item_parent', itemCode.replace('IC-', ''));

      const competencesQuality = this.analyzeCompetences(competences || []);

      // Calcul du score global
      const lyricsScore = (lyricsAnalysis.length + lyricsAnalysis.complexity + 
                          lyricsAnalysis.medicalRelevance + lyricsAnalysis.memorability) / 4;
      
      const overallQuality = (lyricsScore * 0.6 + competencesQuality * 0.4);

      // Recommandations basées sur l'analyse
      const recommendations: string[] = [];
      
      if (lyricsScore < 50) {
        recommendations.push('Réécrire les paroles pour les rendre plus chantables');
        recommendations.push('Simplifier le vocabulaire et raccourcir les phrases');
        recommendations.push('Ajouter une structure musicale claire (couplets/refrains)');
      }
      
      if (competencesQuality < 70) {
        recommendations.push('Nettoyer le formatage HTML des compétences');
        recommendations.push('Enrichir les descriptions trop courtes');
        recommendations.push('Raccourcir les descriptions trop longues');
      }

      if (overallQuality < 60) {
        recommendations.push('Item nécessite une révision complète');
      }

      return {
        itemCode,
        title: item.title,
        lyricsQuality: lyricsScore,
        competencesQuality,
        overallQuality,
        issues: lyricsAnalysis.issues,
        recommendations
      };

    } catch (error) {
      logger.error(`Erreur analyse qualité item ${itemCode}`, {
        component: 'ContentQualityAnalyzer',
        action: 'analyzeEdnItem',
        metadata: { itemCode, error }
      });
      
      return {
        itemCode,
        title: 'Erreur',
        lyricsQuality: 0,
        competencesQuality: 0,
        overallQuality: 0,
        issues: [`Erreur d'analyse: ${error}`],
        recommendations: ['Vérifier la disponibilité des données']
      };
    }
  }

  // Analyse de tous les items pour identifier les problèmes majeurs
  async analyzeAllContent(): Promise<{
    analyzed: number;
    lowQualityItems: ContentQualityScore[];
    averageQuality: number;
    criticalIssues: string[];
    recommendations: string[];
  }> {
    try {
      // Récupérer tous les items actifs
      const { data: items, error } = await supabase
        .from('edn_items_complete')
        .select('item_code, title')
        .eq('status', 'active')
        .order('item_code');

      if (error || !items) {
        throw new Error('Impossible de récupérer les items');
      }

      const analyses: ContentQualityScore[] = [];
      const lowQualityItems: ContentQualityScore[] = [];
      let totalQuality = 0;

      // Analyser les 50 premiers items pour commencer
      const itemsToAnalyze = items.slice(0, 50);
      
      for (const item of itemsToAnalyze) {
        const analysis = await this.analyzeEdnItem(item.item_code);
        analyses.push(analysis);
        totalQuality += analysis.overallQuality;

        if (analysis.overallQuality < 60) {
          lowQualityItems.push(analysis);
        }
      }

      const averageQuality = totalQuality / analyses.length;

      // Identifier les problèmes critiques les plus fréquents
      const allIssues = analyses.flatMap(a => a.issues);
      const issueFrequency = allIssues.reduce((acc, issue) => {
        acc[issue] = (acc[issue] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const criticalIssues = Object.entries(issueFrequency)
        .filter(([_, count]) => count > 5)
        .map(([issue, count]) => `${issue} (${count} items affectés)`)
        .slice(0, 10);

      // Recommandations générales
      const recommendations = [
        'Remplacer les paroles techniques par des paroles chantables mémorisables',
        'Nettoyer le formatage HTML dans toutes les compétences',
        'Standardiser la longueur des descriptions (50-300 caractères)',
        'Créer des templates de paroles musicales par spécialité médicale',
        'Implémenter un système de validation qualité automatique'
      ];

      if (lowQualityItems.length > 10) {
        recommendations.unshift(`URGENT: ${lowQualityItems.length} items de faible qualité nécessitent une révision immédiate`);
      }

      return {
        analyzed: analyses.length,
        lowQualityItems,
        averageQuality,
        criticalIssues,
        recommendations
      };

    } catch (error) {
      logger.error('Erreur analyse complète du contenu', {
        component: 'ContentQualityAnalyzer',
        action: 'analyzeAllContent',
        metadata: { error }
      });
      throw error;
    }
  }

  // Génère des paroles de qualité pour remplacer les mauvaises
  generateQualityLyrics(itemCode: string, title: string, medicalConcepts: string[]): string[] {
    const cleanTitle = title.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim();
    const keywords = medicalConcepts.slice(0, 4); // Limiter à 4 concepts clés
    
    return [
      `[Couplet 1]`,
      `${cleanTitle}, je dois maîtriser`,
      `Les concepts clés pour bien soigner`,
      `${keywords[0] || 'Diagnostic'} et ${keywords[1] || 'traitement'}`,
      `Sont les bases du savoir médical`,
      ``,
      `[Refrain]`,
      `Item ${itemCode}, je retiens`,
      `Chaque notion qui me sert bien`,
      `Pour mes patients, je me forme`,
      `Et j'applique avec la norme`,
      ``,
      `[Couplet 2]`,
      `${keywords[2] || 'Prévention'} et ${keywords[3] || 'suivi'}`,
      `Complètent ma formation ici`,
      `L'excellence médicale exige`,
      `Une approche qui ne néglige`,
      `Rien de ce qui peut guérir`
    ];
  }
}

export const contentQualityAnalyzer = new ContentQualityAnalyzer();