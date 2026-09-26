import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Crown, CreditCard, ArrowRight, Loader2, Settings } from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';
import {
  FORMULES_PREMIUM,
  NOM_OFFRE_PREMIUM,
  NOMBRE_ITEMS_GRATUITS,
  NOMBRE_ITEMS_TOTAL,
  QUOTA_GENERATIONS_AUDIO_PREMIUM,
} from '@/config/offre';
import { useSubscription } from '@/hooks/useSubscription';

interface ProfileSubscriptionProps {
  /** Conservé pour compatibilité : l'abonnement n'est plus lu dans le profil. */
  profile?: unknown;
  /** Masque le lien vers /med-mng/billing (quand on y est déjà). */
  afficherLienFacturation?: boolean;
}

/**
 * Abonnement de l'utilisateur. Même source que le reste de l'application :
 * RPC get_user_subscription via useSubscription (et non plus
 * profile.subscription_plan, qui n'était jamais mis à jour par Stripe).
 */
export const ProfileSubscription: React.FC<ProfileSubscriptionProps> = ({ afficherLienFacturation = true }) => {
  const navigate = useNavigate();
  const {
    subscription,
    musicQuota,
    loading,
    isSubscriptionActive,
    getStatusDisplay,
    openCustomerPortal,
  } = useSubscription();
  const [ouverturePortail, setOuverturePortail] = useState(false);

  const actif = isSubscriptionActive();
  const statut = subscription?.status;
  // Un abonné en retard de paiement ou résilié peut aussi passer par le portail.
  const peutGerer = actif || statut === 'past_due' || statut === 'unpaid' || statut === 'canceled';

  const gererAbonnement = async () => {
    setOuverturePortail(true);
    await openCustomerPortal();
    setOuverturePortail(false);
  };

  const fin = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('fr-FR')
    : null;

  const utilise = musicQuota?.current_usage ?? 0;
  const pourcentage = actif && QUOTA_GENERATIONS_AUDIO_PREMIUM > 0
    ? Math.min(100, Math.round((utilise / QUOTA_GENERATIONS_AUDIO_PREMIUM) * 100))
    : 0;

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Chargement de votre abonnement…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className={`h-5 w-5 ${actif ? 'text-warning' : 'text-muted-foreground'}`} />
            Votre abonnement
          </CardTitle>
          <CardDescription>Consultez et gérez votre abonnement Med MNG.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">{actif ? NOM_OFFRE_PREMIUM : 'Gratuit'}</h3>
                <Badge variant={actif ? 'default' : 'secondary'}>{getStatusDisplay()}</Badge>
              </div>
              {actif && fin && (
                <p className="text-sm text-muted-foreground">Période en cours jusqu'au {fin}</p>
              )}
              {statut === 'past_due' && (
                <p className="text-sm text-warning">
                  Le dernier paiement n'a pas abouti. Mettez à jour votre moyen de paiement pour conserver l'accès.
                </p>
              )}
            </div>
          </div>

          <Separator />

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-success rounded-full" />
              Fiches officielles (rang A et rang B) des {NOMBRE_ITEMS_TOTAL} items
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-success rounded-full" />
              {actif
                ? `Paroles, récits, planches et quiz des ${NOMBRE_ITEMS_TOTAL} items`
                : `Paroles, récits, planches et quiz de ${NOMBRE_ITEMS_GRATUITS} items d'essai`}
            </li>
            {actif && (
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-success rounded-full" />
                {QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio par mois
              </li>
            )}
          </ul>

          {actif && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Générations audio ce mois-ci</span>
                <span className="font-semibold">{utilise} / {QUOTA_GENERATIONS_AUDIO_PREMIUM}</span>
              </div>
              <Progress value={pourcentage} className="h-2" />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {peutGerer && (
              <Button onClick={gererAbonnement} disabled={ouverturePortail} variant="outline">
                {ouverturePortail ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
                Gérer / résilier mon abonnement
              </Button>
            )}
            {!actif && (
              <Button onClick={() => navigate(ROUTE_PATHS.medMngPricing)}>
                Passer à {NOM_OFFRE_PREMIUM} — {FORMULES_PREMIUM.annuel.prixAffiche}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
          {peutGerer && (
            <p className="text-xs text-muted-foreground">
              La résiliation prend effet à la fin de la période déjà payée. Vos factures sont disponibles
              dans le même espace de gestion.
            </p>
          )}
        </CardContent>
      </Card>

      {afficherLienFacturation && (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Facturation
          </CardTitle>
          <CardDescription>
            Paiement et factures sont gérés par Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="link" className="px-0" onClick={() => navigate(ROUTE_PATHS.medMngBilling)}>
            Voir la page facturation
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
      )}
    </div>
  );
};
