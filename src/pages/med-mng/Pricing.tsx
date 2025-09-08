import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Crown, 
  Star, 
  Zap, 
  Heart,
  Music,
  BookOpen,
  Users,
  Shield,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  premium?: boolean;
  icon: React.ReactNode;
  color: string;
}

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Étudiant',
      price: 0,
      period: 'mois',
      description: 'Parfait pour débuter votre apprentissage médical',
      features: [
        '10 compositions musicales par mois',
        'Accès aux 50 premiers items EDN',
        'Quiz interactifs de base',
        'Support par email'
      ],
      icon: <BookOpen className="w-6 h-6" />,
      color: 'blue'
    },
    {
      id: 'standard',
      name: 'Médecin',
      price: 19,
      period: 'mois',
      description: 'Idéal pour les internes et jeunes médecins',
      features: [
        '100 compositions musicales par mois',
        'Accès complet aux 367 items EDN',
        'Sessions de thérapie musicale',
        'Analytics de progression',
        'Support prioritaire',
        'Téléchargements hors ligne'
      ],
      popular: true,
      icon: <Heart className="w-6 h-6" />,
      color: 'pink'
    },
    {
      id: 'premium',
      name: 'Expert Premium',
      price: 49,
      period: 'mois',
      description: 'Pour les professionnels exigeants',
      features: [
        'Compositions illimitées',
        'IA personnalisée avancée',
        'Analyse prédictive des performances',
        'Coaching individuel',
        'API et intégrations tierces',
        'Support 24/7',
        'Accès aux nouvelles fonctionnalités'
      ],
      premium: true,
      icon: <Crown className="w-6 h-6" />,
      color: 'gold'
    }
  ];

  const handleSubscribe = (planId: string) => {
    toast({
      title: "🚀 Souscription en cours",
      description: `Redirection vers le paiement pour le plan ${plans.find(p => p.id === planId)?.name}...`,
    });
    
    // Simuler la redirection vers le paiement
    setTimeout(() => {
      navigate('/med-mng/dashboard');
    }, 2000);
  };

  const getCardClassName = (plan: PricingPlan) => {
    let baseClass = "relative overflow-hidden transition-all duration-300 hover:shadow-2xl";
    
    if (plan.popular) {
      baseClass += " border-pink-500 shadow-lg scale-105";
    } else if (plan.premium) {
      baseClass += " border-yellow-500 shadow-lg";
    } else {
      baseClass += " hover:shadow-lg";
    }
    
    return baseClass;
  };

  const getButtonClassName = (plan: PricingPlan) => {
    if (plan.popular) {
      return "w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0";
    } else if (plan.premium) {
      return "w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0";
    } else {
      return "w-full";
    }
  };

  return (
    <MedMngLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Choisissez votre plan d'apprentissage
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transformez votre façon d'apprendre la médecine avec l'IA musicale. 
            Commencez gratuitement et évoluez selon vos besoins.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={getCardClassName(plan)}>
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center py-2 text-sm font-medium">
                  <Star className="inline w-4 h-4 mr-1" />
                  Le plus populaire
                </div>
              )}
              
              {plan.premium && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-center py-2 text-sm font-medium">
                  <Crown className="inline w-4 h-4 mr-1" />
                  Premium
                </div>
              )}

              <CardHeader className={plan.popular || plan.premium ? "pt-12" : ""}>
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    plan.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                    plan.color === 'gold' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {plan.icon}
                  </div>
                </div>
                
                <CardTitle className="text-2xl text-center">{plan.name}</CardTitle>
                
                <div className="text-center space-y-2">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground ml-1">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  className={getButtonClassName(plan)}
                  size="lg"
                >
                  {plan.price === 0 ? 'Commencer gratuitement' : 'S\'abonner maintenant'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Garanties */}
        <div className="bg-secondary/50 rounded-lg p-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <Shield className="w-8 h-8 text-green-500 mx-auto" />
              <h3 className="font-semibold">Garantie 30 jours</h3>
              <p className="text-sm text-muted-foreground">
                Remboursement intégral si vous n'êtes pas satisfait
              </p>
            </div>
            
            <div className="space-y-2">
              <Zap className="w-8 h-8 text-blue-500 mx-auto" />
              <h3 className="font-semibold">Accès instantané</h3>
              <p className="text-sm text-muted-foreground">
                Commencez immédiatement après votre souscription
              </p>
            </div>
            
            <div className="space-y-2">
              <Users className="w-8 h-8 text-purple-500 mx-auto" />
              <h3 className="font-semibold">Support expert</h3>
              <p className="text-sm text-muted-foreground">
                Assistance par des professionnels de santé
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center text-foreground">
            Questions fréquentes
          </h2>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Comment fonctionne l'IA musicale ?</h3>
                <p className="text-muted-foreground">
                  Notre IA analyse le contenu médical et crée des compositions musicales 
                  personnalisées pour optimiser la mémorisation et l'apprentissage.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h3>
                <p className="text-muted-foreground">
                  Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                  Les changements prennent effet immédiatement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Le contenu est-il validé médicalement ?</h3>
                <p className="text-muted-foreground">
                  Absolument. Tout notre contenu est validé par des professionnels de santé 
                  et suit les référentiels officiels EDN.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <span className="text-lg font-semibold">Rejoignez plus de 15,000 étudiants</span>
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-muted-foreground">
            Transformez votre apprentissage médical dès aujourd'hui avec MED MNG
          </p>
        </div>
      </div>
    </MedMngLayout>
  );
};