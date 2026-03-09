
import type { IC1CompletenessReport } from '../types/ic1Types';

export class IC1MedicalContentChecker {
  static checkMedicalContent(item: any, report: IC1CompletenessReport): void {
    if (import.meta.env.DEV) console.log('🏥 Vérification du contenu médical IC-1...');
    
    const fullContent = this.extractAllContent(item).toLowerCase();
    
    // Vérification plus précise des thèmes médicaux
    report.medicalContentCheck.hasRelationMedecinMalade = this.checkRelationMedecinMalade(fullContent);
    report.medicalContentCheck.hasCorpsHumainDimensions = this.checkCorpsHumainDimensions(fullContent);
    report.medicalContentCheck.hasMaladiesImpact = this.checkMaladiesImpact(fullContent);
    report.medicalContentCheck.hasPratiquesCliniques = this.checkPratiquesCliniques(fullContent);

    // Calcul du score médical
    const medicalChecks = Object.values(report.medicalContentCheck);
    const medicalScore = medicalChecks.filter(Boolean).length / medicalChecks.length;
    
    console.log(`🏥 Score médical: ${Math.round(medicalScore * 100)}%`);

    if (medicalScore < 0.75) {
      report.isCompliant = false;
      report.missingElements.push(`Contenu médical IC-1 incomplet (${Math.round(medicalScore * 100)}% seulement)`);
    }
  }

  private static extractAllContent(item: any): string {
    const contents = [];
    
    // Titre et descriptions
    if (item.title) contents.push(item.title);
    if (item.subtitle) contents.push(item.subtitle);
    if (item.pitch_intro) contents.push(item.pitch_intro);
    
    // Contenu structuré v2
    if (item.content?.rang_a?.competences) {
      item.content.rang_a.competences.forEach((c: any) => {
        if (c.concept) contents.push(c.concept);
        if (c.definition) contents.push(c.definition);
        if (c.exemple) contents.push(c.exemple);
        if (c.application) contents.push(c.application);
      });
    }
    
    if (item.content?.rang_b?.competences) {
      item.content.rang_b.competences.forEach((c: any) => {
        if (c.concept) contents.push(c.concept);
        if (c.definition) contents.push(c.definition);
        if (c.exemple) contents.push(c.exemple);
        if (c.application) contents.push(c.application);
      });
    }
    
    // Contenu v1/legacy
    if (item.tableau_rang_a?.lignes) {
      item.tableau_rang_a.lignes.forEach((ligne: any) => {
        if (typeof ligne === 'object') {
          Object.values(ligne).forEach(val => {
            if (typeof val === 'string') contents.push(val);
          });
        }
      });
    }
    
    if (item.tableau_rang_b?.lignes) {
      item.tableau_rang_b.lignes.forEach((ligne: any) => {
        if (typeof ligne === 'object') {
          Object.values(ligne).forEach(val => {
            if (typeof val === 'string') contents.push(val);
          });
        }
      });
    }
    
    // Paroles musicales
    if (item.paroles_musicales) {
      contents.push(...item.paroles_musicales);
    }
    
    return contents.join(' ');
  }

  private static checkRelationMedecinMalade(content: string): boolean {
    const indicators = [
      'relation médecin',
      'relation medecin',
      'médecin-malade',
      'medecin-malade',
      'alliance thérapeutique',
      'alliance therapeutique',
      'empathie clinique',
      'communication patient',
      'approche centrée',
      'approche centree'
    ];
    
    return indicators.some(indicator => content.includes(indicator));
  }

  private static checkCorpsHumainDimensions(content: string): boolean {
    const indicators = [
      'corps humain',
      'dimension corporelle',
      'expérience corporelle',
      'experience corporelle',
      'alimentation',
      'activité physique',
      'activite physique',
      'genre',
      'procréation',
      'procreation',
      'sexualité',
      'sexualite'
    ];
    
    return indicators.some(indicator => content.includes(indicator));
  }

  private static checkMaladiesImpact(content: string): boolean {
    const indicators = [
      'impact maladie',
      'maladie impact',
      'expérience maladie',
      'experience maladie',
      'vécu maladie',
      'vecu maladie',
      'représentation maladie',
      'representation maladie',
      'ajustement stress',
      'coping'
    ];
    
    return indicators.some(indicator => content.includes(indicator));
  }

  private static checkPratiquesCliniques(content: string): boolean {
    const indicators = [
      'pratique clinique',
      'palpation',
      'imagerie',
      'analyse biologique',
      'examen clinique',
      'diagnostic',
      'thérapeutique',
      'therapeutique',
      'prescription',
      'consultation'
    ];
    
    return indicators.some(indicator => content.includes(indicator));
  }
}
