import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Home,
  Library,
  Music,
  BarChart3,
  Settings,
  Users,
  Heart,
  Bell,
  Search,
  Plus,
  User,
  LogOut,
  Moon,
  Sun,
  Keyboard,
  HelpCircle,
  Zap,
  Crown,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNotifications } from './NotificationProvider';
import { useTheme } from 'next-themes';
import { logger } from '@/utils/logger';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  shortcut?: string;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/med-mng/dashboard',
    icon: Home,
    shortcut: '⌘1',
    description: 'Vue d\'ensemble de vos activités',
  },
  {
    label: 'Créer',
    href: '/med-mng/create',
    icon: Plus,
    shortcut: '⌘N',
    description: 'Générer du nouveau contenu médical',
  },
  {
    label: 'Bibliothèque',
    href: '/med-mng/library',
    icon: Library,
    shortcut: '⌘L',
    description: 'Accéder à votre collection',
  },
  {
    label: 'Playlists',
    href: '/med-mng/playlists',
    icon: Music,
    shortcut: '⌘P',
    description: 'Gérer vos playlists d\'étude',
  },
  {
    label: 'Analyses',
    href: '/med-mng/analytics',
    icon: BarChart3,
    shortcut: '⌘A',
    description: 'Suivre vos progrès d\'apprentissage',
  },
  {
    label: 'Communauté',
    href: '/med-mng/community',
    icon: Users,
    shortcut: '⌘U',
    description: 'Connecter avec d\'autres étudiants',
  },
];

export const EnhancedNavigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, signOut } = useAuth();
  const { state: notificationState } = useNotifications();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        const shortcut = event.key;
        
        const item = navigationItems.find(item => 
          item.shortcut?.includes(shortcut.toUpperCase())
        );
        
        if (item) {
          event.preventDefault();
          navigate(item.href);
          logger.userAction('Navigation via keyboard shortcut', user?.id, { 
            shortcut: item.shortcut,
            destination: item.href 
          });
        }
        
        // Global shortcuts
        switch (shortcut) {
          case '/':
            event.preventDefault();
            setIsSearchOpen(true);
            break;
          case 'k':
            event.preventDefault();
            setIsSearchOpen(true);
            break;
        }
      }
      
      // Escape key
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [navigate, user?.id]);

  const handleSignOut = async () => {
    try {
      logger.userAction('Sign out', user?.id);
      await signOut();
      navigate('/med-mng/login');
    } catch (error) {
      logger.error('Sign out failed', 'Navigation', { error });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    logger.userAction('Theme toggle', user?.id, { newTheme });
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <NavLink 
                to="/med-mng/dashboard" 
                className="flex items-center gap-2 font-bold text-xl"
                onClick={() => logger.userAction('Logo click', user?.id)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="hidden sm:inline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  MED-MNG
                </span>
              </NavLink>
              
              {user && (
                <Badge variant="outline" className="hidden lg:flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Premium
                </Badge>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      size="sm"
                      asChild
                      className="relative"
                    >
                      <NavLink 
                        to={item.href}
                        onClick={() => logger.userAction(`Navigate to ${item.label}`, user?.id)}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                      {item.shortcut && (
                        <div className="text-xs font-mono mt-1">{item.shortcut}</div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(true)}
                    className="hidden sm:flex items-center gap-2 text-muted-foreground"
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden md:inline">Rechercher...</span>
                    <kbd className="hidden md:inline pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      ⌘K
                    </kbd>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Recherche rapide (⌘K)
                </TooltipContent>
              </Tooltip>

              {/* Theme Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={toggleTheme}>
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                </TooltipContent>
              </Tooltip>

              {/* Notifications */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {notificationState.unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                      >
                        {notificationState.unreadCount > 9 ? '9+' : notificationState.unreadCount}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Notifications {notificationState.unreadCount > 0 && `(${notificationState.unreadCount})`}
                </TooltipContent>
              </Tooltip>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user.user_metadata?.avatar_url} 
                          alt={user.email || 'User'} 
                        />
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.full_name || 'Utilisateur'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/med-mng/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/med-mng/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Aide</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <NavLink to="/med-mng/login">Connexion</NavLink>
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t py-4"
              >
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.href}
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className="w-full justify-start"
                      asChild
                    >
                      <NavLink 
                        to={item.href}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          logger.userAction(`Mobile navigate to ${item.label}`, user?.id);
                        }}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-background border rounded-lg shadow-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher dans MED-MNG..."
                    className="flex-1 bg-transparent outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    ESC
                  </kbd>
                </div>
                
                {/* Quick Actions */}
                <div className="space-y-1">
                  {navigationItems
                    .filter(item => 
                      searchQuery === '' || 
                      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item) => (
                      <Button
                        key={item.href}
                        variant="ghost"
                        className="w-full justify-start text-left"
                        onClick={() => {
                          navigate(item.href);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          logger.userAction(`Search navigate to ${item.label}`, user?.id, { query: searchQuery });
                        }}
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        <div>
                          <div className="font-medium">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          )}
                        </div>
                        {item.shortcut && (
                          <kbd className="ml-auto pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            {item.shortcut}
                          </kbd>
                        )}
                      </Button>
                    ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedNavigation;