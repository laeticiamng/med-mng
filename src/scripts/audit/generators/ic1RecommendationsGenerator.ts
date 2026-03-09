
import type { IC1CompletenessReport } from '../types/ic1Types';

export class IC1RecommendationsGenerator {
  static generateRecommendations(report: IC1CompletenessReport): void {
    if (import.meta.env.DEV) console.log('💡 Génération des recommandations...');
    
    if (!report.medicalContentCheck.hasRelationMedecinMalade) {
      report.recommendations.push('Ajouter du contenu sur la relation médecin-malade');
    }
    
    if (!report.medicalContentCheck.hasCorpsHumainDimensions) {
      report.recommendations.push('Inclure les dimensions humaines du corps (alimentation, activité physique, genre, procréation)');
    }
    
    if (!report.medicalContentCheck.hasMaladiesImpact) {
      report.recommendations.push('Développer l\'impact des maladies sur l\'expérience corporelle');
    }
    
    if (!report.medicalContentCheck.hasPratiquesCliniques) {
      report.recommendations.push('Ajouter les pratiques cliniques (palpation, imagerie, analyses biologiques)');
    }

    if (report.contentAnalysis.rangA.competencesCount < 3) {
      report.recommendations.push('Rang A: Ajouter plus de compétences (minimum 3-4 attendues)');
    }

    if (report.contentAnalysis.rangB.competencesCount < 3) {
      report.recommendations.push('Rang B: Ajouter plus de compétences (minimum 3-4 attendues)');
    }

    if (report.contentAnalysis.rangA.missingCompetences.length > 0) {
      report.recommendations.push(`Rang A manque: ${report.contentAnalysis.rangA.missingCompetences.join(', ')}`);
    }

    if (report.contentAnalysis.rangB.missingCompetences.length > 0) {
      report.recommendations.push(`Rang B manque: ${report.contentAnalysis.rangB.missingCompetences.join(', ')}`);
    }
  }
}
