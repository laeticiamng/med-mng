
import { IC2Report } from '../types/ic2Types';

export function logIC2Report(report: IC2Report): void {
  if (!import.meta.env.DEV) return;
  
  console.log('\n📊 RAPPORT DE COMPLÉTUDE IC-2');
  console.log('==================================');
  console.log(`📦 Item: ${report.itemCode} - ${report.title}`);
  console.log(`🎯 Complétude globale: ${report.completeness}%`);
  console.log(`📋 Rang A: ${report.rangA.found}/${report.rangA.expected} concepts`);
  console.log(`📋 Rang B: ${report.rangB.found}/${report.rangB.expected} concepts`);
  
  if (report.completeness === 100) {
    console.log('✅ Item IC-2 COMPLET à 100% selon E-LiSA');
  } else {
    console.log('⚠️ Item IC-2 INCOMPLET');
    console.log('\n💡 Recommandations:');
    report.recommendations.forEach(rec => console.log(`  • ${rec}`));
  }
}
