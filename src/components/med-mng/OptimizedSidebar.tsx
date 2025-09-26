import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Plus,
  Heart,
  Clock,
  Star,
  BookOpen,
  Target,
  Trophy,
  Zap,
  ChevronRight,
  User,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useFavorites } from '@/hooks/useFavorites';
import { logger } from '@/utils/logger';

interface SidebarNavigationItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string;
  isNew?: boolean;
  children?: SidebarNavigationItem[];
}

const navigationItems: SidebarNavigationItem[] = [
  {
    title: 'Dashboard',
    url: '/med-mng/dashboard',
    icon: Home,
  },
  {
    title: 'Créer',
    url: '/med-mng/create',
    icon: Plus,
    badge: 'IA',
    isNew: true,
  },
  {
    title: 'Bibliothèque',
    url: '/med-mng/library',
    icon: Library,
    children: [
      {
        title: 'Mes créations',
        url: '/med-mng/library?filter=my-creations',
        icon: BookOpen,
      },
      {
        title: 'Favoris',
        url: '/med-mng/library?filter=favorites',
        icon: Heart,
      },
      {
        title: 'Récents',
        url: '/med-mng/library?filter=recent',
        icon: Clock,
      },
    ],
  },
  {
    title: 'Playlists',
    url: '/med-mng/playlists',
    icon: Music,
  },
  {
    title: 'Analyses',
    url: '/med-mng/analytics',
    icon: BarChart3,
  },
  {
    title: 'Communauté',
    url: '/med-mng/community',
    icon: Users,
    badge: '12',
  },
];

const quickActions = [
  {
    title: 'Générateur IA',
    url: '/med-mng/create',
    icon: Zap,
    color: 'bg-primary text-primary-foreground',
  },
  {
    title: 'Quiz EDN',
    url: '/med-mng/quiz',
    icon: Target,
    color: 'bg-blue-500 text-white',
  },
  {
    title: 'Objectifs',
    url: '/med-mng/goals',
    icon: Trophy,
    color: 'bg-amber-500 text-white',
  },
];

export function OptimizedSidebar() {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path);
  const collapsed = state === 'collapsed';

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
    logger.userAction('Sidebar group toggle', user?.id, { group: title });
  };

  const handleNavigation = (url: string, title: string) => {
    logger.userAction('Sidebar navigation', user?.id, { destination: url, title });
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-72"} collapsible="icon">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                MED-MNG
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                Plateforme d'apprentissage
              </p>
            </div>
          )}
        </div>
        
        {/* User Info */}
        {!collapsed && user && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user.user_metadata?.avatar_url} 
                  alt={user.email || 'User'} 
                />
                <AvatarFallback className="text-xs">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.full_name || 'Utilisateur'}
                </p>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Overview */}
        {!collapsed && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression hebdomadaire</span>
              <span className="font-medium">7/10</span>
            </div>
            <Progress value={70} className="h-2" />
            <p className="text-xs text-muted-foreground">
              3 sessions restantes pour atteindre votre objectif
            </p>
          </div>
        )}
      </div>

      <SidebarContent className="px-2">
        {/* Quick Actions */}
        {!collapsed && (
          <div className="p-2">
            <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Actions rapides
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((action) => (
                <Tooltip key={action.url}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-16 flex-col gap-1 ${action.color}`}
                      asChild
                    >
                      <NavLink 
                        to={action.url}
                        onClick={() => handleNavigation(action.url, action.title)}
                      >
                        <action.icon className="w-4 h-4" />
                        <span className="text-xs">{action.title}</span>
                      </NavLink>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {action.title}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <div>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.url)}
                      className="group"
                    >
                      <NavLink 
                        to={item.url}
                        onClick={() => handleNavigation(item.url, item.title)}
                        className={({ isActive }) => `
                          flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors
                          ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                        `}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                {item.badge}
                              </Badge>
                            )}
                            {item.isNew && (
                              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                Nouveau
                              </Badge>
                            )}
                            {item.children && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleGroup(item.title);
                                }}
                              >
                                <motion.div
                                  animate={{ rotate: expandedGroups[item.title] ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </motion.div>
                              </Button>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>

                    {/* Submenu */}
                    {item.children && !collapsed && (
                      <AnimatePresence>
                        {expandedGroups[item.title] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-6 mt-1 space-y-1"
                          >
                            {item.children.map((child) => (
                              <SidebarMenuButton key={child.url} asChild size="sm">
                                <NavLink 
                                  to={child.url}
                                  onClick={() => handleNavigation(child.url, child.title)}
                                  className={({ isActive }) => `
                                    flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-sm transition-colors
                                    ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
                                  `}
                                >
                                  <child.icon className="w-3 h-3" />
                                  {child.title}
                                </NavLink>
                              </SidebarMenuButton>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Favorites */}
        {!collapsed && !favoritesLoading && favorites.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Favoris récents</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {favorites.slice(0, 5).map((favorite) => (
                  <SidebarMenuItem key={favorite.id}>
                    <SidebarMenuButton asChild size="sm">
                      <NavLink 
                        to={`/med-mng/player/${favorite.song_id}`}
                        onClick={() => handleNavigation(`/med-mng/player/${favorite.song_id}`, favorite.title)}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded flex items-center justify-center shrink-0">
                          <Music className="w-3 h-3" />
                        </div>
                        <span className="truncate flex-1">{favorite.title}</span>
                        <Heart className="w-3 h-3 text-red-500 shrink-0" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                {favorites.length > 5 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild size="sm">
                      <NavLink 
                        to="/med-mng/library?filter=favorites"
                        className="text-xs text-muted-foreground hover:text-foreground text-center"
                      >
                        Voir tous les favoris ({favorites.length})
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings */}
        <div className="mt-auto p-2">
          <SidebarMenuButton asChild>
            <NavLink 
              to="/med-mng/settings"
              onClick={() => handleNavigation('/med-mng/settings', 'Paramètres')}
              className={({ isActive }) => `
                flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors
                ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
              `}
            >
              <Settings className="w-4 h-4" />
              {!collapsed && <span>Paramètres</span>}
            </NavLink>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}