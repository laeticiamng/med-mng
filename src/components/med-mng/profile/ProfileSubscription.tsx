import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Crown, CreditCard, Calendar, Zap, Star, ArrowRight } from 'lucide-react';

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
          icon: <Crown className="h-5 w-5 text-yellow-600" />,
          color: 'bg-yellow-100 text-yellow-800',
          features: ['50 crédits/mois', 'Qualité audio premium', 'Support prioritaire'],
          price: '9,99€/mois'
        };
      case 'pro':
        return {
          name: 'Pro',
          icon: <Star className="h-5 w-5 text-purple-600" />,
          color: 'bg-purple-100 text-purple-800',
          features: ['100 crédits/mois', 'Qualité audio HD', 'API access', 'Support dédié'],
          price: '19,99€/mois'
        };
      default:
        return {
          name: 'Gratuit',
          icon: <Zap className="h-5 w-5 text-gray-600" />,
          color: 'bg-gray-100 text-gray-800',
          features: ['2 crédits/mois', 'Qualité audio standard'],
          price: 'Gratuit'
        };
    }
  };

  const subscriptionDetails = getSubscriptionDetails(profile?.subscription_plan || 'free');
  const creditsUsed = 50 - (profile?.credits_left || 0);
  const totalCredits = 50; // Base assumption
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
              <p className="text-gray-600">{subscriptionDetails.price}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Prochain renouvellement</p>
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
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
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
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{profile?.credits_left || 0}</p>
              <p className="text-sm text-gray-600">Crédits restants</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{creditsUsed}</p>
              <p className="text-sm text-gray-600">Crédits utilisés</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {profile?.subscription_plan === 'free' && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Améliorez votre plan
            </CardTitle>
            <CardDescription>
              Débloquez plus de fonctionnalités avec nos plans premium
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-yellow-800 mb-2">Premium</h4>
                <p className="text-sm text-gray-600 mb-3">50 crédits/mois + qualité premium</p>
                <p className="text-xl font-bold mb-3">9,99€/mois</p>
                <Button className="w-full" onClick={() => navigate('/med-mng/pricing')}>
                  Choisir Premium
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-purple-800 mb-2">Pro</h4>
                <p className="text-sm text-gray-600 mb-3">100 crédits/mois + API access</p>
                <p className="text-xl font-bold mb-3">19,99€/mois</p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/med-mng/pricing')}>
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
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune facture disponible</p>
            <p className="text-sm">Vos factures apparaîtront ici après votre premier paiement</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};