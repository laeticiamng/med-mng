import React from 'react';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Étudiant',
    price: '0€',
    features: ['Accès EDN limité', 'Support communautaire']
  },
  {
    name: 'Premium', 
    price: '9.99€/mois',
    features: ['Accès EDN complet', 'Simulations ECOS', 'Support prioritaire'],
    popular: true
  },
  {
    name: 'Pro',
    price: '19.99€/mois', 
    features: ['Tout Premium', 'Analytics avancées', 'API accès']
  }
];

export const MedMngPricing: React.FC = () => {
  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-6">
            Tarifs MED-MNG
          </h1>
          <p className="text-white/80 text-xl">
            Choisissez le plan adapté à vos besoins
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PremiumCard key={index} className={`p-8 ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
              <div className="text-center mb-8">
                {plan.popular && (
                  <div className="flex items-center justify-center mb-4">
                    <Star className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">Plus populaire</span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-6">{plan.price}</div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Link to="/med-mng/signup" className="block w-full">
                <PremiumButton className="w-full">
                  Choisir ce plan
                </PremiumButton>
              </Link>
            </PremiumCard>
          ))}
        </div>
      </div>
    </PremiumLayout>
  );
};

export default MedMngPricing;