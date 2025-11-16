import React, { useState } from 'react';
import { useAuditItems } from '@/hooks/useAuditItems';
import { useComprehensiveAudit } from '@/hooks/useComprehensiveAudit';
import { AuditHeader } from './AuditHeader';
import { AuditErrorDisplay } from './AuditErrorDisplay';
import { AuditOverview } from './AuditOverview';
import { AuditProgress } from './AuditProgress';
import { AuditItemsList } from './AuditItemsList';
import { AuditInstructions } from './AuditInstructions';
import { AuditIC2CompletionDashboard } from './AuditIC2CompletionDashboard';
import { OICRegenerationPanel } from './OICRegenerationPanel';
import { ComprehensiveAuditPanel } from './ComprehensiveAuditPanel';
import { SyncTablesPanel } from './SyncTablesPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const AuditDashboard = () => {
  const { report, loading, error, runAudit, exportReport } = useAuditItems();
  const comprehensiveAudit = useComprehensiveAudit();
  const [activeTab, setActiveTab] = useState('comprehensive');

  return (
    <div className="container mx-auto px-4 py-8">
      <AuditHeader 
        loading={loading}
        report={report}
        onRunAudit={runAudit}
        onExportReport={exportReport}
      />

      {error && <AuditErrorDisplay error={error} />}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comprehensive">🔍 Audit Complet</TabsTrigger>
          <TabsTrigger value="actions">⚡ Actions Rapides</TabsTrigger>
        </TabsList>

        <TabsContent value="comprehensive" className="space-y-6">
          <ComprehensiveAuditPanel 
            report={comprehensiveAudit.report}
            loading={comprehensiveAudit.loading}
            error={comprehensiveAudit.error}
            onRunAudit={comprehensiveAudit.runAudit}
            onExportReport={comprehensiveAudit.exportReport}
          />
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          {/* Panel de synchronisation des tables */}
          <SyncTablesPanel onComplete={() => {
            runAudit();
            comprehensiveAudit.runAudit();
          }} />
          
          {/* Bouton de complétion IC-2 */}
          <AuditIC2CompletionDashboard onComplete={runAudit} />
          
          {/* Panel de régénération OIC */}
          <OICRegenerationPanel onComplete={() => {
            runAudit();
            comprehensiveAudit.runAudit();
          }} />

          {report && (
            <div className="space-y-8 mt-6">
              <AuditOverview report={report} />
              <AuditProgress report={report} />
              <AuditItemsList report={report} />
            </div>
          )}

          {!report && !loading && <AuditInstructions />}
        </TabsContent>
      </Tabs>
    </div>
  );
};
