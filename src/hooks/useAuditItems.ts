
import { useState } from 'react';
import { EDNItemsAuditor, AuditReportGenerators } from '@/scripts/auditItems';
import type { AuditResult, AuditReport } from '@/scripts/auditItems';

interface UseAuditItemsResult {
  report: AuditReport | null;
  loading: boolean;
  error: string | null;
  runAudit: () => Promise<void>;
  exportReport: (format: 'json' | 'markdown') => void;
}

export const useAuditItems = (): UseAuditItemsResult => {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Lancement de l\'audit des items EDN...');
      const auditReport = await EDNItemsAuditor.auditAllItems();
      setReport(auditReport);
      console.log('✅ Audit terminé avec succès');
    } catch (err) {
      console.error('❌ Erreur lors de l\'audit:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue lors de l\'audit');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'json' | 'markdown') => {
    if (!report) {
      console.warn('Aucun rapport à exporter');
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = AuditReportGenerators.generateJSONReport(report);
      filename = `audit-edn-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      content = AuditReportGenerators.generateMarkdownReport(report);
      filename = `audit-edn-${new Date().toISOString().split('T')[0]}.md`;
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

    console.log(`📄 Rapport ${format.toUpperCase()} exporté: ${filename}`);
  };

  return {
    report,
    loading,
    error,
    runAudit,
    exportReport
  };
};
