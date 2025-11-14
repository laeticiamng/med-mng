import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import {
  BookOpen,
  Music,
  Users,
  Library,
  Home,
  BarChart3,
  MessageSquare,
  ShoppingBag,
  Star,
  TrendingUp,
  Award,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';
import { Progress } from '@/components/ui/progress';
import { useFavorites } from '@/hooks/useFavorites';
import { useEdnProgress } from '@/hooks/useEdnProgress';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';

export const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { open, setOpen } = useSidebar();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { data: progressData } = useEdnProgress();

  const mainNavItems = [
    { path: ROUTE_PATHS.home, label: 'Accueil', icon: Home },
    { path: ROUTE_PATHS.ednComplete, label: 'Items EDN', icon: BookOpen },
    { path: ROUTE_PATHS.generator, label: 'Générateur', icon: Music },
    { path: ROUTE_PATHS.ecosIndex, label: 'ECOS', icon: Users },
    { path: ROUTE_PATHS.medMngLibrary, label: 'Bibliothèque', icon: Library },
    { path: ROUTE_PATHS.dashboard, label: 'Dashboard', icon: BarChart3 },
    { path: ROUTE_PATHS.chat, label: 'Assistant IA', icon: MessageSquare },
    { path: ROUTE_PATHS.store, label: 'Store', icon: ShoppingBag },
  ];

  const isActive = (path: string) => {
    if (path === ROUTE_PATHS.home) return location.pathname === ROUTE_PATHS.home;
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {/* EDN Progress Section */}
        {progressData && open && (
          <SidebarGroup className="border-b border-border pb-4">
            <SidebarGroupLabel className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progression EDN
            </SidebarGroupLabel>
            <div className="px-3 py-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {progressData.completedItems}/{progressData.totalItems}
                </span>
                <span className="font-medium text-primary">
                  {progressData.completionPercentage.toFixed(0)}%
                </span>
              </div>
              <Progress value={progressData.completionPercentage} className="h-2" />
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>✓ {progressData.completedItems} complets</span>
                <span>• {progressData.inProgressItems} en cours</span>
              </div>
            </div>
          </SidebarGroup>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path)}
                    isActive={isActive(item.path)}
                    className="group relative"
                  >
                    <item.icon className="h-4 w-4" />
                    {open && (
                      <>
                        <span><TranslatedText text={item.label} /></span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite({
                              id: item.path,
                              type: 'route',
                              label: item.label,
                              path: item.path,
                            });
                          }}
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={isFavorite(item.path) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <Star
                            className={`h-3 w-3 ${
                              isFavorite(item.path)
                                ? 'fill-primary text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Favorites Section */}
        {open && favorites.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-primary text-primary" />
              Favoris
              <Badge variant="secondary" className="ml-auto">
                {favorites.length}
              </Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {favorites.map((fav) => {
                  const Icon = mainNavItems.find(i => i.path === fav.path)?.icon || Award;
                  return (
                    <SidebarMenuItem key={fav.id}>
                      <SidebarMenuButton
                        onClick={() => handleNavigation(fav.path)}
                        isActive={isActive(fav.path)}
                        className="group"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="truncate">{fav.label}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(fav);
                          }}
                          className="ml-auto"
                          aria-label="Retirer des favoris"
                        >
                          <Star className="h-3 w-3 fill-primary text-primary" />
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
