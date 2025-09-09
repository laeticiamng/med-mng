import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Filter, Grid, List, BookOpen, Music, Brain, Users, 
  BarChart3, Heart, Shield, Zap, Target, Trophy, Star, Clock,
  Play, Settings, Download, Share2, Bookmark, ArrowRight, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Feature {
  id: string;
  title: string;
  description: string;
  category: 'education' | 'music' | 'community' | 'analytics' | 'tools' | 'premium';
  status: 'active' | 'beta' | 'coming-soon' | 'premium';
  icon: React.ComponentType<any>;
  path: string;
  tags: string[];
  popularity: number;
  lastUpdate: string;
  screenshots?: string[];
  features: string[];
  requirements?: string[];
}

const features: Feature[] = [
  {
    id: 'edn-immersive',
    title: 'Items EDN Immersifs',
    description: 'Explorez les 367 items EDN avec des environnements immersifs et interactifs powered by IA',
    category: 'education',
    status: 'active',
    icon: BookOpen,
    path: '/edn',
    tags: ['EDN', 'immersif', 'IA', 'apprentissage'],
    popularity: 98,
    lastUpdate: '2024-01-15',
    features: [
      'Scènes 3D interactives',
      'Quiz adaptatifs',
      'Génération de paroles musicales',
      'Suivi de progression personnalisé',
      'Recommandations IA'
    ]
  },
  {
    id: 'music-generator',
    title: 'Générateur Musical IA',
    description: 'Créez des musiques pédagogiques personnalisées avec Suno IA pour optimiser votre apprentissage',
    category: 'music',
    status: 'active',
    icon: Music,
    path: '/generator',
    tags: ['musique', 'IA', 'Suno', 'personnalisation'],
    popularity: 95,
    lastUpdate: '2024-01-14',
    features: [
      'Génération avec Suno IA',
      'Paroles médicales automatiques',
      'Styles musicaux variés',
      'Export haute qualité',
      'Intégration EDN'
    ]
  },
  {
    id: 'ai-chat',
    title: 'Assistant Médical IA',
    description: 'Chat intelligent spécialisé en médecine pour diagnostics, formations et références',
    category: 'tools',
    status: 'active',
    icon: Brain,
    path: '/chat',
    tags: ['IA', 'diagnostic', 'formation', 'référence'],
    popularity: 92,
    lastUpdate: '2024-01-13',
    features: [
      'Base de connaissances médicales',
      'Diagnostic différentiel',
      'Recommandations thérapeutiques',
      'Sources vérifiées',
      'Interface conversationnelle'
    ]
  },
  {
    id: 'community-hub',
    title: 'Hub Communautaire',
    description: 'Espace collaboratif avec forums, groupes d\'étude et mentorat entre étudiants',
    category: 'community',
    status: 'active',
    icon: Users,
    path: '/community',
    tags: ['communauté', 'forum', 'mentorat', 'collaboration'],
    popularity: 89,
    lastUpdate: '2024-01-12',
    features: [
      'Forums thématiques',
      'Groupes d\'étude',
      'Système de mentorat',
      'Partage de ressources',
      'Événements communautaires'
    ]
  },
  {
    id: 'analytics-suite',
    title: 'Analytics Avancées',
    description: 'Analyses détaillées de performances avec prédictions IA et insights personnalisés',
    category: 'analytics',
    status: 'premium',
    icon: BarChart3,
    path: '/analytics',
    tags: ['analytics', 'performance', 'IA', 'insights'],
    popularity: 87,
    lastUpdate: '2024-01-11',
    features: [
      'Métriques en temps réel',
      'Prédictions de performance',
      'Rapports personnalisés',
      'Comparaisons de cohorte',
      'Recommandations adaptatives'
    ],
    requirements: ['Abonnement Premium']
  },
  {
    id: 'meditation-center',
    title: 'Centre de Méditation',
    description: 'Séances guidées de méditation et relaxation pour gérer le stress des études',
    category: 'premium',
    status: 'beta',
    icon: Heart,
    path: '/meditation',
    tags: ['méditation', 'bien-être', 'stress', 'relaxation'],
    popularity: 84,
    lastUpdate: '2024-01-10',
    features: [
      'Séances guidées',
      'Programmes personnalisés',
      'Musiques relaxantes',
      'Suivi du bien-être',
      'Exercices de respiration'
    ]
  }
];

