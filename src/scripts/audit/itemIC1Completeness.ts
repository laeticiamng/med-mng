
import { supabase } from '@/integrations/supabase/client';
import type { IC1CompletenessReport } from './types/ic1Types';
import { IC1Validator } from './validators/ic1Validator';
import { IC1ContentAnalyzer } from './analyzers/ic1ContentAnalyzer';
import { IC1MedicalContentChecker } from './analyzers/ic1MedicalContentChecker';
import { IC1RecommendationsGenerator } from './generators/ic1RecommendationsGenerator';
import { IC1ReportDisplayer } from './utils/ic1ReportDisplayer';

export class IC1CompletenessAuditor {
  
  static async auditIC1Completeness(): Promise<IC1CompletenessReport> {
    console.log('🔍 Audit de complétude IC-1 - Relation médecin-malade...');
    
    try {
      // Récupération de l'item IC-1
      const { data: ic1Item, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .or('item_code.eq.IC-1,item_code.eq.IC-001,slug.eq.ic-1,slug.eq.relation-medecin-malade')
        .single();

      if (error || !ic1Item) {
        return this.createErrorReport();
      }

      console.log('📦 Item IC-1 trouvé:', ic1Item.item_code || ic1Item.slug);

      const report = this.initializeReport();

      // 1. Validation du format
      IC1Validator.validateFormat(ic1Item, report);

      // 2. Analyse du contenu
      await IC1ContentAnalyzer.analyzeContent(ic1Item, report);

      // 3. Vérification du contenu médical spécifique
      IC1MedicalContentChecker.checkMedicalContent(ic1Item, report);

      // 4. Génération des recommandations
      IC1RecommendationsGenerator.generateRecommendations(report);

      return report;

    } catch (error) {
      console.error('❌ Erreur lors de l\'audit IC-1:', error);
      throw error;
    }
  }

  private static createErrorReport(): IC1CompletenessReport {
    return {
      isCompliant: false,
      missingElements: ['Item IC-1 non trouvé dans la base de données'],
      contentAnalysis: {
        rangA: { hasContent: false, competencesCount: 0, missingCompetences: [] },
        rangB: { hasContent: false, competencesCount: 0, missingCompetences: [] }
      },
      medicalContentCheck: {
        hasRelationMedecinMalade: false,
        hasCorpsHumainDimensions: false,
        hasMaladiesImpact: false,
        hasPratiquesCliniques: false
      },
      recommendations: ['Créer l\'item IC-1 avec le contenu médical approprié']
    };
  }

  private static initializeReport(): IC1CompletenessReport {
    return {
      isCompliant: true,
      missingElements: [],
      contentAnalysis: {
        rangA: { hasContent: false, competencesCount: 0, missingCompetences: [] },
        rangB: { hasContent: false, competencesCount: 0, missingCompetences: [] }
      },
      medicalContentCheck: {
        hasRelationMedecinMalade: false,
        hasCorpsHumainDimensions: false,
        hasMaladiesImpact: false,
        hasPratiquesCliniques: false
      },
      recommendations: []
    };
  }

  static displayReport(report: IC1CompletenessReport): void {
    IC1ReportDisplayer.displayReport(report);
  }
}

// Export pour utilisation en script standalone
export async function runIC1CompletenessAudit(): Promise<IC1CompletenessReport> {
  try {
    const report = await IC1CompletenessAuditor.auditIC1Completeness();
    IC1CompletenessAuditor.displayReport(report);
    return report;
  } catch (error) {
    console.error('❌ Échec de l\'audit IC-1:', error);
    throw error;
  }
}

// Export types for external use
export type { IC1CompletenessReport };
