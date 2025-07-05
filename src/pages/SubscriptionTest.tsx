import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SubscriptionTestPanel } from '@/components/subscription/SubscriptionTestPanel';
import { SubscriptionAudit } from '@/components/subscription/SubscriptionAudit';
import { TranslatedText } from '@/components/TranslatedText';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const SubscriptionTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <TranslatedText text="Retour" />
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Test des Abonnements
            </h1>
            <p className="text-gray-600">
              Panel de test pour vérifier le fonctionnement des différents niveaux d'abonnement
            </p>
          </div>
        </div>

        <Tabs defaultValue="test" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="test">Tests des Comptes</TabsTrigger>
            <TabsTrigger value="audit">Audit Complet</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="mt-6">
            <SubscriptionTestPanel />
          </TabsContent>
          
          <TabsContent value="audit" className="mt-6">
            <SubscriptionAudit />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};