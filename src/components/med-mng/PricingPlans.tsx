
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Flame, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  songs: string;
  badge?: string;
  features: string[];
  popular?: boolean;
  bestValue?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    songs: '3 générations/mois',
    features: [
      'EDN basique (items Rang A)',
      '10 flashcards/jour',
      '3 générations musicales/mois',
      'Cas cliniques découverte',
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 19,
    songs: '30 chansons/mois',
    features: [
      '30 chansons/mois',
      'Tableaux EDN (Rang A & B)',
      'Sauvegarde bibliothèque',
      'Support email'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    songs: '300 chansons/mois',
    badge: 'Le plus populaire',
    popular: true,
    features: [
      '300 chansons/mois',
      'Tableaux EDN (Rang A & B)',
      'QCM entraînement',
      'Sauvegarde bibliothèque',
      'Support prioritaire'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 39,
    songs: 'Musique IA illimitée',
    badge: 'Meilleur rapport qualité-prix',
    bestValue: true,
    features: [
      'Musique IA illimitée',
      'ECOS complets',
      'Cas cliniques avancés',
      'Mode examen EDN complet',
      'Bande dessinée éducative',
      'Support VIP'
    ]
  },
  {
    id: 'institution',
    name: 'Institution',
    price: 99,
    songs: 'Multi-utilisateurs',
    badge: 'Universités & CHU',
    features: [
      'Tout Premium inclus',
      'Multi-utilisateurs (jusqu\'à 500)',
      'Analytics RH & progression',
      'Import bulk items',
      'Dashboard administrateur',
      'API dédiée',
      'Support dédié & onboarding'
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
  const { stats } = useGamification();

  // Track page view
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

      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { planId },
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
        // Ouvrir Stripe dans un nouvel onglet
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
      {/* Stats gamification */}
      {stats && (
        <div className="flex items-center justify-center gap-4 mb-6">
          <Badge variant="outline" className="gap-1">
            <Flame className="h-3 w-3 text-warning" />
            Série: {stats.currentStreak} jours
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Trophy className="h-3 w-3 text-primary" />
            Niveau {stats.level}
          </Badge>
        </div>
      )}
      
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''} ${plan.bestValue ? 'ring-2 ring-success' : ''}`}
        >
          {plan.badge && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge 
                variant={plan.popular ? 'default' : 'secondary'}
                className={plan.popular ? 'bg-primary' : 'bg-success'}
              >
                {plan.badge}
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <div className="space-y-1">
              <div className="text-3xl font-bold">{plan.price}€</div>
              <div className="text-sm text-muted-foreground">/mois</div>
              <div className="text-sm font-medium text-primary">{plan.songs}</div>
            </div>
            <CardDescription>{plan.songs} inclus</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button
              onClick={() => {
                if (plan.id === 'free') return;
                if (plan.id === 'institution') {
                  window.open('mailto:contact@med-mng.lovable.app?subject=Demande Institution', '_blank');
                  return;
                }
                if (onSelectPlan) {
                  onSelectPlan(plan.id);
                } else {
                  handleStripeCheckout(plan.id);
                }
              }}
              className="w-full"
              variant={plan.popular ? 'default' : 'outline'}
              disabled={loading || processingPlan === plan.id || currentPlan === plan.id || plan.id === 'free'}
            >
              {plan.id === 'free' ? 'Plan actuel' :
               plan.id === 'institution' ? 'Nous contacter' :
               processingPlan === plan.id ? 'Redirection...' :
               currentPlan === plan.id ? 'Plan actuel' :
               loading ? 'Chargement...' : 'S\'abonner'}
            </Button>
          </CardContent>
        </Card>
      ))}
      </div>
    </div>
  );
};