export const ComprehensiveFeatureHub: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popularity');

  const categories = [
    { id: 'all', name: 'Toutes', icon: Grid },
    { id: 'education', name: 'Éducation', icon: BookOpen },
    { id: 'music', name: 'Musique', icon: Music },
    { id: 'community', name: 'Communauté', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'tools', name: 'Outils', icon: Zap },
    { id: 'premium', name: 'Premium', icon: Star }
  ];

  const statuses = [
    { id: 'all', name: 'Tous', color: 'default' },
    { id: 'active', name: 'Actif', color: 'green' },
    { id: 'beta', name: 'Bêta', color: 'yellow' },
    { id: 'coming-soon', name: 'Bientôt', color: 'blue' },
    { id: 'premium', name: 'Premium', color: 'purple' }
  ];

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || feature.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.popularity - a.popularity;
      case 'recent':
        return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'beta': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'coming-soon': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'premium': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'education': return 'text-blue-500';
      case 'music': return 'text-purple-500';
      case 'community': return 'text-green-500';
      case 'analytics': return 'text-orange-500';
      case 'tools': return 'text-indigo-500';
      case 'premium': return 'text-pink-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Hub des Fonctionnalités
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Découvrez toutes les fonctionnalités de MED-MNG pour révolutionner votre apprentissage médical
        </p>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher des fonctionnalités..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Catégories */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Fonctionnalités Total', value: features.length, icon: Target },
          { label: 'Actives', value: features.filter(f => f.status === 'active').length, icon: Zap },
          { label: 'En Bêta', value: features.filter(f => f.status === 'beta').length, icon: Clock },
          { label: 'Premium', value: features.filter(f => f.status === 'premium').length, icon: Star }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Liste des fonctionnalités */}
      <div className={cn(
        "grid gap-6",
        viewMode === 'grid' 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
          : "grid-cols-1"
      )}>
        {filteredFeatures.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={cn(
              "h-full",
              viewMode === 'list' && "max-w-none"
            )}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(feature.path)}>
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-background flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-6 h-6 ${getCategoryColor(feature.category)}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Badge className={cn("text-xs", getStatusColor(feature.status))}>
                      {feature.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {feature.popularity}%
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {feature.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {feature.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{feature.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Fonctionnalités principales */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Fonctionnalités clés :</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {feature.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Mis à jour le {new Date(feature.lastUpdate).toLocaleDateString('fr-FR')}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Bookmark className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Share2 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" className="gap-1">
                      <Play className="w-3 h-3" />
                      Accéder
                    </Button>
                  </div>
                </div>

                {/* Exigences pour premium */}
                {feature.requirements && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-purple-400 text-xs">
                      <Star className="w-3 h-3" />
                      Exigences: {feature.requirements.join(', ')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {filteredFeatures.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Aucune fonctionnalité trouvée</h3>
          <p className="text-muted-foreground mb-4">
            Essayez de modifier vos critères de recherche ou explorez toutes les catégories
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setSelectedStatus('all');
          }}>
            Réinitialiser les filtres
          </Button>
        </motion.div>
      )}

      {/* CTA Bottom */}
      <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Pas trouvé ce que vous cherchez ?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Suggérez de nouvelles fonctionnalités ou contactez notre équipe pour des besoins spécifiques
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Suggérer une fonctionnalité
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Settings className="w-5 h-5" />
              Contacter le support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveFeatureHub;