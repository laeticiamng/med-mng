
import logger from '@/lib/logger';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    id: 'standard',
    name: 'Standard',
    price: 19,
    songs: '30 chansons/mois',
    features: [
      'Audio standard (MNG 3.5)',
      '30 chansons/mois',
      'QCM illimités',
      'Tableau illimités',
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
      'Audio premium (MNG 4)',
      '300 chansons/mois',
      'Reset mensuel',
      'QCM + tableau illimités',
      'QCM entraînement test',
      'Support prioritaire'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 39,
    songs: '3 000 chansons/mois',
    badge: 'Meilleur rapport qualité-prix',
    bestValue: true,
    features: [
      'Audio high premium studio version (MNG 4.5)',
      '3 000 chansons/mois',
      'Reset mensuel',
      'QCM + tableau illimités',
      'QCM entraînement test',
      'Bande dessinée',
      'Support VIP'
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

  const handleStripeCheckout = async (planId: string) => {
    try {
      setProcessingPlan(planId);
      toast.loading('Redirection vers Stripe...', { id: 'stripe-checkout' });
      
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
        logger.error('Erreur checkout:', error);
        toast.error('Erreur lors de la création du checkout Stripe');
        return;
      }

      if (data?.url) {
        // Ouvrir Stripe dans un nouvel onglet
        window.open(data.url, '_blank');
        toast.success('Redirection vers Stripe', { id: 'stripe-checkout' });
      }
    } catch (error) {
      logger.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setProcessingPlan(null);
      toast.dismiss('stripe-checkout');
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''} ${plan.bestValue ? 'ring-2 ring-green-500' : ''}`}
        >
          {plan.badge && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge 
                variant={plan.popular ? 'default' : 'secondary'}
                className={plan.popular ? 'bg-blue-500' : 'bg-green-500'}
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
              <div className="text-sm font-medium text-blue-600">{plan.songs}</div>
            </div>
            <CardDescription>{plan.songs} inclus</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              onClick={() => {
                if (onSelectPlan) {
                  onSelectPlan(plan.id);
                } else {
                  handleStripeCheckout(plan.id);
                }
              }}
              className="w-full"
              variant={plan.popular ? 'default' : 'outline'}
              disabled={loading || processingPlan === plan.id || currentPlan === plan.id}
            >
              {processingPlan === plan.id ? 'Redirection...' : 
               currentPlan === plan.id ? 'Plan actuel' :
               loading ? 'Chargement...' : 'S\'abonner'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
