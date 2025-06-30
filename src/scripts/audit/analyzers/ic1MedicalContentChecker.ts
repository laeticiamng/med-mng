
import type { IC1CompletenessReport } from '../types/ic1Types';

export class IC1MedicalContentChecker {
  static checkMedicalContent(item: any, report: IC1CompletenessReport): void {
    console.log('🏥 Vérification du contenu médical IC-1...');
    
    const fullContent = JSON.stringify(item).toLowerCase();
    
    // Vérification des thèmes médicaux essentiels
    report.medicalContentCheck.hasRelationMedecinMalade = 
      fullContent.includes('relation') && 
      (fullContent.includes('médecin') || fullContent.includes('medecin')) &&
      fullContent.includes('malade');

    report.medicalContentCheck.hasCorpsHumainDimensions = 
      fullContent.includes('corps') && 
      (fullContent.includes('dimension') || fullContent.includes('alimentation') || fullContent.includes('physique'));

    report.medicalContentCheck.hasMaladiesImpact = 
      fullContent.includes('maladie') && 
      (fullContent.includes('impact') || fullContent.includes('expérience') || fullContent.includes('experience'));

    report.medicalContentCheck.hasPratiquesCliniques = 
      fullContent.includes('pratique') && 
      (fullContent.includes('clinique') || fullContent.includes('palpation') || fullContent.includes('imagerie'));

    // Vérifier si tous les aspects médicaux sont couverts
    const medicalChecks = Object.values(report.medicalContentCheck);
    if (!medicalChecks.every(check => check)) {
      report.isCompliant = false;
      report.missingElements.push('Contenu médical incomplet pour IC-1');
    }
  }
}
