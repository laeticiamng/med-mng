import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification, POINTS_CONFIG } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertCircle,
    BookOpen,
    Brain,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    Music,
    Play,
    Plus,
    Target,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

interface StudySession {
  id: string;
  title: string;
  type: 'edn' | 'music' | 'quiz' | 'revision';
  duration: number;
  scheduled: Date;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  itemCode?: string;
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

const StudyPlanner = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('planning');
  const [user, setUser] = useState<any>(null);
  const { stats: gamificationStats, loadStats, addPoints, _unlockBadge } = useGamification();
  const { logActivity, getWeeklySummary } = useActivityTracking();
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [_studyPlans, setStudyPlans] = useState<any[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>([]);
  const [_loading, setLoading] = useState(true);

  // Load user, stats, sessions and goals from Supabase
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
        const summary = await getWeeklySummary();
        setWeeklySummary(summary);
        
        // Load study plans from Supabase
        const { data: plans } = await supabase
          .from('study_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (plans) {
          setStudyPlans(plans);
        }

        // Load study sessions from Supabase (plan_sessions table)
        const { data: sessionsData } = await supabase
          .from('plan_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('scheduled_date', { ascending: true })
          .limit(20);

        if (sessionsData && sessionsData.length > 0) {
          const formattedSessions: StudySession[] = sessionsData.map((s: any) => ({
            id: s.id,
            title: s.title || 'Session d\'étude',
            type: s.item_code ? 'edn' : 'revision' as const,
            duration: s.duration_minutes || 30,
            scheduled: new Date(s.scheduled_date),
            completed: s.completed || false,
            difficulty: 'medium' as const,
            itemCode: s.item_code
          }));
          setStudySessions(formattedSessions);
        }

        // Load learning goals from Supabase
        const { data: goalsData } = await supabase
          .from('learning_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('target_date', { ascending: true });

        if (goalsData && goalsData.length > 0) {
          const formattedGoals: StudyGoal[] = goalsData.map((g: any) => ({
            id: g.id,
            title: g.title || 'Objectif',
            description: g.description || '',
            targetDate: new Date(g.target_date),
            progress: g.progress || 0,
            category: g.category || 'Général',
            priority: (g.priority as 'low' | 'medium' | 'high') || 'medium'
          }));
          setStudyGoals(formattedGoals);
        }
      }
      setLoading(false);
    };
    init();
  }, [loadStats, getWeeklySummary]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'edn': return <BookOpen className="h-4 w-4" />;
      case 'music': return <Music className="h-4 w-4" />;
      case 'quiz': return <Brain className="h-4 w-4" />;
      case 'revision': return <Target className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'edn': return 'bg-primary/10 text-primary';
      case 'music': return 'bg-accent/10 text-accent';
      case 'quiz': return 'bg-success/10 text-success';
      case 'revision': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success/10 text-success';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'hard': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const startSession = async (sessionId: string) => {
    if (user) {
      await logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { sessionId, action: 'start' }
      });
      await addPoints(user.id, POINTS_CONFIG.dailyStreak, 'dailyStreak');
      
      // Track sessions completed for badge
      const completedCount = studySessions.filter(s => s.completed).length + 1;
      if (completedCount >= 10) {
        await _unlockBadge(user.id, 'items_10');
      }
      
      loadStats(user.id);
    }
    
    toast({
      title: "Session démarrée",
      description: "Votre session d'étude a commencé. Bon travail !",
    });
  };
  return (
    <>
      <Helmet>
        <title>Planificateur d'Études | MED-MNG</title>
        <meta name="description" content="Organisez et planifiez vos sessions d'étude avec des objectifs personnalisés" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Planificateur d'Études</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Organisez votre apprentissage avec des sessions planifiées et des objectifs personnalisés
          </p>
        </div>

        {/* Gamification Stats Banner */}
        {gamificationStats && (
          <div className="max-w-3xl mx-auto">
            <StreakDisplay stats={gamificationStats} />
          </div>
        )}

        {/* Weekly Summary */}
        {weeklySummary && (
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/5 via-background to-success/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{weeklySummary.totalActivities}</p>
                    <p className="text-xs text-muted-foreground">activités</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-success">{weeklySummary.totalTime || 0}</p>
                    <p className="text-xs text-muted-foreground">minutes</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-warning">{weeklySummary.averageScore || 0}%</p>
                    <p className="text-xs text-muted-foreground">score moy.</p>
                  </div>
                </div>
                <Badge variant={weeklySummary.trend >= 0 ? 'default' : 'destructive'} className="text-sm">
                  {weeklySummary.trend >= 0 ? '+' : ''}{weeklySummary.trend}% vs sem. dernière
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Planning
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objectifs
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Progrès
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planning" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Sessions Plannifiées</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Session
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studySessions.map((session) => (
                <Card key={session.id} className={`transition-all hover:shadow-md ${session.completed ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(session.type)}
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                      </div>
                      {session.completed && <CheckCircle className="h-5 w-5 text-success" />}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(session.type)}>
                        {session.type.toUpperCase()}
                      </Badge>
                      <Badge className={getDifficultyColor(session.difficulty)}>
                        {session.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {session.duration} minutes
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {session.scheduled.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {!session.completed && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => startSession(session.id)}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Commencer
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Objectifs d'Étude</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvel Objectif
              </Button>
            </div>

            <div className="space-y-4">
              {studyGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          {goal.title}
                          <Badge className={getPriorityColor(goal.priority)}>
                            {goal.priority}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{goal.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progrès</span>
                        <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <Badge variant="outline">{goal.category}</Badge>
                      <span className="text-muted-foreground">
                        Échéance: {goal.targetDate.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <h2 className="text-2xl font-semibold">Suivi des Progrès</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sessions Complétées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">
                    {studySessions.filter(s => s.completed).length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    sur {studySessions.length} planifiées
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Temps d'Étude</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {Math.round(studySessions.filter(s => s.completed).reduce((acc, s) => acc + s.duration, 0) / 60)}h
                  </div>
                  <p className="text-sm text-muted-foreground">sessions complétées</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Objectifs Atteints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">
                    {studyGoals.filter(g => g.progress >= 100).length}/{studyGoals.length}
                  </div>
                  <p className="text-sm text-muted-foreground">objectifs définis</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par Type d'Activité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const total = studySessions.length || 1;
                  const ednCount = studySessions.filter(s => s.type === 'edn').length;
                  const musicCount = studySessions.filter(s => s.type === 'music').length;
                  const quizCount = studySessions.filter(s => s.type === 'quiz').length;
                  const revisionCount = studySessions.filter(s => s.type === 'revision').length;
                  const ednPct = Math.round((ednCount / total) * 100);
                  const musicPct = Math.round((musicCount / total) * 100);
                  const quizPct = Math.round((quizCount / total) * 100);
                  const revisionPct = Math.round((revisionCount / total) * 100);
                  
                  return (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Items EDN</span>
                          <span className="text-sm text-muted-foreground">{ednPct}%</span>
                        </div>
                        <Progress value={ednPct} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Musique</span>
                          <span className="text-sm text-muted-foreground">{musicPct}%</span>
                        </div>
                        <Progress value={musicPct} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Quiz</span>
                          <span className="text-sm text-muted-foreground">{quizPct}%</span>
                        </div>
                        <Progress value={quizPct} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Révision</span>
                          <span className="text-sm text-muted-foreground">{revisionPct}%</span>
                        </div>
                        <Progress value={revisionPct} className="h-2" />
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-semibold">Analytics d'Apprentissage</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance par Difficulté</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const easySessions = studySessions.filter(s => s.difficulty === 'easy');
                    const mediumSessions = studySessions.filter(s => s.difficulty === 'medium');
                    const hardSessions = studySessions.filter(s => s.difficulty === 'hard');
                    
                    const easyCompleted = easySessions.filter(s => s.completed).length;
                    const mediumCompleted = mediumSessions.filter(s => s.completed).length;
                    const hardCompleted = hardSessions.filter(s => s.completed).length;
                    
                    const easyPct = easySessions.length > 0 ? Math.round((easyCompleted / easySessions.length) * 100) : 0;
                    const mediumPct = mediumSessions.length > 0 ? Math.round((mediumCompleted / mediumSessions.length) * 100) : 0;
                    const hardPct = hardSessions.length > 0 ? Math.round((hardCompleted / hardSessions.length) * 100) : 0;
                    
                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-success rounded-full"></div>
                            Facile ({easySessions.length})
                          </span>
                          <span className="font-semibold">{easyPct}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-warning rounded-full"></div>
                            Moyen ({mediumSessions.length})
                          </span>
                          <span className="font-semibold">{mediumPct}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-destructive rounded-full"></div>
                            Difficile ({hardSessions.length})
                          </span>
                          <span className="font-semibold">{hardPct}%</span>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommandations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Augmentez les révisions</p>
                      <p className="text-xs text-muted-foreground">Recommandé pour améliorer la rétention</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Excellent rythme</p>
                      <p className="text-xs text-muted-foreground">Maintenez ce niveau d'activité</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Focus cardiologie</p>
                      <p className="text-xs text-muted-foreground">Domaine à approfondir prioritairement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default StudyPlanner;