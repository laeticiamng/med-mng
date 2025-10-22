
import React from 'react';
import { useAuditItems } from '@/hooks/useAuditItems';
import { AuditHeader } from './AuditHeader';
import { AuditErrorDisplay } from './AuditErrorDisplay';
import { AuditOverview } from './AuditOverview';
import { AuditProgress } from './AuditProgress';
import { AuditItemsList } from './AuditItemsList';
import { AuditInstructions } from './AuditInstructions';
import { AuditIC2CompletionDashboard } from './AuditIC2CompletionDashboard';
import { OICRegenerationPanel } from './OICRegenerationPanel';

export const AuditDashboard = () => {
  const { report, loading, error, runAudit, exportReport } = useAuditItems();

  return (
    <div className="container mx-auto px-4 py-8">
      <AuditHeader 
        loading={loading}
        report={report}
        onRunAudit={runAudit}
        onExportReport={exportReport}
      />

      {error && <AuditErrorDisplay error={error} />}

      {/* Bouton de complétion IC-2 - toujours visible */}
      <AuditIC2CompletionDashboard onComplete={runAudit} />
      
      {/* Panel de régénération OIC */}
      <div className="mt-6">
        <OICRegenerationPanel onComplete={runAudit} />
      </div>

      {report && (
        <div className="space-y-8">
          <AuditOverview report={report} />
          <AuditProgress report={report} />
          <AuditItemsList report={report} />
        </div>
      )}

      {!report && !loading && <AuditInstructions />}
    </div>
  );
};
