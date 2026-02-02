import { TranslatedText } from '@/components/TranslatedText';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { PricingTestimonials } from '@/components/pricing/PricingTestimonials';
import { Badge } from '@/components/ui/badge';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumBackground } from '@/components/ui/premium-background';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Check, Crown, Download, Headphones, Heart, Library, Music, Shield, Star, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { logActivity } = useActivityTracking();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    logActivity({ activity_type: 'study', metadata: { action: 'view_pricing' } });
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
      navigate(ROUTE_PATHS.medMngLogin);
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
      case 'free': return 'from-muted to-muted/80';
      case 'basic': return 'from-primary to-primary/80';
      case 'premium': return 'from-accent to-accent/80';
      case 'enterprise': return 'from-warning to-warning/80';
      default: return 'from-muted to-muted/80';
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
    <PremiumBackground variant="blue" className="min-h-screen">
      <div className="container mx-auto px-4 pt-20">
        <PremiumButton
          variant="glass"
          size="sm"
          onClick={() => navigate(ROUTE_PATHS.home)}
          className="flex items-center gap-2 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText text="Retour à l'accueil" />
        </PremiumButton>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <TranslatedText 
            text="Choisissez votre abonnement MED-MNG"
            as="h1"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4"
            showLoader
          />
          <TranslatedText 
            text="Générez de la musique pédagogique avec l'IA, gérez votre bibliothèque et accédez à des outils d'apprentissage avancés."
            as="p"
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
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
          <PremiumCard variant="glass">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-success">
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
                    <div key={index} className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <Icon className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground">
                          <TranslatedText text={feature.title} />
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          <TranslatedText text={feature.description} />
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 text-center">
                <PremiumButton
                  onClick={() => navigate(ROUTE_PATHS.ednComplete)}
                  className="w-full"
                  variant="primary"
                >
                  <TranslatedText text="Commencer gratuitement" />
                </PremiumButton>
              </div>
            </CardContent>
          </PremiumCard>

          {/* Version Premium */}
          <PremiumCard variant="elevated" className="ring-2 ring-primary">
            <CardHeader className="text-center pb-4">
              <Badge className="mb-2 bg-primary">
                <TranslatedText text="Recommandé" />
              </Badge>
              <CardTitle className="text-2xl text-primary">
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
                    <div key={index} className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground">
                          <TranslatedText text={feature.title} />
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          <TranslatedText text={feature.description} />
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </PremiumCard>
        </div>

        {/* Current subscription banner */}
        {subscription && (
          <PremiumCard variant="glass" className="mb-8 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  <TranslatedText text="Votre abonnement actuel" />
                </h3>
                <p className="text-muted-foreground">
                  Plan {subscription.plan_name} - {subscription.monthly_quota} générations/mois
                </p>
              </div>
              <Badge variant="default" className="bg-success text-success-foreground">
                <TranslatedText text="Actif" />
              </Badge>
            </div>
          </PremiumCard>
        )}

        {/* Plans Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            <TranslatedText text="Plans d'abonnement disponibles" />
          </h2>
          
          {loading || subscriptionLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <PremiumCard 
                  key={plan.id}
                  variant="elevated"
                  className={`relative ${
                    isCurrentPlan(plan.name) ? 'ring-2 ring-primary' : ''
                  } ${plan.name.toLowerCase() === 'premium' ? 'ring-2 ring-accent' : ''}`}
                >
                  {plan.name.toLowerCase() === 'premium' && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground">
                      <TranslatedText text="Recommandé" />
                    </Badge>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getPlanColor(plan.name)} rounded-xl mx-auto mb-4 flex items-center justify-center text-primary-foreground`}>
                      {getPlanIcon(plan.name)}
                    </div>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    <div className="text-3xl font-bold text-foreground mt-4">
                      {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                      {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/mois</span>}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" />
                        <span className="text-sm">{plan.monthly_music_quota} générations/mois</span>
                      </div>
                      
                      {plan.features?.tableaux && (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          <span className="text-sm">Tableaux Rang A & B</span>
                        </div>
                      )}
                      
                      {plan.features?.quiz && (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          <span className="text-sm">Quiz complets</span>
                        </div>
                      )}
                      
                      {plan.features?.bande_dessinee && (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          <span className="text-sm">Bandes dessinées</span>
                        </div>
                      )}
                      
                      {plan.features?.save_music && (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          <span className="text-sm">Sauvegarde bibliothèque</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 space-y-2">
                      {isCurrentPlan(plan.name) ? (
                        <PremiumButton disabled className="w-full" variant="secondary">
                          <TranslatedText text="Plan actuel" />
                        </PremiumButton>
                      ) : plan.name === 'Free' ? (
                        <PremiumButton 
                          variant="glass" 
                          className="w-full"
                          onClick={() => navigate(ROUTE_PATHS.medMngSignup)}
                        >
                          <TranslatedText text="Commencer gratuitement" />
                        </PremiumButton>
                      ) : (
                        <>
                          <div className="mb-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                            <p className="text-xs text-foreground">
                              <strong>✓ J'accepte les</strong>{' '}
                              <Link to={ROUTE_PATHS.cgu} target="_blank" className="text-primary hover:underline font-semibold">CGU</Link>
                              {' '}et le{' '}
                              <strong>droit de rétractation (14 jours)</strong> sauf utilisation crédits.
                            </p>
                          </div>
                          <PremiumButton
                            className="w-full"
                            variant={plan.name.toLowerCase() === 'premium' ? 'accent' : 'primary'}
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={processingPlan === plan.id}
                          >
                            {processingPlan === plan.id ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                <TranslatedText text="Chargement..." />
                              </div>
                            ) : (
                              <TranslatedText text="S'abonner" />
                            )}
                          </PremiumButton>
                        </>
                      )}
                    </div>
                  </CardContent>
                </PremiumCard>
              ))}
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <PremiumCard variant="glass" className="mt-8 sm:mt-12 max-w-4xl mx-auto">
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
                <p className="text-muted-foreground">
                  <TranslatedText text="Vous pouvez générer jusqu'à 3 chansons gratuitement pour tester notre technologie d'IA musicale. Aucune carte bancaire requise." />
                </p>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold text-lg mb-2">
                  <TranslatedText text="Puis-je annuler mon abonnement ?" />
                </h4>
                <p className="text-muted-foreground">
                  <TranslatedText text="Oui, vous pouvez annuler votre abonnement à tout moment. Vos crédits restants resteront valides jusqu'à la fin de votre période." />
                </p>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold text-lg mb-2">
                  <TranslatedText text="Les musiques sont-elles téléchargeables ?" />
                </h4>
                <p className="text-muted-foreground">
                  <TranslatedText text="Non, pour des raisons de sécurité et de droits d'auteur, les musiques sont uniquement disponibles en streaming sécurisé dans votre bibliothèque." />
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">
                  <TranslatedText text="Que comprend le support prioritaire ?" />
                </h4>
                <p className="text-muted-foreground">
                  <TranslatedText text="Les abonnés premium bénéficient d'un support par email avec réponse sous 24h et d'un accès privilégié aux nouvelles fonctionnalités." />
                </p>
              </div>

            </div>
          </CardContent>
        </PremiumCard>

        {/* Testimonials */}
        <PricingTestimonials />

        {/* FAQ */}
        <PricingFAQ />

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <PremiumCard variant="gradient" className="p-8">
            <h3 className="text-2xl font-bold mb-4">
              <TranslatedText text="Prêt à révolutionner votre apprentissage médical ?" />
            </h3>
            <p className="text-lg mb-6 opacity-90">
              <TranslatedText text="Rejoignez des centaines d'étudiants qui utilisent déjà MED-MNG pour réussir leurs études" />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PremiumButton
                onClick={() => navigate(ROUTE_PATHS.ednComplete)}
                variant="primary"
                size="lg"
              >
                <TranslatedText text="Essayer gratuitement" />
              </PremiumButton>
              <PremiumButton
                onClick={() => navigate(ROUTE_PATHS.medMngLogin)}
                variant="glass"
                size="lg"
              >
                <TranslatedText text="Se connecter" />
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumBackground>
  );
};
