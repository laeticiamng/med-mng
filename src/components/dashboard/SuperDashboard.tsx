import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Home, 
  BookOpen, 
  Music, 
  Brain, 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  Search,
  Play,
  Sparkles,
  Target,
  Award,
  TrendingUp,
  Clock,
  Heart,
  Zap,
  Star,
  Activity,
  MessageSquare,
  FileText,
  Stethoscope,
  HeadphonesIcon,
  User,
  CreditCard,
  HelpCircle,
  MonitorSpeaker,
  Database,
  Code,
  Globe,
  Lock,
  Lightbulb,
  Layers
} from 'lucide-react';

interface DashboardModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  category: 'learning' | 'music' | 'analytics' | 'community' | 'admin' | 'tools';
  isActive: boolean;
  isPremium?: boolean;
  isNew?: boolean;
  progress?: number;
  stats?: {
    total?: number;
    completed?: number;
    label?: string;
  };
  color: string;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'creation' | 'completion' | 'interaction' | 'achievement';
  icon: React.ComponentType<any>;
}

export const SuperDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  // Modules principaux de la plateforme
  const modules: DashboardModule[] = [
    // Learning & Education
    {
      id: 'edn-items',
      title: 'Items EDN Immersifs',
      description: 'Maîtrisez les 367 items du référentiel EDN avec une expérience immersive',
      icon: BookOpen,
      path: '/edn',
      category: 'learning',
      isActive: true,
      isNew: true,
      progress: 67,
      stats: { total: 367, completed: 245, label: 'Items complétés' },
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'ecos-scenarios',
      title: 'Simulations ECOS',
      description: 'Examens Cliniques Objectifs Structurés interactifs',
      icon: Target,
      path: '/ecos',
      category: 'learning',
      isActive: true,
      progress: 45,
      stats: { total: 12, completed: 5, label: 'Scénarios maîtrisés' },
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'medical-chat',
      title: 'Assistant IA Médical',
      description: 'Chat intelligent spécialisé avec base de connaissances experte',
      icon: Brain,
      path: '/chat',
      category: 'learning',
      isActive: true,
      isNew: true,
      color: 'from-purple-500 to-pink-600'
    },

    // Musical Learning
    {
      id: 'music-generator',
      title: 'Générateur Musical IA',
      description: 'Créez des mnémotechniques musicaux personnalisés',
      icon: Music,
      path: '/generator',
      category: 'music',
      isActive: true,
      isPremium: true,
      isNew: true,
      stats: { total: 156, completed: 89, label: 'Musiques créées' },
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'music-library',
      title: 'Bibliothèque Musicale',
      description: 'Vos créations, playlists et favoris organisés',
      icon: HeadphonesIcon,
      path: '/med-mng/library',
      category: 'music',
      isActive: true,
      progress: 78,
      stats: { total: 234, completed: 182, label: 'Pistes sauvegardées' },
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'music-studio',
      title: 'Studio de Création',
      description: 'Environnement professionnel de création musicale',
      icon: MonitorSpeaker,
      path: '/med-mng/create',
      category: 'music',
      isActive: true,
      isPremium: true,
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'playlists',
      title: 'Playlists Collaboratives',
      description: 'Créez et partagez des collections musicales thématiques',
      icon: Heart,
      path: '/med-mng/playlists',
      category: 'music',
      isActive: true,
      stats: { total: 24, completed: 18, label: 'Playlists actives' },
      color: 'from-teal-500 to-cyan-600'
    },

    // Analytics & Performance
    {
      id: 'advanced-analytics',
      title: 'Analytics Avancées',
      description: 'Analyses détaillées de votre progression et performances',
      icon: BarChart3,
      path: '/analytics',
      category: 'analytics',
      isActive: true,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'music-analytics',
      title: 'Analytics Musicales',
      description: 'Statistiques d\'écoute et d\'apprentissage musical',
      icon: TrendingUp,
      path: '/med-mng/analytics',
      category: 'analytics',
      isActive: true,
      isPremium: true,
      color: 'from-green-600 to-teal-600'
    },
    {
      id: 'real-time-monitoring',
      title: 'Monitoring Temps Réel',
      description: 'Surveillance en temps réel de vos activités',
      icon: Activity,
      path: '/monitoring',
      category: 'analytics',
      isActive: true,
      color: 'from-orange-500 to-red-600'
    },

    // Community & Social
    {
      id: 'community',
      title: 'Communauté Étudiante',
      description: 'Connectez-vous avec d\'autres étudiants en médecine',
      icon: Users,
      path: '/med-mng/community',
      category: 'community',
      isActive: true,
      stats: { total: 1247, completed: 892, label: 'Membres actifs' },
      color: 'from-violet-500 to-purple-600'
    },
    {
      id: 'profile',
      title: 'Profil Personnel',
      description: 'Gérez votre profil, préférences et achievements',
      icon: User,
      path: '/med-mng/profile',
      category: 'community',
      isActive: true,
      color: 'from-gray-500 to-slate-600'
    },
    {
      id: 'subscription',
      title: 'Abonnement Premium',
      description: 'Accédez aux fonctionnalités avancées',
      icon: Star,
      path: '/med-mng/pricing',
      category: 'community',
      isActive: true,
      color: 'from-yellow-500 to-amber-600'
    },

    // Tools & Utilities
    {
      id: 'platform-overview',
      title: 'Vue d\'Ensemble Plateforme',
      description: 'Navigation master et aperçu complet',
      icon: Globe,
      path: '/platform',
      category: 'tools',
      isActive: true,
      isNew: true,
      color: 'from-emerald-500 to-green-600'
    },
    {
      id: 'all-features',
      title: 'Toutes les Fonctionnalités',
      description: 'Catalogue complet des fonctionnalités disponibles',
      icon: Layers,
      path: '/features',
      category: 'tools',
      isActive: true,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'settings',
      title: 'Paramètres Avancés',
      description: 'Configuration personnalisée de votre expérience',
      icon: Settings,
      path: '/med-mng/settings',
      category: 'tools',
      isActive: true,
      color: 'from-slate-500 to-gray-600'
    },
    {
      id: 'support',
      title: 'Support & Documentation',
      description: 'Centre d\'aide et support technique',
      icon: HelpCircle,
      path: '/support',
      category: 'tools',
      isActive: true,
      color: 'from-indigo-500 to-blue-600'
    },

    // Administration
    {
      id: 'admin-panel',
      title: 'Panel d\'Administration',
      description: 'Interface complète d\'administration',
      icon: Shield,
      path: '/admin-panel',
      category: 'admin',
      isActive: true,
      color: 'from-red-600 to-rose-600'
    },
    {
      id: 'system-health',
      title: 'Santé du Système',
      description: 'Monitoring et diagnostic système',
      icon: Activity,
      path: '/system-health',
      category: 'admin',
      isActive: true,
      color: 'from-green-600 to-emerald-600'
    },
    {
      id: 'audit-quality',
      title: 'Audit Qualité',
      description: 'Contrôle qualité du contenu et des données',
      icon: Award,
      path: '/audit',
      category: 'admin',
      isActive: true,
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'data-export',
      title: 'Export de Données',
      description: 'Outils d\'export et de sauvegarde',
      icon: Database,
      path: '/export',
      category: 'admin',
      isActive: true,
      color: 'from-blue-600 to-cyan-600'
    }
  ];

  // Activité récente simulée
  useEffect(() => {
    setRecentActivity([
      {
        id: '1',
        title: 'Nouveau quiz complété',
        description: 'Item EDN IC-156 - Cardiologie',
        timestamp: '5 min',
        type: 'completion',
        icon: Award
      },
      {
        id: '2',
        title: 'Musique générée',
        description: 'Mnémotechnique Neurologie - Style Rap',
        timestamp: '12 min',
        type: 'creation',
        icon: Music
      },
      {
        id: '3',
        title: 'Achievement débloqué',
        description: 'Expert en Pneumologie',
        timestamp: '1h',
        type: 'achievement',
        icon: Star
      },
      {
        id: '4',
        title: 'Session ECOS terminée',
        description: 'Scénario Urgences - Score: 87%',
        timestamp: '2h',
        type: 'completion',
        icon: Target
      }
    ]);
  }, []);

  const categories = [
    { id: 'all', name: 'Tout', icon: Globe },
    { id: 'learning', name: 'Apprentissage', icon: BookOpen },
    { id: 'music', name: 'Musical', icon: Music },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'community', name: 'Communauté', icon: Users },
    { id: 'tools', name: 'Outils', icon: Settings },
    { id: 'admin', name: 'Admin', icon: Shield }
  ];

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleModuleClick = (module: DashboardModule) => {
    if (module.isPremium) {
      toast.info(`${module.title} - Fonctionnalité Premium`, {
        icon: <Zap className="w-4 h-4" />,
        description: 'Abonnez-vous pour accéder à cette fonctionnalité',
        action: {
          label: 'Voir les tarifs',
          onClick: () => navigate('/med-mng/pricing')
        }
      });
    } else {
      toast.success(`Ouverture de ${module.title}...`);
      navigate(module.path);
    }
  };

  const getStatsProgress = () => {
    const totalItems = modules.reduce((acc, module) => acc + (module.stats?.total || 0), 0);
    const completedItems = modules.reduce((acc, module) => acc + (module.stats?.completed || 0), 0);
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Dashboard Complet MED MNG
              </h1>
              <p className="text-white/70 text-lg">
                Votre centre de contrôle pour l'apprentissage médical révolutionnaire
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500/20 border-green-500/40 text-green-400 px-4 py-2">
                <Activity className="w-4 h-4 mr-2" />
                Système Opérationnel
              </Badge>
              <Button
                onClick={() => navigate('/platform')}
                variant="outline"
                className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
              >
                <Globe className="w-4 h-4 mr-2" />
                Vue Master
              </Button>
            </div>
          </div>

          {/* Stats Globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">367</div>
                  <div className="text-sm text-white/60">Items EDN</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
              <div className="flex items-center gap-3">
                <Music className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">1,247</div>
                  <div className="text-sm text-white/60">Musiques Créées</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">12,843</div>
                  <div className="text-sm text-white/60">Étudiants</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{Math.round(getStatsProgress())}%</div>
                  <div className="text-sm text-white/60">Progression Globale</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
              <Input
                placeholder="Rechercher une fonctionnalité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map(category => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2 shrink-0"
                  >
                    <IconComponent className="w-4 h-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="modules" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 border-white/20">
            <TabsTrigger value="modules" className="data-[state=active]:bg-white/20">
              Modules
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-white/20">
              Activité
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-white/20">
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-8">
            {/* Modules par catégorie */}
            {categories.filter(cat => cat.id !== 'all').map(category => {
              const categoryModules = filteredModules.filter(m => m.category === category.id);
              if (categoryModules.length === 0) return null;

              const IconComponent = category.icon;
              
              return (
                <div key={category.id} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-6 h-6 text-white/70" />
                    <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                    <Badge variant="outline" className="bg-white/10 border-white/20 text-white/70">
                      {categoryModules.length} modules
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryModules.map((module, index) => {
                      const IconComponent = module.icon;
                      
                      return (
                        <motion.div
                          key={module.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className="p-6 h-full bg-gradient-to-br from-white/5 to-white/10 border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
                            onClick={() => handleModuleClick(module)}
                          >
                            {/* Badges */}
                            <div className="absolute top-4 right-4 flex gap-2">
                              {module.isPremium && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                              {module.isNew && (
                                <Badge className="bg-green-500/20 border-green-500/40 text-green-400 text-xs">
                                  Nouveau
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-4">
                              {/* Header */}
                              <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${module.color} flex-shrink-0`}>
                                  <IconComponent className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-semibold text-white mb-2">
                                    {module.title}
                                  </h3>
                                  <p className="text-white/60 text-sm line-clamp-2">
                                    {module.description}
                                  </p>
                                </div>
                              </div>

                              {/* Progress */}
                              {module.progress && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-white/70">Progression</span>
                                    <span className="text-white">{module.progress}%</span>
                                  </div>
                                  <Progress value={module.progress} className="h-2" />
                                </div>
                              )}

                              {/* Stats */}
                              {module.stats && (
                                <div className="bg-white/5 rounded-lg p-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-sm">{module.stats.label}</span>
                                    <span className="text-white font-semibold">
                                      {module.stats.completed}/{module.stats.total}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Action Button */}
                              <Button 
                                className="w-full bg-white/10 hover:bg-white/20 text-white border-0"
                                size="sm"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                {module.isPremium ? 'Découvrir Premium' : 'Accéder'}
                              </Button>
                            </div>

                            {/* Decorative gradient */}
                            <div className={`absolute inset-0 opacity-5 bg-gradient-to-r ${module.color}`} />
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Activité récente */}
              <Card className="p-6 bg-gradient-to-br from-white/5 to-white/10 border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Activité Récente
                </h3>
                <div className="space-y-4">
                  {recentActivity.map(activity => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg bg-white/5">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{activity.title}</h4>
                          <p className="text-white/60 text-sm">{activity.description}</p>
                          <span className="text-white/40 text-xs">Il y a {activity.timestamp}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Raccourcis rapides */}
              <Card className="p-6 bg-gradient-to-br from-white/5 to-white/10 border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Accès Rapide
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: 'Nouveau Quiz', path: '/edn', icon: Brain, color: 'from-blue-500 to-cyan-600' },
                    { title: 'Créer Musique', path: '/generator', icon: Music, color: 'from-purple-500 to-pink-600' },
                    { title: 'Ma Progression', path: '/analytics', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
                    { title: 'Communauté', path: '/med-mng/community', icon: Users, color: 'from-orange-500 to-red-600' }
                  ].map(shortcut => {
                    const IconComponent = shortcut.icon;
                    return (
                      <Button
                        key={shortcut.title}
                        className={`h-20 flex-col gap-2 bg-gradient-to-r ${shortcut.color} hover:opacity-90`}
                        onClick={() => navigate(shortcut.path)}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-xs">{shortcut.title}</span>
                      </Button>
                    );
                  })}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Statistiques d'usage */}
              <Card className="p-6 bg-gradient-to-br from-white/5 to-white/10 border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Utilisation Quotidienne</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Temps d'étude</span>
                    <span className="text-white font-semibold">4h 32min</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="flex justify-between">
                    <span className="text-white/70">Quiz complétés</span>
                    <span className="text-white font-semibold">12</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  <div className="flex justify-between">
                    <span className="text-white/70">Musiques écoutées</span>
                    <span className="text-white font-semibold">28</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
              </Card>

              {/* Achievements */}
              <Card className="p-6 bg-gradient-to-br from-white/5 to-white/10 border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Derniers Achievements</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Expert Cardiologie', icon: Heart, color: 'text-red-400' },
                    { title: 'Mélomane Médical', icon: Music, color: 'text-purple-400' },
                    { title: 'Série de 7 jours', icon: Star, color: 'text-yellow-400' },
                    { title: 'Mentor Communauté', icon: Users, color: 'text-blue-400' }
                  ].map(achievement => {
                    const IconComponent = achievement.icon;
                    return (
                      <div key={achievement.title} className="flex items-center gap-3">
                        <IconComponent className={`w-5 h-5 ${achievement.color}`} />
                        <span className="text-white">{achievement.title}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Performance */}
              <Card className="p-6 bg-gradient-to-br from-white/5 to-white/10 border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Système</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Uptime</span>
                    <span className="text-green-400 font-semibold">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Response Time</span>
                    <span className="text-blue-400 font-semibold">127ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Users Online</span>
                    <span className="text-purple-400 font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">API Health</span>
                    <span className="text-green-400 font-semibold">Operational</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};