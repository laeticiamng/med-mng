
import { AuditReport } from './types';

export class AuditReportGenerators {
  // Génération du rapport Markdown
  static generateMarkdownReport(report: AuditReport): string {
    const date = new Date(report.timestamp).toLocaleString('fr-FR');
    
    let markdown = `# Rapport d'Audit EDN Items\n\n`;
    markdown += `**Date:** ${date}\n\n`;
    markdown += `## Résumé\n\n`;
    markdown += `- **Total items:** ${report.totalItems}\n`;
    markdown += `- **Items valides:** ${report.validItems} (${Math.round(report.validItems/report.totalItems*100)}%)\n`;
    markdown += `- **Items invalides:** ${report.invalidItems}\n`;
    markdown += `- **Erreurs d'audit:** ${report.errorItems}\n\n`;

    markdown += `## Détail par item\n\n`;
    
    for (const result of report.results) {
      const statusEmoji = result.status === 'valid' ? '✅' : result.status === 'invalid' ? '⚠️' : '❌';
      const formatBadge = result.isV2Format ? '`v2`' : '`v1`';
      
      markdown += `### ${statusEmoji} ${result.item_code} ${formatBadge}\n\n`;
      markdown += `- **Slug:** ${result.slug}\n`;
      markdown += `- **Statut:** ${result.status}\n`;
      
      // Complétude
      markdown += `- **Complétude:**\n`;
      markdown += `  - Rang A: ${result.completeness.rangA ? '✅' : '❌'}\n`;
      markdown += `  - Rang B: ${result.completeness.rangB ? '✅' : '❌'}\n`;
      markdown += `  - Paroles musicales: ${result.completeness.parolesMusicales ? '✅' : '⚠️'}\n`;
      markdown += `  - Config génération: ${result.completeness.generationConfig ? '✅' : '⚠️'}\n`;
      
      // Erreurs
      if (result.errors.length > 0) {
        markdown += `- **Erreurs:**\n`;
        for (const error of result.errors) {
          markdown += `  - ${error}\n`;
        }
      }
      
      // Avertissements
      if (result.warnings.length > 0) {
        markdown += `- **Avertissements:**\n`;
        for (const warning of result.warnings) {
          markdown += `  - ${warning}\n`;
        }
      }
      
      markdown += '\n';
    }

    return markdown;
  }

  // Génération du rapport JSON
  static generateJSONReport(report: AuditReport): string {
    return JSON.stringify(report, null, 2);
  }
}
