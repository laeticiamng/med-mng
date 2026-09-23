
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackConversionEvent } from '@/lib/conversionTracking';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { ROUTE_PATHS } from '@/config/routes';
import { SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  priceBarred?: number;
  subtitle: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
  trial?: string;
  cta: string;
}

// Grille unique : source de vérité = SUBSCRIPTION_TIERS (hooks/useSubscription.ts).
// Les identifiants correspondent à ceux de /med-mng/subscribe/:planId.
const COMMON_FEATURES = [
  '367 items EDN : fiche, rang A, rang B, quiz',
  'Paroles de chanson par item (rang A, rang B, A+B)',
  'Situations ECOS du référentiel',
];

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: SUBSCRIPTION_TIERS.free.name,
    price: SUBSCRIPTION_TIERS.free.price,
    subtitle: 'Découverte',
    icon: <Star className="h-6 w-6" />,
    cta: 'Commencer gratuitement',
    features: [
      ...COMMON_FEATURES,
      `${SUBSCRIPTION_TIERS.free.generations} générations audio offertes`,
    ]
  },
  {
    id: 'standard',
    name: SUBSCRIPTION_TIERS.standard.name,
    price: SUBSCRIPTION_TIERS.standard.price,
    subtitle: 'Pour écouter régulièrement',
    icon: <Zap className="h-6 w-6" />,
    popular: true,
    cta: 'Choisir Standard',
    features: [
      ...COMMON_FEATURES,
      `${SUBSCRIPTION_TIERS.standard.generations} générations audio par mois`,
    ]
  },
  {
    id: 'pro',
    name: SUBSCRIPTION_TIERS.pro.name,
    price: SUBSCRIPTION_TIERS.pro.price,
    subtitle: 'Pour un usage intensif',
    icon: <Zap className="h-6 w-6" />,
    cta: 'Choisir Pro',
    features: [
      ...COMMON_FEATURES,
      `${SUBSCRIPTION_TIERS.pro.generations} générations audio par mois`,
    ]
  },
  {
    id: 'premium',
    name: SUBSCRIPTION_TIERS.premium.name,
    price: SUBSCRIPTION_TIERS.premium.price,
    subtitle: 'Volume maximal',
    icon: <Crown className="h-6 w-6" />,
    cta: 'Choisir Premium',
    features: [
      ...COMMON_FEATURES,
      `${SUBSCRIPTION_TIERS.premium.generations.toLocaleString('fr-FR')} générations audio par mois`,
    ]
  }
];

interface PricingPlansProps {
  onSelectPlan?: (planId: string) => void;
  loading?: boolean;
  currentPlan?: string;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan, loading, currentPlan }) => {
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { type: 'view_pricing_plans' }
    });
  }, [logActivity]);

  const handleStripeCheckout = async (planId: string) => {
    try {
      setProcessingPlan(planId);
      trackConversionEvent('checkout_start', { plan: planId });
      toast.loading('Redirection vers Stripe...', { id: 'stripe-checkout' });
      
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { type: 'subscribe_plan', planId }
      });
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Veuillez vous connecter pour vous abonner');
        return;
      }

      // Map plan IDs to create-checkout plan names
      const stripePlan = planId;
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: stripePlan },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Erreur checkout:', error);
        toast.error('Erreur lors de la création du checkout Stripe');
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Redirection vers Stripe', { id: 'stripe-checkout' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setProcessingPlan(null);
      toast.dismiss('stripe-checkout');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Badge variant="secondary" className="px-4 py-1.5 text-sm">
          🎓 367 items EDN · compétences rang A et rang B du référentiel
        </Badge>
      </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative flex flex-col ${
            plan.popular ? 'ring-2 ring-primary shadow-xl scale-[1.02]' : ''
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-primary text-primary-foreground px-4 shadow-md">
                Recommandé
              </Badge>
            </div>
          )}

          {plan.trial && !plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 px-3 shadow-md">
                {plan.trial}
              </Badge>
            </div>
          )}
          
          {plan.trial && plan.popular && (
            <div className="absolute -top-4 right-4 z-10">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 px-3 text-[10px] shadow-md">
                essai gratuit
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
              plan.popular ? 'bg-primary text-primary-foreground' : 
              plan.id === 'premium' ? 'bg-accent text-accent-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              {plan.icon}
            </div>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription>{plan.subtitle}</CardDescription>
            <div className="mt-4">
              {plan.priceBarred && (
                <span className="text-lg text-muted-foreground line-through mr-2">
                  {plan.priceBarred}€
                </span>
              )}
              <span className="text-4xl font-bold text-foreground">
                {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
              </span>
              {plan.price > 0 && <span className="text-sm text-muted-foreground">/mois</span>}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            <ul className="space-y-3 flex-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="pt-6">
              <Button
                onClick={() => {
                  if (plan.id === 'free') {
                    window.location.href = ROUTE_PATHS.medMngSignup;
                    return;
                  }
                  if (onSelectPlan) {
                    onSelectPlan(plan.id);
                  } else {
                    handleStripeCheckout(plan.id);
                  }
                }}
                className="w-full"
                variant={plan.popular ? 'default' : plan.id === 'premium' ? 'secondary' : 'outline'}
                size="lg"
                disabled={loading || processingPlan === plan.id || currentPlan === plan.id}
              >
                {processingPlan === plan.id ? 'Redirection...' :
                 currentPlan === plan.id ? 'Plan actuel' :
                 plan.cta}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    </div>
  );
};
