
import { checkIC2Completeness } from './ic2CompletenessCheck';

export async function runAndDisplayIC2Audit() {
  console.log('🚀 Lancement de l\'audit IC-2...');
  
  try {
    const report = await checkIC2Completeness();
    
    console.log('\n📊 RÉSULTATS DE L\'AUDIT IC-2');
    console.log('=====================================');
    
    if (!report.exists) {
      console.log('❌ Item IC-2 non trouvé dans la base de données');
      return report;
    }
    
    console.log(`📦 Item: ${report.itemCode} - ${report.title}`);
    console.log(`🎯 Complétude: ${report.completeness}%`);
    console.log(`📋 Rang A: ${report.rangA.found}/${report.rangA.expected} concepts`);
    console.log(`🎯 Rang B: ${report.rangB.found}/${report.rangB.expected} concepts`);
    
    if (report.completeness < 100) {
      console.log('\n⚠️ ÉLÉMENTS MANQUANTS:');
      report.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
      
      console.log('\n📝 CONCEPTS MANQUANTS RANG A:');
      report.rangA.missingConcepts.forEach(concept => {
        console.log(`  ❌ ${concept}`);
      });
      
      console.log('\n📝 CONCEPTS MANQUANTS RANG B:');
      report.rangB.missingConcepts.forEach(concept => {
        console.log(`  ❌ ${concept}`);
      });
    } else {
      console.log('✅ Item IC-2 COMPLET à 100%');
    }
    
    return report;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit IC-2:', error);
    throw error;
  }
}
