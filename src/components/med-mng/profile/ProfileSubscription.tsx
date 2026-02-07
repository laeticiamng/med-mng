import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Crown, CreditCard, Calendar, Zap, Star, ArrowRight } from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';

interface ProfileSubscriptionProps {
  profile: any;
}

export const ProfileSubscription: React.FC<ProfileSubscriptionProps> = ({ profile }) => {
  const navigate = useNavigate();

  const getSubscriptionDetails = (plan: string) => {
    switch (plan) {
      case 'premium':
        return {
          name: 'Premium',
          icon: <Crown className="h-5 w-5 text-warning" />,
          color: 'bg-warning/10 text-warning',
          features: ['3 000 chansons/mois', 'Tableaux EDN', 'QCM entraînement', 'Bande dessinée', 'Sauvegarde bibliothèque', 'Support VIP'],
          price: '39€/mois',
          totalCredits: 3000
        };
      case 'pro':
        return {
          name: 'Pro',
          icon: <Star className="h-5 w-5 text-accent" />,
          color: 'bg-accent/10 text-accent-foreground',
          features: ['300 chansons/mois', 'Tableaux EDN', 'QCM entraînement', 'Sauvegarde bibliothèque', 'Support prioritaire'],
          price: '29€/mois',
          totalCredits: 300
        };
      case 'standard':
        return {
          name: 'Standard',
          icon: <Zap className="h-5 w-5 text-primary" />,
          color: 'bg-primary/10 text-primary',
          features: ['30 chansons/mois', 'Tableaux EDN', 'Sauvegarde bibliothèque', 'Support email'],
          price: '19€/mois',
          totalCredits: 30
        };
      default:
        return {
          name: 'Gratuit',
          icon: <Zap className="h-5 w-5 text-muted-foreground" />,
          color: 'bg-muted text-muted-foreground',
          features: ['3 chansons/mois'],
          price: 'Gratuit',
          totalCredits: 3
        };
    }
  };

  const subscriptionDetails = getSubscriptionDetails(profile?.subscription_plan || 'free');
  const totalCredits = subscriptionDetails.totalCredits;
  const creditsUsed = totalCredits - (profile?.credits_left || 0);
  const creditsProgress = (creditsUsed / totalCredits) * 100;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {subscriptionDetails.icon}
            Plan actuel
          </CardTitle>
          <CardDescription>
            Gérez votre abonnement et consultez votre utilisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold">{subscriptionDetails.name}</h3>
                <Badge className={subscriptionDetails.color}>
                  {subscriptionDetails.name}
                </Badge>
              </div>
              <p className="text-muted-foreground">{subscriptionDetails.price}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Prochain renouvellement</p>
              <p className="font-semibold">
                {profile?.subscription_plan !== 'free' 
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Fonctionnalités incluses</h4>
            <ul className="space-y-2">
              {subscriptionDetails.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-success rounded-full" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Utilisation des crédits</CardTitle>
          <CardDescription>
            Suivez votre consommation de crédits ce mois-ci
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Crédits utilisés</span>
            <span className="font-semibold">{creditsUsed} / {totalCredits}</span>
          </div>
          <Progress value={creditsProgress} className="h-3" />
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-2xl font-bold text-primary">{profile?.credits_left || 0}</p>
              <p className="text-sm text-muted-foreground">Crédits restants</p>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <p className="text-2xl font-bold text-success">{creditsUsed}</p>
              <p className="text-sm text-muted-foreground">Crédits utilisés</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {profile?.subscription_plan === 'free' && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-warning" />
              Améliorez votre plan
            </CardTitle>
            <CardDescription>
              Débloquez plus de fonctionnalités avec nos plans premium
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-card rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">Standard</h4>
                <p className="text-sm text-muted-foreground mb-3">30 chansons/mois + tableaux EDN</p>
                <p className="text-xl font-bold mb-3">19€/mois</p>
                <Button className="w-full" onClick={() => navigate(ROUTE_PATHS.medMngPricing)}>
                  Choisir Standard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <h4 className="font-semibold text-accent-foreground mb-2">Pro</h4>
                <p className="text-sm text-muted-foreground mb-3">300 chansons/mois + QCM entraînement</p>
                <p className="text-xl font-bold mb-3">29€/mois</p>
                <Button variant="outline" className="w-full" onClick={() => navigate(ROUTE_PATHS.medMngPricing)}>
                  Choisir Pro
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Historique de facturation
          </CardTitle>
          <CardDescription>
            Consultez vos factures et paiements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune facture disponible</p>
            <p className="text-sm">Vos factures apparaîtront ici après votre premier paiement</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};