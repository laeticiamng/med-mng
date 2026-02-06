import { TranslatedText } from '@/components/TranslatedText';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { AppFooter } from '@/components/layout/AppFooter';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { SEOHead } from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/badge';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumBackground } from '@/components/ui/premium-background';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Check, Crown, Music, Star, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { trackConversionEvent } from '@/lib/conversionTracking';
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
  const { subscription } = useSubscription();
  const { logActivity } = useActivityTracking();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    logActivity({ activity_type: 'study', metadata: { action: 'view_pricing' } });
    trackConversionEvent('page_view', { page: 'pricing' });
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
        description: plan.name.toLowerCase() === 'free' ? 'Découvrez gratuitement' :
          plan.name.toLowerCase() === 'basic' ? 'Pour commencer sérieusement' :
          plan.name.toLowerCase() === 'premium' ? 'L\'expérience complète' :
          plan.name.toLowerCase() === 'enterprise' ? 'Pour les institutions' :
          `Plan ${plan.name.toLowerCase()}`,
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
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        navigate(ROUTE_PATHS.medMngLogin);
        return;
      }

      trackConversionEvent('checkout_start', { planId });

      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { planId },
        headers: { Authorization: `Bearer ${session.data.session.access_token}` }
      });

      if (error) {
        console.error('[Stripe] Checkout error:', error);
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error) {
      // Log technique pour debug
      console.error('[Stripe] Erreur création checkout:', error);
      
      // Message user-friendly - pas de stacktrace
      toast.info('💳 Paiement en cours de configuration', {
        description: 'Le système de paiement sera bientôt disponible. Merci de réessayer dans quelques instants.'
      });
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


  return (
    <>
      <SEOHead
        title="Tarifs & Abonnements"
        description="Découvrez nos offres d'abonnement MED-MNG. Générez de la musique pédagogique IA à partir de 0€/mois."
        keywords="tarifs, abonnement, premium, musique, IA"
        canonical="/med-mng/pricing"
      />
      <PremiumBackground variant="blue" className="min-h-screen flex flex-col">
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

        <div className="container mx-auto px-4 py-4 sm:py-8 flex-1">
        
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
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <PremiumCard 
                  key={plan.id}
                  variant="glass"
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
                    <div className="mt-4">
                      <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                      </span>
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
        <div className="max-w-4xl mx-auto">
          <PricingFAQ />
        </div>

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
      <AppFooter />
    </PremiumBackground>
    </>
  );
};
