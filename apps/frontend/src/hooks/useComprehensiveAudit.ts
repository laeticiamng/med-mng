import logger from '@/lib/logger';
import { useState } from 'react';
import { ComprehensivePlatformAuditor, type ComprehensiveAuditReport } from '@shared/scripts/audit/comprehensiveAudit';

interface UseComprehensiveAuditResult {
  report: ComprehensiveAuditReport | null;
  loading: boolean;
  error: string | null;
  runAudit: () => Promise<void>;
  exportReport: (format: 'json' | 'markdown') => void;
}

export const useComprehensiveAudit = (): UseComprehensiveAuditResult => {
  const [report, setReport] = useState<ComprehensiveAuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      logger.debug('🔍 Lancement de l\'audit complet de la plateforme...');
      const auditReport = await ComprehensivePlatformAuditor.runComprehensiveAudit();
      setReport(auditReport);
      logger.debug('✅ Audit terminé avec succès');
      logger.debug(`📊 Score: ${auditReport.totalScore}/${auditReport.maxScore}`);
      logger.debug(`⚠️ ${auditReport.issues.length} problèmes détectés`);
    } catch (err) {
      logger.error('❌ Erreur lors de l\'audit:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue lors de l\'audit');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'json' | 'markdown') => {
    if (!report) {
      logger.warn('Aucun rapport à exporter');
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(report, null, 2);
      filename = `audit-complet-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      content = generateMarkdownReport(report);
      filename = `audit-complet-${new Date().toISOString().split('T')[0]}.md`;
      mimeType = 'text/markdown';
    }

    // Téléchargement du fichier
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logger.debug(`📄 Rapport ${format.toUpperCase()} exporté: ${filename}`);
  };

  return {
    report,
    loading,
    error,
    runAudit,
    exportReport
  };
};

function generateMarkdownReport(report: ComprehensiveAuditReport): string {
  const { totalScore, maxScore, issues, statistics, oicQuality, recommendations } = report;
  const percentage = ((totalScore / maxScore) * 100).toFixed(1);

  let md = `# 📊 AUDIT COMPLET DE LA PLATEFORME MED MNG\n\n`;
  md += `**Date**: ${new Date(report.timestamp).toLocaleString('fr-FR')}\n\n`;
  md += `---\n\n`;

  // Score global
  md += `## 🎯 SCORE GLOBAL\n\n`;
  md += `**${totalScore} / ${maxScore} points (${percentage}%)**\n\n`;
  
  if (totalScore >= 450) {
    md += `✅ **EXCELLENT** - La plateforme est en excellent état !\n\n`;
  } else if (totalScore >= 350) {
    md += `🟢 **BON** - Quelques améliorations mineures nécessaires\n\n`;
  } else if (totalScore >= 250) {
    md += `🟡 **MOYEN** - Plusieurs problèmes à corriger\n\n`;
  } else {
    md += `🔴 **CRITIQUE** - Actions urgentes requises\n\n`;
  }

  md += `---\n\n`;

  // Statistiques
  md += `## 📈 STATISTIQUES\n\n`;
  md += `| Métrique | Valeur | Pourcentage |\n`;
  md += `|----------|--------|-------------|\n`;
  md += `| Items totaux | ${statistics.totalItems} | 100% |\n`;
  md += `| Items avec sections Rang A | ${statistics.itemsWithRangA} | ${((statistics.itemsWithRangA / statistics.totalItems) * 100).toFixed(1)}% |\n`;
  md += `| Items avec sections Rang B | ${statistics.itemsWithRangB} | ${((statistics.itemsWithRangB / statistics.totalItems) * 100).toFixed(1)}% |\n`;
  md += `| Items avec compétences OIC Rang A | ${statistics.itemsWithOICCompetencesA} | ${((statistics.itemsWithOICCompetencesA / statistics.totalItems) * 100).toFixed(1)}% |\n`;
  md += `| Items avec compétences OIC Rang B | ${statistics.itemsWithOICCompetencesB} | ${((statistics.itemsWithOICCompetencesB / statistics.totalItems) * 100).toFixed(1)}% |\n`;
  md += `| Items 100% complets | ${statistics.itemsComplete} | ${((statistics.itemsComplete / statistics.totalItems) * 100).toFixed(1)}% |\n\n`;

  // Qualité OIC
  md += `## 🎓 QUALITÉ DES COMPÉTENCES OIC\n\n`;
  md += `| Métrique | Valeur |\n`;
  md += `|----------|--------|\n`;
  md += `| Total compétences OIC | ${oicQuality.totalOICCompetences} |\n`;
  md += `| Compétences Rang A de qualité | ${oicQuality.qualityCompetencesA} |\n`;
  md += `| Compétences Rang B de qualité | ${oicQuality.qualityCompetencesB} |\n`;
  md += `| Items couverts Rang A | ${oicQuality.itemsCoveredA} / 367 |\n`;
  md += `| Items couverts Rang B | ${oicQuality.itemsCoveredB} / 367 |\n\n`;

  // Problèmes par sévérité
  md += `## ⚠️ PROBLÈMES DÉTECTÉS\n\n`;
  
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highIssues = issues.filter(i => i.severity === 'high');
  const mediumIssues = issues.filter(i => i.severity === 'medium');
  const lowIssues = issues.filter(i => i.severity === 'low');

  md += `- 🔴 **Critiques**: ${criticalIssues.length}\n`;
  md += `- 🟠 **Élevés**: ${highIssues.length}\n`;
  md += `- 🟡 **Moyens**: ${mediumIssues.length}\n`;
  md += `- 🔵 **Faibles**: ${lowIssues.length}\n\n`;

  if (criticalIssues.length > 0) {
    md += `### 🔴 Problèmes Critiques\n\n`;
    criticalIssues.forEach(issue => {
      md += `- **${issue.issue}**\n`;
      if (issue.itemCode) md += `  - Item: ${issue.itemCode}\n`;
      if (issue.details) md += `  - Détails: ${issue.details}\n`;
      if (issue.fix) md += `  - Solution: ${issue.fix}\n`;
      md += `\n`;
    });
  }

  if (highIssues.length > 0) {
    md += `### 🟠 Problèmes Élevés\n\n`;
    // Grouper par catégorie
    const byCategory = new Map<string, typeof highIssues>();
    highIssues.forEach(issue => {
      const category = issue.category;
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push(issue);
    });

    byCategory.forEach((categoryIssues, category) => {
      md += `#### ${category} (${categoryIssues.length})\n\n`;
      // Afficher seulement les 10 premiers pour ne pas surcharger
      const displayIssues = categoryIssues.slice(0, 10);
      displayIssues.forEach(issue => {
        md += `- ${issue.issue}`;
        if (issue.itemCode) md += ` (${issue.itemCode})`;
        md += `\n`;
      });
      if (categoryIssues.length > 10) {
        md += `\n*... et ${categoryIssues.length - 10} autres*\n\n`;
      }
      md += `\n`;
    });
  }

  // Recommandations
  md += `---\n\n`;
  md += `## 🎯 RECOMMANDATIONS\n\n`;
  recommendations.forEach((rec, index) => {
    md += `${index + 1}. ${rec}\n\n`;
  });

  md += `---\n\n`;
  md += `*Rapport généré le ${new Date().toLocaleString('fr-FR')}*\n`;

  return md;
}
