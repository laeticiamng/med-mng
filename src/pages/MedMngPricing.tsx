import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedMngNavigation } from '@/components/med-mng/MedMngNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Music, Library, Heart, Shield, Headphones, Download, Crown, Star, Zap, Check } from 'lucide-react';
import { SimpleTranslatedText } from '@/components/SimpleTranslatedText';
import { useAuth } from '@/components/med-mng/SimpleAuthProvider';
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
          <SimpleTranslatedText text="Retour à l'accueil" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <SimpleTranslatedText 
            text="Choisissez votre abonnement MED-MNG"
            as="h1"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          />
          <SimpleTranslatedText 
            text="Générez de la musique pédagogique avec l'IA, gérez votre bibliothèque et accédez à des outils d'apprentissage avancés."
            as="p"
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8"
          />
          
          {/* Free Trial Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg">
            <Music className="h-4 w-4 mr-2" />
            <SimpleTranslatedText text="3 chansons gratuites pour commencer !" />
          </Badge>
        </div>

        {/* Plans Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            <SimpleTranslatedText text="Plans d'abonnement disponibles" />
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
                      <SimpleTranslatedText text="Recommandé" />
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
                    </div>

                    <div className="pt-4">
                      {isCurrentPlan(plan.name) ? (
                        <Button disabled className="w-full">
                          <SimpleTranslatedText text="Plan actuel" />
                        </Button>
                      ) : plan.name === 'Free' ? (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate('/med-mng/signup')}
                        >
                          <SimpleTranslatedText text="Commencer gratuitement" />
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
                              <SimpleTranslatedText text="Chargement..." />
                            </div>
                          ) : (
                            <SimpleTranslatedText text="S'abonner" />
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
      </div>
    </div>
  );
};