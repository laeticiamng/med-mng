import React, { useEffect } from 'react';
import { CheckCircle, Crown, Mail, ArrowRight, Download, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export const MedMngSuccess = () => {
  useEffect(() => {
    // Track conversion or send analytics
    console.log('Subscription success page loaded');
  }, []);

  const nextSteps = [
    {
      icon: BookOpen,
      title: 'Explorez les contenus premium',
      description: 'Accédez à tous les items EDN exclusifs et parcours avancés',
      action: 'Explorer',
      href: '/med-mng/library'
    },
    {
      icon: Crown,
      title: 'Configurez votre IA musicale',
      description: 'Personnalisez vos préférences pour une expérience optimale',
      action: 'Configurer',
      href: '/med-mng/create'
    },
    {
      icon: Users,
      title: 'Rejoignez la communauté premium',
      description: 'Accédez aux groupes d\'étude exclusifs et événements',
      action: 'Rejoindre',
      href: '/community'
    }
  ];

  const benefits = [
    'Accès illimité à tous les contenus EDN',
    'IA musicale avancée et personnalisée',
    'Analytics détaillées de progression',
    'Support prioritaire 24/7',
    'Mode hors ligne disponible',
    'Sessions de groupe privées'
  ];

  return (
    <>
      <Helmet>
        <title>Bienvenue dans MED-MNG Premium ! - MED-MNG</title>
        <meta name="description" content="Félicitations ! Votre abonnement MED-MNG Premium est maintenant actif" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              Bienvenue dans MED-MNG Premium ! 🎉
            </h1>
            <p className="text-xl text-muted-foreground">
              Votre abonnement a été activé avec succès
            </p>
          </div>

          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-purple/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Crown className="h-6 w-6 text-primary" />
                <Badge variant="default" className="bg-primary">
                  Premium Actif
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Vous avez maintenant accès à toutes les fonctionnalités premium de MED-MNG.
                Un email de confirmation a été envoyé à votre adresse.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What's Included */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Ce qui est inclus dans votre abonnement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Prochaines étapes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nextSteps.map((step, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    {step.description}
                  </p>
                  <Button asChild className="w-full">
                    <Link to={step.href} className="flex items-center justify-center gap-2">
                      {step.action}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Confirmation par email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Un email de confirmation avec tous les détails de votre abonnement 
                a été envoyé à votre adresse email.
              </p>
              <Button variant="outline" className="w-full">
                Renvoyer l'email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Application mobile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Téléchargez l'app mobile pour étudier partout avec le mode hors ligne premium.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  iOS
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Android
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Besoin d'aide ?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Notre équipe support premium est là pour vous accompagner
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link to="/support">
                  Centre d'aide
                </Link>
              </Button>
              <Button asChild>
                <a href="mailto:premium@med-mng.fr">
                  Contact Premium
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Thank You Message */}
        <div className="text-center mt-12 p-6 bg-gradient-to-r from-primary/5 to-purple/5 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Merci de votre confiance ! 🙏</h3>
          <p className="text-muted-foreground">
            Nous sommes ravis de vous accompagner dans votre parcours médical. 
            Ensemble, révolutionnons l'apprentissage de la médecine avec l'IA.
          </p>
        </div>
      </div>
    </>
  );
};

export default MedMngSuccess;