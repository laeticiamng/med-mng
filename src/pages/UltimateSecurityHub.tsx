import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield } from 'lucide-react';
import { AdvancedRLSMonitor } from '@/components/security/AdvancedRLSMonitor';
import { UltimateAuthentication } from '@/components/security/UltimateAuthentication';
import { APISecurity } from '@/components/security/APISecurity';
import { ComprehensiveAuditTrail } from '@/components/security/ComprehensiveAuditTrail';
import { AdvancedEncryption } from '@/components/security/AdvancedEncryption';

const UltimateSecurityHub: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Shield className="h-12 w-12 text-blue-600" />
          <h1 className="text-4xl font-bold">Ultimate Security Hub</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Sécurité de niveau enterprise avec protection quantum-safe, audit forensique et conformité réglementaire complète
        </p>
      </div>

      <Tabs defaultValue="rls" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="rls">RLS Monitor</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="api">API Security</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
        </TabsList>

        <TabsContent value="rls">
          <AdvancedRLSMonitor />
        </TabsContent>

        <TabsContent value="auth">
          <UltimateAuthentication />
        </TabsContent>

        <TabsContent value="api">
          <APISecurity />
        </TabsContent>

        <TabsContent value="audit">
          <ComprehensiveAuditTrail />
        </TabsContent>

        <TabsContent value="encryption">
          <AdvancedEncryption />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UltimateSecurityHub;