import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Star, Music2, Brain, Headphones, Download } from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { useToast } from '@/hooks/use-toast';

interface PremiumFeature {
  icon: any;
  title: string;
  description: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: PremiumFeature[];
  popular?: boolean;
  cta: string;
  badge?: string;
}

export default function Premium() {
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans: PricingPlan[] = [
    {
      name: 'Étudiant',
      price: billingPeriod === 'monthly' ? 9.99 : 99.99,
      period: billingPeriod === 'monthly' ? '/mois' : '/an',
      description: 'Parfait pour débuter dans l\'apprentissage musical médical',
      features: [
        { icon: Music2, title: '50 générations/mois', description: 'Créez jusqu\'à 50 musiques par mois', included: true },
        { icon: Brain, title: 'IA éducative', description: 'Accès à tous les styles musicaux', included: true },
        { icon: Download, title: 'Téléchargements', description: 'Exportez vos créations', included: true },
        { icon: Headphones, title: 'Support prioritaire', description: 'Aide dédiée aux étudiants', included: false }
      ],
      cta: 'Commencer gratuitement'
    },
    {
      name: 'Pro',
      price: billingPeriod === 'monthly' ? 19.99 : 199.99,
      period: billingPeriod === 'monthly' ? '/mois' : '/an',
      description: 'Pour les professionnels de santé et formateurs',
      features: [
        { icon: Music2, title: 'Générations illimitées', description: 'Créez autant de musiques que nécessaire', included: true },
        { icon: Brain, title: 'IA avancée', description: 'Modèles IA premium et personnalisation', included: true },
        { icon: Download, title: 'Export premium', description: 'Formats haute qualité et sans watermark', included: true },
        { icon: Headphones, title: 'Support prioritaire', description: 'Assistance dédiée sous 24h', included: true }
      ],
      popular: true,
      badge: 'Plus populaire',
      cta: 'Démarrer Pro'
    },
    {
      name: 'Institution',
      price: billingPeriod === 'monthly' ? 49.99 : 499.99,
      period: billingPeriod === 'monthly' ? '/mois' : '/an',
      description: 'Solution complète pour universités et hôpitaux',
      features: [
        { icon: Music2, title: 'Multi-utilisateurs', description: 'Jusqu\'à 100 comptes inclus', included: true },
        { icon: Brain, title: 'IA sur-mesure', description: 'Modèles personnalisés pour votre institution', included: true },
        { icon: Download, title: 'Intégration LMS', description: 'Compatible Moodle, Canvas, etc.', included: true },
        { icon: Headphones, title: 'Support dédié', description: 'Manager de compte et formation incluse', included: true }
      ],
      badge: 'Enterprise',
      cta: 'Nous contacter'
    }
  ];

  const handleSubscribe = (plan: string) => {
    toast({
      title: `Abonnement ${plan}`,
      description: "Redirection vers la page de paiement sécurisé...",
    });
    
    // Ici, redirection vers Stripe ou autre processeur de paiement
    console.log(`Souscription au plan ${plan}`);
  };

  const testimonials = [
    {
      name: 'Dr. Marie Laurent',
      role: 'Professeure de Cardiologie, CHU Paris',
      content: 'Révolutionnaire ! Mes étudiants retiennent 3x mieux les concepts complexes avec ces musiques.',
      rating: 5
    },
    {
      name: 'Thomas Durand',
      role: 'Externe en Médecine, Lyon',
      content: 'J\'ai validé mes ECN grâce aux musiques MedMng. Un outil indispensable pour réviser.',
      rating: 5
    },
    {
      name: 'Prof. Jean-Claude Martin',
      role: 'Doyen Faculté de Médecine, Bordeaux',
      content: 'Nous avons intégré MedMng dans notre cursus. Les résultats sont exceptionnels.',
      rating: 5
    }
  ];

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              <Crown className="w-4 h-4 mr-2" />
              Offre spéciale étudiants -50%
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              Débloquez tout le potentiel de l'IA médicale
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Accédez à des fonctionnalités premium pour transformer votre apprentissage médical 
              avec des musiques IA illimitées et personnalisées
            </p>
            
            {/* Billing toggle */}
            <div className="flex items-center justify-center mb-12">
              <span className={`mr-3 ${billingPeriod === 'monthly' ? 'text-white' : 'text-white/70'}`}>
                Mensuel
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-16 h-8 bg-white/20 rounded-full p-1"
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                  billingPeriod === 'yearly' ? 'translate-x-8' : ''
                }`} />
              </button>
              <span className={`ml-3 ${billingPeriod === 'yearly' ? 'text-white' : 'text-white/70'}`}>
                Annuel
              </span>
              {billingPeriod === 'yearly' && (
                <Badge className="ml-2 bg-green-500 text-white">
                  -20%
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-10">
          
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name}
                className={`relative bg-white shadow-xl ${
                  plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className={`px-3 py-1 ${
                      plan.popular ? 'bg-purple-500' : 'bg-blue-500'
                    } text-white`}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  </div>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${
                          feature.included ? 'text-green-500' : 'text-gray-400'
                        }`}>
                          {feature.included ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4 border border-gray-300 rounded-full" />
                          )}
                        </div>
                        <div>
                          <div className={`font-medium ${
                            feature.included ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {feature.title}
                          </div>
                          <div className={`text-sm ${
                            feature.included ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {feature.description}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleSubscribe(plan.name)}
                    className={`w-full py-3 ${
                      plan.popular 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features showcase */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">
              Pourquoi choisir MedMng Premium ?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">IA Ultra-rapide</h3>
                <p className="text-gray-600 text-sm">
                  Génération instantanée avec les modèles IA les plus avancés
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Neuro-optimisé</h3>
                <p className="text-gray-600 text-sm">
                  Basé sur les dernières recherches en neurosciences de l'apprentissage
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Export haute qualité</h3>
                <p className="text-gray-600 text-sm">
                  Téléchargez en MP3, WAV et formats professionnels
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Support 24/7</h3>
                <p className="text-gray-600 text-sm">
                  Assistance dédiée par des experts en pédagogie médicale
                </p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">
              Ils ont transformé leur apprentissage
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center mb-16">
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">
                  Prêt à révolutionner votre apprentissage ?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Rejoignez plus de 10,000 professionnels de santé qui utilisent déjà MedMng
                </p>
                <Button 
                  onClick={() => handleSubscribe('Pro')}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3"
                >
                  Essayer gratuitement 14 jours
                </Button>
                <p className="text-sm mt-4 opacity-75">
                  Aucune carte de crédit requise • Annulation à tout moment
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MedMngLayout>
  );
}