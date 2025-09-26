import React, { useState } from 'react';
import { Crown, Check, Zap, Star, CreditCard, Shield, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Helmet } from 'react-helmet-async';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular?: boolean;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const plans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Étudiant',
    description: 'Pour débuter votre apprentissage médical',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    color: 'text-blue-600',
    icon: Star,
    features: [
      'Accès aux items EDN de base',
      'Génération musicale standard',
      'Suivi de progression',
      'Communauté étudiante',
      'Support par email',
      'Jusqu\'à 3 playlists'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'L\'expérience complète pour exceller',
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    popular: true,
    color: 'text-primary',
    icon: Crown,
    features: [
      'Tous les items EDN + exclusifs',
      'IA musicale avancée personnalisée',
      'Analytics détaillées',
      'Parcours d\'apprentissage adaptatifs',
      'Support prioritaire + chat',
      'Playlists illimitées',
      'Mode hors ligne',
      'Sessions de groupe privées'
    ]
  },
  {
    id: 'pro',
    name: 'Professionnel',
    description: 'Pour les professionnels de santé',
    monthlyPrice: 39.99,
    yearlyPrice: 399.99,
    color: 'text-purple-600',
    icon: Zap,
    features: [
      'Tous les avantages Premium',
      'Contenus de formation continue',
      'Certifications officielles',
      'API d\'intégration',
      'Support téléphonique dédié',
      'Gestion d\'équipe',
      'Rapports institutionnels',
      'Personnalisation de marque'
    ]
  }
];

export const MedMngSubscribe = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const getPrice = (plan: PricingPlan) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: PricingPlan) => {
    const monthlyTotal = plan.monthlyPrice * 12;
    const savings = monthlyTotal - plan.yearlyPrice;
    return Math.round((savings / monthlyTotal) * 100);
  };

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    // Handle subscription logic here
    console.log(`Subscribing to plan: ${planId}, yearly: ${isYearly}`);
  };

  return (
    <>
      <Helmet>
        <title>Abonnement Premium - MED-MNG</title>
        <meta name="description" content="Accédez à tous les contenus EDN premium et fonctionnalités avancées d'IA musicale" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Choisissez votre plan</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Débloquez tout le potentiel de MED-MNG avec nos fonctionnalités premium 
            d'apprentissage médical et d'IA musicale
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm ${!isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
            Mensuel
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-primary"
          />
          <span className={`text-sm ${isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
            Annuel
          </span>
          {isYearly && (
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-green-300">
              Jusqu'à 20% d'économie
            </Badge>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/80" />
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <plan.icon className={`h-6 w-6 ${plan.color}`} />
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  {plan.popular && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Populaire
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{getPrice(plan).toFixed(2)}€</span>
                    <span className="text-muted-foreground">/{isYearly ? 'an' : 'mois'}</span>
                  </div>
                  {isYearly && (
                    <p className="text-sm text-green-600 mt-1">
                      Économisez {getSavings(plan)}% par rapport au mensuel
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={selectedPlan === plan.id}
                >
                  {selectedPlan === plan.id ? (
                    'Processing...'
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {plan.id === 'basic' ? 'Commencer' : 'Choisir Premium'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="text-center mb-12">
          <Alert className="max-w-2xl mx-auto">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-center">
              <strong>Garantie 30 jours satisfait ou remboursé</strong><br />
              Paiement sécurisé • Annulation facile • Support 24/7
            </AlertDescription>
          </Alert>
        </div>

        {/* FAQ Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Questions fréquentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Puis-je changer de plan ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis vos paramètres.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Y a-t-il un engagement ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Aucun engagement. Vous pouvez annuler votre abonnement à tout moment.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Les contenus EDN sont-ils officiels ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Oui, nous travaillons directement avec les universités et le CNG pour garantir l'authenticité.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Comment fonctionne l'IA musicale ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Notre IA génère de la musique personnalisée pour optimiser votre concentration et mémorisation.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Puis-je utiliser MED-MNG hors ligne ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Les plans Premium et Pro incluent le mode hors ligne pour étudier partout.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Support technique inclus ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Tous les plans incluent le support. Premium et Pro bénéficient d'un support prioritaire.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Rejoignez plus de 10,000 étudiants qui utilisent déjà MED-MNG
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Sans engagement
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Garantie 30 jours
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Support inclus
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedMngSubscribe;