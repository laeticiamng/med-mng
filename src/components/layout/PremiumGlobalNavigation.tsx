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
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 group relative",
              isActive 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
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
        className="hidden md:flex items-center gap-2 w-64 justify-start text-muted-foreground"
      >
        <Search className="w-4 h-4" />
        <span>Rechercher...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
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
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/med-mng/login">Connexion</Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/med-mng/signup">S'inscrire</Link>
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
        <Button variant="outline" className="flex items-center gap-2 px-3 py-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
            {userInitials}
          </div>
          <span className="hidden sm:block font-medium">{userName}</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-200",
          isScrolled 
            ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm" 
            : "bg-background/50"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="medical-container">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Stethoscope className="w-6 h-6 text-white" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  MED-MNG
                </h1>
                <p className="text-xs text-muted-foreground -mt-1">Excellence Médicale</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <DesktopNavigation />

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <GlobalSearch />

              {/* Notifications */}
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              <UserMenu />

              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isScrolled && (
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.header>

      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={isMobileOpen} 
        onClose={() => setIsMobileOpen(false)} 
      />
    </>
  );
};

export default memo(PremiumGlobalNavigation);