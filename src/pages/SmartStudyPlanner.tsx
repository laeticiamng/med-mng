import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ROUTE_PATHS } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { useSRS } from '@/hooks/useSRS';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertCircle,
    CheckCircle,
    ChevronLeft,
    Clock,
    Flame,
    Loader2, RefreshCw,
    Sparkles,
    Target,
    Trophy
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

interface StudySession {
  startTime: string;
  duration: number;
  type: 'new_learning' | 'srs_review' | 'exam_practice' | 'clinical_cases' | 'break';
  topic: string;
  itemCodes?: string[];
  priority: 'low' | 'medium' | 'high';
}

interface DayPlan {
  day: number;
  date: string;
  sessions: StudySession[];
  totalHours: number;
  focusAreas: string[];
}

interface StudyPlan {
  weekPlan: DayPlan[];
  recommendations: string[];
  priorityItems: string[];
}

const SESSION_COLORS: Record<string, string> = {
  new_learning: 'bg-primary/20 border-primary/40 text-primary',
  srs_review: 'bg-accent/20 border-accent/40 text-accent',
  exam_practice: 'bg-warning/20 border-warning/40 text-warning',
  clinical_cases: 'bg-success/20 border-success/40 text-success',
  break: 'bg-muted border-muted-foreground/20 text-muted-foreground',
};

const SESSION_LABELS: Record<string, string> = {
  new_learning: 'Nouvel apprentissage',
  srs_review: 'Révision SRS',
  exam_practice: 'Examen blanc',
  clinical_cases: 'Cas cliniques',
  break: 'Pause',
};

export default function SmartStudyPlanner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stats: srsStats, getStats: getSrsStats } = useSRS();
  const { _stats: gamificationStats, loadStats, _addPoints } = useGamification();
  const { logActivity } = useActivityTracking();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState([4]);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Connexion requise", variant: "destructive" });
        navigate(ROUTE_PATHS.medMngLogin);
        return;
      }
      setUser(user);
      getSrsStats(user.id);
      loadStats(user.id);
    };
    checkAuth();
  }, [navigate, toast, getSrsStats, loadStats]);

  const generatePlan = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { _data, error } = await supabase.functions.invoke('study-planner', {
        body: {
          userProgress: {
            masteredCount: srsStats?.masteredItems || 0,
            learningCount: srsStats?.learningItems || 0,
            dueCount: srsStats?.dueToday || 0,
          },
          examDate: examDate || null,
          availableHoursPerDay: hoursPerDay[0],
          weakTopics: [],
        }
      });

      if (error) throw error;
      
      if (_data.error) {
        toast({ title: "Erreur", description: _data.error, variant: "destructive" });
        return;
      }

      setPlan(_data);
      
      // Log activity and award points
      if (user) {
        await logActivity({ activity_type: 'study', metadata: { action: 'plan_generated' }, score: 100 });
        await _addPoints(user.id, 'itemReviewed');
      }
      
      toast({ title: "Planning généré", description: "Votre planning personnalisé est prêt ! (+10 XP)" });
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: "Erreur", 
        description: "Impossible de générer le planning. Réessayez plus tard.",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const currentDayPlan = plan?.weekPlan[selectedDay];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-warning/5">
      <Helmet>
        <title>Planning Intelligent | MED-MNG</title>
        <meta name="description" content="Planificateur d'études alimenté par l'IA" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with gamification stats */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-warning to-primary bg-clip-text text-transparent">
              Planning Intelligent
            </h1>
            <p className="text-muted-foreground">Optimisez vos révisions avec l'IA</p>
          </div>
          {gamificationStats && (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1 py-1">
                <Flame className="h-3 w-3 text-warning" />
                {gamificationStats.currentStreak || 0}j
              </Badge>
              <Badge variant="outline" className="gap-1 py-1">
                <Trophy className="h-3 w-3 text-primary" />
                Niv. {Math.floor((gamificationStats.totalPoints || 0) / 100) + 1}
              </Badge>
            </div>
          )}
        </div>

        {/* Configuration */}
        {!plan && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-warning" />
                Configurez votre planning
              </CardTitle>
              <CardDescription>
                L'IA analysera votre progression et créera un planning personnalisé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Date de l'examen (optionnel)</Label>
                  <Input 
                    type="date" 
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heures disponibles par jour: {hoursPerDay[0]}h</Label>
                  <Slider
                    value={hoursPerDay}
                    onValueChange={setHoursPerDay}
                    min={1}
                    max={10}
                    step={0.5}
                  />
                </div>
              </div>

              {/* Current stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{srsStats?.masteredItems || 0}</p>
                  <p className="text-xs text-muted-foreground">Items maîtrisés</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning">{srsStats?.learningItems || 0}</p>
                  <p className="text-xs text-muted-foreground">En apprentissage</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{srsStats?.dueToday || 0}</p>
                  <p className="text-xs text-muted-foreground">À réviser</p>
                </div>
              </div>

              <Button 
                onClick={generatePlan} 
                disabled={loading}
                className="w-full gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Générer mon planning personnalisé
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Generated Plan */}
        {plan && (
          <div className="space-y-6">
            {/* Week selector */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {plan.weekPlan.map((day, index) => (
                  <Button
                    key={index}
                    variant={selectedDay === index ? 'default' : 'outline'}
                    className="flex-col h-auto py-2 min-w-[80px]"
                    onClick={() => setSelectedDay(index)}
                  >
                    <span className="text-xs">Jour {day.day}</span>
                    <span className="text-[10px] opacity-70">
                      {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </span>
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPlan(null)} className="gap-1">
                <RefreshCw className="h-4 w-4" />
                Reconfigurer
              </Button>
            </div>

            {/* Day plan */}
            {currentDayPlan && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {new Date(currentDayPlan.date).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </CardTitle>
                      <CardDescription>
                        {currentDayPlan.totalHours}h de travail • {currentDayPlan.sessions.length} sessions
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {currentDayPlan.focusAreas.slice(0, 2).map((area, i) => (
                        <Badge key={i} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentDayPlan.sessions.map((session, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border-2 ${SESSION_COLORS[session.type]}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono">
                              {session.startTime}
                            </Badge>
                            <span className="font-medium">{SESSION_LABELS[session.type]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{session.duration} min</span>
                            <Badge variant={
                              session.priority === 'high' ? 'destructive' :
                              session.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {session.priority === 'high' ? 'Prioritaire' :
                               session.priority === 'medium' ? 'Important' : 'Normal'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm">{session.topic}</p>
                        {session.itemCodes && session.itemCodes.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {session.itemCodes.slice(0, 5).map((code, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {code}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {plan.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Recommandations IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Priority Items */}
            {plan.priorityItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-warning" />
                    Items prioritaires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {plan.priorityItems.map((item, i) => (
                      <Badge key={i} variant="outline" className="text-sm">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
