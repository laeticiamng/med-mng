import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Music, 
  Brain, 
  Users, 
  BarChart3,
  Settings,
  Menu,
  X,
  Sparkles,
  Target,
  Globe,
  Layers,
  Shield,
  Star,
  Zap,
  Play,
  Heart,
  Award,
  Search,
  Bell,
  User
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  category: 'main' | 'tools' | 'community' | 'admin';
  isNew?: boolean;
  isPremium?: boolean;
  isPopular?: boolean;
  description: string;
}

export const PremiumNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('main');

  const navigationItems: NavigationItem[] = [
    // Main Navigation
    { id: 'home', label: 'Accueil', path: '/', icon: Home, color: 'from-blue-500 to-cyan-600', category: 'main', description: 'Page d\'accueil de la plateforme', isPopular: true },
    { id: 'edn', label: 'Items EDN', path: '/edn', icon: BookOpen, color: 'from-primary to-primary-glow', category: 'main', description: '367 items EDN avec contenus immersifs', isPopular: true },
    { id: 'platform', label: 'Vue Plateforme', path: '/platform', icon: Globe, color: 'from-teal-500 to-cyan-600', category: 'main', description: 'Navigation master complète', isNew: true },
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: BarChart3, color: 'from-indigo-500 to-blue-600', category: 'main', description: 'Tableau de bord principal' },
    { id: 'features', label: 'Fonctionnalités', path: '/features', icon: Layers, color: 'from-purple-500 to-pink-600', category: 'main', description: 'Toutes les fonctionnalités disponibles' },

    // Tools
    { id: 'generator', label: 'Générateur IA', path: '/generator', icon: Music, color: 'from-accent to-accent-glow', category: 'tools', description: 'Créez des musiques pédagogiques', isPremium: true, isPopular: true },
    { id: 'meditation', label: 'Méditation IA', path: '/meditation', icon: Brain, color: 'from-purple-500 to-indigo-600', category: 'tools', description: 'Suite complète méditation IA', isNew: true, isPremium: true },
    { id: 'chat', label: 'Assistant IA', path: '/chat', icon: Brain, color: 'from-success to-success-glow', category: 'tools', description: 'Assistant médical intelligent', isNew: true },
    { id: 'ecos', label: 'Simulations ECOS', path: '/ecos', icon: Play, color: 'from-green-500 to-emerald-600', category: 'tools', description: 'Examens cliniques simulés' },
    { id: 'analytics', label: 'Analytics', path: '/analytics', icon: BarChart3, color: 'from-info to-info-glow', category: 'tools', description: 'Analyses avancées de performance' },

    // Community & MED-MNG
    { id: 'med-mng-dashboard', label: 'MED-MNG Studio', path: '/med-mng/dashboard', icon: Heart, color: 'from-pink-500 to-red-600', category: 'community', description: 'Studio de création musicale', isPremium: true },
    { id: 'community', label: 'Communauté', path: '/community', icon: Users, color: 'from-orange-500 to-red-600', category: 'community', description: 'Échangez avec la communauté' },
    { id: 'profile', label: 'Profil', path: '/profile', icon: User, color: 'from-violet-500 to-purple-600', category: 'community', description: 'Gérez votre profil' },

    // Admin & Tools
    { id: 'admin', label: 'Administration', path: '/admin', icon: Shield, color: 'from-red-500 to-pink-600', category: 'admin', description: 'Panneau d\'administration' },
    { id: 'system-admin', label: 'Admin Système', path: '/system-admin', icon: Settings, color: 'from-purple-500 to-indigo-600', category: 'admin', description: 'Administration système avancée', isNew: true },
    { id: 'system-dashboard', label: 'Dashboard Système', path: '/system-dashboard', icon: BarChart3, color: 'from-cyan-500 to-blue-600', category: 'admin', description: 'Tableau de bord système complet', isNew: true },
    { id: 'monitoring', label: 'Monitoring', path: '/monitoring', icon: Target, color: 'from-yellow-500 to-orange-600', category: 'admin', description: 'Surveillance système' },
    { id: 'settings', label: 'Paramètres', path: '/settings', icon: Settings, color: 'from-gray-500 to-slate-600', category: 'admin', description: 'Configuration utilisateur' }
  ];

  const categories = [
    { id: 'main', label: 'Principal', icon: Home },
    { id: 'tools', label: 'Outils', icon: Zap },
    { id: 'community', label: 'Communauté', icon: Users },
    { id: 'admin', label: 'Admin', icon: Shield }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const filteredItems = navigationItems.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  );

  const handleNavigate = (item: NavigationItem) => {
    if (item.isPremium) {
      navigate('/med-mng/pricing');
    } else {
      navigate(item.path);
    }
    setIsMobileMenuOpen(false);
  };

  const popularItems = navigationItems.filter(item => item.isPopular);
  const newItems = navigationItems.filter(item => item.isNew);

  return (
    <>
      {/* Header Premium */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Premium */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  MED MNG
                </h1>
                <p className="text-xs text-muted-foreground">Plateforme IA Médicale Premium</p>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.filter(item => item.category === 'main').slice(0, 5).map((item) => {
                const IconComponent = item.icon;
                return (
                  <motion.div key={item.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleNavigate(item)}
                      className={`relative flex items-center space-x-2 transition-all ${
                        isActive(item.path)
                          ? 'bg-primary text-primary-foreground shadow-medium'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.isPremium && (
                        <Badge className="bg-gradient-accent text-white text-xs ml-1">
                          Pro
                        </Badge>
                      )}
                      {item.isNew && (
                        <Badge className="bg-success/20 text-success text-xs ml-1">
                          New
                        </Badge>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </nav>

            {/* Actions Premium */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex border-border/50 hover:bg-muted"
              >
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="relative hidden sm:flex"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/platform')}
                className="hidden lg:flex bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20"
              >
                <Globe className="w-4 h-4 mr-2" />
                Navigation Master
              </Button>

              {/* Menu Mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Menu Mobile Premium */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl"
            >
              <div className="container mx-auto px-4 py-6">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveCategory(category.id)}
                        className="flex items-center space-x-2"
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{category.label}</span>
                      </Button>
                    );
                  })}
                </div>

                {/* Quick Access - Popular */}
                {activeCategory === 'main' && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">Populaire</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {popularItems.slice(0, 4).map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <motion.div key={item.id} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-gradient-to-br from-card via-card to-muted/30 border-border/50 hover:border-primary/30 hover:shadow-soft"
                              onClick={() => handleNavigate(item)}
                            >
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color}`}>
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-sm font-medium text-center">{item.label}</span>
                              <div className="flex gap-1">
                                {item.isPremium && (
                                  <Badge className="bg-gradient-accent text-white text-xs">Premium</Badge>
                                )}
                                {item.isNew && (
                                  <Badge className="bg-success/20 text-success text-xs">Nouveau</Badge>
                                )}
                                {item.isPopular && (
                                  <Badge className="bg-info/20 text-info text-xs">Populaire</Badge>
                                )}
                              </div>
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Navigation Items */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
                    {categories.find(c => c.id === activeCategory)?.label || 'Navigation'}
                  </h3>
                  {filteredItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.div key={item.id} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant={isActive(item.path) ? "default" : "ghost"}
                          className={`w-full justify-start h-auto p-4 ${
                            isActive(item.path) 
                              ? 'bg-primary text-primary-foreground shadow-medium' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => handleNavigate(item)}
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} mr-3`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs opacity-70 mt-1">{item.description}</div>
                          </div>
                          <div className="flex flex-col gap-1">
                            {item.isPremium && (
                              <Badge className="bg-gradient-accent text-white text-xs">Pro</Badge>
                            )}
                            {item.isNew && (
                              <Badge className="bg-success/20 text-success text-xs">New</Badge>
                            )}
                            {isActive(item.path) && (
                              <Badge variant="secondary" className="bg-white/20 text-xs">Actuel</Badge>
                            )}
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};