import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FieldAnalysis {
  field: string;
  status: 'empty' | 'incomplete' | 'partial' | 'complete' | 'missing';
  length: number;
  expectedLength: number;
  completenessRatio: number;
  issues: string[];
}

interface CompetenceAnalysis {
  id: string;
  titre: string;
  completeness: number;
  missingFields: string[];
  partialFields: string[];
  emptyFields: string[];
  fieldAnalysis: Record<string, FieldAnalysis>;
  recommendations: Recommendation[];
}

interface Recommendation {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
  message: string;
}

interface AnalysisResults {
  total: number;
  incomplete: CompetenceAnalysis[];
  critical: CompetenceAnalysis[];
  needsAttention: CompetenceAnalysis[];
  complete: CompetenceAnalysis[];
  statistics: {
    averageCompleteness: number;
    criticalCount: number;
    incompleteCount: number;
    completeCount: number;
  };
}

export const useContentCompletenessChecker = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requiredFields = [
    'intitule', 'description', 'rubrique', 'titre_complet', 
    'sommaire', 'mecanismes', 'indications', 'effets_indesirables', 
    'interactions', 'modalites_surveillance', 'causes_echec', 'contributeurs'
  ];
  const minimumCompleteness = 20;

  const analyzeField = (fieldName: string, value: any): FieldAnalysis => {
    const analysis: FieldAnalysis = {
      field: fieldName,
      status: 'empty',
      length: 0,
      expectedLength: 0,
      completenessRatio: 0,
      issues: []
    };

    if (!value || value.toString().trim() === '') {
      analysis.status = 'empty';
      analysis.issues.push('Champ vide');
      return analysis;
    }

    const cleanValue = value.toString().trim();
    analysis.length = cleanValue.length;

    const expectedLengths: Record<string, number> = {
      'intitule': 100,
      'description': 300,
      'rubrique': 50,
      'titre_complet': 150,
      'sommaire': 400,
      'mecanismes': 300,
      'indications': 250,
      'effets_indesirables': 200,
      'interactions': 200,
      'modalites_surveillance': 250,
      'causes_echec': 200,
      'contributeurs': 100
    };

    analysis.expectedLength = expectedLengths[fieldName] || 100;
    analysis.completenessRatio = (cleanValue.length / analysis.expectedLength) * 100;

    if (analysis.completenessRatio >= 80) {
      analysis.status = 'complete';
    } else if (analysis.completenessRatio >= 30) {
      analysis.status = 'partial';
      analysis.issues.push(`Contenu partiel (${Math.round(analysis.completenessRatio)}%)`);
    } else {
      analysis.status = 'incomplete';
      analysis.issues.push(`Contenu très incomplet (${Math.round(analysis.completenessRatio)}%)`);
    }

    // Détecter les contenus génériques
    const placeholders = [
      'lorem ipsum', 'text here', 'à compléter', 'todo', 'tbd',
      'exemple', 'description', 'titre', '...', 'etc',
      'expertise de base', 'expertise avancée', 'communication - éthique'
    ];
    
    const lowerContent = cleanValue.toLowerCase();
    for (const placeholder of placeholders) {
      if (lowerContent.includes(placeholder)) {
        analysis.issues.push(`Contenu générique détecté: "${placeholder}"`);
        analysis.status = 'incomplete';
      }
    }

    return analysis;
  };

  const analyzeCompleteness = (competence: any): CompetenceAnalysis => {
    const analysis: CompetenceAnalysis = {
      id: competence.objectif_id || competence.id,
      titre: competence.intitule || 'Sans titre',
      completeness: 0,
      missingFields: [],
      partialFields: [],
      emptyFields: [],
      fieldAnalysis: {},
      recommendations: []
    };

    let totalFields = 0;
    let completedFields = 0;

    for (const field of requiredFields) {
      totalFields++;
      const value = competence[field];
      const fieldAnalysis = analyzeField(field, value);
      analysis.fieldAnalysis[field] = fieldAnalysis;

      if (fieldAnalysis.status === 'complete') {
        completedFields++;
      } else if (fieldAnalysis.status === 'missing') {
        analysis.missingFields.push(field);
      } else if (fieldAnalysis.status === 'partial') {
        analysis.partialFields.push(field);
        completedFields += 0.5;
      } else {
        analysis.emptyFields.push(field);
      }
    }

    analysis.completeness = Math.round((completedFields / totalFields) * 100);
    analysis.recommendations = generateRecommendations(analysis);

    return analysis;
  };

  const generateRecommendations = (analysis: CompetenceAnalysis): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    if (analysis.completeness < minimumCompleteness) {
      recommendations.push({
        priority: 'HIGH',
        action: 'URGENT_COMPLETION',
        message: `Compétence très incomplète (${analysis.completeness}%). Nécessite une attention immédiate.`
      });
    }

    if (analysis.emptyFields.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'FILL_REQUIRED_FIELDS',
        message: `Remplir les champs obligatoires: ${analysis.emptyFields.join(', ')}`
      });
    }

    if (analysis.partialFields.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'COMPLETE_PARTIAL_FIELDS',
        message: `Compléter les champs partiels: ${analysis.partialFields.join(', ')}`
      });
    }

    return recommendations;
  };

  const analyzeAllCompetences = async (): Promise<AnalysisResults> => {
    console.log('🔍 Début de l\'analyse de complétude des compétences OIC...');
    
    try {
      const { data: oicData, error } = await supabase
        .from('oic_competences')
        .select('*');

      if (error) throw error;

      console.log(`📊 ${oicData.length} compétences OIC à analyser`);

      const results: AnalysisResults = {
        total: oicData.length,
        incomplete: [],
        critical: [],
        needsAttention: [],
        complete: [],
        statistics: {
          averageCompleteness: 0,
          criticalCount: 0,
          incompleteCount: 0,
          completeCount: 0
        }
      };

      let totalCompleteness = 0;

      for (const competence of oicData) {
        const analysis = analyzeCompleteness(competence);
        totalCompleteness += analysis.completeness;

        if (analysis.completeness < minimumCompleteness) {
          results.critical.push(analysis);
          results.statistics.criticalCount++;
        } else if (analysis.completeness < 70) {
          results.incomplete.push(analysis);
          results.statistics.incompleteCount++;
        } else if (analysis.completeness < 90) {
          results.needsAttention.push(analysis);
        } else {
          results.complete.push(analysis);
          results.statistics.completeCount++;
        }
      }

      results.statistics.averageCompleteness = Math.round(totalCompleteness / oicData.length);

      console.log('✅ Analyse terminée');
      return results;

    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error);
      throw error;
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysisResults = await analyzeAllCompetences();
      setResults(analysisResults);
      console.log('🎉 Analyse de complétude terminée avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('💥 Erreur durant l\'analyse:', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    results,
    error,
    runAnalysis
  };
};