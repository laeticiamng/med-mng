
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedMngNavigation } from '@/components/med-mng/MedMngNavigation';
import { PricingPlans } from '@/components/med-mng/PricingPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

export const MedMngPricing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    setLoading(true);
    navigate(`/med-mng/subscribe/${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <MedMngNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <TranslatedText 
            text="Choisissez votre abonnement MED-MNG"
            as="h1"
            className="text-4xl font-bold text-gray-900 mb-4"
            showLoader
          />
          <TranslatedText 
            text="Générez de la musique pédagogique avec l'IA, gérez votre bibliothèque et accédez à des outils d'apprentissage avancés."
            as="p"
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            showLoader
          />
        </div>

        <PricingPlans onSelectPlan={handleSelectPlan} loading={loading} />

        <Card className="mt-12 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>
              <TranslatedText text="Fonctionnalités incluses dans tous les plans" />
            </CardTitle>
            <CardDescription>
              <TranslatedText text="Découvrez ce qui rend MED-MNG unique" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <TranslatedText 
                  text="🎵 Génération musicale IA"
                  as="h4"
                  className="font-semibold"
                />
                <TranslatedText 
                  text="Créez des chansons personnalisées avec Suno AI pour vos contenus pédagogiques"
                  as="p"
                  className="text-sm text-gray-600"
                />
              </div>
              
              <div className="space-y-3">
                <TranslatedText 
                  text="📚 Bibliothèque personnelle"
                  as="h4"
                  className="font-semibold"
                />
                <TranslatedText 
                  text="Organisez et gérez toutes vos créations musicales en un seul endroit"
                  as="p"
                  className="text-sm text-gray-600"
                />
              </div>
              
              <div className="space-y-3">
                <TranslatedText 
                  text="🎨 Thèmes personnalisables"
                  as="h4"
                  className="font-semibold"
                />
                <TranslatedText 
                  text="Adaptez l'interface à vos préférences avec des thèmes de couleur"
                  as="p"
                  className="text-sm text-gray-600"
                />
              </div>
              
              <div className="space-y-3">
                <TranslatedText 
                  text="🔒 Streaming sécurisé"
                  as="h4"
                  className="font-semibold"
                />
                <TranslatedText 
                  text="Écoutez vos créations en streaming sans possibilité de téléchargement"
                  as="p"
                  className="text-sm text-gray-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
