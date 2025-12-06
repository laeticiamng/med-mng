import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { CheckCircle, Music, ArrowRight, Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { TranslatedText } from '@/components/TranslatedText';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const MedMngSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();
  const { fetchSubscription, subscription } = useSubscription();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshData = async () => {
      if (sessionId && user) {
        // Wait for webhook to process
        setTimeout(async () => {
          await fetchSubscription();
          setLoading(false);
        }, 3000);
      } else {
        setLoading(false);
      }
    };

    refreshData();
  }, [sessionId, user, fetchSubscription]);

  const handleManageSubscription = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Erreur lors de l\'ouverture du portail client');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success/5 to-success/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-success border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Vérification de votre abonnement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/5 to-success/10 px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-success to-success/80 text-success-foreground rounded-t-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-background/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-success-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Paiement réussi !</CardTitle>
            <CardDescription className="text-success-foreground/80">
              Votre abonnement MED-MNG est maintenant actif
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {subscription && (
              <div className="bg-success/10 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-success mb-4">✨ Votre plan {subscription.plan_name} est actif !</h3>
                <ul className="space-y-2 text-success/90">
                  <li className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-success" />
                    <span>{subscription.monthly_quota} générations musicales par mois</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Sauvegarde dans votre bibliothèque</span>
                  </li>
                  {subscription.features.tableaux && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Accès aux tableaux Rang A et B</span>
                    </li>
                  )}
                  {subscription.features.quiz && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Quiz complets disponibles</span>
                    </li>
                  )}
                  {subscription.features.bande_dessinee && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Bandes dessinées éducatives</span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={() => navigate(ROUTE_PATHS.generator)}
                className="w-full bg-success hover:bg-success/90 text-success-foreground py-3"
                size="lg"
              >
                <Music className="h-5 w-5 mr-2" />
                Commencer à générer de la musique
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <Button
                onClick={handleManageSubscription}
                variant="outline"
                className="w-full py-3"
                size="lg"
              >
                <Settings className="h-5 w-5 mr-2" />
                Gérer mon abonnement
              </Button>

              <Button
                onClick={() => navigate(ROUTE_PATHS.home)}
                variant="ghost"
                className="w-full py-3"
                size="lg"
              >
                <Home className="h-5 w-5 mr-2" />
                Retour à l'accueil
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground mt-6">
              <p>📧 Vous recevrez un email de confirmation sous peu</p>
              <p>❓ Questions ? Contactez notre support</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};