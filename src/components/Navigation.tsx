import React, { useState, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useOptimizedAccessibility } from '@/hooks/useOptimizedAccessibility';
import { 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  HelpCircle,
  Music,
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation: React.FC = memo(() => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { announceToScreenReader } = useOptimizedAccessibility();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      href: '/',
      label: 'Accueil',
      icon: Home,
      description: 'Tableau de bord principal'
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Vue d\'ensemble des analytics'
    },
    {
      href: '/generator',
      label: 'Générateur',
      icon: Music,
      description: 'Créer du contenu musical'
    },
    {
      href: '/edn',
      label: 'EDN',
      icon: BookOpen,
      description: 'Explorer les items EDN'
    },
    {
      href: '/community',
      label: 'Communauté',
      icon: Users,
      description: 'Discussions et partages'
    }
  ];

  const isActiveRoute = (href: string): boolean => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      announceToScreenReader('Vous avez été déconnecté avec succès', 'polite');
    } catch (error) {
      announceToScreenReader('Erreur lors de la déconnexion', 'assertive');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    announceToScreenReader(
      isMobileMenuOpen ? 'Menu fermé' : 'Menu ouvert', 
      'polite'
    );
  };

  return (
    <nav 
      className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
            onClick={() => announceToScreenReader('Navigation vers l\'accueil', 'polite')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MED-MNG
            </span>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.href);
                  
                  return (
                    <NavigationMenuItem key={item.href}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                            isActive && "bg-accent/50 text-accent-foreground"
                          )}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Menu utilisateur desktop */}
                <div className="hidden md:flex items-center space-x-3">
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback>
                              {user.email?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {user.user_metadata?.name || user.email}
                          </span>
                          <ChevronDown className="w-4 h-4" />
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="w-56 p-2">
                            <Link
                              to="/profile"
                              className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent text-sm"
                            >
                              <User className="w-4 h-4" />
                              <span>Mon profil</span>
                            </Link>
                            <Link
                              to="/settings"
                              className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent text-sm"
                            >
                              <Settings className="w-4 h-4" />
                              <span>Paramètres</span>
                            </Link>
                            <Link
                              to="/help"
                              className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent text-sm"
                            >
                              <HelpCircle className="w-4 h-4" />
                              <span>Aide</span>
                            </Link>
                            <hr className="my-2" />
                            <button
                              onClick={handleSignOut}
                              className="flex items-center space-x-2 p-2 rounded-md hover:bg-destructive/10 hover:text-destructive text-sm w-full text-left"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Se déconnecter</span>
                            </button>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </div>

                {/* Menu mobile toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={toggleMobileMenu}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth/signin">Connexion</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth/signup">Inscription</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && user && (
          <div 
            className="md:hidden border-t bg-background/95 backdrop-blur"
            id="mobile-menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Navigation items */}
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <hr className="my-3" />

              {/* User actions */}
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>Mon profil</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Paramètres</span>
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

Navigation.displayName = 'Navigation';

export { Navigation };