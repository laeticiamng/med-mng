import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  TrendingUp, Target, Brain, BookOpen, Trophy, Clock,
  Calendar, Flame, CheckCircle, AlertTriangle, ChevronLeft,
  BarChart3, PieChart, Activity, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useSRS } from '@/hooks/useSRS';
import { useExamMode } from '@/hooks/useExamMode';
import { useClinicalCases } from '@/hooks/useClinicalCases';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useToast } from '@/hooks/use-toast';
import { ROUTE_PATHS } from '@/config/routes';
import { ActivityHeatmap } from '@/components/learning/ActivityHeatmap';
import { LearningInsights } from '@/components/learning/LearningInsights';

export default function ProgressDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stats: srsStats, getStats: getSrsStats } = useSRS();
  const { getStats: getExamStats } = useExamMode();
  const { getStats: getClinicalStats } = useClinicalCases();
  const { getStats: getFlashcardStats } = useFlashcards();

  const [user, setUser] = useState<any>(null);
  const [examStats, setExamStats] = useState<any>(null);
  const [clinicalStats, setClinicalStats] = useState<any>(null);
  const [flashcardStats, setFlashcardStats] = useState<any>(null);
  const [activityData, setActivityData] = useState<number[]>([]);

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
      setExamStats(getExamStats(user.id));
      setClinicalStats(getClinicalStats(user.id));
      setFlashcardStats(getFlashcardStats(user.id));
      
      // Generate mock activity data for heatmap
      const activity = Array(30).fill(0).map(() => Math.floor(Math.random() * 50));
      setActivityData(activity);
    };
    loadData();
  }, [navigate, toast, getSrsStats, getExamStats, getClinicalStats, getFlashcardStats]);

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
              Tableau de Bord
            </h1>
            <p className="text-muted-foreground">Vue d'ensemble de votre progression</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
              <p className="text-3xl font-bold text-warning">{flashcardStats?.streakDays || 0}</p>
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

        {/* Activity Heatmap - Real data */}
        <div className="mb-8">
          <ActivityHeatmap days={90} />
        </div>

        {/* Learning Insights */}
        <div className="mb-8">
          <LearningInsights />
        </div>

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
