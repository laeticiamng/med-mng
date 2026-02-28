import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const plans = {
  standard: { name: 'Standard', price: 19, songs: 30 },
  pro: { name: 'Pro', price: 29, songs: 300 },
  premium: { name: 'Premium', price: 39, songs: 3000 },
};

export const MedMngSubscribe = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendSubscriptionEmail } = useEmailNotifications();
  const medMngApi = useMedMngApi();
  const [isProcessing, setIsProcessing] = useState(false);
  const { logActivity } = useActivityTracking();

  const plan = planId && plans[planId as keyof typeof plans];

  useEffect(() => {
    if (!user) {
      navigate(ROUTE_PATHS.medMngLogin);
      return;
    }

    if (!plan) {
      navigate(ROUTE_PATHS.medMngPricing);
      return;
    }
  }, [user, plan, navigate]);

  const handleSubscription = async (gateway: 'stripe' | 'paypal' | 'demo') => {
    if (!plan || !user) return;

    setIsProcessing(true);
    try {
      if (gateway === 'demo') {
        // Mode démo - activation via Edge Function réelle
        await medMngApi.createUserSubscription(planId!, 'demo', `demo-sub-${Date.now()}`);
        
        // Envoyer l'email de confirmation d'abonnement
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || '';
        await sendSubscriptionEmail(
          user.email!,
          userName,
          plan.name,
          plan.songs,
          plan.price
        );

        logActivity({ activity_type: 'study', metadata: { action: 'subscription_success', plan: plan.name } });
        toast.success(`🎉 Abonnement ${plan.name} activé ! Vérifiez vos emails.`);
        navigate(ROUTE_PATHS.medMngMusicLibrary);
      } else if (gateway === 'stripe') {
        // Stripe réel via Edge Function
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { plan: planId },
        });

        if (error) throw error;
        if (data?.url) {
          window.location.href = data.url;
        }
      } else {
        // PayPal - redirection vers implémentation
        toast.info('PayPal sera bientôt disponible');
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-t-lg">
            <CardTitle className="text-2xl">Finaliser votre abonnement</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Plan {plan.name} - {plan.price}€/mois
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="bg-primary/10 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-primary mb-2">✨ Votre abonnement {plan.name} inclut :</h3>
              <ul className="space-y-2 text-primary/80">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>{plan.songs} chansons/mois pour la génération musicale</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Qualité audio premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>QCM et tableaux illimités</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Support prioritaire</span>
                </li>
                {plan.name === 'Premium' && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Bandes dessinées éducatives</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Choisissez votre mode de paiement :</h3>
              
              <Button
                onClick={() => handleSubscription('demo')}
                disabled={isProcessing}
                className="w-full bg-success hover:bg-success/90 text-success-foreground py-3"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {isProcessing ? 'Traitement...' : `Activer l'abonnement (Démo)`}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
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
