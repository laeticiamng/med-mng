// ==========================================
// MED-MNG PREMIUM GLOBAL NAVIGATION
// Navigation de niveau mondial avec accessibilité AAA
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, BookOpen, Music, User, Menu, X, ChevronDown, 
  Settings, LogOut, Crown, Zap, Brain, Heart, 
  Stethoscope, GraduationCap, Target, Award,
  Search, Bell, HelpCircle, Palette
} from 'lucide-react';
import { useAccessibility } from '@/hooks/useAccessibility';
import { accessibilityService } from '@/core/services/AccessibilityService';
import { cn } from '@/lib/utils';

interface NavigationItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  badge?: string;
  premium?: boolean;
  children?: NavigationItem[];
}

export const PremiumGlobalNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { preferences, updatePreference } = useAccessibility();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigationItems: NavigationItem[] = [
    { 
      path: '/', 
      icon: Home, 
      label: 'Accueil',
      description: 'Tableau de bord principal'
    },
    { 
      path: '/edn', 
      icon: BookOpen, 
      label: 'Items EDN',
      description: 'Base complète des 367 items',
      badge: '367',
      children: [
        { path: '/edn', icon: BookOpen, label: 'Explorer tout' },
        { path: '/edn/favorites', icon: Heart, label: 'Mes favoris' },
        { path: '/edn/progress', icon: Target, label: 'Mon progrès' },
      ]
    },
    { 
      path: '/med-mng', 
      icon: Music, 
      label: 'Studio Musical',
      description: 'Génération IA et bibliothèque',
      premium: true,
      children: [
        { path: '/med-mng/dashboard', icon: Crown, label: 'Dashboard Premium' },
        { path: '/med-mng/create', icon: Zap, label: 'Générer Musique' },
        { path: '/med-mng/library', icon: Music, label: 'Ma Bibliothèque' },
        { path: '/med-mng/playlists', icon: Heart, label: 'Mes Playlists' },
      ]
    },
    { 
      path: '/study', 
      icon: Brain, 
      label: 'Outils d\'Étude',
      description: 'Quiz, timer, analytics',
      children: [
        { path: '/med-mng/comprehensive', icon: Brain, label: 'Outils Interactifs' },
        { path: '/study/quiz', icon: GraduationCap, label: 'Quiz Adaptatifs' },
        { path: '/study/analytics', icon: Target, label: 'Analyses' },
        { path: '/study/timer', icon: Award, label: 'Timer Pomodoro' },
      ]
    },
    { 
      path: '/ecos', 
      icon: Stethoscope, 
      label: 'Simulations ECOS',
      description: 'Examens cliniques immersifs'
    }
  ];

  // Raccourcis clavier pour l'accessibilité
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + M pour ouvrir/fermer le menu mobile
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        setIsMobileMenuOpen(!isMobileMenuOpen);
        accessibilityService.announce(
          isMobileMenuOpen ? 'Menu fermé' : 'Menu ouvert', 
          'polite'
        );
      }
      
      // Alt + S pour focus sur la recherche
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        searchInputRef.current?.focus();
        accessibilityService.announce('Focus sur la recherche', 'polite');
      }
      
      // Escape pour fermer les dropdowns
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Fermer les dropdowns lors du clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const hasActiveChild = (item: NavigationItem) => {
    return item.children?.some(child => isActive(child.path)) || false;
  };

  const handleNavigation = (path: string, label: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    accessibilityService.announceNavigation(label);
  };

  const toggleDropdown = (itemPath: string) => {
    setActiveDropdown(activeDropdown === itemPath ? null : itemPath);
  };

  const quickSearchResults = navigationItems
    .filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 medical-nav"
      role="banner"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Premium */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group focus:ring-2 focus:ring-primary/20 rounded-lg p-1 transition-all"
            onClick={() => accessibilityService.announceNavigation('Accueil')}
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-medical flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Stethoscope className="text-white h-5 w-5" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                <Crown className="text-accent-foreground h-2 w-2" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl bg-gradient-medical bg-clip-text text-transparent">
                MED-MNG
              </span>
              <div className="flex items-center gap-1">
                <Badge className="bg-accent/20 text-accent-foreground text-xs">Premium</Badge>
                <Badge className="bg-primary/20 text-primary text-xs">v2.0</Badge>
              </div>
            </div>
          </Link>

          {/* Recherche Intelligente */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher... (Alt+S)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="medical-input pl-10 pr-4 py-2 w-full bg-muted/50 border-border focus:bg-background"
                aria-label="Recherche intelligente dans la plateforme"
              />
              
              {/* Résultats de recherche */}
              {isSearchFocused && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50"
                >
                  {quickSearchResults.length > 0 ? (
                    quickSearchResults.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          handleNavigation(item.path, item.label);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg flex items-center gap-3"
                      >
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{item.label}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-muted-foreground text-center">
                      Aucun résultat trouvé
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-1" role="navigation" aria-label="Navigation principale">
            {navigationItems.map((item) => (
              <div key={item.path} className="relative" ref={dropdownRef}>
                {item.children ? (
                  <Button
                    variant="ghost"
                    className={cn(
                      "medical-nav-item flex items-center space-x-2 px-3 py-2 h-10",
                      (isActive(item.path) || hasActiveChild(item)) && "active"
                    )}
                    onClick={() => toggleDropdown(item.path)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleDropdown(item.path);
                      }
                    }}
                    aria-expanded={activeDropdown === item.path}
                    aria-haspopup="menu"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.premium && <Crown className="h-3 w-3 text-accent" />}
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
                    )}
                    <ChevronDown className={cn(
                      "h-3 w-3 transition-transform",
                      activeDropdown === item.path && "rotate-180"
                    )} />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className={cn(
                      "medical-nav-item flex items-center space-x-2 px-3 py-2 h-10",
                      isActive(item.path) && "active"
                    )}
                    onClick={() => handleNavigation(item.path, item.label)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.premium && <Crown className="h-3 w-3 text-accent" />}
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
                    )}
                  </Button>
                )}

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === item.path && item.children && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-lg shadow-lg z-50"
                      role="menu"
                    >
                      <div className="p-2">
                        <div className="px-3 py-2 text-sm font-medium text-foreground border-b border-border mb-2">
                          {item.label}
                        </div>
                        {item.children.map((child) => (
                          <button
                            key={child.path}
                            onClick={() => handleNavigation(child.path, child.label)}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted/50 flex items-center gap-3 transition-colors",
                              isActive(child.path) && "bg-muted text-foreground font-medium"
                            )}
                            role="menuitem"
                          >
                            <child.icon className="h-4 w-4 text-muted-foreground" />
                            <span>{child.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Actions Utilisateur */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex relative medical-focus-ring"
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
            </Button>

            {/* Accessibilité */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex medical-focus-ring"
              onClick={() => updatePreference('highContrast', !preferences.highContrast)}
              aria-label="Basculer le contraste élevé"
              title="Accessibility (Alt+A)"
            >
              <Palette className="h-4 w-4" />
            </Button>

            {/* Aide */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex medical-focus-ring"
              onClick={() => navigate('/help')}
              aria-label="Centre d'aide"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            {/* Profil */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex medical-focus-ring"
              onClick={() => navigate('/med-mng/profile')}
              aria-label="Mon profil utilisateur"
            >
              <User className="h-4 w-4" />
            </Button>

            {/* Menu Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden medical-focus-ring"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu Mobile */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t py-4 space-y-2"
              role="navigation"
              aria-label="Navigation mobile"
            >
              {/* Recherche Mobile */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="medical-input pl-10 pr-4 py-2 w-full"
                    aria-label="Recherche mobile"
                  />
                </div>
              </div>

              {navigationItems.map((item) => (
                <div key={item.path}>
                  <button
                    onClick={() => 
                      item.children 
                        ? setActiveDropdown(activeDropdown === item.path ? null : item.path)
                        : handleNavigation(item.path, item.label)
                    }
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-3 rounded-md text-left transition-colors",
                      (isActive(item.path) || hasActiveChild(item)) 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        )}
                      </div>
                      {item.premium && <Crown className="h-4 w-4 text-accent ml-2" />}
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
                      )}
                      {item.children && (
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform",
                          activeDropdown === item.path && "rotate-180"
                        )} />
                      )}
                    </div>
                  </button>

                  {/* Sous-menu Mobile */}
                  <AnimatePresence>
                    {activeDropdown === item.path && item.children && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-6 mt-2 space-y-2"
                      >
                        {item.children.map((child) => (
                          <button
                            key={child.path}
                            onClick={() => handleNavigation(child.path, child.label)}
                            className={cn(
                              "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors",
                              isActive(child.path) 
                                ? "bg-primary/10 text-primary" 
                                : "hover:bg-muted/50"
                            )}
                          >
                            <child.icon className="h-4 w-4" />
                            <span>{child.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Actions Mobiles */}
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleNavigation('/notifications', 'Notifications')}
                    className="justify-start"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleNavigation('/help', 'Aide')}
                    className="justify-start"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Aide
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};