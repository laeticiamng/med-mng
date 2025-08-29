import React from 'react';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MedMngSuccess: React.FC = () => {
  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <PremiumCard className="p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold mb-4">
            🎉 Félicitations !
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Votre abonnement MED-MNG Premium a été activé avec succès.
          </p>
          
          <PremiumButton asChild className="text-lg px-8 py-6">
            <Link to="/med-mng/dashboard">
              Accéder au tableau de bord
            </Link>
          </PremiumButton>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
};

export default MedMngSuccess;