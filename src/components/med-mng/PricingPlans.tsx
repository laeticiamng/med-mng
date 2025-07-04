
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
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
    credits: 60,
    songs: '≈15 chansons/mois',
    features: [
      'Audio standard (Suno 3.5)',
      '60 crédits/mois',
      'QCM illimités',
      'Tableau illimités',
      'Support email'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    credits: 2500,
    songs: '≈500 chansons/mois',
    badge: 'Le plus populaire',
    popular: true,
    features: [
      'Audio premium (Suno 4)',
      '2 500 crédits/mois',
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
    credits: 5000,
    songs: '≈1 000 chansons/mois',
    badge: 'Meilleur rapport qualité-prix',
    bestValue: true,
    features: [
      'Audio high premium studio version (Suno 4.5)',
      '5 000 crédits/mois',
      'Reset mensuel',
      'QCM + tableau illimités',
      'QCM entraînement test',
      'Bande dessinée',
      'Support VIP'
    ]
  }
];

interface PricingPlansProps {
  onSelectPlan: (planId: string) => void;
  loading?: boolean;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan, loading }) => {
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
            <CardDescription>{plan.credits} crédits inclus</CardDescription>
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
              onClick={() => onSelectPlan(plan.id)}
              className="w-full"
              variant={plan.popular ? 'default' : 'outline'}
              disabled={loading}
            >
              {loading ? 'Chargement...' : 'Choisir ce plan'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
