import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Music, Brain, Users, BarChart3, Settings, Stethoscope,
  Search, Filter, Star, Zap, Shield, Award, Globe, Heart, Clock,
  Target, PlayCircle, MessageSquare, Download, Upload, Share,
  CheckCircle, TrendingUp, Layers, Sparkles, ArrowRight, Eye
} from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  category: 'core' | 'ai' | 'community' | 'analytics' | 'admin' | 'premium';
  isPremium?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  progress?: number;
  stats?: {
    users?: number;
    content?: number;
    satisfaction?: number;
  };
}

export default function PremiumAllFeatures() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const features: Feature[] = [
    // Core Features
    {
      id: 'edn-items',
      title: 'Items EDN Immersifs',
      description: 'Maîtrisez les 367 items EDN avec des contenus interactifs',
      longDescription: 'Interface complète pour étudier tous les items EDN avec des scènes immersives, des quiz adaptatifs et des contenus musicaux générés par IA.',
      path: '/edn',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-600',
      category: 'core',
      isPopular: true,
      progress: 85,
      stats: { users: 1247, content: 367, satisfaction: 96 }
    },
    {
      id: 'dashboard',
      title: 'Dashboard Premium',
      description: 'Tableau de bord intelligent avec analytics en temps réel',
      longDescription: 'Centre de contrôle premium avec statistiques personnalisées, progression détaillée et recommandations IA.',
      path: '/dashboard',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-600',
      category: 'core',
      isPopular: true,
      progress: 100
    },
    {
      id: 'platform-nav',
      title: 'Navigation Master',
      description: 'Vue d\'ensemble complète de la plateforme',
      longDescription: 'Interface unifiée pour accéder à toutes les fonctionnalités avec navigation intelligente et raccourcis contextuels.',
      path: '/platform',
      icon: Globe,
      color: 'from-teal-500 to-cyan-600',
      category: 'core',
      isNew: true,
      progress: 100
    },

    // AI Features
    {
      id: 'music-generator',
      title: 'Générateur Musical IA',
      description: 'Créez des musiques pédagogiques personnalisées',
      longDescription: 'IA avancée pour générer des chansons éducatives sur mesure avec paroles médicales précises et styles musicaux variés.',
      path: '/generator',
      icon: Music,
      color: 'from-purple-500 to-pink-600',
      category: 'ai',
      isPremium: true,
      isPopular: true,
      progress: 92,
      stats: { users: 856, content: 2847, satisfaction: 98 }
    },
    {
      id: 'ai-assistant',
      title: 'Assistant IA Médical',
      description: 'Intelligence artificielle spécialisée en médecine',
      longDescription: 'Assistant conversationnel expert en médecine pour répondre à vos questions, expliquer des concepts et vous guider dans votre apprentissage.',
      path: '/chat',
      icon: Brain,
      color: 'from-green-500 to-emerald-600',
      category: 'ai',
      isNew: true,
      progress: 78,
      stats: { users: 634, satisfaction: 94 }
    },

    // Community & Collaboration
    {
      id: 'community',
      title: 'Communauté Médicale',
      description: 'Échangez avec des étudiants et professionnels',
      longDescription: 'Plateforme collaborative pour partager des ressources, poser des questions et construire votre réseau professionnel médical.',
      path: '/community',
      icon: Users,
      color: 'from-orange-500 to-red-600',
      category: 'community',
      progress: 88,
      stats: { users: 3241, satisfaction: 91 }
    },
    {
      id: 'med-mng-studio',
      title: 'MED-MNG Studio',
      description: 'Studio de création musicale premium',
      longDescription: 'Environnement professionnel pour créer, éditer et partager vos créations musicales pédagogiques.',
      path: '/med-mng/dashboard',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      category: 'premium',
      isPremium: true,
      progress: 95,
      stats: { users: 423, content: 1563, satisfaction: 97 }
    },

    // Learning & Practice
    {
      id: 'ecos-simulations',
      title: 'Simulations ECOS',
      description: 'Examens Cliniques Objectifs Structurés',
      longDescription: 'Entraînez-vous avec des cas cliniques réalistes et des scénarios d\'examen pour préparer vos ECOS.',
      path: '/ecos',
      icon: Stethoscope,
      color: 'from-emerald-500 to-teal-600',
      category: 'core',
      progress: 76,
      stats: { content: 124, satisfaction: 89 }
    },

    // Analytics & Monitoring
    {
      id: 'analytics',
      title: 'Analytics Avancées',
      description: 'Analyses détaillées de vos performances',
      longDescription: 'Tableaux de bord complets avec métriques personnalisées, prédictions IA et recommandations d\'amélioration.',
      path: '/analytics',
      icon: TrendingUp,
      color: 'from-blue-600 to-indigo-600',
      category: 'analytics',
      progress: 84,
      stats: { satisfaction: 93 }
    },
    {
      id: 'monitoring',
      title: 'Monitoring Système',
      description: 'Surveillance en temps réel de la plateforme',
      longDescription: 'Outils de monitoring pour surveiller les performances, l\'utilisation et la santé de la plateforme.',
      path: '/monitoring',
      icon: Target,
      color: 'from-yellow-500 to-orange-600',
      category: 'admin',
      progress: 90
    },

    // Personal & Settings
    {
      id: 'profile',
      title: 'Profil Personnel',
      description: 'Gérez votre profil et vos préférences',
      longDescription: 'Espace personnel pour personnaliser votre expérience, suivre vos progrès et gérer vos paramètres.',
      path: '/profile',
      icon: Users,
      color: 'from-violet-500 to-purple-600',
      category: 'core',
      progress: 100
    },
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Configuration et préférences utilisateur',
      longDescription: 'Centre de configuration pour personnaliser l\'interface, les notifications et les paramètres d\'apprentissage.',
      path: '/settings',
      icon: Settings,
      color: 'from-gray-500 to-slate-600',
      category: 'core',
      progress: 100
    }
  ];

  const categories = [
    { id: 'all', label: 'Toutes', count: features.length },
    { id: 'core', label: 'Essentielles', count: features.filter(f => f.category === 'core').length },
    { id: 'ai', label: 'Intelligence IA', count: features.filter(f => f.category === 'ai').length },
    { id: 'community', label: 'Communauté', count: features.filter(f => f.category === 'community').length },
    { id: 'analytics', label: 'Analytics', count: features.filter(f => f.category === 'analytics').length },
    { id: 'premium', label: 'Premium', count: features.filter(f => f.category === 'premium').length }
  ];

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularFeatures = features.filter(f => f.isPopular);
  const newFeatures = features.filter(f => f.isNew);
  const premiumFeatures = features.filter(f => f.isPremium);

  const totalUsers = features.reduce((sum, f) => sum + (f.stats?.users || 0), 0);
  const avgSatisfaction = Math.round(features.reduce((sum, f) => sum + (f.stats?.satisfaction || 0), 0) / features.filter(f => f.stats?.satisfaction).length);

  return (
    <PremiumLayout variant="gradient">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Toutes les Fonctionnalités
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez l'écosystème complet de MED-MNG : outils IA, contenus immersifs, 
            communauté active et analytics avancées pour révolutionner votre formation médicale.
          </p>
          
          {/* Stats globales */}
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-primary font-semibold">{totalUsers.toLocaleString()} utilisateurs</span>
            </div>
            <div className="flex items-center gap-2 bg-success/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Star className="w-4 h-4 text-success" />
              <span className="text-success font-semibold">{avgSatisfaction}% satisfaction</span>
            </div>
            <div className="flex items-center gap-2 bg-accent/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-accent font-semibold">{features.length} fonctionnalités</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Populaires */}
          <PremiumCard variant="glow" colorScheme="primary" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground">Les Plus Populaires</h3>
            </div>
            <div className="space-y-2">
              {popularFeatures.slice(0, 3).map(feature => (
                <div key={feature.id} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">{feature.title}</span>
                </div>
              ))}
            </div>
          </PremiumCard>

          {/* Nouveautés */}
          <PremiumCard variant="glow" colorScheme="success" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-success/20">
                <Sparkles className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-bold text-foreground">Nouveautés</h3>
            </div>
            <div className="space-y-2">
              {newFeatures.map(feature => (
                <div key={feature.id} className="flex items-center gap-2">
                  <Badge className="bg-success/20 text-success text-xs">New</Badge>
                  <span className="text-sm text-muted-foreground">{feature.title}</span>
                </div>
              ))}
            </div>
          </PremiumCard>

          {/* Premium */}
          <PremiumCard variant="glow" colorScheme="accent" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent/20">
                <Award className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-bold text-foreground">Premium</h3>
            </div>
            <div className="space-y-2">
              {premiumFeatures.map(feature => (
                <div key={feature.id} className="flex items-center gap-2">
                  <Badge className="bg-gradient-accent text-white text-xs">Pro</Badge>
                  <span className="text-sm text-muted-foreground">{feature.title}</span>
                </div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher une fonctionnalité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border/50"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <PremiumButton
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                icon={<Layers className="w-4 h-4" />}
              >
                Grille
              </PremiumButton>
              <PremiumButton
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                icon={<Eye className="w-4 h-4" />}
              >
                Liste
              </PremiumButton>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <PremiumButton
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="relative"
              >
                {category.label}
                <Badge className="ml-2 bg-muted/20 text-muted-foreground text-xs">
                  {category.count}
                </Badge>
              </PremiumButton>
            ))}
          </div>
        </motion.div>

        {/* Features Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PremiumCard
                    variant="glass"
                    hover
                    className={`p-6 cursor-pointer group h-full ${
                      viewMode === 'list' ? 'flex items-center gap-6' : ''
                    }`}
                    onClick={() => navigate(feature.path)}
                  >
                    <div className={`flex items-start gap-4 ${viewMode === 'list' ? 'flex-1' : 'flex-col'}`}>
                      <div className={`${viewMode === 'grid' ? 'self-start' : ''}`}>
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                              {feature.title}
                            </h3>
                            <div className="flex gap-1">
                              {feature.isPremium && (
                                <Badge className="bg-gradient-accent text-white text-xs">Premium</Badge>
                              )}
                              {feature.isNew && (
                                <Badge className="bg-success/20 text-success text-xs">New</Badge>
                              )}
                              {feature.isPopular && (
                                <Badge className="bg-primary/20 text-primary text-xs">Populaire</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {viewMode === 'list' ? feature.longDescription : feature.description}
                          </p>
                        </div>

                        {feature.stats && (
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            {feature.stats.users && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{feature.stats.users.toLocaleString()} utilisateurs</span>
                              </div>
                            )}
                            {feature.stats.content && (
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                <span>{feature.stats.content.toLocaleString()} contenus</span>
                              </div>
                            )}
                            {feature.stats.satisfaction && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                <span>{feature.stats.satisfaction}% satisfaction</span>
                              </div>
                            )}
                          </div>
                        )}

                        {feature.progress && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Progression</span>
                              <span className="text-primary font-medium">{feature.progress}%</span>
                            </div>
                            <div className="w-full bg-muted/30 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                                style={{ width: `${feature.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center text-primary text-sm group-hover:translate-x-1 transition-transform">
                          <span>Explorer</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-6 pt-8"
        >
          <PremiumCard variant="glow" colorScheme="primary" className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Prêt à révolutionner votre formation médicale ?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Accédez à toutes ces fonctionnalités premium et bien plus encore. 
              Rejoignez la communauté MED-MNG et transformez votre apprentissage.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <PremiumButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/dashboard')}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Commencer Maintenant
              </PremiumButton>
              <PremiumButton
                variant="outline"
                size="lg"
                onClick={() => navigate('/med-mng/pricing')}
                icon={<Award className="w-5 h-5" />}
              >
                Voir les Tarifs
              </PremiumButton>
            </div>
          </PremiumCard>
        </motion.div>
      </div>
    </PremiumLayout>
  );
}