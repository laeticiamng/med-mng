import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { 
  Book, 
  Search, 
  Music, 
  Settings, 
  Users, 
  Zap,
  ExternalLink,
  PlayCircle,
  Download,
  Code,
  Lightbulb,
  Stethoscope
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Documentation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const documentationSections = [
    {
      id: 'getting-started',
      title: 'Commencer',
      description: 'Guides pour débuter avec MED-MNG',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      articles: [
        {
          title: 'Installation et configuration',
          description: 'Comment configurer MED-MNG pour la première fois',
          duration: '5 min',
          level: 'Débutant'
        },
        {
          title: 'Votre première génération musicale',
          description: 'Guide étape par étape pour créer votre première musique',
          duration: '10 min',
          level: 'Débutant'
        },
        {
          title: 'Interface utilisateur',
          description: 'Tour d\'horizon des fonctionnalités principales',
          duration: '8 min',
          level: 'Débutant'
        }
      ]
    },
    {
      id: 'music-generation',
      title: 'Génération musicale',
      description: 'Tout sur la création de musique IA',
      icon: Music,
      color: 'from-purple-500 to-pink-500',
      articles: [
        {
          title: 'Paramètres de génération',
          description: 'Comment optimiser vos paramètres pour de meilleurs résultats',
          duration: '12 min',
          level: 'Intermédiaire'
        },
        {
          title: 'Styles musicaux disponibles',
          description: 'Découvrez tous les styles musicaux et leurs usages',
          duration: '15 min',
          level: 'Débutant'
        },
        {
          title: 'Génération avancée',
          description: 'Techniques avancées pour des créations personnalisées',
          duration: '20 min',
          level: 'Avancé'
        }
      ]
    },
    {
      id: 'medical-content',
      title: 'Contenu médical',
      description: 'Integration du contenu éducatif médical',
      icon: Stethoscope,
      color: 'from-green-500 to-emerald-500',
      articles: [
        {
          title: 'Référentiels médicaux',
          description: 'Sources et validation du contenu médical',
          duration: '8 min',
          level: 'Débutant'
        },
        {
          title: 'Personnalisation par spécialité',
          description: 'Adapter le contenu à votre spécialité',
          duration: '12 min',
          level: 'Intermédiaire'
        },
        {
          title: 'Création de contenu personnalisé',
          description: 'Ajouter vos propres contenus d\'apprentissage',
          duration: '18 min',
          level: 'Avancé'
        }
      ]
    },
    {
      id: 'api-integration',
      title: 'API et intégrations',
      description: 'Intégrer MED-MNG dans vos applications',
      icon: Code,
      color: 'from-orange-500 to-red-500',
      articles: [
        {
          title: 'API Reference',
          description: 'Documentation complète de l\'API REST',
          duration: '25 min',
          level: 'Avancé'
        },
        {
          title: 'Webhooks',
          description: 'Recevoir des notifications en temps réel',
          duration: '15 min',
          level: 'Avancé'
        },
        {
          title: 'SDK et bibliothèques',
          description: 'Outils de développement disponibles',
          duration: '10 min',
          level: 'Intermédiaire'
        }
      ]
    }
  ];

  const tutorials = [
    {
      title: 'Créer une playlist d\'étude',
      description: 'Organisez vos musiques par matière et objectif',
      duration: '12 min',
      thumbnail: '/api/placeholder/300/200',
      category: 'Organisation'
    },
    {
      title: 'Optimiser sa concentration',
      description: 'Techniques et musiques pour améliorer votre focus',
      duration: '18 min',
      thumbnail: '/api/placeholder/300/200',
      category: 'Productivité'
    },
    {
      title: 'Intégration avec vos outils',
      description: 'Connecter MED-MNG à vos applications préférées',
      duration: '15 min',
      thumbnail: '/api/placeholder/300/200',
      category: 'Intégration'
    }
  ];

  const filteredSections = documentationSections.map(section => ({
    ...section,
    articles: section.articles.filter(article =>
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.articles.length > 0);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Avancé': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <ConsistentBackground>
      <Helmet>
        <title>Documentation | MED-MNG</title>
        <meta name="description" content="Documentation complète de MED-MNG, guides d'utilisation et tutoriels pour la génération de musique thérapeutique." />
      </Helmet>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mb-6">
            <Book className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Guides complets, tutoriels et références pour maîtriser MED-MNG
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Rechercher dans la documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <Tabs defaultValue="guides" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="tutorials">Tutoriels vidéo</TabsTrigger>
            <TabsTrigger value="reference">Référence API</TabsTrigger>
          </TabsList>

          <TabsContent value="guides" className="space-y-8">
            {/* Quick Start */}
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Démarrage rapide
                    </h2>
                    <p className="text-muted-foreground">
                      Commencez à utiliser MED-MNG en moins de 5 minutes
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link to="/med-mng/create">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Créer ma première musique
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/help">
                      <Book className="w-4 h-4 mr-2" />
                      Guide complet
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Documentation Sections */}
            <div className="grid lg:grid-cols-2 gap-8">
              {filteredSections.map((section) => (
                <Card key={section.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color}`}>
                        <section.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {section.articles.map((article, index) => (
                        <div key={index} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground mb-1">
                                {article.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {article.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {article.duration}
                                </Badge>
                                <Badge className={`text-xs ${getLevelColor(article.level)}`}>
                                  {article.level}
                                </Badge>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((tutorial, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-primary" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {tutorial.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tutorial.duration}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {tutorial.description}
                    </p>
                    <Button size="sm" className="w-full">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Regarder
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reference" className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>API REST de MED-MNG</CardTitle>
                    <p className="text-muted-foreground">
                      Documentation technique complète pour les développeurs
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Endpoints principaux</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">POST</Badge>
                        <code className="text-muted-foreground">/api/music/generate</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">GET</Badge>
                        <code className="text-muted-foreground">/api/music/status/{id}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">GET</Badge>
                        <code className="text-muted-foreground">/api/library/tracks</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Ressources</h3>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger OpenAPI Spec
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Code className="w-4 h-4 mr-2" />
                        Collection Postman
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Documentation interactive
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Exemple de requête</h4>
                  <pre className="text-sm text-muted-foreground overflow-x-auto">
{`curl -X POST https://api.med-mng.com/v1/music/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "lyrics": ["Anatomie du coeur", "Circulation sanguine"],
    "style": "ambient",
    "duration": 240,
    "rang": "A"
  }'`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ConsistentBackground>
  );
};

export default Documentation;