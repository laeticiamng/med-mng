import React, { useState, Suspense, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { AdvancedAnalyticsDashboard } from '@/components/analytics/AdvancedAnalyticsDashboard';
import { AdvancedMusicGenerator } from '@/components/music/AdvancedMusicGenerator';
import { AIAssistantHub } from '@/components/ai/AIAssistantHub';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { CollaborativeStudy } from '@/components/study/CollaborativeStudy';
import { AdvancedMusicPlayer } from '@/components/music/AdvancedMusicPlayer';
import { StudyPlanManager } from '@/components/study/StudyPlanManager';
import { StudyCalendar } from '@/components/calendar/StudyCalendar';
import { SystemSettings } from '@/components/settings/SystemSettings';
import { AIChat } from '@/components/ai/AIChat';
import { ROUTE_PATHS } from '@/config/routes';

// Lazy loaded components
const RealTimeAnalytics = React.lazy(() => import('@/components/analytics/RealTimeAnalytics').then(m => ({ default: m.RealTimeAnalytics })));
const UserProfileManager = React.lazy(() => import('@/components/profile/UserProfileManager').then(m => ({ default: m.UserProfileManager })));
const AchievementSystem = React.lazy(() => import('@/components/gamification/AchievementSystem').then(m => ({ default: m.AchievementSystem })));
const CommunityHub = React.lazy(() => import('@/components/social/CommunityHub').then(m => ({ default: m.CommunityHub })));
import { 
  BarChart3, 
  Music, 
  MessageSquare, 
  BookOpen, 
  Users, 
  Settings,
  Sparkles,
  TrendingUp,
  Headphones,
  Brain,
  Calendar,
  Target
} from 'lucide-react';

export default function ModularDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('analytics');
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_modular_dashboard' } });
  }, []);

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
    logActivity({ activity_type: 'study', metadata: { action: 'switch_module', module: moduleId } });
  };

  const modules = [
    {
      id: 'analytics',
      name: 'Analytics Avancées',
      description: 'Analyse détaillée de votre progression et performances',
      icon: BarChart3,
      color: 'from-primary to-primary/80',
      component: AdvancedAnalyticsDashboard
    },
    {
      id: 'music',
      name: 'Générateur Musical IA',
      description: 'Création de musiques personnalisées pour l\'étude',
      icon: Music,
      color: 'from-accent to-accent/80',
      component: AdvancedMusicGenerator
    },
    {
      id: 'assistant',
      name: 'Assistant IA Médical',
      description: 'Chat intelligent pour l\'assistance médicale',
      icon: MessageSquare,
      color: 'from-success to-success/80',
      component: AIChat
    },
    {
      id: 'analytics-realtime',
      name: 'Analytics Temps Réel',
      description: 'Données en direct et métriques avancées',
      icon: TrendingUp,
      color: 'from-warning to-warning/80',
      component: () => import('@/components/analytics/RealTimeAnalytics').then(m => m.RealTimeAnalytics)
    },
    {
      id: 'profile',
      name: 'Profil Utilisateur',
      description: 'Gestion complète du profil et préférences',
      icon: Settings,
      color: 'from-muted-foreground to-muted-foreground/80',
      component: () => import('@/components/profile/UserProfileManager').then(m => m.UserProfileManager)
    },
    {
      id: 'achievements',
      name: 'Système de Récompenses',
      description: 'Achievements et progression gamifiée',
      icon: Brain,
      color: 'from-warning to-warning/80',
      component: () => import('@/components/gamification/AchievementSystem').then(m => m.AchievementSystem)
    },
    {
      id: 'community',
      name: 'Hub Communautaire',
      description: 'Interactions sociales et groupes d\'étude',
      icon: Users,
      color: 'from-accent to-accent/80',
      component: () => import('@/components/social/CommunityHub').then(m => m.CommunityHub)
    },
    {
      id: 'study-plans',
      name: 'Plans d\'Étude',
      description: 'Gestion et suivi des plans d\'apprentissage',
      icon: Target,
      color: 'from-primary to-primary/80',
      component: StudyPlanManager
    },
    {
      id: 'calendar',
      name: 'Calendrier d\'Étude',
      description: 'Planning et organisation des sessions',
      icon: Calendar,
      color: 'from-primary to-primary/80',
      component: StudyCalendar
    },
    {
      id: 'system',
      name: 'Paramètres Système',
      description: 'Configuration et monitoring avancés',
      icon: Settings,
      color: 'from-destructive to-destructive/80',
      component: SystemSettings
    }
  ];

  const quickActions = [
    {
      title: 'Interface EDN',
      description: 'Accéder aux items EDN complets',
      icon: BookOpen,
      action: () => navigate(ROUTE_PATHS.ednComplete),
      color: 'bg-primary'
    },
    {
      title: 'Communauté',
      description: 'Rejoindre la communauté médicale',
      icon: Users,
      action: () => navigate(ROUTE_PATHS.community),
      color: 'bg-success'
    },
    {
      title: 'Paramètres',
      description: 'Configurer votre profil',
      icon: Settings,
      action: () => navigate(ROUTE_PATHS.settings),
      color: 'bg-muted-foreground'
    }
  ];

  const ActiveComponent = modules.find(m => m.id === activeModule)?.component || AdvancedAnalyticsDashboard;

  const handleSidebarNavigation = (moduleId: string) => {
    setActiveModule(moduleId);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar onNavigate={handleSidebarNavigation} />
        
        <div className="flex-1 flex flex-col">
          {/* Header with Sidebar Toggle */}
          <header className="h-16 flex items-center justify-between border-b bg-card px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-semibold">Hub Éducatif MED-MNG</h1>
                <p className="text-sm text-muted-foreground">Plateforme médicale avancée</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Progression</p>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-gradient-to-r from-primary to-accent" />
                  </div>
                  <span className="text-xs font-medium">75%</span>
                </div>
              </div>
              
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                M
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-6">
            <Tabs value={activeModule} onValueChange={setActiveModule}>
              <TabsContent value="analytics" className="mt-0">
                <AdvancedAnalyticsDashboard />
              </TabsContent>
              
              <TabsContent value="music" className="mt-0">
                <AdvancedMusicGenerator />
              </TabsContent>
              
              <TabsContent value="assistant" className="mt-0">
                <AIChat />
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-0">
                <NotificationCenter />
              </TabsContent>
              
              <TabsContent value="study" className="mt-0">
                <CollaborativeStudy />
              </TabsContent>
              
              <TabsContent value="player" className="mt-0">
                <AdvancedMusicPlayer />
              </TabsContent>
              
              <TabsContent value="study-plans" className="mt-0">
                <StudyPlanManager />
              </TabsContent>
              
              <TabsContent value="calendar" className="mt-0">
                <StudyCalendar />
              </TabsContent>
              
              <TabsContent value="system" className="mt-0">
                <SystemSettings />
              </TabsContent>

              {/* Dynamic components for lazy-loaded modules */}
              <TabsContent value="analytics-realtime" className="mt-0">
                <Suspense fallback={<div>Chargement...</div>}>
                  <RealTimeAnalytics />
                </Suspense>
              </TabsContent>
              
              <TabsContent value="profile" className="mt-0">
                <Suspense fallback={<div>Chargement...</div>}>
                  <UserProfileManager />
                </Suspense>
              </TabsContent>
              
              <TabsContent value="achievements" className="mt-0">
                <Suspense fallback={<div>Chargement...</div>}>
                  <AchievementSystem />
                </Suspense>
              </TabsContent>
              
              <TabsContent value="community" className="mt-0">
                <Suspense fallback={<div>Chargement...</div>}>
                  <CommunityHub />
                </Suspense>
              </TabsContent>
            </Tabs>
          </main>

          {/* Status Indicators */}
          <div className="fixed bottom-4 right-4 space-y-2">
            <div className="bg-card border rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">Système opérationnel</span>
              </div>
            </div>
            
            <div className="bg-card border rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-warning" />
                <span className="text-muted-foreground">23 crédits IA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
