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
    DropdownMenuTrigger,
    DropdownMenuGroup,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ADMIN_NAV_ITEMS, MAIN_NAV_ITEMS, SECONDARY_NAV_GROUPS } from '@/config/navigation';
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
    const checkAdminRole = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        return;
      }
      
      try {
        // Import dynamique pour éviter les problèmes de bundling
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Vérification sécurisée via la table user_roles (RLS protégée)
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (error) {
          console.error('Erreur vérification admin:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error('Erreur vérification admin:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdminRole();
    if (user?.id) {
      loadStats(user.id);
    }
  }, [user?.id, loadStats]);
  
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
            
            {/* Menu "Plus" avec sous-catégories */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-4 h-4 mr-1" />
                  Plus
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {SECONDARY_NAV_GROUPS.map((group, index) => (
                  <DropdownMenuGroup key={group.id}>
                    {index > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="font-medium">
                        <group.icon className="w-4 h-4 mr-2" />
                        {group.label}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-52">
                          {group.items.map((item) => (
                            <DropdownMenuItem 
                              key={item.path} 
                              onClick={() => navigate(item.path)}
                              className="flex flex-col items-start"
                            >
                              <div className="flex items-center w-full">
                                <item.icon className="w-4 h-4 mr-2" />
                                <span>{item.label}</span>
                              </div>
                              {item.description && (
                                <span className="text-xs text-muted-foreground ml-6">{item.description}</span>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                ))}
                
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Administration
                    </DropdownMenuLabel>
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
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
            <div className="hidden md:block">
              <GlobalSearchBar />
            </div>
            
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
            
            <ThemeToggle />
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative h-8 w-8 sm:h-9 sm:w-9 p-0"
              aria-label="Notifications"
              onClick={() => {
                const event = new CustomEvent('toggle-notifications');
                window.dispatchEvent(event);
              }}
            >
              <Bell className="w-4 h-4" />
            </Button>

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
                  <DropdownMenuGroup>
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
                  </DropdownMenuGroup>
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
              <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.medMngLogin)} className="text-sm h-9 px-3 whitespace-nowrap">
                  Connexion
                </Button>
                <Button size="sm" onClick={() => navigate(ROUTE_PATHS.medMngSignup)} className="text-sm h-9 px-4 whitespace-nowrap">
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
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile amélioré avec catégories */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 sm:py-4 border-t border-border/50 safe-area-bottom max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col space-y-1">
              {/* Mobile search */}
              <div className="px-2 pb-3 sm:hidden">
                <GlobalSearchBar />
              </div>
              
              {/* Navigation principale */}
              <div className="px-2 pb-2">
                <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">Navigation</p>
              </div>
              {MAIN_NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Link>
              ))}
              
              {/* Catégories secondaires */}
              {SECONDARY_NAV_GROUPS.map((group) => {
                const IconComponent = group.icon;
                return (
                  <div key={group.id} className="pt-3">
                    <div className="px-2 pb-2 border-t border-border/50 pt-3">
                      <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide flex items-center gap-2">
                        <IconComponent className="w-3 h-3" />
                        {group.label.replace(/^[^\s]+\s/, '')}
                      </p>
                    </div>
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive(item.path)
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                          }`}
                        >
                          <div className="flex items-center">
                            <ItemIcon className="w-4 h-4 mr-3" />
                            {item.label}
                          </div>
                          {item.description && (
                            <span className="text-xs text-muted-foreground/70">{item.description}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
              
              {/* Connexion pour mobile */}
              {!user && (
                <div className="flex flex-col space-y-2 pt-4 px-2 border-t border-border/50">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      navigate(ROUTE_PATHS.medMngLogin);
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start h-10"
                  >
                    Connexion
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      navigate(ROUTE_PATHS.medMngSignup);
                      setIsMobileMenuOpen(false);
                    }}
                    className="h-10"
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
