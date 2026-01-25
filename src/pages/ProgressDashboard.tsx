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
import { OfflineSyncManager } from '@/components/pwa/OfflineSyncManager';
import { SmartReminders } from '@/components/revision/SmartReminders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTE_PATHS } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useClinicalCases } from '@/hooks/useClinicalCases';
import { useExamMode } from '@/hooks/useExamMode';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useGamification } from '@/hooks/useGamification';
import { useSRS } from '@/hooks/useSRS';
import { supabase } from '@/integrations/supabase/client';
import {
    Activity,
    AlertTriangle,
    Award,
    Bell,
    BookOpen,
    Brain,
    Calendar,
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
  const { getStats: getExamStats } = useExamMode();
  const { getStats: getClinicalStats } = useClinicalCases();
  const { getStats: getFlashcardStats } = useFlashcards();
  const { _stats: gamificationStats, loadStats: loadGamificationStats, BADGE_DEFINITIONS, checkAndUnlockBadges } = useGamification();
  const { _getHeatmapData } = useActivityTracking();

  const [user, setUser] = useState<any>(null);
  const [examStats, setExamStats] = useState<any>(null);
  const [clinicalStats, setClinicalStats] = useState<any>(null);
  const [flashcardStats, setFlashcardStats] = useState<any>(null);
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
      getExamStats(user.id).then(setExamStats);
      getClinicalStats(user.id).then(setClinicalStats);
      getFlashcardStats(user.id).then(setFlashcardStats);
      loadGamificationStats(user.id);
      checkAndUnlockBadges(user.id);
      
      // Load weekly data
      const heatmapData = await _getHeatmapData(14);
      const thisWeek = heatmapData.slice(0, 7);
      const lastWeek = heatmapData.slice(7, 14);
      const thisWeekTotal = thisWeek.reduce((sum, d) => sum + d.count, 0);
      const lastWeekTotal = lastWeek.reduce((sum, d) => sum + d.count, 0);
      const byType: Record<string, number> = {};
      thisWeek.forEach(d => {
        Object.entries(d.activities).forEach(([type, count]) => {
          byType[type] = (byType[type] || 0) + count;
        });
      });
      const trend = lastWeekTotal > 0 ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100) : 0;
      setWeeklyData({ total: thisWeekTotal, byType, trend });
    };
    loadData();
  }, [navigate, toast, getSrsStats, getExamStats, getClinicalStats, getFlashcardStats, loadGamificationStats, checkAndUnlockBadges, _getHeatmapData]);

  const totalProgress = srsStats ? 
    Math.round((srsStats.masteredItems / srsStats.totalItems) * 100) : 0;

  const overallScore = Math.round(
    ((examStats?.averageScore || 0) + 
     (clinicalStats?.averageScore || 0) + 
     (flashcardStats?.accuracy || 0)) / 3
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Helmet>
        <title>Tableau de Bord | MED-MNG</title>
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="badges">
              <Award className="h-4 w-4 mr-1" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="reminders">
              <Bell className="h-4 w-4 mr-1" />
              Rappels
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-1" />
              Options
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
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-3xl font-bold text-primary">{weeklyData.total}</p>
                    <p className="text-sm text-muted-foreground">activités</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <Brain className="h-6 w-6 mx-auto mb-2 text-accent" />
                    <p className="text-3xl font-bold text-accent">{weeklyData.byType['review'] || weeklyData.byType['srs_review'] || 0}</p>
                    <p className="text-sm text-muted-foreground">révisions</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <Trophy className="h-6 w-6 mx-auto mb-2 text-warning" />
                    <p className="text-3xl font-bold text-warning">{examStats?.totalExams || weeklyData.byType['exam'] || 0}</p>
                    <p className="text-sm text-muted-foreground">examens</p>
                  </div>
                  <div className={`text-center p-4 rounded-lg ${weeklyData.trend >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <TrendingUp className={`h-6 w-6 mx-auto mb-2 ${weeklyData.trend >= 0 ? 'text-success' : 'text-destructive'}`} />
                    <p className={`text-3xl font-bold ${weeklyData.trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {weeklyData.trend >= 0 ? '+' : ''}{weeklyData.trend}%
                    </p>
                    <p className="text-sm text-muted-foreground">vs sem. dernière</p>
                  </div>
                </div>

                {/* Activity breakdown */}
                {Object.keys(weeklyData.byType).length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Répartition par type</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(weeklyData.byType).map(([type, count]) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time Spent Analytics Card */}
            <Card className="border-accent/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-accent" />
                  Temps d'étude par item
                </CardTitle>
                <CardDescription>Analyse du temps passé sur chaque élément</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-accent/5 rounded-lg text-center">
                    <p className="text-2xl font-bold text-accent">{Math.round((weeklyData.total * 5) / 60)}h</p>
                    <p className="text-xs text-muted-foreground">Temps total estimé</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{Math.round((weeklyData.total * 5) / 7)} min/jour</p>
                    <p className="text-xs text-muted-foreground">Moyenne quotidienne</p>
                  </div>
                  <div className="p-4 bg-success/5 rounded-lg text-center">
                    <p className="text-2xl font-bold text-success">{srsStats?.masteredItems || 0}</p>
                    <p className="text-xs text-muted-foreground">Items maîtrisés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Probability Card - Weighted Model */}
            <Card className="border-warning/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-warning" />
                  Probabilité de succès estimée
                </CardTitle>
                <CardDescription>Modèle pondéré : SRS (40%), Examens (30%), Régularité (30%)</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Weighted success probability calculation
                  const srsWeight = 0.40;
                  const examWeight = 0.30;
                  const regularityWeight = 0.30;
                  
                  // SRS component: mastery ratio (0-100)
                  const srsScore = srsStats 
                    ? Math.round((srsStats.masteredItems / Math.max(1, srsStats.totalItems)) * 100)
                    : 0;
                  
                  // Exam component: average exam score (0-100)
                  const examScore = examStats?.averageScore || 0;
                  
                  // Regularity component: streak bonus + weekly activity
                  const streakBonus = Math.min(20, (gamificationStats?.currentStreak || 0) * 2);
                  const activityBonus = Math.min(80, weeklyData.total * 10);
                  const regularityScore = streakBonus + activityBonus;
                  
                  // Weighted total with floor of 50% if any activity exists
                  const rawProbability = (srsScore * srsWeight) + (examScore * examWeight) + (regularityScore * regularityWeight);
                  const hasActivity = srsStats?.totalItems > 0 || examStats?.totalExams > 0 || weeklyData.total > 0;
                  const probability = hasActivity ? Math.max(50, Math.min(95, Math.round(rawProbability))) : 0;
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rétention globale estimée</span>
                        <span className="text-lg font-bold text-warning">{probability}%</span>
                      </div>
                      <Progress value={probability} className="h-3" />
                      
                      {/* Factor breakdown */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">SRS</p>
                          <p className="text-sm font-medium">{srsScore}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Examens</p>
                          <p className="text-sm font-medium">{examScore}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Régularité</p>
                          <p className="text-sm font-medium">{regularityScore}%</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Continuez à réviser régulièrement pour améliorer votre score.
                      </p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-primary">{totalProgress}%</p>
                  <p className="text-sm text-muted-foreground">Items maîtrisés</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-success/10 to-success/5">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p className="text-3xl font-bold text-success">{overallScore}%</p>
                  <p className="text-sm text-muted-foreground">Score global</p>
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

          <TabsContent value="reminders" className="space-y-6 mt-6">
            <SmartReminders />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {user && <SRSNotificationSettings userId={user.id} />}
              <StudyCalendarSync />
              {user && gamificationStats && (
                <ProgressExport userId={user.id} stats={gamificationStats} />
              )}
              <PDFExportService />
              <OfflineSyncManager />
            </div>
          </TabsContent>
        </Tabs>

        {/* Module Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
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

          {/* Exam Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                Mode Examen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{examStats?.totalExams || 0}</p>
                  <p className="text-xs text-muted-foreground">Examens passés</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{examStats?.averageScore || 0}%</p>
                  <p className="text-xs text-muted-foreground">Score moyen</p>
                </div>
              </div>
              {examStats?.weakTopics?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Points faibles
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {examStats.weakTopics.slice(0, 3).map((t: any, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {t.item_code}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(ROUTE_PATHS.examMode)}
              >
                Passer un examen
              </Button>
            </CardContent>
          </Card>

          {/* Clinical Cases Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-success" />
                Cas Cliniques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{clinicalStats?.totalCasesCompleted || 0}</p>
                  <p className="text-xs text-muted-foreground">Cas terminés</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{clinicalStats?.averageScore || 0}%</p>
                  <p className="text-xs text-muted-foreground">Score moyen</p>
                </div>
              </div>
              {Object.keys(clinicalStats?.bySpecialty || {}).length > 0 && (
                <div className="space-y-1">
                  {Object.entries(clinicalStats.bySpecialty).slice(0, 2).map(([spec, data]: [string, any]) => (
                    <div key={spec} className="flex justify-between text-sm">
                      <span>{spec}</span>
                      <Badge variant={data.score >= 70 ? 'default' : 'secondary'}>
                        {data.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(ROUTE_PATHS.clinicalCases)}
              >
                Explorer les cas
              </Button>
            </CardContent>
          </Card>

          {/* Flashcards Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-warning" />
                Flashcards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{flashcardStats?.totalCards || 0}</p>
                  <p className="text-xs text-muted-foreground">Cartes créées</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{flashcardStats?.accuracy || 0}%</p>
                  <p className="text-xs text-muted-foreground">Précision</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-warning" />
                <span className="text-sm">{flashcardStats?.streakDays || 0} jours consécutifs</span>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(ROUTE_PATHS.flashcards)}
              >
                Réviser mes cartes
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                onClick={() => navigate(ROUTE_PATHS.examMode)}
              >
                <Trophy className="h-6 w-6 text-accent" />
                <span className="text-xs">Examen blanc</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate(ROUTE_PATHS.clinicalCases)}
              >
                <Activity className="h-6 w-6 text-success" />
                <span className="text-xs">Cas clinique</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate(ROUTE_PATHS.studyPlanner)}
              >
                <Calendar className="h-6 w-6 text-warning" />
                <span className="text-xs">Planning IA</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
