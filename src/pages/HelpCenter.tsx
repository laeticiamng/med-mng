import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { 
  Search, 
  HelpCircle, 
  Book, 
  MessageSquare, 
  Video, 
  FileText,
  ExternalLink,
  Star,
  Clock,
  Users,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Commencer',
      description: 'Guides pour débuter avec MED-MNG',
      icon: Star,
      color: 'from-blue-500 to-cyan-500',
      articles: [
        'Créer votre premier projet',
        'Guide de navigation',
        'Configuration du profil',
        'Comprendre les crédits'
      ]
    },
    {
      id: 'features',
      title: 'Fonctionnalités',
      description: 'Découvrez toutes les possibilités',
      icon: Book,
      color: 'from-purple-500 to-indigo-500',
      articles: [
        'Module EDN expliqué',
        'Générateur musical IA',
        'Simulations ECOS',
        'Analytics et suivi'
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Dépannage',
      description: 'Solutions aux problèmes courants',
      icon: HelpCircle,
      color: 'from-red-500 to-pink-500',
      articles: [
        'Problèmes de connexion',
        'Erreurs de génération',
        'Problèmes audio',
        'Performance lente'
      ]
    },
    {
      id: 'advanced',
      title: 'Avancé',
      description: 'Fonctionnalités pour utilisateurs experts',
      icon: Video,
      color: 'from-green-500 to-emerald-500',
      articles: [
        'API et intégrations',
        'Personnalisation avancée',
        'Gestion d\'équipe',
        'Analytics personnalisés'
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Documentation complète',
      description: 'Guide utilisateur détaillé',
      icon: FileText,
      url: '/documentation',
      color: 'bg-blue-500/20 text-blue-200'
    },
    {
      title: 'FAQ',
      description: 'Questions fréquemment posées',
      icon: HelpCircle,
      url: '/faq',
      color: 'bg-purple-500/20 text-purple-200'
    },
    {
      title: 'Support technique',
      description: 'Contacter notre équipe',
      icon: MessageSquare,
      url: '/support',
      color: 'bg-green-500/20 text-green-200'
    },
    {
      title: 'Communauté',
      description: 'Rejoindre les discussions',
      icon: Users,
      url: '/community',
      color: 'bg-orange-500/20 text-orange-200'
    }
  ];

  const recentUpdates = [
    {
      title: 'Nouvelle fonctionnalité Analytics',
      description: 'Suivi des performances amélioré',
      date: '2024-01-15',
      type: 'Nouvelle fonctionnalité'
    },
    {
      title: 'Optimisation des performances',
      description: 'Temps de chargement réduits de 40%',
      date: '2024-01-10',
      type: 'Amélioration'
    },
    {
      title: 'Interface mobile redesignée',
      description: 'Expérience mobile entièrement repensée',
      date: '2024-01-05',
      type: 'Interface'
    }
  ];

  const popularArticles = [
    {
      title: 'Comment créer votre première chanson éducative ?',
      category: 'Générateur IA',
      readTime: '5 min',
      views: 1247,
      rating: 4.8
    },
    {
      title: 'Maîtriser les items EDN avec MED-MNG',
      category: 'EDN',
      readTime: '8 min',
      views: 892,
      rating: 4.9
    },
    {
      title: 'Optimiser vos révisions avec l\'IA',
      category: 'Conseils',
      readTime: '6 min',
      views: 734,
      rating: 4.7
    },
    {
      title: 'Guide complet des simulations ECOS',
      category: 'ECOS',
      readTime: '12 min',
      views: 645,
      rating: 4.8
    }
  ];

  return (
    <ConsistentBackground variant="secondary">
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Centre d'Aide MED-MNG
            </h1>
            <p className="text-white/70 text-lg mb-8">
              Trouvez rapidement les réponses à vos questions et apprenez à maîtriser la plateforme
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
              <Input
                placeholder="Rechercher de l'aide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200 cursor-pointer group"
              >
                <Link to={action.url} className="block">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{action.title}</h3>
                    <p className="text-white/60 text-sm">{action.description}</p>
                    <ExternalLink className="h-4 w-4 text-white/40 mx-auto mt-2 group-hover:text-white/70 transition-colors" />
                  </CardContent>
                </Link>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Categories */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Catégories d'aide</h2>
                
                <div className="grid gap-6">
                  {helpCategories.map((category) => (
                    <Card key={category.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                            <category.icon className="h-6 w-6 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-2">{category.title}</h3>
                            <p className="text-white/70 mb-4">{category.description}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {category.articles.map((article, idx) => (
                                <Button
                                  key={idx}
                                  variant="ghost"
                                  className="justify-start text-white/80 hover:text-white hover:bg-white/10 h-auto py-2"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                                  <span className="text-sm">{article}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Popular Articles */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Articles populaires</h2>
                
                <div className="space-y-4">
                  {popularArticles.map((article, index) => (
                    <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-2">{article.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-white/60">
                              <Badge variant="outline" className="border-white/20 text-white/70">
                                {article.category}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {article.readTime}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {article.views} vues
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                {article.rating}
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-white/40 hover:text-white/70 transition-colors flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Support */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 backdrop-blur-sm border-blue-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Besoin d'aide ?
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Notre équipe est là pour vous accompagner
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" asChild>
                    <Link to="/support">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contacter le support
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10" asChild>
                    <Link to="/community">
                      <Users className="h-4 w-4 mr-2" />
                      Communauté
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Updates */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Mises à jour récentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentUpdates.map((update, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-white/20 text-white/70 text-xs">
                          {update.type}
                        </Badge>
                        <span className="text-white/50 text-xs">{update.date}</span>
                      </div>
                      <h4 className="text-white font-medium text-sm">{update.title}</h4>
                      <p className="text-white/60 text-xs">{update.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Statistiques d'aide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">150+</div>
                    <div className="text-white/60 text-sm">Articles d'aide</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-white/60 text-sm">Assistant IA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">98%</div>
                    <div className="text-white/60 text-sm">Problèmes résolus</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default HelpCenter;