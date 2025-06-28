
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MedMngNavigation } from '@/components/med-mng/MedMngNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, CreditCard } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { toast } from 'sonner';

const planDetails = {
  standard: {
    name: 'Standard',
    price: 14,
    credits: 60,
    features: [
      'Qualité standard',
      '60 crédits/mois',
      'QCM illimités',
      'Tableau illimités',
      'Support email'
    ]
  },
  pro: {
    name: 'Pro',
    price: 24,
    credits: 2500,
    features: [
      'Qualité premium',
      '2 500 crédits/mois',
      'Reset mensuel',
      'QCM + tableau illimités',
      'QCM entraînement test',
      'Support prioritaire'
    ]
  },
  premium: {
    name: 'Premium',
    price: 34,
    credits: 5000,
    features: [
      'Qualité premium',
      '5 000 crédits/mois',
      'Reset mensuel',
      'QCM + tableau illimités',
      'QCM entraînement test',
      'Bande dessinée',
      'Support VIP'
    ]
  }
};

export const MedMngSubscribe = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  
  const plan = planId && planDetails[planId as keyof typeof planDetails];

  useEffect(() => {
    if (!plan) {
      toast.error('Plan invalide');
      navigate('/med-mng/pricing');
    }
  }, [plan, navigate]);

  const handleSubscribe = () => {
    // Simuler le processus d'abonnement
    toast.success(`Abonnement ${plan?.name} activé avec succès !`);
    navigate('/med-mng/library');
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <MedMngNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Plan non trouvé</h1>
            <Button onClick={() => navigate('/med-mng/pricing')}>
              Retour aux plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <MedMngNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/med-mng/pricing')}
          className="flex items-center gap-2 mb-6 bg-white/80 hover:bg-white shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText text="Retour aux plans" />
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <TranslatedText 
              text={`Finaliser l'abonnement ${plan.name}`}
              as="h1"
              className="text-3xl font-bold text-gray-900 mb-2"
            />
            <TranslatedText 
              text="Confirmez votre choix et activez votre abonnement"
              as="p"
              className="text-gray-600"
            />
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="space-y-1">
                <div className="text-4xl font-bold text-blue-600">{plan.price}€</div>
                <div className="text-sm text-muted-foreground">/mois</div>
                <div className="text-sm font-medium text-blue-600">
                  {plan.credits} crédits inclus
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">
                  <TranslatedText text="Fonctionnalités incluses :" />
                </h3>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-blue-800 text-sm">
                    <TranslatedText text="🎵 Accès immédiat à la génération musicale IA avec Suno" />
                  </p>
                  <p className="text-blue-700 text-xs mt-1">
                    <TranslatedText text="Créez des chansons personnalisées pour vos contenus pédagogiques" />
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleSubscribe}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                <TranslatedText text={`S'abonner au plan ${plan.name}`} />
              </Button>

              <div className="text-center text-xs text-gray-500 space-y-1">
                <p>
                  <TranslatedText text="Annulation possible à tout moment" />
                </p>
                <p>
                  <TranslatedText text="Facturation mensuelle automatique" />
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
