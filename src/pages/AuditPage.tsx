import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditDashboard } from '@/components/audit/AuditDashboard';
import { AuditLogsTable } from '@/components/audit/AuditLogsTable';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Shield, BarChart3, List } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function AuditPage() {
  const { isAdmin, isSecurityAnalyst, loadingMyRoles } = useUserRoles();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loadingMyRoles) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin && !isSecurityAnalyst) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Audit & Sécurité</h1>
          <p className="text-muted-foreground">
            Surveillance des activités et logs d'audit système
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <List className="h-4 w-4" />
            Logs détaillés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AuditDashboard />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <AuditLogsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
