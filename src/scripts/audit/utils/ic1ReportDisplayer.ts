
import type { IC1CompletenessReport } from '../types/ic1Types';

export class IC1ReportDisplayer {
  static displayReport(report: IC1CompletenessReport): void {
    console.log('\n📋 RAPPORT DE COMPLÉTUDE IC-1');
    console.log('================================');
    
    console.log(`\n✅ Conformité globale: ${report.isCompliant ? 'OUI' : 'NON'}`);
    
    if (report.missingElements.length > 0) {
      console.log('\n❌ Éléments manquants:');
      report.missingElements.forEach(element => console.log(`  • ${element}`));
    }

    console.log('\n📊 Analyse du contenu:');
    console.log(`  Rang A: ${report.contentAnalysis.rangA.competencesCount} compétences`);
    console.log(`  Rang B: ${report.contentAnalysis.rangB.competencesCount} compétences`);

    console.log('\n🏥 Contenu médical:');
    console.log(`  Relation médecin-malade: ${report.medicalContentCheck.hasRelationMedecinMalade ? '✅' : '❌'}`);
    console.log(`  Dimensions du corps: ${report.medicalContentCheck.hasCorpsHumainDimensions ? '✅' : '❌'}`);
    console.log(`  Impact des maladies: ${report.medicalContentCheck.hasMaladiesImpact ? '✅' : '❌'}`);
    console.log(`  Pratiques cliniques: ${report.medicalContentCheck.hasPratiquesCliniques ? '✅' : '❌'}`);

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommandations:');
      report.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }
  }
}
