// ProgressDashboard - Learning Progress Tracking
import { RevisionHistory } from '@/components/analytics/RevisionHistory';
import { PDFExportService } from '@/components/export/PDFExportService';
import { ProgressExport } from '@/components/export/ProgressExport';
import { BadgeCollection } from '@/components/gamification/BadgeCollection';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { WeeklyChallenges } from '@/components/gamification/WeeklyChallenges';
import { ActivityHeatmap } from '@/components/learning/ActivityHeatmap';
import { ItemMasteryGrid } from '@/components/learning/ItemMasteryGrid';
import { LearningInsights } from '@/components/learning/LearningInsights';
import { StudyCalendar } from '@/components/learning/StudyCalendar';
import { StudyCalendarSync } from '@/components/learning/StudyCalendarSync';
import { SRSNotificationSettings } from '@/components/notifications/SRSNotificationSettings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTE_PATHS } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { useSRS } from '@/hooks/useSRS';
import { supabase } from '@/integrations/supabase/client';
import { repartitionParLibelle } from '@/lib/libellesActivite';
import {
    Activity,
    AlertTriangle,
    Award,
    BookOpen,
    Brain,
    ChevronLeft,
    Clock,
    Flame,
    History,
    Settings,
    Star,
    Target,
    TrendingUp,
    Trophy,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function ProgressDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stats: srsStats, getStats: getSrsStats } = useSRS();
  const { stats: gamificationStats, loadStats: loadGamificationStats, BADGE_DEFINITIONS, checkAndUnlockBadges } = useGamification();
  const { getHeatmapData } = useActivityTracking();

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [weeklyData, setWeeklyData] = useState<{ total: number; byType: Record<string, number>; trend: number }>({ total: 0, byType: {}, trend: 0 });

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Connexion requise", variant: "destructive" });
        navigate(ROUTE_PATHS.medMngLogin);
        return;
      }
      setUser(user);
      
      getSrsStats(user.id);
      loadGamificationStats(user.id);
      checkAndUnlockBadges(user.id).catch(() => {});
      
      // Load weekly data
      const heatmapData = await getHeatmapData(14);
      const thisWeek = heatmapData.slice(0, 7);
      const lastWeek = heatmapData.slice(7, 14);
      const thisWeekTotal = thisWeek.reduce((sum, d) => sum + d.count, 0);
      const lastWeekTotal = lastWeek.reduce((sum, d) => sum + d.count, 0);
      const byType: Record<string, number> = {};
      thisWeek.forEach(d => {
        Object.entries(d.activities).forEach(([type, count]) => {
          byType[type] = (byType[type] || 0) + (count as number);
        });
      });
      const trend = lastWeekTotal > 0 ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100) : 0;
      setWeeklyData({ total: thisWeekTotal, byType, trend });
    };
    loadData().catch(() => {});
  }, [navigate, toast, getSrsStats, loadGamificationStats, checkAndUnlockBadges, getHeatmapData]);

  const totalProgress = srsStats ? 
    Math.round((srsStats.masteredItems / srsStats.totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Helmet>
        <title>Ma progression · Med MNG</title>
        <meta name="description" content="Vue d'ensemble de votre progression EDN" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ma progression
            </h1>
            <p className="text-muted-foreground">C'est fait. Continue comme ça.</p>
          </div>
        </div>

        {/* Gamification Stats */}
        {gamificationStats && (
          <div className="mb-8">
            <StreakDisplay stats={gamificationStats} />
          </div>
        )}

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="flex w-full overflow-x-auto hide-scrollbar h-auto p-1">
            <TabsTrigger value="overview" className="shrink-0 flex-col sm:flex-row gap-0.5 sm:gap-1 py-2 sm:py-1.5 px-2 sm:px-3">
              <span className="text-[10px] sm:text-xs">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="shrink-0 flex-col sm:flex-row gap-0.5 sm:gap-1 py-2 sm:py-1.5 px-2 sm:px-3">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="text-[10px] sm:text-xs">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="shrink-0 flex-col sm:flex-row gap-0.5 sm:gap-1 py-2 sm:py-1.5 px-2 sm:px-3">
              <span className="text-[10px] sm:text-xs">Analyses</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="shrink-0 flex-col sm:flex-row gap-0.5 sm:gap-1 py-2 sm:py-1.5 px-2 sm:px-3">
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="text-[10px] sm:text-xs">Historique</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="shrink-0 flex-col sm:flex-row gap-0.5 sm:gap-1 py-2 sm:py-1.5 px-2 sm:px-3">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="text-[10px] sm:text-xs">Options</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Weekly Summary - Enhanced */}
            <Card className="bg-gradient-to-r from-primary/5 via-background to-success/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-primary" />
                  Résumé de la semaine
                </CardTitle>
                <CardDescription>Votre activité des 7 derniers jours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  <div className="text-center p-3 sm:p-4 bg-background/50 rounded-lg">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1.5 sm:mb-2 text-primary" />
                    <p className="text-xl sm:text-3xl font-bold text-primary">{weeklyData.total}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">activités</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-background/50 rounded-lg">
                    <Brain className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1.5 sm:mb-2 text-accent" />
                    <p className="text-xl sm:text-3xl font-bold text-accent">{weeklyData.byType['review'] || weeklyData.byType['srs_review'] || 0}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">révisions</p>
                  </div>
                  <div className={`text-center p-3 sm:p-4 rounded-lg ${weeklyData.trend >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <TrendingUp className={`h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1.5 sm:mb-2 ${weeklyData.trend >= 0 ? 'text-success' : 'text-destructive'}`} />
                    <p className={`text-xl sm:text-3xl font-bold ${weeklyData.trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {weeklyData.trend >= 0 ? '+' : ''}{weeklyData.trend}%
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">vs sem. dernière</p>
                  </div>
                </div>

                {/* Activity breakdown */}
                {/* Libellés français, sans les zéros (identifiants bruts « srs_review: 0 »… affichés jusqu'ici). */}
                {repartitionParLibelle(weeklyData.byType).length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Répartition par type</p>
                    <div className="flex flex-wrap gap-2">
                      {repartitionParLibelle(weeklyData.byType).map(([libelle, count]) => (
                        <Badge key={libelle} variant="secondary" className="text-xs">
                          {libelle} : {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* « Temps d'étude par item » (5 min par activité, estimé) et « Probabilité de
                succès estimée » (pondération SRS 40 % / Examens 30 % / Régularité 30 %) retirés
                le 07.10.2026 (MM-A09) : le mode Examen n'existe plus et ces chiffres
                n'étaient pas mesurés. */}
            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-primary">{totalProgress}%</p>
                  <p className="text-sm text-muted-foreground">Items maîtrisés</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
                <CardContent className="p-4 text-center">
                  <Flame className="h-8 w-8 mx-auto mb-2 text-warning" />
                  <p className="text-3xl font-bold text-warning">{gamificationStats?.currentStreak || 0}</p>
                  <p className="text-sm text-muted-foreground">Jours de suite</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <p className="text-3xl font-bold text-accent">{srsStats?.dueToday || 0}</p>
                  <p className="text-sm text-muted-foreground">À réviser aujourd'hui</p>
                </CardContent>
              </Card>
            </div>

            {/* Activity Heatmap */}
            <ActivityHeatmap days={90} />

            {/* Study Calendar */}
            <StudyCalendar />
          </TabsContent>

          <TabsContent value="badges" className="space-y-6 mt-6">
            {/* Weekly Challenges */}
            <WeeklyChallenges />
            
            {/* Badge Collection */}
            {gamificationStats && (
              <BadgeCollection 
                unlockedBadges={gamificationStats.badges} 
                allBadges={BADGE_DEFINITIONS} 
              />
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <LearningInsights />
            <ItemMasteryGrid />
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            <RevisionHistory />
          </TabsContent>

          {/* Onglet « Rappels » retiré le 25/09/2026 : SmartReminders n'affichait que
              des rappels de démonstration codés en dur (« 15 cartes à réviser »,
              « streak 7 jours ») et ses réglages n'étaient enregistrés nulle part. */}

          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {user && <SRSNotificationSettings userId={user.id} />}
              <StudyCalendarSync />
              {user && gamificationStats && (
                <ProgressExport userId={user.id} stats={gamificationStats} />
              )}
              <PDFExportService />
              {/* OfflineSyncManager retiré le 25/09/2026 : son « téléchargement hors
                  ligne » n'écrivait qu'un stub JSON de quelques octets dans le cache
                  sous une URL fictive, puis annonçait le contenu « disponible hors
                  ligne » ; ses réglages n'étaient enregistrés nulle part. */}
            </div>
          </TabsContent>
        </Tabs>

        {/* Cartes « Mode Examen », « Cas cliniques » et « Flashcards » retirées le
            07.10.2026 (MM-A09) : fonctions retirées ou sans contenu (0 paquet). */}
        <div className="grid gap-6 mb-8">
          {/* SRS Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Révision Espacée (SRS)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{srsStats?.masteredItems || 0}</p>
                  <p className="text-xs text-muted-foreground">Maîtrisés</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{srsStats?.learningItems || 0}</p>
                  <p className="text-xs text-muted-foreground">En cours</p>
                </div>
              </div>
              <Progress value={totalProgress} className="h-2" />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(ROUTE_PATHS.srsReview)}
              >
                Commencer une session
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Examen blanc, cas cliniques et planning générés par IA : retirés (DC7, 04.10.2026). */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate(ROUTE_PATHS.srsReview)}
              >
                <Brain className="h-6 w-6 text-primary" />
                <span className="text-xs">Révision SRS</span>
                {srsStats?.dueToday ? (
                  <Badge variant="destructive" className="text-xs">
                    {srsStats.dueToday} à faire
                  </Badge>
                ) : null}
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate(ROUTE_PATHS.ednComplete)}
              >
                <Trophy className="h-6 w-6 text-accent" />
                <span className="text-xs">Quiz par item</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate(ROUTE_PATHS.ecosIndex)}
              >
                <Activity className="h-6 w-6 text-success" />
                <span className="text-xs">Situations ECOS</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
