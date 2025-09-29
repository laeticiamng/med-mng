import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedAnalyticsDashboard } from '@/components/analytics/AdvancedAnalyticsDashboard';
import { AdvancedMusicGenerator } from '@/components/music/AdvancedMusicGenerator';
import { AIAssistantHub } from '@/components/ai/AIAssistantHub';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { CollaborativeStudy } from '@/components/study/CollaborativeStudy';
import { AdvancedMusicPlayer } from '@/components/music/AdvancedMusicPlayer';
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
  Brain
} from 'lucide-react';

export default function ModularDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('analytics');

  const modules = [
    {
      id: 'analytics',
      name: 'Analytics Avancées',
      description: 'Analyse détaillée de votre progression et performances',
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600',
      component: AdvancedAnalyticsDashboard
    },
    {
      id: 'music',
      name: 'Générateur Musical IA',
      description: 'Création de musiques personnalisées pour l\'étude',
      icon: Music,
      color: 'from-purple-500 to-purple-600',
      component: AdvancedMusicGenerator
    },
    {
      id: 'assistant',
      name: 'Assistant IA Médical',
      description: 'Chat intelligent pour l\'assistance médicale',
      icon: MessageSquare,
      color: 'from-green-500 to-green-600',
      component: AIAssistantHub
    },
    {
      id: 'analytics-realtime',
      name: 'Analytics Temps Réel',
      description: 'Données en direct et métriques avancées',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      component: () => import('@/components/analytics/RealTimeAnalytics').then(m => m.RealTimeAnalytics)
    },
    {
      id: 'profile',
      name: 'Profil Utilisateur',
      description: 'Gestion complète du profil et préférences',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      component: () => import('@/components/profile/UserProfileManager').then(m => m.UserProfileManager)
    },
    {
      id: 'achievements',
      name: 'Système de Récompenses',
      description: 'Achievements et progression gamifiée',
      icon: Brain,
      color: 'from-yellow-500 to-yellow-600',
      component: () => import('@/components/gamification/AchievementSystem').then(m => m.AchievementSystem)
    },
    {
      id: 'community',
      name: 'Hub Communautaire',
      description: 'Interactions sociales et groupes d\'étude',
      icon: Users,
      color: 'from-pink-500 to-pink-600',
      component: () => import('@/components/social/CommunityHub').then(m => m.CommunityHub)
    }
  ];

  const quickActions = [
    {
      title: 'Interface EDN',
      description: 'Accéder aux items EDN complets',
      icon: BookOpen,
      action: () => navigate('/edn-complete'),
      color: 'bg-blue-500'
    },
    {
      title: 'Communauté',
      description: 'Rejoindre la communauté médicale',
      icon: Users,
      action: () => navigate('/community'),
      color: 'bg-green-500'
    },
    {
      title: 'Paramètres',
      description: 'Configurer votre profil',
      icon: Settings,
      action: () => navigate('/settings'),
      color: 'bg-gray-500'
    }
  ];

  const ActiveComponent = modules.find(m => m.id === activeModule)?.component || AdvancedAnalyticsDashboard;

  return (
    <div className="min-h-screen bg-background">
      {/* En-tête principal */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Hub Éducatif MED-MNG
              </h1>
              <p className="text-muted-foreground">
                Plateforme complète d'apprentissage médical avec IA intégrée
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Niveau de progression</p>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  </div>
                  <span className="text-sm font-medium">75%</span>
                </div>
              </div>
              
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des modules */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-6">
          <Tabs value={activeModule} onValueChange={setActiveModule}>
            <TabsList className="bg-transparent border-none h-16 p-0">
              {modules.map((module) => (
                <TabsTrigger 
                  key={module.id}
                  value={module.id}
                  className="data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-16 px-6"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center text-white`}>
                      <module.icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{module.name}</p>
                      <p className="text-xs text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Actions rapides</h3>
            <div className="flex gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-card/80 transition-colors"
                >
                  <div className={`w-4 h-4 rounded ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium">{action.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto">
        <Tabs value={activeModule} onValueChange={setActiveModule}>
          <TabsContent value="analytics" className="mt-0">
            <AdvancedAnalyticsDashboard />
          </TabsContent>
          
          <TabsContent value="music" className="mt-0">
            <AdvancedMusicGenerator />
          </TabsContent>
          
          <TabsContent value="assistant" className="mt-0">
            <AIAssistantHub />
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
        </Tabs>
      </div>

      {/* Indicateurs de statut */}
      <div className="fixed bottom-4 right-4 space-y-2">
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">IA Médicale active</span>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-muted-foreground">23 crédits restants</span>
          </div>
        </div>
      </div>
    </div>
  );
}