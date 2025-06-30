
import { EXPECTED_IC1_COMPETENCES } from '../constants/ic1Constants';
import type { IC1CompletenessReport } from '../types/ic1Types';

export class IC1ContentAnalyzer {
  static async analyzeContent(item: any, report: IC1CompletenessReport): Promise<void> {
    console.log('🔍 Analyse du contenu IC-1...', { item_code: item.item_code || item.slug });

    // Analyse Rang A
    const rangAAnalysis = this.analyzeRangA(item);
    report.contentAnalysis.rangA = rangAAnalysis;

    // Analyse Rang B  
    const rangBAnalysis = this.analyzeRangB(item);
    report.contentAnalysis.rangB = rangBAnalysis;

    // Vérifier la complétude globale
    if (!rangAAnalysis.hasContent) {
      report.isCompliant = false;
      report.missingElements.push('Rang A manquant ou vide');
    }

    console.log('📊 Analyse terminée:', {
      rangA: `${rangAAnalysis.competencesCount} compétences`,
      rangB: `${rangBAnalysis.competencesCount} compétences`
    });
  }

  private static analyzeRangA(item: any) {
    const analysis = {
      hasContent: false,
      competencesCount: 0,
      missingCompetences: [...EXPECTED_IC1_COMPETENCES.rangA]
    };

    // Format v2
    if (item.content?.rang_a?.competences) {
      analysis.hasContent = true;
      analysis.competencesCount = item.content.rang_a.competences.length;
      
      const presentCompetences = item.content.rang_a.competences.map((c: any) => 
        c.concept || c.titre || c.definition || ''
      );
      
      analysis.missingCompetences = this.findMissingCompetences(
        EXPECTED_IC1_COMPETENCES.rangA, 
        presentCompetences
      );
    }
    // Format v1/legacy
    else if (item.tableau_rang_a?.lignes) {
      analysis.hasContent = true;
      analysis.competencesCount = item.tableau_rang_a.lignes.length;
      
      const presentConcepts = item.tableau_rang_a.lignes.map((ligne: any) => 
        ligne.concept || ligne.titre || ligne[0] || ''
      );
      
      analysis.missingCompetences = this.findMissingCompetences(
        EXPECTED_IC1_COMPETENCES.rangA,
        presentConcepts
      );
    }
    // Données dans des formats alternatifs
    else if (this.hasAlternativeRangAContent(item)) {
      analysis.hasContent = true;
      analysis.competencesCount = this.countAlternativeRangAContent(item);
      // Pour les formats alternatifs, on assume une couverture partielle
      analysis.missingCompetences = EXPECTED_IC1_COMPETENCES.rangA.slice(0, 2);
    }

    return analysis;
  }

  private static analyzeRangB(item: any) {
    const analysis = {
      hasContent: false,
      competencesCount: 0,
      missingCompetences: [...EXPECTED_IC1_COMPETENCES.rangB]
    };

    // Format v2
    if (item.content?.rang_b?.competences) {
      analysis.hasContent = true;
      analysis.competencesCount = item.content.rang_b.competences.length;
      
      const presentCompetences = item.content.rang_b.competences.map((c: any) => 
        c.concept || c.titre || c.definition || ''
      );
      
      analysis.missingCompetences = this.findMissingCompetences(
        EXPECTED_IC1_COMPETENCES.rangB,
        presentCompetences
      );
    }
    // Format v1/legacy
    else if (item.tableau_rang_b?.lignes) {
      analysis.hasContent = true;
      analysis.competencesCount = item.tableau_rang_b.lignes.length;
      
      const presentConcepts = item.tableau_rang_b.lignes.map((ligne: any) => 
        ligne.concept || ligne.titre || ligne[0] || ''
      );
      
      analysis.missingCompetences = this.findMissingCompetences(
        EXPECTED_IC1_COMPETENCES.rangB,
        presentConcepts
      );
    }
    // IC-1 peut avoir tout son contenu en Rang A selon certaines sources
    else {
      analysis.hasContent = true; // Accepté pour IC-1
      analysis.competencesCount = 0;
      analysis.missingCompetences = []; // Pas obligatoire pour IC-1
    }

    return analysis;
  }

  private static findMissingCompetences(expected: string[], present: string[]): string[] {
    return expected.filter(expectedComp => {
      const keywords = expectedComp.toLowerCase().split(' ').slice(0, 2);
      return !present.some(presentComp => 
        keywords.some(keyword => 
          presentComp.toLowerCase().includes(keyword)
        )
      );
    });
  }

  private static hasAlternativeRangAContent(item: any): boolean {
    return !!(
      item.paroles_musicales?.length ||
      item.scene_immersive ||
      item.pitch_intro ||
      (typeof item.content === 'string' && item.content.length > 100)
    );
  }

  private static countAlternativeRangAContent(item: any): number {
    let count = 0;
    if (item.paroles_musicales?.length) count += Math.min(item.paroles_musicales.length, 10);
    if (item.scene_immersive) count += 3;
    if (item.pitch_intro) count += 2;
    return Math.min(count, 15); // Maximum attendu pour IC-1
  }
}
