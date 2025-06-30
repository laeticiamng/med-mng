
import { EDNItemsAuditor } from './audit/auditor';
import { AuditReportGenerators } from './audit/reportGenerators';

// Export des classes principales pour compatibilité
export { EDNItemsAuditor } from './audit/auditor';
export { AuditReportGenerators } from './audit/reportGenerators';
export type { AuditResult, AuditReport } from './audit/types';

// Fonction principale pour utilisation en script
export async function runAudit() {
  try {
    console.log('🚀 Lancement de l\'audit EDN Items...');
    const report = await EDNItemsAuditor.auditAllItems();
    
    console.log('\n📊 RAPPORT D\'AUDIT');
    console.log('==================');
    console.log(`Total: ${report.totalItems} items`);
    console.log(`Valides: ${report.validItems} items`);
    console.log(`Invalides: ${report.invalidItems} items`);
    console.log(`Erreurs: ${report.errorItems} items`);
    
    // Génération des rapports
    const markdownReport = AuditReportGenerators.generateMarkdownReport(report);
    const jsonReport = AuditReportGenerators.generateJSONReport(report);
    
    console.log('\n📄 Rapport Markdown généré');
    console.log('\n📄 Rapport JSON généré');
    
    return {
      report,
      markdown: markdownReport,
      json: jsonReport
    };
    
  } catch (error) {
    console.error('❌ Échec de l\'audit:', error);
    throw error;
  }
}
