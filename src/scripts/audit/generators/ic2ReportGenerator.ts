
import { IC2Report } from '../types/ic2Types';

export function generateRecommendations(report: IC2Report): string[] {
  const recommendations: string[] = [];

  if (report.rangA.found < report.rangA.expected) {
    recommendations.push(`Rang A: ${report.rangA.expected - report.rangA.found} concepts manquants`);
    report.rangA.missingConcepts.forEach(concept => {
      recommendations.push(`Ajouter : ${concept}`);
    });
  }
  
  if (report.rangB.found < report.rangB.expected) {
    recommendations.push(`Rang B: ${report.rangB.expected - report.rangB.found} concepts manquants`);
    report.rangB.missingConcepts.forEach(concept => {
      recommendations.push(`Ajouter : ${concept}`);
    });
  }

  if (report.completeness < 100) {
    recommendations.push('Mettre à jour l\'item IC-2 selon le référentiel E-LiSA officiel');
  }

  return recommendations;
}

export function calculateCompleteness(rangAFound: number, rangBFound: number, totalExpected: number): number {
  const totalFound = rangAFound + rangBFound;
  return Math.round((totalFound / totalExpected) * 100);
}
