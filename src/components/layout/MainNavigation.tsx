import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Settings, Bell, User, LogOut, Menu, X, Sparkles, Shield, Music, Flame, Trophy, Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MAIN_NAV_ITEMS, type NavItem } from '@/config/navigation';
import { ROUTE_PATHS } from '@/config/routes';
import { useGamification, XP_PER_LEVEL } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar';

export const MainNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { stats: gamificationStats, loadStats } = useGamification();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    if (user?.id) {
      loadStats(user.id);
    }
  }, [user?.id, loadStats]);

  const handleNavClick = (path: string, label: string) => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { component: 'main_navigation', action: 'click', destination: label }
    });
    navigate(path);
  };

  const level = gamificationStats ? Math.floor((gamificationStats.currentXP || 0) / XP_PER_LEVEL) + 1 : 1;

  const mainNavItems = MAIN_NAV_ITEMS;

  const isActive = (path: string) => {
    if (path === ROUTE_PATHS.home) return location.pathname === ROUTE_PATHS.home;
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(ROUTE_PATHS.home);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border/50 shadow-sm dark:bg-card/80 safe-area-top">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to={ROUTE_PATHS.home} className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary via-accent to-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              MED MNG
            </span>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <item.icon className="w-4 h-4 mr-1.5 xl:mr-2" />
                <span className="hidden xl:inline">{item.label}</span>
                <span className="xl:hidden">{item.shortLabel || item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-1.5 xl:ml-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Global Search - hidden on very small screens */}
            <div className="hidden sm:block">
              <GlobalSearchBar />
            </div>
            
            {/* Gamification stats for logged in users */}
            {user && gamificationStats && (
              <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
                <Badge variant="outline" className="gap-1 py-0.5 sm:py-1 text-xs">
                  <Flame className="h-3 w-3 text-warning" />
                  {gamificationStats.currentStreak || 0}
                </Badge>
                <Badge variant="outline" className="gap-1 py-0.5 sm:py-1 text-xs">
                  <Trophy className="h-3 w-3 text-primary" />
                  Niv.{level}
                </Badge>
              </div>
            )}
            
            {/* Toggle thème */}
            <ThemeToggle />
            
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative h-8 w-8 sm:h-9 sm:w-9 p-0"
              aria-label="Notifications (3 non lues)"
            >
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs p-0">
                3
              </Badge>
            </Button>

            {/* Profil utilisateur */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1.5 sm:space-x-2 h-8 sm:h-9 px-2 sm:px-3">
                    <User className="w-4 h-4" />
                    <span className="hidden md:block text-xs sm:text-sm truncate max-w-[80px] lg:max-w-[120px]">{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.medMngProfile)}>
                    <User className="w-4 h-4 mr-2" />
                    Mon Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.medMngLibrary)}>
                    <Music className="w-4 h-4 mr-2" />
                    Ma Bibliothèque
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.platformSettings)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.rlsDocumentation)}>
                    <Shield className="w-4 h-4 mr-2" />
                    Documentation RLS
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.securityMonitoring)}>
                    <Shield className="w-4 h-4 mr-2" />
                    Monitoring Sécurité
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-1.5 sm:space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.medMngLogin)} className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                  Connexion
                </Button>
                <Button size="sm" onClick={() => navigate(ROUTE_PATHS.medMngSignup)} className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                  S'inscrire
                </Button>
              </div>
            )}

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 sm:py-4 border-t border-border/50 safe-area-bottom">
            <div className="flex flex-col space-y-1.5 sm:space-y-2">
              {/* Mobile search */}
              <div className="px-2 pb-2 sm:hidden">
                <GlobalSearchBar />
              </div>
              
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
              
              {/* Boutons de connexion pour mobile */}
              {!user && (
                <div className="flex flex-col space-y-1.5 sm:space-y-2 pt-3 sm:pt-4 border-t border-border/50">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      navigate(ROUTE_PATHS.medMngLogin);
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start h-10 sm:h-9"
                  >
                    Connexion
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      navigate(ROUTE_PATHS.medMngSignup);
                      setIsMobileMenuOpen(false);
                    }}
                    className="h-10 sm:h-9"
                  >
                    S'inscrire
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};