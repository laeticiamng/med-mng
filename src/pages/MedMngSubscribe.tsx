import React from 'react';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { CreditCard } from 'lucide-react';

export const MedMngSubscribe: React.FC = () => {
  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <PremiumCard className="p-8">
          <div className="text-center mb-8">
            <CreditCard className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Finaliser l'abonnement</h1>
            <p className="text-muted-foreground">Sécurisez votre accès premium</p>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="font-semibold mb-2">Plan Premium</h3>
              <p className="text-2xl font-bold">9.99€/mois</p>
            </div>
            
            <PremiumButton className="w-full">
              Confirmer l'abonnement
            </PremiumButton>
          </div>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
};

export default MedMngSubscribe;