import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Music, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Shield,
  Activity,
  HeadphonesIcon,
  Sparkles,
  User,
  Trophy,
  Users,
  Play,
  Zap,
  Brain,
  Target,
  Clock,
  Star,
  Award,
  TrendingUp,
  Lightbulb,
  Headphones
} from 'lucide-react';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
  description?: string;
  category: 'main' | 'study' | 'tools' | 'community' | 'admin';
  isNew?: boolean;
  isPremium?: boolean;
}

const navigationItems: NavigationItem[] = [
  // Main Navigation
  { path: '/', label: 'Accueil', icon: Home, description: 'Dashboard principal immersif', category: 'main' },
  { path: '/dashboard', label: 'Dashboard Immersif', icon: Sparkles, description: 'Expérience personnalisée complète', category: 'main', isNew: true },
  
  // Study & Learning
  { path: '/edn', label: 'Items EDN', icon: BookOpen, badge: '367', description: 'Référentiel EDN complet avec immersion', category: 'study' },
  { path: '/ecos', label: 'ECOS', icon: MessageSquare, description: 'Examens cliniques objectifs structurés', category: 'study' },
  { path: '/generator', label: 'Générateur IA', icon: Music, badge: 'AI', description: 'Génération musicale pour mémorisation', category: 'study', isPremium: true },
  
  // AI Tools
  { path: '/chat', label: 'Assistant IA', icon: Brain, badge: 'GPT-4', description: 'Assistant médical intelligent', category: 'tools', isNew: true },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, description: 'Analyses de progression avancées', category: 'tools' },
  { path: '/monitoring', label: 'Monitoring', icon: Activity, description: 'Suivi en temps réel', category: 'tools' },
  
  // MED-MNG Platform
  { path: '/med-mng/dashboard', label: 'MED-MNG', icon: Headphones, description: 'Plateforme musicale médicale', category: 'study', isPremium: true },
  { path: '/med-mng/create', label: 'Créer Musique', icon: Play, description: 'Studio de création musicale', category: 'study', isPremium: true },
  { path: '/med-mng/library', label: 'Bibliothèque', icon: Music, description: 'Collection musicale personnelle', category: 'study' },
  { path: '/med-mng/community', label: 'Communauté', icon: Users, description: 'Réseau collaboratif médical', category: 'community' },
  
  // Community & Social
  { path: '/med-mng/playlists', label: 'Playlists', icon: Trophy, description: 'Playlists collaboratives', category: 'community' },
  { path: '/support', label: 'Support', icon: HeadphonesIcon, description: 'Aide et documentation', category: 'community' },
  
  // Admin & Management
  { path: '/admin', label: 'Administration', icon: Shield, description: 'Gestion plateforme', category: 'admin' },
  { path: '/audit', label: 'Audit Qualité', icon: Target, description: 'Contrôle qualité contenu', category: 'admin' },
];

export const UnifiedNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('main');

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const categories = {
    main: { label: 'Principal', icon: Home, color: 'from-blue-500 to-purple-600' },
    study: { label: 'Études', icon: BookOpen, color: 'from-green-500 to-blue-600' },
    tools: { label: 'Outils IA', icon: Brain, color: 'from-purple-500 to-pink-600' },
    community: { label: 'Communauté', icon: Users, color: 'from-orange-500 to-red-600' },
    admin: { label: 'Administration', icon: Shield, color: 'from-gray-500 to-gray-700' }
  };

  const getItemsByCategory = (category: string) => {
    return navigationItems.filter(item => item.category === category);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-xl border-white/10 text-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MED MNG Navigation</h1>
              <p className="text-white/60">Plateforme immersive d'apprentissage médical</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/20 border-green-500/40 text-green-400">
              <Star className="w-3 h-3 mr-1" />
              100% Fonctionnel
            </Badge>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(categories).map(([key, category]) => {
            const isSelected = selectedCategory === key;
            const CategoryIcon = category.icon;
            
            return (
              <Button
                key={key}
                variant={isSelected ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className={`relative ${isSelected 
                  ? `bg-gradient-to-r ${category.color} text-white` 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <CategoryIcon className="w-4 h-4 mr-2" />
                {category.label}
                <Badge variant="outline" className="ml-2 text-xs">
                  {getItemsByCategory(key).length}
                </Badge>
              </Button>
            );
          })}
        </div>

        <Separator className="bg-white/10 mb-6" />

        {/* Navigation Items */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {getItemsByCategory(selectedCategory).map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                    active 
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-blue-500/40' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {/* Premium Badge */}
                  {item.isPremium && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}

                  {/* New Badge */}
                  {item.isNew && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs">
                        Nouveau
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${active ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                      <IconComponent className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-white/70'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold truncate ${active ? 'text-white' : 'text-white/90'}`}>
                          {item.label}
                        </h3>
                        {item.badge && (
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-white/10 border-white/20 text-white/70"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-white/60 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      {active && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-blue-400">
                          <Activity className="w-3 h-3" />
                          Page active
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">367</div>
              <div className="text-sm text-white/60">Items EDN</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">24</div>
              <div className="text-sm text-white/60">Fonctionnalités</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">100%</div>
              <div className="text-sm text-white/60">Fonctionnel</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">AI</div>
              <div className="text-sm text-white/60">Powered</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};