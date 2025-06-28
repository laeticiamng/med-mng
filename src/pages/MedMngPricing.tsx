import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedMngNavigation } from '@/components/med-mng/MedMngNavigation';
import { PricingPlans } from '@/components/med-mng/PricingPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre abonnement MED-MNG
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Générez de la musique pédagogique avec l'IA, gérez votre bibliothèque 
            et accédez à des outils d'apprentissage avancés.
          </p>
        </div>

        <PricingPlans onSelectPlan={handleSelectPlan} loading={loading} />

        <Card className="mt-12 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Fonctionnalités incluses dans tous les plans</CardTitle>
            <CardDescription>
              Découvrez ce qui rend MED-MNG unique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">🎵 Génération musicale IA</h4>
                <p className="text-sm text-gray-600">
                  Créez des chansons personnalisées avec Suno AI pour vos contenus pédagogiques
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">📚 Bibliothèque personnelle</h4>
                <p className="text-sm text-gray-600">
                  Organisez et gérez toutes vos créations musicales en un seul endroit
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">🎨 Thèmes personnalisables</h4>
                <p className="text-sm text-gray-600">
                  Adaptez l'interface à vos préférences avec des thèmes de couleur
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">🔒 Streaming sécurisé</h4>
                <p className="text-sm text-gray-600">
                  Écoutez vos créations en streaming sans possibilité de téléchargement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
