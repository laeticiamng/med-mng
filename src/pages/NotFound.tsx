import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { Home, ArrowLeft, Search, HelpCircle, Music } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const popularPages = [
    {
      title: 'Accueil',
      description: 'Retour à la page principale',
      href: '/',
      icon: Home
    },
    {
      title: 'Plateforme MED-MNG',
      description: 'Génération de musique thérapeutique',
      href: '/med-mng/platform',
      icon: Music
    },
    {
      title: 'Centre d\'aide',
      description: 'Documentation et support',
      href: '/help',
      icon: HelpCircle
    }
  ];

  return (
    <ConsistentBackground>
      <Helmet>
        <title>Page non trouvée - 404 | MED-MNG</title>
        <meta name="description" content="La page que vous recherchez n'existe pas ou a été déplacée." />
      </Helmet>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center">
          {/* 404 Visual */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="text-9xl font-bold text-primary/20 select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                  <Search className="w-12 h-12 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Page non trouvée
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              La page que vous recherchez n'existe pas ou a été déplacée. 
              Vérifiez l'URL ou utilisez les liens ci-dessous pour naviguer.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour en arrière
            </Button>
            <Button 
              asChild
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                Accueil
              </Link>
            </Button>
          </div>

          {/* Popular Pages */}
          <div className="text-left">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
              Pages populaires
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {popularPages.map((page) => (
                <Card key={page.href} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Link to={page.href} className="block group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <page.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {page.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {page.description}
                      </p>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-16">
            <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/5">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Besoin d'aide ?
              </h3>
              <p className="text-muted-foreground mb-6">
                Si vous pensez qu'il s'agit d'une erreur, contactez notre équipe de support
              </p>
              <Button asChild variant="outline">
                <Link to="/support">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Contacter le support
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default NotFound;