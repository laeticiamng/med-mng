
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useActivityTracking } from '@/hooks/useActivityTracking';

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

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    subtitle: 'Découverte',
    icon: <Star className="h-6 w-6" />,
    cta: 'Commencer gratuitement',
    features: [
      '10 items EDN accessibles',
      '3 QCM/jour',
      'Démo ECOS',
      '3 générations musicales/mois',
      'Flashcards limitées',
    ]
  },
  {
    id: 'pro',
    name: 'Pro Étudiant',
    price: 19,
    subtitle: 'Pour réussir l\'EDN',
    icon: <Zap className="h-6 w-6" />,
    popular: true,
    trial: '7 jours d\'essai gratuit',
    cta: 'Essai gratuit 7 jours',
    features: [
      '367 items EDN complets',
      'Examen illimité (EDN + ECOS)',
      'Cas cliniques complets',
      'Musique IA illimitée',
      'Tableaux Rang A & B',
      'QCM illimité',
      'Bibliothèque musicale',
      'Support email prioritaire',
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 39,
    priceBarred: 49,
    subtitle: 'L\'excellence totale',
    icon: <Crown className="h-6 w-6" />,
    cta: 'S\'abonner',
    features: [
      'Tout le plan Pro inclus',
      'IA avancée & chat illimité',
      'Planning personnalisé IA',
      'Percentile national simulé',
      'Bande dessinée éducative',
      'Cas cliniques premium',
      'Support VIP prioritaire',
      'Accès anticipé nouvelles features',
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
  const [userCount, setUserCount] = useState<number>(37);
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { type: 'view_pricing_plans' }
    });
    // Fetch real user count
    supabase.from('profiles').select('id', { count: 'exact', head: true })
      .then(({ count }) => {
        if (count && count > 10) setUserCount(count);
      });
  }, [logActivity]);

  const handleStripeCheckout = async (planId: string) => {
    try {
      setProcessingPlan(planId);
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
      const planMapping: Record<string, string> = { pro: 'standard', premium: 'premium' };
      const stripePlan = planMapping[planId] || planId;
      
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
          🎓 Déjà {userCount}+ étudiants inscrits
        </Badge>
      </div>
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative flex flex-col ${
            plan.popular ? 'ring-2 ring-primary shadow-xl scale-[1.02]' : ''
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4">
                Recommandé
              </Badge>
            </div>
          )}

          {plan.trial && (
            <div className="absolute -top-3 right-4">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 px-3">
                {plan.trial}
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
                  if (plan.id === 'free') return;
                  if (onSelectPlan) {
                    onSelectPlan(plan.id);
                  } else {
                    handleStripeCheckout(plan.id);
                  }
                }}
                className="w-full"
                variant={plan.popular ? 'default' : plan.id === 'premium' ? 'secondary' : 'outline'}
                size="lg"
                disabled={loading || processingPlan === plan.id || currentPlan === plan.id || plan.id === 'free'}
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
