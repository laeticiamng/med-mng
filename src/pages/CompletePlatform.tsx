import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PlatformNavigation } from '@/components/platform/PlatformNavigation';
import { QuickActions } from '@/components/platform/QuickActions';
import { ActivityFeed } from '@/components/platform/ActivityFeed';
import { StatsOverview } from '@/components/platform/StatsOverview';
import { RecentContent } from '@/components/platform/RecentContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, X, Bell, Search, User, Settings, 
  Sparkles, TrendingUp, Calendar, MessageSquare
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

export default function CompletePlatform() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications] = useState(3);
  const isMobile = useIsMobile();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      <Helmet>
        <title>MED-MNG - Plateforme d'Apprentissage Médical</title>
        <meta name="description" content="Plateforme complète d'apprentissage médical avec IA musicale, items EDN, ECOS et outils pédagogiques avancés" />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}>
          <PlatformNavigation />
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher items, musiques..."
                  className="pl-10 h-9"
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>

              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {/* Welcome Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Bienvenue sur MED-MNG
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Votre plateforme d'apprentissage médical avec intelligence artificielle
                  </p>
                </div>
                <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Premium
                </Badge>
              </div>

              {/* Daily Insights */}
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <TrendingUp className="w-5 h-5" />
                    Insights du Jour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-foreground">12</div>
                      <div className="text-muted-foreground">Items recommandés</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">3</div>
                      <div className="text-muted-foreground">Quiz disponibles</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">5</div>
                      <div className="text-muted-foreground">Nouvelles musiques</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Stats Overview */}
            <StatsOverview />

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentContent />
              <ActivityFeed />
            </div>

            {/* Additional Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-5 h-5 text-primary" />
                    Planning d'Étude
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Organisez votre apprentissage avec un planning personnalisé
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Voir le planning
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Assistant IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Posez vos questions médicales à l'intelligence artificielle
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Démarrer une conversation
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Nouveautés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Découvrez les dernières fonctionnalités et contenus
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Explorer
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}