import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

// Source de vérité unique : SUBSCRIPTION_TIERS (hooks/useSubscription.ts).
const plans = {
  standard: { name: SUBSCRIPTION_TIERS.standard.name, price: SUBSCRIPTION_TIERS.standard.price, songs: SUBSCRIPTION_TIERS.standard.generations },
  pro: { name: SUBSCRIPTION_TIERS.pro.name, price: SUBSCRIPTION_TIERS.pro.price, songs: SUBSCRIPTION_TIERS.pro.generations },
  premium: { name: SUBSCRIPTION_TIERS.premium.name, price: SUBSCRIPTION_TIERS.premium.price, songs: SUBSCRIPTION_TIERS.premium.generations },
};

export const MedMngSubscribe = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // CONSTAT (audit allégations) : un bouton « Activer l'abonnement (Démo) » créait
  // un abonnement payant sans paiement. Supprimé : seul le paiement Stripe réel
  // (Edge Function create-checkout) peut ouvrir un plan payant.
  const handleSubscription = async () => {
    if (!plan || !user) return;

    setIsProcessing(true);
    try {
      logActivity({ activity_type: 'study', metadata: { action: 'checkout_start', plan: plan.name } });
      const { data, error } = await supabase.functions.invoke('mm-create-checkout', {
        body: { plan: planId },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Le paiement est momentanément indisponible. Réessayez plus tard.');
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erreur abonnement:', error);
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
                  <span>{plan.songs.toLocaleString('fr-FR')} générations audio de chansons par mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Les 367 items EDN : fiche, rang A, rang B, quiz, paroles</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Choisissez votre mode de paiement :</h3>
              
              <Button
                onClick={() => handleSubscription()}
                disabled={isProcessing}
                className="w-full bg-success hover:bg-success/90 text-success-foreground py-3"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {isProcessing ? 'Redirection vers le paiement…' : 'Payer par carte (Stripe)'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                                <p>Renouvellement automatique mensuel</p>
                <p>Résiliation possible à tout moment depuis votre profil</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
