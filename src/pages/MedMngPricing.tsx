
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedMngNavigation } from '@/components/med-mng/MedMngNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Music, Library, Heart, Shield, Headphones, Download, Crown, Star, Zap, Check } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  monthly_music_quota: number;
  features: any;
}

export const MedMngPricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      
      const processedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        description: `Plan ${plan.name.toLowerCase()}`,
        price: plan.price,
        monthly_music_quota: plan.monthly_music_quota,
        features: plan.features
      }));
      
      setPlans(processedPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Erreur lors du chargement des plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour vous abonner');
      navigate('/med-mng/login');
      return;
    }

    setProcessingPlan(planId);

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { planId },
        headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erreur lors de la création du checkout');
    } finally {
      setProcessingPlan(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return <Star className="h-6 w-6" />;
      case 'basic': return <Zap className="h-6 w-6" />;
      case 'premium': return <Crown className="h-6 w-6" />;
      case 'enterprise': return <Crown className="h-6 w-6" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return 'from-gray-500 to-gray-600';
      case 'basic': return 'from-blue-500 to-blue-600';
      case 'premium': return 'from-purple-500 to-purple-600';
      case 'enterprise': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const isCurrentPlan = (planName: string) => {
    return subscription?.plan_name === planName;
  };

  const freeFeatures = [
    {
      icon: Music,
      title: "3 chansons gratuites",
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
            <TranslatedText text="3 chansons gratuites pour commencer !" />
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

        {/* Current subscription banner */}
        {subscription && (
          <Card className="mb-8 p-6 bg-white/90 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  <TranslatedText text="Votre abonnement actuel" />
                </h3>
                <p className="text-gray-600">
                  Plan {subscription.plan_name} - {subscription.monthly_quota} générations/mois
                </p>
              </div>
              <Badge variant="default" className="bg-green-500 text-white">
                <TranslatedText text="Actif" />
              </Badge>
            </div>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            <TranslatedText text="Plans d'abonnement disponibles" />
          </h2>
          
          {loading || subscriptionLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative bg-white/90 backdrop-blur-sm shadow-lg ${
                    isCurrentPlan(plan.name) ? 'ring-2 ring-blue-500' : ''
                  } ${plan.name.toLowerCase() === 'premium' ? 'border-2 border-purple-500' : ''}`}
                >
                  {plan.name.toLowerCase() === 'premium' && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white">
                      <TranslatedText text="Recommandé" />
                    </Badge>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getPlanColor(plan.name)} rounded-xl mx-auto mb-4 flex items-center justify-center text-white`}>
                      {getPlanIcon(plan.name)}
                    </div>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    <div className="text-3xl font-bold text-gray-900 mt-4">
                      {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                      {plan.price > 0 && <span className="text-sm font-normal text-gray-600">/mois</span>}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{plan.monthly_music_quota} générations/mois</span>
                      </div>
                      
                      {plan.features?.tableaux && (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Tableaux Rang A & B</span>
                        </div>
                      )}
                      
                      {plan.features?.quiz && (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Quiz complets</span>
                        </div>
                      )}
                      
                      {plan.features?.bande_dessinee && (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Bandes dessinées</span>
                        </div>
                      )}
                      
                      {plan.features?.save_music && (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Sauvegarde bibliothèque</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      {isCurrentPlan(plan.name) ? (
                        <Button disabled className="w-full">
                          <TranslatedText text="Plan actuel" />
                        </Button>
                      ) : plan.name === 'Free' ? (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate('/med-mng/signup')}
                        >
                          <TranslatedText text="Commencer gratuitement" />
                        </Button>
                      ) : (
                        <Button
                          className={`w-full ${
                            plan.name.toLowerCase() === 'premium' 
                              ? 'bg-purple-600 hover:bg-purple-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={processingPlan === plan.id}
                        >
                          {processingPlan === plan.id ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                              <TranslatedText text="Chargement..." />
                            </div>
                          ) : (
                            <TranslatedText text="S'abonner" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
                  <TranslatedText text="Vous pouvez générer jusqu'à 3 chansons gratuitement pour tester notre technologie d'IA musicale. Aucune carte bancaire requise." />
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
