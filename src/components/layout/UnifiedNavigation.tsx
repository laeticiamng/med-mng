/**
 * Navigation unifiée - Interface unique pour toute l'app
 * Accessible, responsive, intelligente selon le contexte
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Home, User, Settings, HelpCircle, 
  Search, Bell, LogOut, ChevronDown, Stethoscope,
  BookOpen, BarChart3, Users, Shield, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/unified/useAuth';
import { useAccessibilityAnnouncement } from '@/hooks/useAccessibilityAnnouncement';

interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  badge?: string;
  children?: NavigationItem[];
  requireAuth?: boolean;
  medMngOnly?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    title: 'Accueil',
    href: '/',
    icon: Home,
    description: 'Retour à la page d\'accueil',
  },
  {
    id: 'platform',
    title: 'Plateforme',
    href: '/platform',
    icon: Lightbulb,
    description: 'Découvrir les fonctionnalités',
    children: [
      {
        id: 'generator',
        title: 'Générateur',
        href: '/generator',
        icon: Lightbulb,
        description: 'Outils de génération de contenu',
      },
      {
        id: 'meditation',
        title: 'Méditation',
        href: '/meditation',
        icon: Users,
        description: 'Centre de méditation et relaxation',
      },
    ],
  },
  {
    id: 'learning',
    title: 'Apprentissage',
    href: '/edn',
    icon: BookOpen,
    description: 'Modules éducatifs et simulations',
    children: [
      {
        id: 'edn',
        title: 'EDN - Modules',
        href: '/edn',
        icon: BookOpen,
        description: 'Modules d\'apprentissage interactifs',
      },
      {
        id: 'ecos',
        title: 'ECOS - Simulations',
        href: '/ecos',
        icon: Stethoscope,
        description: 'Simulations cliniques interactives',
      },
    ],
  },
  {
    id: 'medmng',
    title: 'MED-MNG',
    href: '/med-mng/dashboard',
    icon: Stethoscope,
    description: 'Plateforme médicale complète',
    requireAuth: true,
    medMngOnly: true,
    badge: 'Pro',
    children: [
      {
        id: 'dashboard',
        title: 'Tableau de bord',
        href: '/med-mng/dashboard',
        icon: BarChart3,
        requireAuth: true,
      },
      {
        id: 'create',
        title: 'Créer',
        href: '/med-mng/create',
        icon: Lightbulb,
        requireAuth: true,
      },
      {
        id: 'library',
        title: 'Bibliothèque',
        href: '/med-mng/library',
        icon: BookOpen,
        requireAuth: true,
      },
    ],
  },
  {
    id: 'community',
    title: 'Communauté',
    href: '/community',
    icon: Users,
    description: 'Rejoindre la communauté',
  },
];

const userMenuItems = [
  { id: 'profile', title: 'Mon profil', href: '/profile', icon: User },
  { id: 'settings', title: 'Paramètres', href: '/settings', icon: Settings },
  { id: 'notifications', title: 'Notifications', href: '/notifications', icon: Bell },
  { id: 'help', title: 'Aide', href: '/help', icon: HelpCircle },
];

export const UnifiedNavigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const { announceNavigation } = useAccessibilityAnnouncement();
  const location = useLocation();
  const navigate = useNavigate();

  const isMedMngRoute = location.pathname.startsWith('/med-mng');

  const filteredNavItems = navigationItems.filter(item => {
    if (item.requireAuth && !isAuthenticated) return false;
    if (item.medMngOnly && !isMedMngRoute && !isAuthenticated) return false;
    return true;
  });

  const handleNavigation = (href: string, title: string) => {
    announceNavigation(title);
    setIsMobileMenuOpen(false);
    navigate(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      announceNavigation('Résultats de recherche');
    }
  };

  const handleLogout = async () => {
    await logout();
    announceNavigation('Déconnexion');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo et nom */}
          <Link 
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary rounded-md px-2 py-1"
            onClick={() => announceNavigation('Accueil MED-MNG')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Stethoscope size={20} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              MED-MNG
            </span>
            {isMedMngRoute && (
              <Badge variant="secondary" className="hidden md:flex">
                Pro
              </Badge>
            )}
          </Link>

          {/* Navigation desktop */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {filteredNavItems.map((item) => (
                <NavigationMenuItem key={item.id}>
                  {item.children ? (
                    <>
                      <NavigationMenuTrigger className="gap-1">
                        <item.icon size={16} />
                        {item.title}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[400px] gap-3 p-4">
                          {item.children.map((child) => (
                            <NavigationMenuLink
                              key={child.id}
                              href={child.href}
                              onClick={() => handleNavigation(child.href, child.title)}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center gap-2">
                                <child.icon size={16} />
                                <span className="text-sm font-medium leading-none">
                                  {child.title}
                                </span>
                              </div>
                              {child.description && (
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                  {child.description}
                                </p>
                              )}
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink
                      href={item.href}
                      onClick={() => handleNavigation(item.href, item.title)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-foreground/80 focus:text-foreground/80 ${
                        location.pathname === item.href 
                          ? 'text-foreground border-b-2 border-primary' 
                          : 'text-foreground/60'
                      }`}
                    >
                      <item.icon size={16} />
                      {item.title}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Recherche */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex items-center gap-2 max-w-sm"
          >
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 w-48"
                aria-label="Rechercher dans MED-MNG"
              />
            </div>
          </form>

          {/* Actions utilisateur */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                {/* Notifications */}
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/notifications" aria-label="Notifications">
                    <Bell size={20} />
                  </Link>
                </Button>

                {/* Menu utilisateur */}
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="gap-2">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden lg:block">
                          {user?.user_metadata?.first_name || 'Utilisateur'}
                        </span>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-64 p-2">
                          {userMenuItems.map((item) => (
                            <NavigationMenuLink
                              key={item.id}
                              href={item.href}
                              onClick={() => handleNavigation(item.href, item.title)}
                              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                            >
                              <item.icon size={16} />
                              {item.title}
                            </NavigationMenuLink>
                          ))}
                          <hr className="my-2" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors w-full text-left text-destructive hover:text-destructive"
                          >
                            <LogOut size={16} />
                            Se déconnecter
                          </button>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/med-mng/login">Connexion</Link>
                </Button>
                <Button asChild>
                  <Link to="/med-mng/signup">S'inscrire</Link>
                </Button>
              </div>
            )}

            {/* Menu mobile */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden"
                  aria-label="Ouvrir le menu de navigation"
                >
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Stethoscope size={20} />
                    Navigation MED-MNG
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* Recherche mobile */}
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4"
                      />
                    </div>
                  </form>

                  {/* Navigation mobile */}
                  <nav className="space-y-2">
                    {filteredNavItems.map((item) => (
                      <div key={item.id}>
                        <Link
                          to={item.href}
                          onClick={() => handleNavigation(item.href, item.title)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            location.pathname === item.href
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <item.icon size={16} />
                          {item.title}
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                        {item.children && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.id}
                                to={child.href}
                                onClick={() => handleNavigation(child.href, child.title)}
                                className="flex items-center gap-3 px-3 py-1 rounded-md text-xs hover:bg-accent transition-colors"
                              >
                                <child.icon size={14} />
                                {child.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>

                  {/* Actions utilisateur mobile */}
                  {isAuthenticated ? (
                    <div className="border-t pt-4 space-y-2">
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Connecté en tant que {user?.email}
                      </div>
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.id}
                          to={item.href}
                          onClick={() => handleNavigation(item.href, item.title)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                        >
                          <item.icon size={16} />
                          {item.title}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors w-full text-left text-destructive"
                      >
                        <LogOut size={16} />
                        Se déconnecter
                      </button>
                    </div>
                  ) : (
                    <div className="border-t pt-4 space-y-2">
                      <Link
                        to="/med-mng/login"
                        onClick={() => handleNavigation('/med-mng/login', 'Connexion')}
                        className="block w-full"
                      >
                        <Button variant="ghost" className="w-full">
                          Connexion
                        </Button>
                      </Link>
                      <Link
                        to="/med-mng/signup"
                        onClick={() => handleNavigation('/med-mng/signup', 'Inscription')}
                        className="block w-full"
                      >
                        <Button className="w-full">
                          S'inscrire
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};