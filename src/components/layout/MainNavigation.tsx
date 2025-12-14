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
import { MAIN_NAV_ITEMS } from '@/config/navigation';
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
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border/50 shadow-sm dark:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTE_PATHS.home} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-accent to-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              MED MNG
            </span>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
                {item.badge && (
                  <Badge variant="secondary" className="ml-2">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-3">
            {/* Global Search */}
            <GlobalSearchBar />
            
            {/* Gamification stats for logged in users */}
            {user && gamificationStats && (
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="outline" className="gap-1 py-1">
                  <Flame className="h-3 w-3 text-warning" />
                  {gamificationStats.currentStreak || 0}
                </Badge>
                <Badge variant="outline" className="gap-1 py-1">
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
              className="relative"
              aria-label="Notifications (3 non lues)"
            >
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>

            {/* Profil utilisateur */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:block">{user.email?.split('@')[0]}</span>
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
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.medMngLogin)}>
                  Connexion
                </Button>
                <Button size="sm" onClick={() => navigate(ROUTE_PATHS.medMngSignup)}>
                  S'inscrire
                </Button>
              </div>
            )}

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col space-y-2">
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
              
              {/* Boutons de connexion pour mobile */}
              {!user && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-border/50">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      navigate(ROUTE_PATHS.medMngLogin);
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    Connexion
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      navigate(ROUTE_PATHS.medMngSignup);
                      setIsMobileMenuOpen(false);
                    }}
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