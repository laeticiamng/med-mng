
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedMngNavigation } from '@/components/med-mng/MedMngNavigation';
import { PricingPlans } from '@/components/med-mng/PricingPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Music, Library, Heart, Shield, Headphones, Download } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

export const MedMngPricing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    setLoading(true);
    navigate(`/med-mng/subscribe/${planId}`);
  };

  const freeFeatures = [
    {
      icon: Music,
      title: "2 chansons gratuites",
      description: "Testez notre générateur d'IA musicale"
    },
    {
      icon: Library,
      title: "Accès à la bibliothèque",
      description: "Consultez les exemples disponibles"
    }
  ];

  const premiumFeatures = [
    {
      icon: Heart,
      title: "Favoris illimités",
      description: "Organisez vos chansons préférées"
    },
    {
      icon: Shield,
      title: "Qualité premium",
      description: "Audio haute définition garanti"
    },
    {
      icon: Headphones,
      title: "Streaming sécurisé",
      description: "Écoute protégée sans téléchargement"
    },
    {
      icon: Download,
      title: "Sauvegarde cloud",
      description: "Vos créations toujours accessibles - 100% streaming"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <MedMngNavigation />
      
      {/* Back to Home Button */}
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
        
        {/* Header Section */}
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
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8"
            showLoader
          />
          
          {/* Free Trial Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg">
            <Music className="h-4 w-4 mr-2" />
            <TranslatedText text="2 chansons gratuites pour commencer !" />
          </Badge>
        </div>

        {/* Features Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* Version Gratuite */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-green-600">
                <TranslatedText text="Version Gratuite" />
              </CardTitle>
              <CardDescription className="text-lg">
                <TranslatedText text="Parfait pour découvrir" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {freeFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <Icon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          <TranslatedText text={feature.title} />
                        </h4>
                        <p className="text-sm text-gray-600">
                          <TranslatedText text={feature.description} />
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 text-center">
                <Button
                  onClick={() => navigate('/edn')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <TranslatedText text="Commencer gratuitement" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Version Premium */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-blue-500">
            <CardHeader className="text-center pb-4">
              <Badge className="mb-2 bg-blue-500">
                <TranslatedText text="Recommandé" />
              </Badge>
              <CardTitle className="text-2xl text-blue-600">
                <TranslatedText text="Versions Premium" />
              </CardTitle>
              <CardDescription className="text-lg">
                <TranslatedText text="Pour une expérience complète" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {premiumFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          <TranslatedText text={feature.title} />
                        </h4>
                        <p className="text-sm text-gray-600">
                          <TranslatedText text={feature.description} />
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Premium */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            <TranslatedText text="Plans Premium Disponibles" />
          </h2>
          <PricingPlans onSelectPlan={handleSelectPlan} loading={loading} />
        </div>

        {/* FAQ Section */}
        <Card className="mt-8 sm:mt-12 max-w-4xl mx-auto shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-lg sm:text-xl">
              <TranslatedText text="Questions Fréquentes" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              <div className="border-b pb-4">
                <h4 className="font-semibold text-lg mb-2">
                  <TranslatedText text="Comment fonctionne la version gratuite ?" />
                </h4>
                <p className="text-gray-600">
                  <TranslatedText text="Vous pouvez générer jusqu'à 2 chansons gratuitement pour tester notre technologie d'IA musicale. Aucune carte bancaire requise." />
                </p>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold text-lg mb-2">
                  <TranslatedText text="Puis-je annuler mon abonnement ?" />
                </h4>
                <p className="text-gray-600">
                  <TranslatedText text="Oui, vous pouvez annuler votre abonnement à tout moment. Vos crédits restants resteront valides jusqu'à la fin de votre période." />
                </p>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold text-lg mb-2">
                  <TranslatedText text="Les musiques sont-elles téléchargeables ?" />
                </h4>
                <p className="text-gray-600">
                  <TranslatedText text="Non, pour des raisons de sécurité et de droits d'auteur, les musiques sont uniquement disponibles en streaming sécurisé dans votre bibliothèque." />
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">
                  <TranslatedText text="Que comprend le support prioritaire ?" />
                </h4>
                <p className="text-gray-600">
                  <TranslatedText text="Les abonnés premium bénéficient d'un support par email avec réponse sous 24h et d'un accès privilégié aux nouvelles fonctionnalités." />
                </p>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              <TranslatedText text="Prêt à révolutionner votre apprentissage médical ?" />
            </h3>
            <p className="text-lg mb-6 opacity-90">
              <TranslatedText text="Rejoignez des centaines d'étudiants qui utilisent déjà MED-MNG pour réussir leurs études" />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/edn')}
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <TranslatedText text="Essayer gratuitement" />
              </Button>
              <Button
                onClick={() => navigate('/med-mng/login')}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                <TranslatedText text="Se connecter" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
