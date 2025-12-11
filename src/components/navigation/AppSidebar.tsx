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
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Home,
  BarChart3, 
  Music, 
  MessageSquare, 
  BookOpen, 
  Users, 
  Settings,
  Brain,
  Calendar,
  Target,
  Bell,
  Trophy,
  HeartHandshake,
  Sparkles,
  Database,
  Flame,
  Star
} from 'lucide-react';
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ROUTE_PATHS } from '@/config/routes';
import { useGamification, XP_PER_LEVEL } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

const navigationItems = [
  {
    title: "Accueil",
    url: ROUTE_PATHS.home,
    icon: Home,
    category: "Principal"
  },
  {
    title: "Analytics Avancées", 
    url: ROUTE_PATHS.learningDashboard,
    icon: BarChart3,
    category: "Analytics",
    badge: "Nouveau"
  },
  {
    title: "Analytics Temps Réel",
    url: ROUTE_PATHS.statistics,
    icon: Database,
    category: "Analytics"
  },
  {
    title: "Générateur Musical",
    url: ROUTE_PATHS.generator,
    icon: Music,
    category: "Création"
  },
  {
    title: "Assistant IA",
    url: ROUTE_PATHS.chat,
    icon: MessageSquare,
    category: "IA",
    badge: "IA"
  },
  {
    title: "Plans d'Étude",
    url: ROUTE_PATHS.studyPlanner,
    icon: Target,
    category: "Étude"
  },
  {
    title: "Calendrier",
    url: ROUTE_PATHS.studyPlanner,
    icon: Calendar,
    category: "Étude"
  },
  {
    title: "Communauté",
    url: ROUTE_PATHS.community,
    icon: Users,
    category: "Social"
  },
  {
    title: "Récompenses",
    url: ROUTE_PATHS.achievements,
    icon: Trophy,
    category: "Gamification"
  },
  {
    title: "Interface EDN",
    url: ROUTE_PATHS.ednComplete,
    icon: BookOpen,
    category: "Contenu"
  },
  {
    title: "Profil",
    url: ROUTE_PATHS.medMngProfile,
    icon: HeartHandshake,
    category: "Personnel"
  },
  {
    title: "Notifications",
    url: ROUTE_PATHS.settings,
    icon: Bell,
    category: "Personnel"
  },
  {
    title: "Système",
    url: ROUTE_PATHS.systemManagement,
    icon: Settings,
    category: "Admin"
  }
];

interface AppSidebarProps {
  onNavigate?: (moduleId: string) => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { state: sidebarState } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [onlineUsers, setOnlineUsers] = useState(127);
  const [user, setUser] = useState<any>(null);
  const { stats: gamificationStats, loadStats } = useGamification();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
    };
    init();
  }, [loadStats]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setUnreadNotifications(Math.floor(Math.random() * 10));
      setOnlineUsers(Math.floor(Math.random() * 200) + 100);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const isCollapsed = sidebarState === "collapsed";
  
  const isActive = (url: string) => {
    if (url === "/" && currentPath === "/") return true;
    if (url !== "/" && currentPath.startsWith(url)) return true;
    return false;
  };

  const getNavClassName = (url: string) => {
    const base = "w-full transition-colors duration-200";
    return isActive(url) 
      ? `${base} bg-primary text-primary-foreground hover:bg-primary/90`
      : `${base} hover:bg-accent hover:text-accent-foreground`;
  };

  const groupedItems = navigationItems.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {} as Record<string, typeof navigationItems>);

  const handleNavigation = (url: string) => {
    // Convert URL to module ID for dashboard compatibility
    const moduleMap: Record<string, string> = {
      '/analytics': 'analytics',
      '/analytics-realtime': 'analytics-realtime', 
      '/music': 'music',
      '/assistant': 'assistant',
      '/study-plans': 'study-plans',
      '/calendar': 'calendar',
      '/community': 'community',
      '/achievements': 'achievements',
      '/profile': 'profile',
      '/notifications': 'notifications',
      '/system': 'system'
    };

    const moduleId = moduleMap[url];
    if (moduleId && onNavigate) {
      onNavigate(moduleId);
    }
  };

  return (
    <Sidebar className={`border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-72'}`}>
      <SidebarContent className="bg-card">
        {/* Header */}
        <div className={`p-4 border-b ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              M
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-lg">MED-MNG</h2>
                <p className="text-xs text-muted-foreground">Plateforme médicale</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        {!isCollapsed && (
          <div className="px-4 py-3 bg-muted/30 border-b">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">En ligne</span>
              </div>
              <div className="text-muted-foreground">{onlineUsers} utilisateurs</div>
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        <div className="flex-1 py-2">
          {Object.entries(groupedItems).map(([category, items]) => (
            <SidebarGroup key={category}>
              {!isCollapsed && (
                <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton 
                        asChild
                        className={getNavClassName(item.url)}
                      >
                        <button
                          onClick={() => handleNavigation(item.url)}
                          className="w-full"
                        >
                          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && (
                              <>
                                <span className="flex-1 text-left">{item.title}</span>
                                <div className="flex items-center gap-1">
                                  {item.badge && (
                                    <Badge 
                                      variant={item.badge === "IA" ? "default" : "secondary"} 
                                      className="text-xs px-1.5 py-0.5"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                  {item.title === "Notifications" && unreadNotifications > 0 && (
                                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                      {unreadNotifications}
                                    </Badge>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>

        {/* Gamification Stats */}
        {user && gamificationStats && !isCollapsed && (
          <div className="px-4 py-3 border-t bg-gradient-to-r from-primary/5 to-warning/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-warning" />
                <span className="text-sm font-bold text-warning">{gamificationStats.currentStreak}j</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary">Nv.{gamificationStats.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-success" />
                <span className="text-sm font-bold text-success">{gamificationStats.badges?.length || 0}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>XP</span>
                <span>{gamificationStats.totalPoints % XP_PER_LEVEL}/{XP_PER_LEVEL}</span>
              </div>
              <Progress value={(gamificationStats.totalPoints % XP_PER_LEVEL) / XP_PER_LEVEL * 100} className="h-1.5" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`p-4 border-t bg-muted/20 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              {gamificationStats && (
                <>
                  <div className="flex items-center gap-1 text-warning">
                    <Flame className="h-4 w-4" />
                    <span className="text-xs font-bold">{gamificationStats.currentStreak}</span>
                  </div>
                </>
              )}
              <Sparkles className="h-5 w-5 text-warning" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Crédits IA</span>
                <span className="font-medium">23 restants</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full" style={{ width: '65%' }} />
              </div>
              <div className="text-xs text-muted-foreground">
                Plan Premium • Expires 31/12/2025
              </div>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}