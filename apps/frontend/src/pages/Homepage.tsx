import logger from '@/lib/logger';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, Music, BookOpen, Users, BarChart3, 
  Sparkles, Heart, Brain, Shield, Zap, TrendingUp, Clock
} from 'lucide-react';
import { ProgressIndicator, useProgressData } from '@/components/modern/ProgressIndicator';
import { ModernStats, useModernStatsData } from '@/components/modern/ModernStats';
import { ActivityFeed } from '@/components/modern/ActivityFeed';
import { SearchSystem } from '@/components/advanced/SearchSystem';
import { BookmarkSystem } from '@/components/advanced/BookmarkSystem';
import { SocialShare } from '@/components/advanced/SocialShare';

/**
 * Page d'accueil moderne avec sections interactives et analytics
 */
const Homepage: React.FC = () => {
  const progressData = useProgressData();
  const statsData = useModernStatsData();

  const handleSearch = (query: string) => {
    logger.debug('Recherche:', query);
  };

  const handleFilter = (filters: Record<string, any>) => {
    logger.debug('Filtres:', filters);
  };
  const features = [
    {
      icon: Music,
      title: 'Générateur Musical Médical',
      description: 'Créez des contenus musicaux éducatifs personnalisés pour vos formations',
      link: '/generator',
      badge: 'IA Avancée'
    },
    {
      icon: BookOpen,
      title: 'Bibliothèque EDN',
      description: 'Accédez à une vaste collection de ressources médicales certifiées',
      link: '/edn-complete',
      badge: 'Nouveau'
    },
    {
      icon: Users,
      title: 'Simulation ECOS',
      description: 'Entraînez-vous avec des scénarios cliniques interactifs',
      link: '/ecos',
      badge: 'Populaire'
    },
    {
      icon: BarChart3,
      title: 'Analytics Avancés',
      description: 'Suivez vos progrès et performances en temps réel',
      link: '/dashboard',
      badge: 'Pro'
    }
  ];

  const stats = [
    { label: 'Utilisateurs Actifs', value: '15,000+', icon: Users },
    { label: 'Contenus Générés', value: '50,000+', icon: Music },
    { label: 'Taux de Réussite', value: '94%', icon: Heart },
    { label: 'Satisfaction', value: '4.9/5', icon: Sparkles }
  ];

  return (
    <>
      <Helmet>
        <title>Accueil - Plateforme Médicale MED-MNG</title>
        <meta name="description" content="Plateforme éducative médicale innovante avec IA générative, formations interactives et outils d'apprentissage avancés." />
        <meta name="keywords" content="formation médicale, IA générative, ECOS, EDN, éducation médicale" />
        <link rel="canonical" href="/" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10" />
          <div className="medical-container relative">
            <div className="text-center animate-fade-in-up">
              <Badge variant="secondary" className="mb-6 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Plateforme Médicale Nouvelle Génération
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                MED-MNG
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Révolutionnez votre formation médicale avec l'IA générative,
                des simulations immersives et un apprentissage personnalisé
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="medical-btn-primary">
                  <Link to="/generator">
                    <Music className="w-5 h-5 mr-2" />
                    Commencer Maintenant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg">
                  <Link to="/dashboard">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Voir le Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section de recherche intelligente moderne */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
          <div className="medical-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Recherche Intelligente
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Trouvez exactement ce que vous cherchez avec notre moteur de recherche avancé
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <SearchSystem
                placeholder="Rechercher des items EDN, ECOS, contenus musicaux..."
                onResultSelect={(result) => {
                  logger.debug('Résultat sélectionné:', result);
                  // Navigation vers le contenu
                }}
              />
            </div>
          </div>
        </section>

        {/* Dashboard personnel */}
        <section className="medical-section">
          <div className="medical-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Votre Progression
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Suivez vos performances et célébrez vos succès
              </p>
            </div>
            
            <div className="space-y-12">
              <div>
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Indicateurs de Performance
                </h3>
                <ProgressIndicator data={progressData} />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Statistiques Détaillées
                </h3>
                <ModernStats 
                  stats={statsData} 
                  layout="grid" 
                  showTrends={true}
                  showTargets={true}
                  animated={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section des favoris et partage */}
        <section className="py-16 bg-card/30">
          <div className="medical-container">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Organisez vos Contenus
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Sauvegardez vos contenus préférés et partagez vos découvertes avec la communauté
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Système de Favoris</h3>
                      <p className="text-muted-foreground">
                        Sauvegardez facilement vos contenus préférés pour y accéder rapidement
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Partage Intelligent</h3>
                      <p className="text-muted-foreground">
                        Partagez vos trouvailles sur toutes les plateformes sociales
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <BookmarkSystem
                    itemId="demo-content"
                    itemType="edn"
                    itemTitle="Contenu de démonstration"
                    itemCategory="Général"
                    itemDescription="Un exemple de contenu pour tester le système de favoris"
                  />
                  <SocialShare
                    title="Découvrez MED-MNG"
                    description="Plateforme éducative médicale innovante avec IA générative"
                    hashtags={["medecine", "education", "IA", "formation"]}
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Fonctionnalités Avancées
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">Recherche intelligente avec filtres avancés</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">Système de favoris avec synchronisation</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">Partage sur réseaux sociaux et QR codes</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">Notifications temps réel</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">Interface responsive et accessible</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="medical-section">
          <div className="medical-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Fonctionnalités Avancées
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Découvrez les outils qui révolutionneront votre apprentissage médical
              </p>
            </div>
            
            <div className="medical-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card 
                  key={feature.title}
                  className="medical-card group cursor-pointer animate-slide-in-right"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="secondary">{feature.badge}</Badge>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {feature.description}
                    </CardDescription>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link to={feature.link}>
                        Découvrir
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="medical-container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Pourquoi Choisir MED-MNG ?
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">IA Médicale Avancée</h3>
                      <p className="text-muted-foreground">
                        Algorithmes spécialisés pour l'éducation médicale
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Sécurité & Conformité</h3>
                      <p className="text-muted-foreground">
                        Respect des normes RGPD et sécurité médicale
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Performance Optimale</h3>
                      <p className="text-muted-foreground">
                        Interface rapide et intuitive pour tous les appareils
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card/80 rounded-2xl p-8 medical-card">
                <h3 className="text-xl font-semibold mb-4">
                  Prêt à Commencer ?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Rejoignez des milliers de professionnels qui utilisent déjà MED-MNG
                  pour améliorer leur formation médicale.
                </p>
                <Button asChild className="w-full medical-btn-primary">
                  <Link to="/med-mng/signup">
                    Créer un Compte Gratuit
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Homepage;