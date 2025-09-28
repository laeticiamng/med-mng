// ==========================================
// MED-MNG PREMIUM GLOBAL NAVIGATION - Navigation premium unifiée
// ==========================================

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  Music, 
  Users, 
  Settings, 
  User, 
  ChevronDown,
  Sparkles,
  Stethoscope,
  GraduationCap,
  Bell,
  Search,
  Headphones,
  Zap,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

// Navigation items configuration
const navigationItems = [
  {
    id: 'home',
    label: 'Accueil',
    href: '/',
    icon: Home,
    description: 'Retour à l\'accueil'
  },
  {
    id: 'platform',
    label: 'Plateforme',
    href: '/platform',
    icon: Stethoscope,
    description: 'Découvrir la plateforme'
  },
  {
    id: 'edn',
    label: 'EDN',
    href: '/edn',
    icon: BookOpen,
    badge: 'Premium',
    description: 'Items et contenus EDN'
  },
  {
    id: 'med-mng',
    label: 'MED-MNG',
    href: '/med-mng/dashboard',
    icon: Music,
    badge: 'IA',
    description: 'Plateforme IA musicale'
  },
  {
    id: 'community',
    label: 'Communauté',
    href: '/community',
    icon: Users,
    description: 'Rejoindre la communauté'
  }
];

// User menu items
const userMenuItems = [
  { label: 'Mon Profil', href: '/profile', icon: User },
  { label: 'Mes Playlists', href: '/med-mng/playlists', icon: Headphones },
  { label: 'Paramètres', href: '/settings', icon: Settings },
  { label: 'Notifications', href: '/notifications', icon: Bell }
];

// Premium Status Component
const PremiumStatus = memo(() => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full"
    >
      <Sparkles className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium text-primary">Premium</span>
    </motion.div>
  );
});

