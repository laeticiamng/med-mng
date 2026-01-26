import { useAuth } from '@/components/med-mng/AuthProvider';
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ADMIN_NAV_ITEMS, MAIN_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '@/config/navigation';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification, XP_PER_LEVEL } from '@/hooks/useGamification';
import {
    BarChart3,
    Bell,
    ChevronDown,
    Flame,
    LogOut, Menu,
    MoreHorizontal,
    Music,
    Settings,
    Shield,
    Sparkles,
    Trophy,
    User,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const MainNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { stats: gamificationStats, loadStats } = useGamification();
  useActivityTracking();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadStats(user.id);
      // Check admin status (simplified check)
      setIsAdmin(user.email?.includes('admin') || false);
    }
  }, [user?.id, loadStats, user?.email]);
  const level = gamificationStats ? Math.floor((gamificationStats.currentXP || 0) / XP_PER_LEVEL) + 1 : 1;

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
            {MAIN_NAV_ITEMS.map((item) => (
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
              </Link>
            ))}
            
            {/* Menu "Plus" pour pages secondaires */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-4 h-4 mr-1" />
                  Plus
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Outils d'apprentissage</DropdownMenuLabel>
                {SECONDARY_NAV_ITEMS.map((item) => (
                  <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
                
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Administration</DropdownMenuLabel>
                    {ADMIN_NAV_ITEMS.slice(0, 3).map((item) => (
                      <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
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
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.medMngProfile)}>
                    <User className="w-4 h-4 mr-2" />
                    Mon Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.medMngLibrary)}>
                    <Music className="w-4 h-4 mr-2" />
                    Ma Bibliothèque
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.medMngFavorites)}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Mes Favoris
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.progressDashboard)}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ma Progression
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.achievements)}>
                    <Trophy className="w-4 h-4 mr-2" />
                    Mes Succès
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.settings)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Administration</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.adminPanel)}>
                        <Shield className="w-4 h-4 mr-2" />
                        Panneau Admin
                      </DropdownMenuItem>
                    </>
                  )}
                  
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
          <div className="lg:hidden py-3 sm:py-4 border-t border-border/50 safe-area-bottom max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col space-y-1.5 sm:space-y-2">
              {/* Mobile search */}
              <div className="px-2 pb-2 sm:hidden">
                <GlobalSearchBar />
              </div>
              
              {/* Navigation principale */}
              <div className="px-2 pb-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Navigation</p>
              </div>
              {MAIN_NAV_ITEMS.map((item) => (
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
                </Link>
              ))}
              
              {/* Outils secondaires */}
              <div className="px-2 pt-3 pb-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">Outils</p>
              </div>
              {SECONDARY_NAV_ITEMS.map((item) => (
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