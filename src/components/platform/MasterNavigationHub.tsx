import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  BookOpen, 
  Music, 
  Brain, 
  Users, 
  BarChart3,
  Settings,
  Shield,
  Activity,
  Sparkles,
  Target,
  Globe,
  Heart,
  Zap,
  Star,
  Award,
  TrendingUp,
  Clock,
  PlayCircle,
  FileText,
  HelpCircle,
  MessageSquare,
  Stethoscope
} from 'lucide-react';

interface NavigationItem {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<any>;
  category: 'study' | 'tools' | 'community' | 'admin' | 'premium';
  isNew?: boolean;
  isPremium?: boolean;
  isPopular?: boolean;
  completionRate?: number;
  userCount?: number;
}

const navigationItems: NavigationItem[] = [
  // Study & Learning
  {
    id: 'edn',
    title: 'Items EDN',
    description: '367 items de connaissances avec contenu immersif et musical',
    path: '/edn',
    icon: BookOpen,
    category: 'study',
    isPopular: true,
    completionRate: 95,
    userCount: 2847
  },
  {
    id: 'ecos',
    title: 'ECOS Simulations',
    description: 'Examens cliniques objectifs structurés interactifs',
    path: '/ecos',
    icon: Stethoscope,
    category: 'study',
    completionRate: 87
  },
  {
    id: 'generator',
    title: 'Générateur Musical IA',
    description: 'Créez des chansons éducatives personnalisées avec Suno AI',
    path: '/generator',
    icon: Music,
    category: 'premium',
    isPremium: true,
    isNew: true,
    completionRate: 92
  },
  
  // MED-MNG Platform
  {
    id: 'med-mng-dashboard',
    title: 'Dashboard MED-MNG',
    description: 'Interface principale de la plateforme musicale médicale',
    path: '/med-mng/dashboard',
    icon: BarChart3,
    category: 'premium',
    isPremium: true,
    isPopular: true
  },
  {
    id: 'med-mng-create',
    title: 'Studio de Création',
    description: 'Créateur de musiques pédagogiques avancé',
    path: '/med-mng/create',
    icon: PlayCircle,
    category: 'premium',
    isPremium: true
  },
  {
    id: 'med-mng-library',
    title: 'Bibliothèque Musicale',
    description: 'Collection complète de musiques éducatives',
    path: '/med-mng/library',
    icon: Music,
    category: 'study',
    userCount: 1543
  },
  
  // AI Tools
  {
    id: 'chat',
    title: 'Assistant IA Médical',
    description: 'Chatbot spécialisé en médecine avec GPT-4',
    path: '/chat',
    icon: Brain,
    category: 'tools',
    isNew: true,
    completionRate: 89
  },
  {
    id: 'analytics',
    title: 'Analytics Avancées',
    description: 'Analyses détaillées de performances et progression',
    path: '/analytics',
    icon: TrendingUp,
    category: 'tools',
    completionRate: 94
  },
  {
    id: 'monitoring',
    title: 'Centre de Monitoring',
    description: 'Surveillance système et performance en temps réel',
    path: '/monitoring',
    icon: Activity,
    category: 'admin'
  },
  
  // Community & Social
  {
    id: 'community',
    title: 'Communauté',
    description: 'Réseau social des étudiants en médecine',
    path: '/community',
    icon: Users,
    category: 'community',
    isPopular: true,
    userCount: 892
  },
  {
    id: 'med-mng-community',
    title: 'Communauté MED-MNG',
    description: 'Partage et collaboration musicale',
    path: '/med-mng/community',
    icon: Heart,
    category: 'community'
  },
  {
    id: 'playlists',
    title: 'Playlists Collaboratives',
    description: 'Créez et partagez des playlists éducatives',
    path: '/med-mng/playlists',
    icon: Music,
    category: 'community'
  },
  
  // Platform Management
  {
    id: 'profile',
    title: 'Mon Profil',
    description: 'Gestion du profil utilisateur et préférences',
    path: '/profile',
    icon: Settings,
    category: 'tools'
  },
  {
    id: 'settings',
    title: 'Paramètres',
    description: 'Configuration de la plateforme et compte',
    path: '/settings',
    icon: Settings,
    category: 'tools'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Centre de notifications et alertes',
    path: '/notifications',
    icon: MessageSquare,
    category: 'tools'
  },
  
  // Help & Support
  {
    id: 'documentation',
    title: 'Documentation',
    description: 'Guide complet d\'utilisation de la plateforme',
    path: '/documentation',
    icon: FileText,
    category: 'tools',
    completionRate: 98
  },
  {
    id: 'faq',
    title: 'FAQ',
    description: 'Questions fréquemment posées et réponses',
    path: '/faq',
    icon: HelpCircle,
    category: 'tools'
  },
  {
    id: 'help',
    title: 'Centre d\'Aide',
    description: 'Support technique et assistance utilisateur',
    path: '/help',
    icon: HelpCircle,
    category: 'tools'
  },
  
  // Admin & Advanced
  {
    id: 'admin',
    title: 'Administration',
    description: 'Panel d\'administration de la plateforme',
    path: '/admin',
    icon: Shield,
    category: 'admin'
  },
  {
    id: 'audit',
    title: 'Audit Qualité',
    description: 'Contrôle qualité des contenus et données',
    path: '/audit',
    icon: Target,
    category: 'admin'
  },
  {
    id: 'system-health',
    title: 'Santé Système',
    description: 'Monitoring de l\'état du système',
    path: '/system-health',
    icon: Activity,
    category: 'admin'
  }
];

