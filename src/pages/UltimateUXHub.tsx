import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette } from 'lucide-react';
import { UltimateResponsiveDesign } from '@/components/ux/UltimateResponsiveDesign';
import { UltimatePerformance } from '@/components/ux/UltimatePerformance';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';

const UltimateUXHub: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Palette className="h-12 w-12 text-purple-600" />
          <h1 className="text-4xl font-bold">Ultimate UX Hub</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Expérience utilisateur exceptionnelle avec design responsif, accessibilité universelle et performance optimale
        </p>
      </div>

      <Tabs defaultValue="responsive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="responsive">Responsive</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibilité</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="responsive">
          <UltimateResponsiveDesign />
        </TabsContent>

        <TabsContent value="accessibility">
          <AccessibilityProvider>
            <div className="text-center p-8">
              <h3 className="text-2xl font-bold mb-4">Accessibilité Universelle</h3>
              <p>Conforme WCAG 2.1 AA avec support complet des technologies d'assistance</p>
            </div>
          </AccessibilityProvider>
        </TabsContent>

        <TabsContent value="performance">
          <UltimatePerformance />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UltimateUXHub;