import React from 'react';
import { ArrowLeft, TestTube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SubscriptionTestPanel } from '@/components/subscription/SubscriptionTestPanel';
import { SubscriptionAudit } from '@/components/subscription/SubscriptionAudit';
import { TranslatedText } from '@/components/TranslatedText';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';

export const SubscriptionTest = () => {
  const navigate = useNavigate();

  return (
    <ConsistentBackground variant="secondary">
      <PageHeader
        title="Test des Abonnements"
        subtitle="Panel de test pour vérifier le fonctionnement des différents niveaux d'abonnement"
        icon={TestTube}
        showBackButton
        backTo="/"
      />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="test" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="test">Tests des Comptes</TabsTrigger>
            <TabsTrigger value="audit">Audit Complet</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="mt-6">
            <SubscriptionTestPanel />
            
            {/* Section de test EDN UNESS supprimée pour sécurité */}
            <div className="mt-8 p-6 bg-warning/10 rounded-lg shadow-sm border border-warning/30">
              <h3 className="text-lg font-semibold mb-4 text-warning">⚠️ Test EDN UNESS</h3>
              <p className="text-muted-foreground mb-4">
                Le test d'extraction EDN UNESS a été désactivé pour des raisons de sécurité. 
                Utilisez la page d'administration dédiée avec authentification sécurisée.
              </p>
              <Button 
                variant="outline"
                onClick={() => window.open('/admin/extract-edn', '_blank')}
                className="border-warning/30 text-warning hover:bg-warning/10"
              >
                Accéder à l'extraction sécurisée
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="audit" className="mt-6">
            <SubscriptionAudit />
          </TabsContent>
        </Tabs>
      </div>
    </ConsistentBackground>
  );
};