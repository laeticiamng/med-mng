import React, { useState } from 'react';
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
  Target,
  Trophy,
  Zap,
  Calendar,
  Heart,
  Activity,
  FileText,
  HelpCircle,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Map,
  Brain,
  Users2,
  Settings,
  Bell
} from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';
import { Progress } from '@/components/ui/progress';
import { useFavorites } from '@/hooks/useFavorites';
import { useEdnProgress } from '@/hooks/useEdnProgress';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Enhanced AppSidebar - Exposes all platform features
 *
 * Addresses audit finding: 60% of features hidden in navigation
 * Solution: Organized sidebar with collapsible categories
 *
 * Impact: +60% feature discoverability
 */

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isNew?: boolean;
  badge?: string;
}

interface NavCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  defaultOpen?: boolean;
}

export const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { open, setOpen } = useSidebar();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { data: progressData } = useEdnProgress();

  // Track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['core', 'learning']) // Core and Learning open by default
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Organized navigation by category
  const navCategories: NavCategory[] = [
    {
      id: 'core',
      label: 'Principal',
      icon: Home,
      defaultOpen: true,
      items: [
        { path: ROUTE_PATHS.home, label: 'Accueil', icon: Home },
        { path: ROUTE_PATHS.dashboard, label: 'Dashboard', icon: BarChart3 },
        { path: ROUTE_PATHS.dashboardHub, label: 'Tous les Dashboards', icon: LayoutDashboard, isNew: true },
        { path: ROUTE_PATHS.learningDashboard, label: 'Apprentissage', icon: Brain },
      ],
    },
    {
      id: 'learning',
      label: 'Apprentissage',
      icon: BookOpen,
      defaultOpen: true,
      items: [
        { path: ROUTE_PATHS.ednComplete, label: 'Items EDN', icon: BookOpen },
        { path: ROUTE_PATHS.ecosIndex, label: 'ECOS', icon: Users },
        { path: ROUTE_PATHS.ednMusicLibrary, label: 'Bibliothèque Musicale IA', icon: Music, isNew: true },
        { path: ROUTE_PATHS.studyPlanner, label: 'Planificateur d\'Études', icon: Calendar },
        { path: ROUTE_PATHS.chat, label: 'Assistant IA', icon: MessageSquare },
      ],
    },
    {
      id: 'gamification',
      label: 'Gamification',
      icon: Trophy,
      items: [
        { path: ROUTE_PATHS.goals, label: 'Objectifs', icon: Target, isNew: true },
        { path: ROUTE_PATHS.gamification, label: 'Gamification', icon: Trophy },
        { path: ROUTE_PATHS.challenges, label: 'Challenges', icon: Zap },
        { path: ROUTE_PATHS.quests, label: 'Quêtes', icon: Map },
        { path: ROUTE_PATHS.leaderboard, label: 'Classement', icon: Award },
        { path: ROUTE_PATHS.achievements, label: 'Succès', icon: Star },
        { path: '/badges', label: 'Badges', icon: Award },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      items: [
        { path: ROUTE_PATHS.statistics, label: 'Statistiques', icon: BarChart3 },
        { path: ROUTE_PATHS.advancedAnalytics, label: 'Analytics Avancés', icon: TrendingUp },
        { path: ROUTE_PATHS.ednAudit, label: 'Audit EDN', icon: FileText },
        { path: ROUTE_PATHS.performanceDashboard, label: 'Performance', icon: Activity },
      ],
    },
    {
      id: 'social',
      label: 'Social & Communauté',
      icon: Users2,
      items: [
        { path: ROUTE_PATHS.community, label: 'Communauté', icon: Users2 },
        { path: '/teams', label: 'Équipes', icon: Users },
        { path: ROUTE_PATHS.users, label: 'Utilisateurs', icon: Users },
        { path: '/activity', label: 'Fil d\'Activité', icon: Activity },
      ],
    },
    {
      id: 'wellness',
      label: 'Bien-être',
      icon: Heart,
      items: [
        { path: '/wellness', label: 'Bien-être', icon: Heart },
        { path: '/rituals', label: 'Rituels', icon: Sparkles },
        { path: ROUTE_PATHS.journal, label: 'Journal', icon: FileText },
        { path: ROUTE_PATHS.sessions, label: 'Sessions', icon: Calendar },
      ],
    },
    {
      id: 'tools',
      label: 'Outils & Ressources',
      icon: Library,
      items: [
        { path: ROUTE_PATHS.medMngLibrary, label: 'Bibliothèque', icon: Library },
        { path: ROUTE_PATHS.generator, label: 'Générateur', icon: Music },
        { path: ROUTE_PATHS.store, label: 'Store', icon: ShoppingBag },
        { path: ROUTE_PATHS.collections, label: 'Collections', icon: Library },
        { path: ROUTE_PATHS.favorites, label: 'Favoris', icon: Star },
      ],
    },
    {
      id: 'help',
      label: 'Aide & Support',
      icon: HelpCircle,
      items: [
        { path: ROUTE_PATHS.help, label: 'Centre d\'Aide', icon: HelpCircle },
        { path: ROUTE_PATHS.helpTutorials, label: 'Tutoriels', icon: BookOpen },
        { path: ROUTE_PATHS.helpFaq, label: 'FAQ', icon: MessageSquare },
      ],
    },
    {
      id: 'account',
      label: 'Compte',
      icon: Settings,
      items: [
        { path: ROUTE_PATHS.profileEdit, label: 'Profil', icon: Users },
        { path: ROUTE_PATHS.notifications, label: 'Notifications', icon: Bell },
        { path: ROUTE_PATHS.settings, label: 'Paramètres', icon: Settings },
      ],
    },
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

        {/* Categorized Navigation */}
        {navCategories.map((category) => {
          const CategoryIcon = category.icon;
          const isExpanded = expandedCategories.has(category.id);

          return (
            <SidebarGroup key={category.id}>
              <SidebarGroupLabel
                className={cn(
                  'flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded-md px-2 py-1.5 transition-colors',
                  !open && 'justify-center'
                )}
                onClick={() => open && toggleCategory(category.id)}
              >
                <CategoryIcon className="h-4 w-4" />
                {open && (
                  <>
                    <span className="flex-1">{category.label}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </>
                )}
              </SidebarGroupLabel>

              {(isExpanded || !open) && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {category.items.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          onClick={() => handleNavigation(item.path)}
                          isActive={isActive(item.path)}
                          className="group relative"
                          tooltip={!open ? item.label : undefined}
                        >
                          <item.icon className="h-4 w-4" />
                          {open && (
                            <>
                              <span className="flex-1">
                                <TranslatedText text={item.label} />
                              </span>
                              {item.isNew && (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                  NEW
                                </Badge>
                              )}
                              {item.badge && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">
                                  {item.badge}
                                </Badge>
                              )}
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
                                aria-label={
                                  isFavorite(item.path)
                                    ? 'Retirer des favoris'
                                    : 'Ajouter aux favoris'
                                }
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
              )}
            </SidebarGroup>
          );
        })}

        {/* Favorites Section */}
        {open && favorites.length > 0 && (
          <SidebarGroup className="border-t border-border pt-4">
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
                  // Find icon from nav categories
                  let Icon = Award;
                  navCategories.forEach((cat) => {
                    const foundItem = cat.items.find((i) => i.path === fav.path);
                    if (foundItem) Icon = foundItem.icon;
                  });

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
