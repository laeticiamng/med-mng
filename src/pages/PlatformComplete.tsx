import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Music, 
  Brain, 
  Users, 
  Target, 
  BarChart3,
  Settings,
  Shield,
  Stethoscope,
  GraduationCap,
  Heart,
  Sparkles,
  Star,
  TrendingUp,
  Globe,
  Zap,
  Award,
  Clock,
  PlayCircle,
  MessageSquare
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface PlatformFeature {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  path: string;
  icon: React.ComponentType<any>;
  category: 'education' | 'creation' | 'analysis' | 'social' | 'ai' | 'admin';
  status: 'active' | 'beta' | 'new' | 'premium';
  popularity: number;
  userCount?: number;
  rating?: number;
  tags: string[];
}

const PlatformComplete: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const features: PlatformFeature[] = [
    // Education
    {
      id: 'edn-immersive',
      title: 'Items EDN Immersifs',
      description: 'Étudiez les 367 items EDN avec contenus interactifs',
      longDescription: 'Interface complète pour maîtriser tous les items EDN avec scènes immersives, quiz adaptatifs, et contenus musicaux générés par IA.',
      path: '/edn',
      icon: BookOpen,
      category: 'education',
      status: 'active',
      popularity: 95,
      userCount: 12847,
      rating: 4.8,
      tags: ['EDN', 'Interactif', 'Quiz', 'Immersif']
    },
    {
      id: 'ecos-simulator',
      title: 'Simulateur ECOS',
      description: 'Entraînement aux examens cliniques objectifs structurés',
      longDescription: 'Simulations réalistes d\'ECOS avec scénarios cliniques variés, évaluation automatique et feedback détaillé.',
      path: '/ecos',
      icon: Stethoscope,
      category: 'education',
      status: 'active',
      popularity: 88,
      userCount: 8934,
      rating: 4.7,
      tags: ['ECOS', 'Simulation', 'Clinique', 'Évaluation']
    },
    {
      id: 'quickstart',
      title: 'Guide de Démarrage',
      description: 'Découvrez la plateforme en 5 étapes simples',
      longDescription: 'Guide interactif pour vous familiariser avec toutes les fonctionnalités essentielles de MED-MNG.',
      path: '/quickstart',
      icon: PlayCircle,
      category: 'education',
      status: 'new',
      popularity: 76,
      userCount: 5621,
      rating: 4.9,
      tags: ['Guide', 'Débutant', 'Formation', 'Interactif']
    },

    // Creation
    {
      id: 'music-studio',
      title: 'Studio Musical MED-MNG',
      description: 'Créez des musiques pédagogiques avec l\'IA',
      longDescription: 'Studio de création utilisant l\'IA Suno pour transformer contenus médicaux en musiques mémorables avec paroles personnalisées.',
      path: '/med-mng/create',
      icon: Music,
      category: 'creation',
      status: 'active',
      popularity: 92,
      userCount: 11234,
      rating: 4.6,
      tags: ['IA', 'Musique', 'Création', 'Pédagogie']
    },
    {
      id: 'content-generator',
      title: 'Générateur de Contenu IA',
      description: 'Créez du contenu éducatif personnalisé',
      longDescription: 'Générateur intelligent pour créer fiches de révision, quiz, et contenus pédagogiques adaptés à vos besoins.',
      path: '/generator',
      icon: Brain,
      category: 'creation',
      status: 'beta',
      popularity: 84,
      userCount: 7892,
      rating: 4.5,
      tags: ['IA', 'Générateur', 'Personnalisé', 'Quiz']
    },

    // Analysis
    {
      id: 'analytics-dashboard',
      title: 'Analytics Avancées',
      description: 'Analysez vos performances d\'apprentissage',
      longDescription: 'Tableau de bord complet avec métriques détaillées, analyses de progression et recommandations personnalisées.',
      path: '/analytics',
      icon: BarChart3,
      category: 'analysis',
      status: 'active',
      popularity: 87,
      userCount: 9156,
      rating: 4.4,
      tags: ['Analytics', 'Performance', 'Statistiques', 'Progression']
    },
    {
      id: 'unified-dashboard',
      title: 'Tableau de Bord Unifié',
      description: 'Vue d\'ensemble complète de votre apprentissage',
      longDescription: 'Interface centralisée regroupant toutes vos activités, progrès et recommandations dans un tableau de bord élégant.',
      path: '/dashboard',
      icon: Target,
      category: 'analysis',
      status: 'active',
      popularity: 90,
      userCount: 12100,
      rating: 4.7,
      tags: ['Dashboard', 'Vue d\'ensemble', 'Unified', 'Progrès']
    },

    // Social
    {
      id: 'community',
      title: 'Communauté Étudiante',
      description: 'Échangez avec d\'autres étudiants en médecine',
      longDescription: 'Plateforme sociale pour partager connaissances, poser questions et collaborer avec vos pairs.',
      path: '/community',
      icon: Users,
      category: 'social',
      status: 'active',
      popularity: 79,
      userCount: 15642,
      rating: 4.3,
      tags: ['Communauté', 'Partage', 'Collaboration', 'Social']
    },

    // AI
    {
      id: 'ai-assistant',
      title: 'Assistant IA Médical',
      description: 'Assistant conversationnel spécialisé en médecine',
      longDescription: 'Chat IA avancé formé sur les connaissances médicales pour répondre à vos questions et vous accompagner.',
      path: '/chat',
      icon: MessageSquare,
      category: 'ai',
      status: 'premium',
      popularity: 86,
      userCount: 8734,
      rating: 4.8,
      tags: ['IA', 'Assistant', 'Chat', 'Médical']
    },
    {
      id: 'ai-hub',
      title: 'Hub IA Complet',
      description: 'Accès à tous les outils d\'intelligence artificielle',
      longDescription: 'Centre unifié regroupant tous les outils IA : recommendations, coach virtuel, analyse comportementale.',
      path: '/ai-hub',
      icon: Sparkles,
      category: 'ai',
      status: 'premium',
      popularity: 81,
      userCount: 6892,
      rating: 4.6,
      tags: ['Hub IA', 'Outils', 'Recommandations', 'Coach']
    },

    // Admin
    {
      id: 'admin-panel',
      title: 'Administration Unifiée',
      description: 'Panel d\'administration sécurisé',
      longDescription: 'Interface d\'administration complète pour gérer utilisateurs, contenu et monitoring système.',
      path: '/admin',
      icon: Shield,
      category: 'admin',
      status: 'active',
      popularity: 95,
      userCount: 23,
      rating: 5.0,
      tags: ['Admin', 'Gestion', 'Sécurité', 'Monitoring']
    },
    {
      id: 'system-health',
      title: 'Santé du Système',
      description: 'Monitoring temps réel de la plateforme',
      longDescription: 'Dashboard de surveillance système avec métriques de performance, statut des services et alertes.',
      path: '/system-health',
      icon: Heart,
      category: 'admin',
      status: 'active',
      popularity: 78,
      userCount: 15,
      rating: 4.9,
      tags: ['Monitoring', 'Système', 'Performance', 'Alertes']
    }
  ];

  const categories = [
    { id: 'all', label: 'Toutes', icon: Globe },
    { id: 'education', label: 'Éducation', icon: GraduationCap },
    { id: 'creation', label: 'Création', icon: Sparkles },
    { id: 'analysis', label: 'Analyse', icon: BarChart3 },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'ai', label: 'Intelligence IA', icon: Brain },
    { id: 'admin', label: 'Administration', icon: Settings }
  ];

  const statuses = [
    { id: 'all', label: 'Tous les statuts' },
    { id: 'active', label: 'Actif' },
    { id: 'beta', label: 'Bêta' },
    { id: 'new', label: 'Nouveau' },
    { id: 'premium', label: 'Premium' }
  ];

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || feature.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'beta': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'new': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'premium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryStats = (categoryId: string) => {
    if (categoryId === 'all') return features.length;
    return features.filter(f => f.category === categoryId).length;
  };

  return (
    <>
      <Helmet>
        <title>Plateforme Complète - MED-MNG</title>
        <meta name="description" content="Découvrez toutes les fonctionnalités de MED-MNG - Studio musical, items EDN, simulations ECOS, analytics et bien plus" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Plateforme MED-MNG Complète
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Découvrez l'écosystème complet d'outils pour vos études médicales : 
              studio musical IA, items EDN immersifs, simulations ECOS et bien plus.
            </p>

            {/* Stats globales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{features.length}</div>
                <div className="text-sm text-muted-foreground">Fonctionnalités</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">50K+</div>
                <div className="text-sm text-muted-foreground">Utilisateurs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4.7</div>
                <div className="text-sm text-muted-foreground">Note moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">367</div>
                <div className="text-sm text-muted-foreground">Items EDN</div>
              </div>
            </div>
          </motion.div>

          {/* Filtres et recherche */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une fonctionnalité..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label} ({getCategoryStats(cat.id)})
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation par catégories */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Grille de fonctionnalités */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                      onClick={() => navigate(feature.path)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(feature.status)}>
                              {feature.status}
                            </Badge>
                            {feature.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-muted-foreground">{feature.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {feature.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      {feature.userCount && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Utilisateurs actifs</span>
                          <span className="font-medium">{feature.userCount.toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {feature.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {feature.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{feature.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredFeatures.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun résultat trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche ou de filtrage.
              </p>
            </div>
          )}

          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Prêt à commencer ?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Explorez toutes ces fonctionnalités dès maintenant et révolutionnez votre façon d'apprendre la médecine.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => navigate('/quickstart')} size="lg">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Guide de démarrage
                  </Button>
                  <Button onClick={() => navigate('/dashboard')} variant="outline" size="lg">
                    Tableau de bord
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PlatformComplete;