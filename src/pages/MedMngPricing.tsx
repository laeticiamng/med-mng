
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
      
      {/* Back to Home Button - Prominent */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-4 bg-white/80 hover:bg-white shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText text="Retour à l'accueil" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="text-center mb-8 sm:mb-12">
          <TranslatedText 
            text="Choisissez votre abonnement MED-MNG"
            as="h1"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            showLoader
          />
          <TranslatedText 
            text="Générez de la musique pédagogique avec l'IA, gérez votre bibliothèque et accédez à des outils d'apprentissage avancés."
            as="p"
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
            showLoader
          />
        </div>

        <PricingPlans onSelectPlan={handleSelectPlan} loading={loading} />

        <Card className="mt-8 sm:mt-12 max-w-4xl mx-auto shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-lg sm:text-xl">
              <TranslatedText text="Fonctionnalités incluses dans tous les plans" />
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              <TranslatedText text="Découvrez ce qui rend MED-MNG unique" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                <TranslatedText 
                  text="🎵 Génération musicale IA"
                  as="h4"
                  className="font-semibold text-sm sm:text-base"
                />
                <TranslatedText 
                  text="Créez des chansons personnalisées avec Suno AI pour vos contenus pédagogiques"
                  as="p"
                  className="text-xs sm:text-sm text-gray-600"
                />
              </div>
              
              <div className="space-y-3 p-4 bg-green-50 rounded-lg">
                <TranslatedText 
                  text="📚 Bibliothèque personnelle"
                  as="h4"
                  className="font-semibold text-sm sm:text-base"
                />
                <TranslatedText 
                  text="Organisez et gérez toutes vos créations musicales en un seul endroit"
                  as="p"
                  className="text-xs sm:text-sm text-gray-600"
                />
              </div>
              
              <div className="space-y-3 p-4 bg-purple-50 rounded-lg">
                <TranslatedText 
                  text="🎨 Thèmes personnalisables"
                  as="h4"
                  className="font-semibold text-sm sm:text-base"
                />
                <TranslatedText 
                  text="Adaptez l'interface à vos préférences avec des thèmes de couleur"
                  as="p"
                  className="text-xs sm:text-sm text-gray-600"
                />
              </div>
              
              <div className="space-y-3 p-4 bg-orange-50 rounded-lg">
                <TranslatedText 
                  text="🔒 Streaming sécurisé"
                  as="h4"
                  className="font-semibold text-sm sm:text-base"
                />
                <TranslatedText 
                  text="Écoutez vos créations en streaming sans possibilité de téléchargement"
                  as="p"
                  className="text-xs sm:text-sm text-gray-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Navigation */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/med-mng/library')}
              className="bg-white/80 hover:bg-white shadow-sm"
            >
              <TranslatedText text="Voir la Bibliothèque" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/med-mng/create')}
              className="bg-white/80 hover:bg-white shadow-sm"
            >
              <TranslatedText text="Créer de la Musique" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/med-mng/login')}
              className="bg-white/80 hover:bg-white shadow-sm"
            >
              <TranslatedText text="Se Connecter" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
