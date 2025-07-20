
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle, CreditCard } from 'lucide-react';

const plans = {
  standard: { name: 'Standard', price: 9.99, songs: 30 },
  pro: { name: 'Pro', price: 29.99, songs: 300 },
  premium: { name: 'Premium', price: 49.99, songs: 3000 },
};

export const MedMngSubscribe = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendSubscriptionEmail } = useEmailNotifications();
  const medMngApi = useMedMngApi();
  const [isProcessing, setIsProcessing] = useState(false);

  const plan = planId && plans[planId as keyof typeof plans];

  useEffect(() => {
    if (!user) {
      navigate('/med-mng/login');
      return;
    }

    if (!plan) {
      navigate('/med-mng/pricing');
      return;
    }
  }, [user, plan, navigate]);

  const handleSubscription = async (gateway: 'stripe' | 'paypal' | 'demo') => {
    if (!plan || !user) return;

    setIsProcessing(true);
    try {
      console.log(`💳 Traitement abonnement ${plan.name} via ${gateway}`);

      if (gateway === 'demo') {
        // Simulation pour la démo
        await medMngApi.createUserSubscription(planId!, 'demo', 'demo-sub-' + Date.now());
        
        // Envoyer l'email de confirmation d'abonnement
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || '';
        await sendSubscriptionEmail(
          user.email!,
          userName,
          plan.name,
          plan.songs,
          plan.price
        );

        toast.success(`🎉 Abonnement ${plan.name} activé ! Vérifiez vos emails.`);
        navigate('/med-mng/library');
      } else {
        // Pour Stripe/PayPal, rediriger vers l'implémentation réelle
        toast.info(`Redirection vers ${gateway}...`);
        // Ici vous ajouteriez l'intégration Stripe/PayPal réelle
      }

    } catch (error) {
      console.error('Erreur abonnement:', error);
      toast.error('Erreur lors de la souscription. Réessayez.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!plan) {
    return <div>Plan non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Finaliser votre abonnement</CardTitle>
            <CardDescription className="text-blue-100">
              Plan {plan.name} - {plan.price}€/mois
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">✨ Votre abonnement {plan.name} inclut :</h3>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{plan.songs} chansons/mois pour la génération musicale</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Qualité audio premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>QCM et tableaux illimités</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Support prioritaire</span>
                </li>
                {plan.name === 'Premium' && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Bandes dessinées éducatives</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Choisissez votre mode de paiement :</h3>
              
              <Button
                onClick={() => handleSubscription('demo')}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {isProcessing ? 'Traitement...' : `Activer l'abonnement (Démo)`}
              </Button>

              <div className="text-center text-sm text-gray-500">
                <p>✅ Email de confirmation automatique</p>
                <p>🔄 Renouvellement automatique mensuel</p>
                <p>❌ Résiliation possible à tout moment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