// Mobile Navigation Component
const MobileNavigation = memo(({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleNavigation = (href: string) => {
    navigate(href);
    onClose();
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      onClose();
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          
          {/* Mobile Menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-80 bg-card border-r border-border z-50 lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">MED-MNG</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Items */}
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href || 
                                (item.href !== '/' && location.pathname.startsWith(item.href));
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto bg-accent/20 text-accent text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {/* User Section */}
            {user ? (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-muted/20">
                <div className="flex items-center gap-3 mb-3 px-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                    {user.email?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user.user_metadata?.name || user.email?.split('@')[0]}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {userMenuItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left hover:bg-muted transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left hover:bg-muted transition-colors text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">{isSigningOut ? 'Déconnexion...' : 'Se déconnecter'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => handleNavigation('/med-mng/login')}
                  >
                    Se connecter
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleNavigation('/med-mng/signup')}
                  >
                    S'inscrire
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// Desktop Navigation Component
const DesktopNavigation = memo(() => {
  const location = useLocation();
  
  return (
    <nav className="hidden lg:flex items-center gap-1">
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.href || 
                        (item.href !== '/' && location.pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.id}
            to={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 xl:px-4 xl:py-2 rounded-lg transition-all duration-200 group relative",
              "text-sm lg:text-base min-h-[44px] min-w-[44px]", // Perfect touch targets
              "hover:scale-105 active:scale-95 transform-gpu", // Smooth scaling
              isActive 
                ? "bg-primary/10 text-primary font-medium shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-sm sm:text-base font-medium">{item.label}</span>
            {item.badge && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs transition-colors",
                  item.badge === 'IA' ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                )}
              >
                {item.badge}
              </Badge>
            )}
            
            {/* Active Indicator */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
});

// Search Component
const GlobalSearch = memo(() => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="hidden lg:flex items-center gap-2 w-48 xl:w-64 justify-start text-muted-foreground min-h-[40px]"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="text-sm">Rechercher...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="lg:hidden min-h-[40px] min-w-[40px]"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
      >
        <Search className="w-4 h-4" />
      </Button>
    </div>
  );
});

// User Menu Component
const UserMenu = memo(() => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setIsSigningOut(false);
    }
  };

  // Si pas d'utilisateur connecté, afficher les boutons de connexion
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="sm" asChild className="min-h-[40px] px-2 sm:px-3">
          <Link to="/med-mng/login" className="text-sm">Connexion</Link>
        </Button>
        <Button size="sm" asChild className="min-h-[40px] px-3 sm:px-4">
          <Link to="/med-mng/signup" className="text-sm">S'inscrire</Link>
        </Button>
      </div>
    );
  }

  const userInitials = user.user_metadata?.name 
    ? user.user_metadata.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() || 'U';
  
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 px-2 sm:px-3 py-2 min-h-[40px]">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0">
            {userInitials}
          </div>
          <span className="hidden md:block font-medium text-sm truncate max-w-24 lg:max-w-32">{userName}</span>
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
            {userInitials}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <PremiumStatus />
        </div>
        <DropdownMenuSeparator />
        {userMenuItems.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link to={item.href} className="flex items-center gap-2">
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-destructive cursor-pointer"
          disabled={isSigningOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isSigningOut ? 'Déconnexion...' : 'Déconnexion'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

// Main Navigation Component
const PremiumGlobalNavigation: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Amélioration du scroll avec debounce pour performance
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermeture mobile avec ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Empêche le scroll
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Fermeture automatique sur changement de route
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled 
            ? "bg-background/90 dark:bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-primary/5" 
            : "bg-background/60 dark:bg-background/70 backdrop-blur-md"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex h-16 sm:h-18 lg:h-20 items-center justify-between gap-4">
            {/* Logo - Ergonomie améliorée */}
            <Link 
              to="/" 
              className="flex items-center gap-3 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded-xl p-1 -m-1"
            >
              <motion.div 
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 8 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white drop-shadow-sm" />
              </motion.div>
              <div className="hidden sm:block">
                <motion.h1 
                  className="font-bold text-xl sm:text-2xl lg:text-3xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-none"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}  
                  transition={{ delay: 0.2 }}
                >
                  MED-MNG
                </motion.h1>
                <motion.p 
                  className="text-xs sm:text-sm text-muted-foreground font-medium tracking-wide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Excellence Médicale
                </motion.p>
              </div>
            </Link>

            {/* Desktop Navigation - Ergonomie optimisée */}
            <DesktopNavigation />

            {/* Right Section - Espacement et interactions améliorés */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
              {/* Search - UX améliorée */}
              <GlobalSearch />

              {/* Notifications - Feedback visuel amélioré */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="relative min-h-[44px] min-w-[44px] hidden sm:flex border-border/50 hover:border-primary/30 hover:bg-accent/50 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  <Bell className="w-5 h-5" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.6 }}
                  >
                    <span className="text-destructive-foreground text-xs font-bold">3</span>
                  </motion.div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive/20 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </Button>
              </motion.div>

              {/* User Menu */}
              <UserMenu />

              {/* Mobile Menu Button - UX grandement améliorée */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden min-h-[44px] min-w-[44px] border-border/50 hover:border-primary/30 hover:bg-accent/50 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/20 relative overflow-hidden"
                  onClick={() => setIsMobileOpen(!isMobileOpen)}
                  aria-expanded={isMobileOpen}
                  aria-controls="mobile-navigation"
                  aria-label={isMobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                >
                  <div className="relative w-6 h-6">
                    <motion.div
                      className="absolute inset-0"
                      initial={false}
                      animate={{ opacity: isMobileOpen ? 0 : 1, rotate: isMobileOpen ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0"
                      initial={false}
                      animate={{ opacity: isMobileOpen ? 1 : 0, rotate: isMobileOpen ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  </div>
                  
                  {/* Ripple effect sur clic */}
                  <motion.div
                    className="absolute inset-0 bg-primary/20 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isMobileOpen ? { scale: 1.5, opacity: [0, 1, 0] } : {}}
                    transition={{ duration: 0.4 }}
                  />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Progress Bar ergonomique - Feedback visuel de scroll */}
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary shadow-lg"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.3 }}
              style={{ transformOrigin: 'left' }}
            />
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Navigation - UX révolutionnaire */}
      <MobileNavigation 
        isOpen={isMobileOpen} 
        onClose={() => setIsMobileOpen(false)} 
      />
      
      {/* Quick Access Fab - Innovation ergonomique pour mobile */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            className="fixed bottom-6 right-6 z-40 lg:hidden"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <Button
              size="icon"
              className="w-14 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-background/50"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Retour en haut"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="w-6 h-6" />
              </motion.div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(PremiumGlobalNavigation);