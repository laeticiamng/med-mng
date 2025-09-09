import React from 'react';
import { DuplicateAnalyzer } from '@/utils/analysis/DuplicateAnalyzer';
import { DuplicateCleanupAutomation } from '@/utils/cleanup/DuplicateCleanupAutomation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DuplicateAnalysis() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Analyse et Nettoyage des Doublons</h1>
        <p className="text-muted-foreground mt-2">
          Rapport complet des doublons détectés et plan d'action automatisé pour l'optimisation du code.
        </p>
      </div>
      
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
          <TabsTrigger value="cleanup">Nettoyage</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <DuplicateAnalyzer />
        </TabsContent>

        <TabsContent value="cleanup">
          <DuplicateCleanupAutomation />
        </TabsContent>
      </Tabs>
    </div>
  );
}