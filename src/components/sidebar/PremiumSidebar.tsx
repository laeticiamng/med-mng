/**
 * 🎛️ PREMIUM SIDEBAR - MED-MNG v4.0
 * Sidebar moderne avec navigation intelligente et accessibilité parfaite
 */

import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
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
  Home, 
  Stethoscope, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  BarChart3, 
  Shield,
  BookOpen,
  Zap,
  Heart,
  Activity,
  UserCheck,
  ClipboardList,
  Microscope,
  Pill,
  Building2,
  GraduationCap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFinalStore } from '@/stores/finalStore';
import { cn } from '@/lib/utils';

// ==========================================
// CONFIGURATION NAVIGATION PREMIUM
// ==========================================

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  description?: string;
  shortcut?: string;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
  collapsed?: boolean;
}

const navigationGroups: NavigationGroup[] = [
  {
    label: 'Principal',
    items: [
      {
        title: 'Tableau de bord',
        url: '/',
        icon: Home,
        description: 'Vue d\'ensemble de votre activité',
        shortcut: 'Ctrl+H'
      },
      {
        title: 'Patients',
        url: '/patients',
        icon: Users,
        badge: { text: '89', variant: 'secondary' },
        description: 'Gestion des dossiers patients',
        shortcut: 'Ctrl+P'
      },
      {
        title: 'Consultations',
        url: '/consultations',
        icon: Stethoscope,
        badge: { text: '12', variant: 'default' },
        description: 'Rendez-vous et consultations',
        shortcut: 'Ctrl+C'
      },
      {
        title: 'Calendrier',
        url: '/calendar',
        icon: Calendar,
        description: 'Planning et rendez-vous',
        shortcut: 'Ctrl+K'
      }
    ]
  },
  {
    label: 'Formation EDN',
    items: [
      {
        title: 'Items EDN',
        url: '/edn',
        icon: BookOpen,
        badge: { text: '367', variant: 'outline' },
        description: 'Référentiel EDN complet',
        shortcut: 'Ctrl+E'
      },
      {
        title: 'Apprentissage',
        url: '/learning',
        icon: GraduationCap,
        description: 'Parcours d\'apprentissage personnalisés'
      },
      {
        title: 'Évaluations',
        url: '/evaluations',
        icon: ClipboardList,
        badge: { text: 'Nouveau', variant: 'destructive' },
        description: 'Tests et évaluations'
      }
    ]
  },
  {
    label: 'Outils Médicaux',
    items: [
      {
        title: 'Prescriptions',
        url: '/prescriptions',
        icon: Pill,
        description: 'Gestion des prescriptions'
      },
      {
        title: 'Examens',
        url: '/exams',
        icon: Microscope,
        description: 'Résultats d\'examens et analyses'
      },
      {
        title: 'Monitoring',
        url: '/monitoring',
        icon: Activity,
        badge: { text: 'Live', variant: 'default' },
        description: 'Surveillance en temps réel'
      },
      {
        title: 'Urgences',
        url: '/emergency',
        icon: Heart,
        badge: { text: '3', variant: 'destructive' },
        description: 'Gestion des urgences'
      }
    ]
  },
  {
    label: 'Administration',
    items: [
      {
        title: 'Établissement',
        url: '/facility',
        icon: Building2,
        description: 'Gestion de l\'établissement'
      },
      {
        title: 'Personnel',
        url: '/staff',
        icon: UserCheck,
        description: 'Équipe médicale et administrative'
      },
      {
        title: 'Rapports',
        url: '/reports',
        icon: BarChart3,
        description: 'Analyses et statistiques'
      },
      {
        title: 'Sécurité',
        url: '/security',
        icon: Shield,
        badge: { text: 'OK', variant: 'secondary' },
        description: 'Audit et sécurité'
      }
    ]
  },
  {
    label: 'Système',
    items: [
      {
        title: 'Paramètres',
        url: '/settings',
        icon: Settings,
        description: 'Configuration du système'
      },
      {
        title: 'Optimisation',
        url: '/optimization',
        icon: Zap,
        description: 'Performance et optimisation'
      },
      {
        title: 'Documentation',
        url: '/docs',
        icon: FileText,
        description: 'Guides et documentation'
      }
    ]
  }
];

// ==========================================
// PREMIUM SIDEBAR COMPONENT
// ==========================================

export const PremiumSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useFinalStore();
  const currentPath = location.pathname;

  // Helpers pour la navigation active
  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    
    return cn(
      baseClasses,
      isActive(path) 
        ? "bg-accent text-accent-foreground shadow-sm border-l-2 border-primary" 
        : "text-muted-foreground hover:text-foreground"
    );
  };

  return (
    <Sidebar
      id="sidebar-navigation"
      className={cn(
        "border-r bg-card/50 backdrop-blur-sm",
        state === 'collapsed' ? "w-14" : "w-72"
      )}
      collapsible="icon"
    >
      <SidebarContent className="gap-0">
        
        {/* Header avec logo et utilisateur */}
          <div className={cn(
          "flex flex-col gap-4 p-4 border-b",
          state === 'collapsed' && "items-center p-2"
        )}>
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            {state !== 'collapsed' && (
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                  MED-MNG
                </span>
                <span className="text-xs text-muted-foreground">v4.0 Premium</span>
              </div>
            )}
          </div>

          {/* Utilisateur connecté */}
          {user && (
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-lg bg-muted/50",
              state === 'collapsed' && "justify-center"
            )}>
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar_url} alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {state !== 'collapsed' && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation groups */}
        <div className="flex-1 overflow-y-auto px-2 py-4">
          {navigationGroups.map((group, groupIndex) => {
            const hasActiveItem = group.items.some(item => isActive(item.url));
            
            return (
              <SidebarGroup 
                key={group.label}
                className="mb-4"
              >
                {state !== 'collapsed' && (
                  <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </SidebarGroupLabel>
                )}
                
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className={getNavClasses(item.url)}
                            title={state === 'collapsed' ? `${item.title} ${item.shortcut ? `(${item.shortcut})` : ''}` : undefined}
                            aria-label={`${item.title}${item.description ? ` - ${item.description}` : ''}`}
                          >
                            <item.icon 
                              className={cn(
                                "w-4 h-4 flex-shrink-0",
                                isActive(item.url) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                              )} 
                            />
                            
                            {state !== 'collapsed' && (
                              <>
                                <span className="flex-1 truncate">{item.title}</span>
                                
                                {item.badge && (
                                  <Badge 
                                    variant={item.badge.variant || 'default'} 
                                    className="ml-auto text-xs px-1.5 py-0.5"
                                  >
                                    {item.badge.text}
                                  </Badge>
                                )}
                                
                                {item.shortcut && !item.badge && (
                                  <span className="ml-auto text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.shortcut.replace('Ctrl', '⌘')}
                                  </span>
                                )}
                              </>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </div>

      </SidebarContent>
    </Sidebar>
  );
};