const categoryConfig = {
  study: { 
    label: 'Apprentissage', 
    icon: BookOpen, 
    color: 'from-blue-500 to-cyan-600',
    description: 'Outils d\'apprentissage et contenus pédagogiques'
  },
  tools: { 
    label: 'Outils', 
    icon: Zap, 
    color: 'from-purple-500 to-pink-600',
    description: 'Outils et fonctionnalités utilitaires'
  },
  community: { 
    label: 'Communauté', 
    icon: Users, 
    color: 'from-green-500 to-emerald-600',
    description: 'Interactions sociales et collaboration'
  },
  premium: { 
    label: 'Premium', 
    icon: Star, 
    color: 'from-yellow-500 to-orange-600',
    description: 'Fonctionnalités premium et avancées'
  },
  admin: { 
    label: 'Administration', 
    icon: Shield, 
    color: 'from-gray-500 to-slate-600',
    description: 'Gestion et administration de la plateforme'
  }
};

export const MasterNavigationHub: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = useMemo(() => {
    let items = navigationItems;
    
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    if (searchTerm) {
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  }, [searchTerm, selectedCategory]);

  const stats = {
    totalItems: navigationItems.length,
    premiumItems: navigationItems.filter(item => item.isPremium).length,
    newItems: navigationItems.filter(item => item.isNew).length,
    popularItems: navigationItems.filter(item => item.isPopular).length
  };

  return (
    <div className="space-y-8">
      {/* Header avec stats */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Globe className="w-10 h-10 text-blue-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Master Navigation Hub
          </h1>
        </div>
        <p className="text-xl text-white/70 max-w-3xl mx-auto">
          Accédez à toutes les fonctionnalités de MED MNG depuis cette interface centralisée
        </p>
        
        {/* Stats rapides */}
        <div className="flex justify-center gap-4">
          <Badge className="bg-blue-500/20 border-blue-500/40 text-blue-300">
            {stats.totalItems} Fonctionnalités
          </Badge>
          <Badge className="bg-yellow-500/20 border-yellow-500/40 text-yellow-300">
            {stats.premiumItems} Premium
          </Badge>
          <Badge className="bg-green-500/20 border-green-500/40 text-green-300">
            {stats.newItems} Nouveautés
          </Badge>
          <Badge className="bg-pink-500/20 border-pink-500/40 text-pink-300">
            {stats.popularItems} Populaires
          </Badge>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
        <Input
          placeholder="Rechercher une fonctionnalité..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/40 text-lg h-12"
        />
      </div>

      {/* Navigation par catégories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-white/10">
          <TabsTrigger value="all" className="data-[state=active]:bg-white/20">
            Toutes ({navigationItems.length})
          </TabsTrigger>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = navigationItems.filter(item => item.category === key).length;
            return (
              <TabsTrigger key={key} value={key} className="data-[state=active]:bg-white/20">
                {config.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + searchTerm}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredItems.map((item, index) => {
                const IconComponent = item.icon;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className="h-full bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate(item.path)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${categoryConfig[item.category].color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex flex-col gap-1">
                            {item.isNew && (
                              <Badge className="bg-green-500/20 border-green-500/40 text-green-400 text-xs">
                                Nouveau
                              </Badge>
                            )}
                            {item.isPremium && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs">
                                Premium
                              </Badge>
                            )}
                            {item.isPopular && (
                              <Badge className="bg-pink-500/20 border-pink-500/40 text-pink-400 text-xs">
                                Populaire
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-white/60 leading-relaxed">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {/* Stats optionnelles */}
                        {(item.completionRate || item.userCount) && (
                          <div className="flex justify-between text-sm text-white/50 mb-4">
                            {item.completionRate && (
                              <span>Complété: {item.completionRate}%</span>
                            )}
                            {item.userCount && (
                              <span>{item.userCount} utilisateurs</span>
                            )}
                          </div>
                        )}
                        
                        <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20">
                          Accéder
                          <IconComponent className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Message si aucun résultat */}
          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-white/50">
                Essayez d'autres mots-clés ou changez de catégorie
              </p>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};