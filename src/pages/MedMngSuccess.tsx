import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/config/routes';
import { NOM_OFFRE_PREMIUM, NOMBRE_ITEMS_TOTAL, QUOTA_GENERATIONS_AUDIO_PREMIUM } from '@/config/offre';
import { useSubscription } from '@/hooks/useSubscription';
import { ArrowRight, BookOpen, CheckCircle, Clock, Home, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { trackConversionEvent } from '@/lib/conversionTracking';

/** Sondage de l'activation : le webhook Stripe peut arriver après le retour. */
const NOMBRE_SONDAGES = 5;
const INTERVALLE_SONDAGE_MS = 1500;

type Etat = 'verification' | 'active' | 'en_attente';

export const MedMngSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();
  const { refresh, openCustomerPortal } = useSubscription();
  const [etat, setEtat] = useState<Etat>('verification');
  const lanceRef = useRef(false);

  useEffect(() => {
    if (!user || lanceRef.current) return;
    lanceRef.current = true;
    let annule = false;

    if (sessionId) trackConversionEvent('checkout_complete', { sessionId });

    const sonder = async () => {
      for (let i = 0; i < NOMBRE_SONDAGES && !annule; i++) {
        const abo = await refresh();
        if (annule) return;
        if (abo && (abo.status === 'active' || abo.status === 'trialing')) {
          setEtat('active');
          return;
        }
        if (i < NOMBRE_SONDAGES - 1) {
          await new Promise((r) => setTimeout(r, INTERVALLE_SONDAGE_MS));
        }
      }
      if (!annule) setEtat('en_attente');
    };
    sonder();

    return () => {
      annule = true;
    };
  }, [user, sessionId, refresh]);

  if (etat === 'verification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success/5 to-success/10 flex items-center justify-center px-4">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin h-12 w-12 border-4 border-success border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Vérification de votre abonnement…</p>
        </div>
      </div>
    );
  }

  const active = etat === 'active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/5 to-success/10 px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-success to-success/80 text-success-foreground rounded-t-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-background/20 rounded-full flex items-center justify-center">
                {active
                  ? <CheckCircle className="h-10 w-10 text-success-foreground" />
                  : <Clock className="h-10 w-10 text-success-foreground" />}
              </div>
            </div>
            <CardTitle className="text-2xl" aria-live="polite">
              {active ? 'Abonnement activé' : 'Paiement reçu, activation en cours…'}
            </CardTitle>
            <CardDescription className="text-success-foreground/80">
              {active
                ? `Bienvenue dans ${NOM_OFFRE_PREMIUM}.`
                : "La confirmation de Stripe peut prendre quelques instants. Actualisez cette page dans une minute ; si l'accès n'est toujours pas ouvert, contactez-nous."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {active && (
              <div className="bg-success/10 rounded-lg p-6 mb-6">
                <ul className="space-y-2 text-success/90">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Paroles, récits, planches et quiz des {NOMBRE_ITEMS_TOTAL} items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>{QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio par mois</span>
                  </li>
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={() => navigate(ROUTE_PATHS.ednComplete)}
                className="w-full bg-success hover:bg-success/90 text-success-foreground py-3"
                size="lg"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Réviser les items
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              {!active && (
                <Button onClick={() => window.location.reload()} variant="outline" className="w-full py-3" size="lg">
                  Actualiser
                </Button>
              )}

              {active && (
                <Button onClick={() => openCustomerPortal()} variant="outline" className="w-full py-3" size="lg">
                  <Settings className="h-5 w-5 mr-2" />
                  Gérer mon abonnement
                </Button>
              )}

              <Button onClick={() => navigate(ROUTE_PATHS.home)} variant="ghost" className="w-full py-3" size="lg">
                <Home className="h-5 w-5 mr-2" />
                Retour à l'accueil
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Vos factures sont disponibles depuis « Gérer mon abonnement » (profil).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
