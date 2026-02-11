import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ROUTE_PATHS } from '@/config/routes';
import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useAuth } from '@/components/med-mng/AuthProvider';
import {
  CreditCard,
  Crown,
  ExternalLink,
  Music,
  RefreshCw,
  Settings,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BillingDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    subscription,
    musicQuota,
    loading,
    getStatusDisplay,
    getStatusColor,
    getQuotaPercentage,
    getRemainingGenerations,
    getDaysUntilReset,
    formatQuotaDisplay,
    getPlanTier,
    canUpgrade,
    getUpgradeOptions,
    openCustomerPortal,
    createCheckout,
  } = useSubscription();

  const quotaDisplay = formatQuotaDisplay();
  const planTier = getPlanTier();
  const daysUntilReset = getDaysUntilReset();
  const remaining = getRemainingGenerations();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse h-32 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-accent" />
                Votre abonnement
              </CardTitle>
              <CardDescription>
                Gérez votre abonnement et votre consommation
              </CardDescription>
            </div>
            <Badge className={getStatusColor()}>
              {getStatusDisplay()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan info */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-semibold text-lg">
                {subscription?.plan_name || 'Plan Gratuit'}
              </p>
              <p className="text-sm text-muted-foreground">
                {planTier === 'free' ? 'Accès limité' :
                 planTier === 'premium' ? 'Accès complet' :
                 `Plan ${subscription?.plan_name}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {planTier === 'free' ? '0€' :
                 planTier === 'basic' ? '19€' :
                 planTier === 'pro' ? '29€' :
                 '39€'}
              </p>
              <p className="text-sm text-muted-foreground">/mois</p>
            </div>
          </div>

          {/* Music Quota */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-primary" />
                <span className="font-medium">Générations musicales</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {quotaDisplay.used} / {quotaDisplay.total}
              </span>
            </div>
            <Progress
              value={parseInt(quotaDisplay.percentage)}
              className={`h-3 ${
                quotaDisplay.status === 'critical' ? '[&>div]:bg-destructive' :
                quotaDisplay.status === 'warning' ? '[&>div]:bg-warning' :
                ''
              }`}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{remaining} générations restantes</span>
              <span>Réinitialisation dans {daysUntilReset} jours</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {canUpgrade() && (
              <Button
                onClick={() => navigate(ROUTE_PATHS.medMngPricing)}
                className="gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Passer au Premium
              </Button>
            )}
            {subscription && (
              <Button
                variant="outline"
                onClick={() => openCustomerPortal()}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Gérer l'abonnement
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparer les plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Gratuit */}
            <div className={`p-4 rounded-lg border-2 ${planTier === 'free' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
              <h3 className="font-bold mb-2">Gratuit</h3>
              <p className="text-2xl font-bold mb-3">0€<span className="text-sm font-normal">/mois</span></p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-muted-foreground" /> 3 générations IA/mois</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-muted-foreground" /> 10 flashcards/jour</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-muted-foreground" /> Items EDN basiques</li>
              </ul>
            </div>

            {/* Premium */}
            <div className={`p-4 rounded-lg border-2 ${planTier === 'premium' ? 'border-accent bg-accent/5' : 'border-muted'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Premium</h3>
                <Badge variant="secondary">Recommandé</Badge>
              </div>
              <p className="text-2xl font-bold mb-3">39€<span className="text-sm font-normal">/mois</span></p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-accent" /> Musique IA illimitée</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-accent" /> 367 items EDN complets</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-accent" /> QCM + QRU + QROC</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-accent" /> Cas cliniques avancés</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-accent" /> Mode examen EDN</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-accent" /> Support VIP</li>
              </ul>
            </div>

            {/* Institution */}
            <div className={`p-4 rounded-lg border-2 border-muted`}>
              <h3 className="font-bold mb-2">Institution</h3>
              <p className="text-2xl font-bold mb-3">99€<span className="text-sm font-normal">/mois</span></p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-warning" /> Multi-utilisateurs</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-warning" /> Dashboard admin</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-warning" /> Analytics promotion</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-warning" /> Support dédié</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-warning" /> Toutes fonctions Premium</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Music className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xl font-bold">{musicQuota?.current_usage || 0}</p>
            <p className="text-xs text-muted-foreground">Générations ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className="text-xl font-bold">{remaining}</p>
            <p className="text-xs text-muted-foreground">Restantes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <RefreshCw className="h-6 w-6 mx-auto mb-2 text-success" />
            <p className="text-xl font-bold">{daysUntilReset}j</p>
            <p className="text-xs text-muted-foreground">Avant reset</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-warning" />
            <p className="text-xl font-bold">{quotaDisplay.percentage}</p>
            <p className="text-xs text-muted-foreground">Consommation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
