import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  BookOpen,
  Music,
  Brain,
  Users,
  BarChart3,
  Shield,
  Target,
  Star,
  Settings,
  FileText,
  Heart,
  Activity,
  Zap,
  Globe,
  Layers,
  MessageSquare,
  Award,
  Clock,
  TrendingUp,
  Database,
  Lock,
  Play,
  Home,
  Stethoscope
} from 'lucide-react';

interface FeaturePage {
  id: string;
  title: string;
  description: string;
  path: string;
  category: 'core' | 'learning' | 'music' | 'analytics' | 'community' | 'admin' | 'tools';
  icon: React.ComponentType<any>;
  status: 'active' | 'premium' | 'development' | 'deprecated';
  complexity: 'simple' | 'moderate' | 'advanced';
  lastUpdated: string;
  features: string[];
  dependencies?: string[];
  userRating?: number;
  usageCount?: number;
  isPopular?: boolean;
  isNew?: boolean;
  color: string;
}

export const CompleteFeatureMap: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const allPages: FeaturePage[] = [
    // Pages Core
    {
      id: 'home',
      title: 'Page d\'Accueil',
      description: 'Point d\'entrée principal avec navigation immersive',
      path: '/',
      category: 'core',
      icon: Home,
      status: 'active',
      complexity: 'simple',
      lastUpdated: '2024-01-15',
      features: ['Navigation principale', 'Démos interactives', 'Stats temps réel', 'Témoignages'],
      userRating: 4.8,
      usageCount: 15420,
      isPopular: true,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'dashboard',
      title: 'Dashboard Complet',
      description: 'Centre de contrôle unifié avec tous les modules',
      path: '/dashboard',
      category: 'core',
      icon: BarChart3,
      status: 'active',
      complexity: 'advanced',
      lastUpdated: '2024-01-20',
      features: ['Vue d\'ensemble', 'Accès rapide', 'Statistiques', 'Activité récente'],
      userRating: 4.7,
      usageCount: 8930,
      isPopular: true,
      isNew: true,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'platform-overview',
      title: 'Vue Plateforme Master',
      description: 'Navigation master et aperçu architectural complet',
      path: '/platform',
      category: 'core',
      icon: Globe,
      status: 'active',
      complexity: 'advanced',
      lastUpdated: '2024-01-18',
      features: ['Navigation master', 'API Status', 'Activity tracking', 'System overview'],
      userRating: 4.9,
      usageCount: 3420,
      isNew: true,
      color: 'from-emerald-500 to-green-600'
    },
    {
      id: 'all-features',
      title: 'Catalogue Fonctionnalités',
      description: 'Répertoire complet de toutes les fonctionnalités',
      path: '/features',
      category: 'core',
      icon: Layers,
      status: 'active',
      complexity: 'moderate',
      lastUpdated: '2024-01-16',
      features: ['Feature launcher', 'Catégorisation', 'Stats utilisation', 'Accès rapide'],
      userRating: 4.6,
      usageCount: 5670,
      color: 'from-indigo-500 to-purple-600'
    },

    // Pages Learning
    {
      id: 'edn-items',
      title: 'Items EDN Immersifs',
      description: 'Référentiel EDN complet avec expérience immersive',
      path: '/edn',
      category: 'learning',
      icon: BookOpen,
      status: 'active',
      complexity: 'advanced',
      lastUpdated: '2024-01-22',
      features: ['367 items', 'Scènes immersives', 'BD interactives', 'Quiz adaptatifs', 'Génération musicale'],
      dependencies: ['Supabase EDN', 'OpenAI API', 'Audio System'],
      userRating: 4.9,
      usageCount: 12340,
      isPopular: true,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'ecos-scenarios',
      title: 'Simulations ECOS',
      description: 'Examens Cliniques Objectifs Structurés interactifs',
      path: '/ecos',
      category: 'learning',
      icon: Target,
      status: 'active',
      complexity: 'moderate',
      lastUpdated: '2024-01-14',
      features: ['Scénarios cliniques', 'Évaluations', 'Feedback détaillé', 'Progression'],
      userRating: 4.5,
      usageCount: 3890,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'medical-ai-chat',
      title: 'Assistant IA Médical',
      description: 'Chat intelligent spécialisé avec expertise médicale',
      path: '/chat',
      category: 'learning',
      icon: Brain,
      status: 'active',
      complexity: 'advanced',
      lastUpdated: '2024-01-21',
      features: ['GPT-4 médical', 'Base connaissance', 'Contexte français', 'Apprentissage adaptatif'],
      dependencies: ['OpenAI API', 'Medical Knowledge Base'],
      userRating: 4.8,
      usageCount: 7654,
      isNew: true,
      color: 'from-purple-500 to-pink-600'
    },

    // Pages Music
    {
      id: 'music-generator',
      title: 'Générateur Musical IA',
      description: 'Création de mnémotechniques musicaux personnalisés',
      path: '/generator',
      category: 'music',
      icon: Music,
      status: 'premium',
      complexity: 'advanced',
      lastUpdated: '2024-01-19',
      features: ['Suno AI v4', 'Multi-styles', 'Paroles adaptatives', 'Export HD'],
      dependencies: ['Suno AI API', 'Audio Processing'],
      userRating: 4.7,
      usageCount: 4560,
      isPopular: true,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'music-library',
      title: 'Bibliothèque Musicale',
      description: 'Collection personnelle et playlists collaboratives',
      path: '/med-mng/library',
      category: 'music',
      icon: Heart,
      status: 'active',
      complexity: 'moderate',
      lastUpdated: '2024-01-17',
      features: ['Stockage cloud', 'Playlists', 'Partage', 'Recommandations'],
      userRating: 4.4,
      usageCount: 6789,
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'music-studio',
      title: 'Studio de Création',
      description: 'Environnement professionnel de création musicale',
      path: '/med-mng/create',
      category: 'music',
      icon: Stethoscope,
      status: 'premium',
      complexity: 'advanced',
      lastUpdated: '2024-01-20',
      features: ['Interface studio', 'Effets avancés', 'Collaboration', 'Export multi-format'],
      userRating: 4.6,
      usageCount: 2340,
      color: 'from-yellow-500 to-orange-600'
    },

    // Pages Analytics
    {
      id: 'advanced-analytics',
      title: 'Analytics Avancées',
      description: 'Analyses détaillées et insights personnalisés',
      path: '/analytics',
      category: 'analytics',
      icon: TrendingUp,
      status: 'active',
      complexity: 'advanced',
      lastUpdated: '2024-01-16',
      features: ['Métriques détaillées', 'Visualisations', 'Prédictions IA', 'Export rapports'],
      userRating: 4.5,
      usageCount: 3456,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'real-time-monitoring',
      title: 'Monitoring Temps Réel',
      description: 'Surveillance système et utilisateur en direct',
      path: '/monitoring',
      category: 'analytics',
      icon: Activity,
      status: 'active',
      complexity: 'advanced',
      lastUpdated: '2024-01-18',
      features: ['Temps réel', 'Alertes', 'Métriques système', 'Dashboard live'],
      userRating: 4.3,
      usageCount: 1890,
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'system-health',
      title: 'Santé du Système',
      description: 'Diagnostic et monitoring de l\'infrastructure',
      path: '/system-health',
      category: 'analytics',
      icon: Heart,
      status: 'active',
      complexity: 'moderate',
      lastUpdated: '2024-01-15',
      features: ['Health checks', 'Performance', 'Diagnostics', 'Optimisations'],
      userRating: 4.2,
      usageCount: 890,
      color: 'from-green-600 to-teal-600'
    },

    // Pages Community
    {
      id: 'student-community',
      title: 'Communauté Étudiante',
      description: 'Réseau social et collaboration entre étudiants',
      path: '/med-mng/community',
      category: 'community',
      icon: Users,
      status: 'active',
      complexity: 'moderate',
      lastUpdated: '2024-01-19',
      features: ['Forums', 'Groupes d\'étude', 'Mentoring', 'Événements'],
      userRating: 4.6,
      usageCount: 8920,
      isPopular: true,
      color: 'from-violet-500 to-purple-600'
    },
    {
      id: 'user-profile',
      title: 'Profil Personnel',
      description: 'Gestion du profil et des achievements',
      path: '/med-mng/profile',
      category: 'community',
      icon: Users,
      status: 'active',
      complexity: 'simple',
      lastUpdated: '2024-01-12',
      features: ['Profil utilisateur', 'Achievements', 'Préférences', 'Historique'],
      userRating: 4.1,
      usageCount: 11230,
      color: 'from-gray-500 to-slate-600'
    },

    // Pages Admin
    {
      id: 'admin-panel',
      title: 'Panel d\'Administration',
      description: 'Interface complète d\'administration système',
      path: '/admin-panel',
      category: 'admin',
      icon: Shield,
      status: 'active',
      complexity: 'advanced',
      lastUpdated: '2024-01-21',
      features: ['Gestion utilisateurs', 'Config système', 'Monitoring', 'Sécurité'],
      userRating: 4.4,
      usageCount: 340,
      color: 'from-red-600 to-rose-600'
    },
    {
      id: 'quality-audit',
      title: 'Audit Qualité',
      description: 'Contrôle qualité et conformité des données',
      path: '/audit',
      category: 'admin',
      icon: Award,
      status: 'active',
      complexity: 'moderate',
      lastUpdated: '2024-01-17',
      features: ['Audit automatique', 'Rapports', 'Corrections', 'Conformité'],
      userRating: 4.3,
      usageCount: 560,
      color: 'from-purple-600 to-pink-600'
    },

    // Pages Tools
    {
      id: 'support-center',
      title: 'Centre de Support',
      description: 'Documentation et assistance utilisateur',
      path: '/support',
      category: 'tools',
      icon: MessageSquare,
      status: 'active',
      complexity: 'simple',
      lastUpdated: '2024-01-13',
      features: ['FAQ', 'Tickets', 'Documentation', 'Tutoriels'],
      userRating: 4.2,
      usageCount: 4560,
      color: 'from-indigo-500 to-blue-600'
    },
    {
      id: 'optimization-center',
      title: 'Centre d\'Optimisation',
      description: 'Outils d\'optimisation et de performance',
      path: '/optimization',
      category: 'tools',
      icon: Zap,
      status: 'active',
      complexity: 'advanced',
      lastUpdated: '2024-01-20',
      features: ['Performance tuning', 'Analyses', 'Recommandations', 'Automatisation'],
      userRating: 4.5,
      usageCount: 1230,
      isNew: true,
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  const categories = [
    { id: 'all', name: 'Toutes', icon: Globe },
    { id: 'core', name: 'Core', icon: Home },
    { id: 'learning', name: 'Apprentissage', icon: BookOpen },
    { id: 'music', name: 'Musical', icon: Music },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'community', name: 'Communauté', icon: Users },
    { id: 'admin', name: 'Admin', icon: Shield },
    { id: 'tools', name: 'Outils', icon: Settings }
  ];

  const statusFilters = [
    { id: 'all', name: 'Tous', color: 'gray' },
    { id: 'active', name: 'Actif', color: 'green' },
    { id: 'premium', name: 'Premium', color: 'yellow' },
    { id: 'development', name: 'Développement', color: 'blue' },
    { id: 'deprecated', name: 'Déprécié', color: 'red' }
  ];

  const filteredPages = useMemo(() => {
    return allPages.filter(page => {
      const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           page.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           page.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || page.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || page.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  const handlePageAccess = (page: FeaturePage) => {
    if (page.status === 'premium') {
      toast.info(`${page.title} - Fonctionnalité Premium`, {
        icon: <Star className="w-4 h-4" />,
        description: 'Abonnez-vous pour accéder à cette fonctionnalité avancée',
        action: {
          label: 'Voir les tarifs',
          onClick: () => navigate('/med-mng/pricing')
        }
      });
    } else if (page.status === 'development') {
      toast.info(`${page.title} - En Développement`, {
        icon: <Clock className="w-4 h-4" />,
        description: 'Cette fonctionnalité est en cours de développement'
      });
    } else {
      toast.success(`Accès à ${page.title}`, {
        icon: <Play className="w-4 h-4" />
      });
      navigate(page.path);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Actif', className: 'bg-green-500/20 border-green-500/40 text-green-400' },
      premium: { label: 'Premium', className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' },
      development: { label: 'Dev', className: 'bg-blue-500/20 border-blue-500/40 text-blue-400' },
      deprecated: { label: 'Déprécié', className: 'bg-red-500/20 border-red-500/40 text-red-400' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const getComplexityColor = (complexity: string) => {
    const colors = {
      simple: 'text-green-400',
      moderate: 'text-yellow-400',
      advanced: 'text-red-400'
    };
    return colors[complexity as keyof typeof colors];
  };

  const stats = {
    total: allPages.length,
    active: allPages.filter(p => p.status === 'active').length,
    premium: allPages.filter(p => p.status === 'premium').length,
    totalUsage: allPages.reduce((sum, p) => sum + (p.usageCount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Carte Complète des Fonctionnalités
          </h1>
          <p className="text-white/70 text-lg max-w-3xl mx-auto">
            Explorez toutes les pages et fonctionnalités de la plateforme MED MNG. 
            Chaque élément est documenté avec ses caractéristiques et métriques d'usage.
          </p>
          
          {/* Stats Globales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <Card className="p-4 bg-white/10 border-white/20">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-white/60 text-sm">Pages Total</div>
            </Card>
            <Card className="p-4 bg-green-500/10 border-green-500/20">
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              <div className="text-white/60 text-sm">Pages Actives</div>
            </Card>
            <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400">{stats.premium}</div>
              <div className="text-white/60 text-sm">Premium</div>
            </Card>
            <Card className="p-4 bg-blue-500/10 border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">{Math.round(stats.totalUsage/1000)}k</div>
              <div className="text-white/60 text-sm">Utilisations</div>
            </Card>
          </div>
        </div>

        {/* Filtres et Recherche */}
        <Card className="p-6 bg-white/10 border-white/20">
          <div className="space-y-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, description ou fonctionnalité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-white/70 text-sm font-medium self-center">Catégorie:</span>
                {categories.map(category => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      <IconComponent className="w-4 h-4" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-white/70 text-sm font-medium self-center">Statut:</span>
                {statusFilters.map(status => (
                  <Button
                    key={status.id}
                    variant={selectedStatus === status.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus(status.id)}
                  >
                    {status.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Résultats */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">
              {filteredPages.length} Page{filteredPages.length !== 1 ? 's' : ''} trouvée{filteredPages.length !== 1 ? 's' : ''}
            </h2>
            <Badge variant="outline" className="bg-white/10 border-white/20 text-white/70">
              <Filter className="w-4 h-4 mr-2" />
              Filtré
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page, index) => {
              const IconComponent = page.icon;
              
              return (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 h-full bg-gradient-to-br from-white/5 to-white/10 border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
                    onClick={() => handlePageAccess(page)}
                  >
                    {/* Badges en haut */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {getStatusBadge(page.status)}
                      {page.isNew && (
                        <Badge className="bg-green-500/20 border-green-500/40 text-green-400 text-xs">
                          Nouveau
                        </Badge>
                      )}
                      {page.isPopular && (
                        <Badge className="bg-orange-500/20 border-orange-500/40 text-orange-400 text-xs">
                          Populaire
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${page.color} flex-shrink-0`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-2 pr-20">
                            {page.title}
                          </h3>
                          <p className="text-white/60 text-sm line-clamp-2">
                            {page.description}
                          </p>
                        </div>
                      </div>

                      {/* Métriques */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-2 text-white/70 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            Usage
                          </div>
                          <div className="text-white font-semibold">
                            {page.usageCount ? `${Math.round(page.usageCount/1000)}k` : '-'}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-white/70 mb-1">
                            <Star className="w-4 h-4" />
                            Note
                          </div>
                          <div className="text-white font-semibold">
                            {page.userRating ? `${page.userRating}/5` : '-'}
                          </div>
                        </div>
                      </div>

                      {/* Complexité */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Complexité:</span>
                        <span className={`font-medium capitalize ${getComplexityColor(page.complexity)}`}>
                          {page.complexity}
                        </span>
                      </div>

                      {/* Fonctionnalités */}
                      <div className="space-y-2">
                        <span className="text-white/70 text-sm">Fonctionnalités clés:</span>
                        <div className="flex flex-wrap gap-1">
                          {page.features.slice(0, 3).map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-white/10 text-white/70">
                              {feature}
                            </Badge>
                          ))}
                          {page.features.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-white/10 text-white/70">
                              +{page.features.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full bg-white/10 hover:bg-white/20 text-white border-0"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {page.status === 'premium' ? 'Découvrir Premium' : 
                         page.status === 'development' ? 'En développement' : 'Accéder'}
                      </Button>
                    </div>

                    {/* Decorative gradient */}
                    <div className={`absolute inset-0 opacity-5 bg-gradient-to-r ${page.color}`} />
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredPages.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucun résultat</h3>
              <p className="text-white/60">
                Essayez de modifier vos critères de recherche ou filtres.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};