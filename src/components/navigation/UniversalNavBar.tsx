import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { UniversalSearchWidget } from '@/components/features/UniversalSearchWidget';
import { QuickAccessPanel } from '@/components/features/QuickAccessPanel';
import { 
  Home, 
  BookOpen, 
  Music, 
  Brain, 
  Users, 
  BarChart3,
  Settings,
  Search,
  Menu,
  X,
  Sparkles,
  Target,
  Globe,
  Layers,
  Shield,
  Star,
  ChevronDown,
  Zap
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  isNew?: boolean;
  isPremium?: boolean;
}

export const UniversalNavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const quickActions: QuickAction[] = [
    { id: 'edn', title: 'Items EDN', path: '/edn', icon: BookOpen, color: 'from-blue-500 to-cyan-600' },
    { id: 'generator', title: 'Générateur IA', path: '/generator', icon: Music, color: 'from-purple-500 to-pink-600', isPremium: true },
    { id: 'chat', title: 'Assistant IA', path: '/chat', icon: Brain, color: 'from-green-500 to-emerald-600', isNew: true },
    { id: 'community', title: 'Communauté', path: '/med-mng/community', icon: Users, color: 'from-orange-500 to-red-600' },
    { id: 'analytics', title: 'Analytics', path: '/analytics', icon: BarChart3, color: 'from-indigo-500 to-blue-600' },
    { id: 'platform', title: 'Navigation Master', path: '/platform', icon: Globe, color: 'from-teal-500 to-cyan-600', isNew: true }
  ];

  const mainNavItems = [
    { path: '/', label: 'Accueil', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/edn', label: 'EDN', icon: BookOpen },
    { path: '/generator', label: 'Générateur', icon: Music, isPremium: true },
    { path: '/features', label: 'Fonctionnalités', icon: Layers }
  ];

  const filteredActions = quickActions.filter(action =>
    action.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.isPremium) {
      // Rediriger vers pricing pour les fonctionnalités premium
      navigate('/med-mng/pricing');
    } else {
      navigate(action.path);
    }
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Barre de navigation principale */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo et Brand */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">MED MNG</h1>
                <p className="text-xs text-white/60">Plateforme IA Médicale</p>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {mainNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.path)
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs ml-1">
                        Pro
                      </Badge>
                    )}
                    {isActive(item.path) && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions Droite */}
            <div className="flex items-center space-x-3">
              {/* Widget de recherche universel */}
              <div className="hidden sm:block">
                <UniversalSearchWidget />
              </div>

              {/* Accès rapide */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsQuickAccessOpen(true)}
                className="border-white/20 text-white/70 hover:text-white hover:bg-white/10 hidden md:flex"
              >
                <Zap className="w-4 h-4 mr-2" />
                Accès Rapide
              </Button>

              {/* Navigation Master */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/platform')}
                className="border-white/20 text-white/70 hover:text-white hover:bg-white/10 hidden lg:flex"
              >
                <Globe className="w-4 h-4 mr-2" />
                Navigation Master
              </Button>

              {/* Dashboard Complet */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-white/70 hover:text-white hover:bg-white/10 hidden md:flex"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>

              {/* Menu Mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-white/70 hover:text-white"
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

        {/* Recherche Rapide Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-4"
            >
              <div className="container mx-auto max-w-2xl">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    placeholder="Rechercher une fonctionnalité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/40"
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredActions.map((action) => {
                    const IconComponent = action.icon;
                    return (
                      <motion.div
                        key={action.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-3 h-auto bg-white/5 hover:bg-white/10"
                          onClick={() => handleQuickAction(action)}
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} mr-3`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-white font-medium text-sm">{action.title}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {action.isNew && (
                                <Badge className="bg-green-500/20 border-green-500/40 text-green-400 text-xs">
                                  Nouveau
                                </Badge>
                              )}
                              {action.isPremium && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs">
                                  Premium
                                </Badge>
                              )}
                            </div>
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

        {/* Menu Mobile */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl"
            >
              <div className="container mx-auto px-4 py-6">
                <nav className="space-y-2 mb-6">
                  {mainNavItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-white/10 text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {item.isPremium && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs ml-auto">
                            Premium
                          </Badge>
                        )}
                        {isActive(item.path) && (
                          <Badge variant="secondary" className="ml-auto">
                            Actuel
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Actions rapides mobiles */}
                <div className="space-y-3">
                  <h3 className="text-white/70 text-sm font-medium px-4">Accès Rapide</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        navigate('/platform');
                        setIsMobileMenuOpen(false);
                      }}
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Navigation
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Panel d'accès rapide */}
      <QuickAccessPanel 
        isOpen={isQuickAccessOpen} 
        onClose={() => setIsQuickAccessOpen(false)} 
      />

      {/* Overlay de fermeture */}
      {(isSearchOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => {
            setIsSearchOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </>
  );
};