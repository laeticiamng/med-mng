
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle, Download, FileText } from 'lucide-react';
import type { AuditReport } from '@/scripts/audit/types';

interface AuditHeaderProps {
  loading: boolean;
  report: AuditReport | null;
  onRunAudit: () => void;
  onExportReport: (format: 'json' | 'markdown') => void;
}

export const AuditHeader = ({ loading, report, onRunAudit, onExportReport }: AuditHeaderProps) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Audit & Conformité EDN Items
        </h1>
        <p className="text-gray-600">
          Vérification de la conformité des items EDN au schéma v2 et contrôles de qualité
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          onClick={onRunAudit} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          {loading ? 'Audit en cours...' : 'Lancer l\'audit'}
        </Button>

        {report && (
          <>
            <Button 
              variant="outline"
              onClick={() => onExportReport('json')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            <Button 
              variant="outline"
              onClick={() => onExportReport('markdown')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export Markdown
            </Button>
          </>
        )}
      </div>
    </>
  );
};
