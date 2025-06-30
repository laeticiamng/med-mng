
import { EXPECTED_IC1_COMPETENCES } from '../constants/ic1Constants';
import type { IC1CompletenessReport } from '../types/ic1Types';

export class IC1ContentAnalyzer {
  static async analyzeContent(item: any, report: IC1CompletenessReport): Promise<void> {
    console.log('🔍 Analyse du contenu IC-1...');

    // Analyse Rang A
    if (item.content?.rang_a?.competences) {
      report.contentAnalysis.rangA.hasContent = true;
      report.contentAnalysis.rangA.competencesCount = item.content.rang_a.competences.length;
      
      const presentCompetences = item.content.rang_a.competences.map((c: any) => c.concept || c.titre);
      report.contentAnalysis.rangA.missingCompetences = EXPECTED_IC1_COMPETENCES.rangA.filter(
        expected => !presentCompetences.some((present: string) => 
          present.toLowerCase().includes(expected.toLowerCase().split(' ')[0])
        )
      );
    } else if (item.tableau_rang_a?.lignes) {
      // Format v1
      report.contentAnalysis.rangA.hasContent = true;
      report.contentAnalysis.rangA.competencesCount = item.tableau_rang_a.lignes.length;
      report.contentAnalysis.rangA.missingCompetences = EXPECTED_IC1_COMPETENCES.rangA;
    } else {
      report.isCompliant = false;
      report.missingElements.push('Rang A manquant ou vide');
      report.contentAnalysis.rangA.missingCompetences = EXPECTED_IC1_COMPETENCES.rangA;
    }

    // Analyse Rang B
    if (item.content?.rang_b?.competences) {
      report.contentAnalysis.rangB.hasContent = true;
      report.contentAnalysis.rangB.competencesCount = item.content.rang_b.competences.length;
      
      const presentCompetences = item.content.rang_b.competences.map((c: any) => c.concept || c.titre);
      report.contentAnalysis.rangB.missingCompetences = EXPECTED_IC1_COMPETENCES.rangB.filter(
        expected => !presentCompetences.some((present: string) => 
          present.toLowerCase().includes(expected.toLowerCase().split(' ')[0])
        )
      );
    } else if (item.tableau_rang_b?.lignes) {
      // Format v1
      report.contentAnalysis.rangB.hasContent = true;
      report.contentAnalysis.rangB.competencesCount = item.tableau_rang_b.lignes.length;
      report.contentAnalysis.rangB.missingCompetences = EXPECTED_IC1_COMPETENCES.rangB;
    } else {
      report.isCompliant = false;
      report.missingElements.push('Rang B manquant ou vide');
      report.contentAnalysis.rangB.missingCompetences = EXPECTED_IC1_COMPETENCES.rangB;
    }
  }
}
