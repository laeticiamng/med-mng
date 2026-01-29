import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePomodoroSessions } from '@/hooks/usePomodoroSessions';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3,
  BookOpen, 
  Coffee, 
  Edit2,
  Flame, 
  Pause, 
  Play, 
  RotateCcw, 
  Settings, 
  Timer,
  Trophy,
  Zap
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

const PRESETS = {
  classic: { work: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLong: 4 },
  extended: { work: 50, shortBreak: 10, longBreak: 30, sessionsBeforeLong: 2 },
  short: { work: 15, shortBreak: 3, longBreak: 10, sessionsBeforeLong: 4 },
};

const Pomodoro = () => {
  const { sessions, logSession, todayWorkSessions, todayMinutes } = usePomodoroSessions();
  const { stats, loadStats } = useGamification();
  const [preset, setPreset] = useState<'classic' | 'extended' | 'short'>('classic');
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [timeLeft, setTimeLeft] = useState(PRESETS.classic.work * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [taskName, setTaskName] = useState('Étude EDN');
  const [isEditingTask, setIsEditingTask] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const settings = PRESETS[preset];

  // Charger le streak dynamiquement
  useEffect(() => {
    const loadUserStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadStats(user.id);
      }
    };
    loadUserStats();
  }, [loadStats]);

  const streak = stats?.currentStreak || 0;

  const playNotification = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro terminé !', {
        body: sessionType === 'work' ? 'Temps de pause !' : 'Retour au travail !',
        icon: '/favicon.ico',
      });
    }
    toast.success(sessionType === 'work' ? '🎉 Session terminée !' : '⏰ Pause terminée !');
  }, [sessionType]);

  const handleSessionComplete = useCallback(() => {
    playNotification();
    
    if (sessionType === 'work') {
      // Log la session au backend
      logSession({
        session_type: 'work',
        duration_minutes: settings.work,
        task_name: taskName,
        preset,
        completed: true,
      });
      
      const newCompleted = completedSessions + 1;
      setCompletedSessions(newCompleted);
      
      if (newCompleted % settings.sessionsBeforeLong === 0) {
        setSessionType('long_break');
        setTimeLeft(settings.longBreak * 60);
      } else {
        setSessionType('short_break');
        setTimeLeft(settings.shortBreak * 60);
      }
    } else {
      setSessionType('work');
      setTimeLeft(settings.work * 60);
    }
    
    setIsRunning(false);
  }, [sessionType, completedSessions, settings, playNotification, taskName, preset, logSession]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleSessionComplete]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSessionType('work');
    setTimeLeft(settings.work * 60);
    setCompletedSessions(0);
  };

  const skipSession = () => {
    setIsRunning(false);
    handleSessionComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionDuration = () => {
    switch (sessionType) {
      case 'work': return settings.work * 60;
      case 'short_break': return settings.shortBreak * 60;
      case 'long_break': return settings.longBreak * 60;
    }
  };

  const progress = ((getSessionDuration() - timeLeft) / getSessionDuration()) * 100;

  return (
    <>
      <Helmet>
        <title>Pomodoro Timer | MED-MNG</title>
        <meta name="description" content="Améliorez votre productivité avec la technique Pomodoro. Sessions de travail focalisé et pauses optimisées pour les étudiants en médecine." />
        <meta name="keywords" content="pomodoro, productivité, timer, étude, concentration, médecine" />
        <link rel="canonical" href="/pomodoro" />
      </Helmet>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header avec streak dynamique */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Timer className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Pomodoro</h1>
            {streak > 0 && (
              <Badge variant="outline" className="gap-1 ml-2">
                <Flame className="h-3 w-3 text-orange-500" />
                {streak} jours
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Technique de productivité par sessions de travail focalisé
          </p>
        </div>

      {/* Main Timer */}
      <Card className={`max-w-md mx-auto overflow-hidden ${
        sessionType === 'work' 
          ? 'border-primary/50' 
          : 'border-success/50'
      }`}>
        <CardHeader className={`text-center ${
          sessionType === 'work' 
            ? 'bg-primary/10' 
            : 'bg-success/10'
        }`}>
          <div className="flex items-center justify-center gap-2">
            {sessionType === 'work' ? (
              <>
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Travail</CardTitle>
              </>
            ) : (
              <>
                <Coffee className="h-5 w-5 text-success" />
                <CardTitle>
                  {sessionType === 'short_break' ? 'Pause courte' : 'Pause longue'}
                </CardTitle>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{taskName}</p>
        </CardHeader>
        <CardContent className="pt-8 pb-6 space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-7xl font-mono font-bold tracking-tight">
              {formatTime(timeLeft)}
            </div>
            <Progress value={progress} className="mt-4 h-2" />
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={resetTimer}
              title="Réinitialiser"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              className="w-24 h-14 gap-2"
              onClick={toggleTimer}
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Start
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              size="icon"
              onClick={skipSession}
              title="Passer"
            >
              <Zap className="h-5 w-5" />
            </Button>
          </div>

          {/* Session Progress */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: settings.sessionsBeforeLong }).map((_, i) => (
              <div 
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < (completedSessions % settings.sessionsBeforeLong)
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Session {(completedSessions % settings.sessionsBeforeLong) + 1} / {settings.sessionsBeforeLong}
          </p>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="max-w-md mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-4 w-4" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Preset</span>
            <Select value={preset} onValueChange={(v) => {
              setPreset(v as typeof preset);
              setTimeLeft(PRESETS[v as typeof preset].work * 60);
              setIsRunning(false);
            }}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classique (25/5)</SelectItem>
                <SelectItem value="extended">Étendu (50/10)</SelectItem>
                <SelectItem value="short">Court (15/3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-muted">
              <p className="text-muted-foreground">Travail</p>
              <p className="font-bold">{settings.work}min</p>
            </div>
            <div className="p-2 rounded bg-muted">
              <p className="text-muted-foreground">Pause</p>
              <p className="font-bold">{settings.shortBreak}min</p>
            </div>
            <div className="p-2 rounded bg-muted">
              <p className="text-muted-foreground">Longue</p>
              <p className="font-bold">{settings.longBreak}min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center">
            <Flame className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{todayWorkSessions}</p>
            <p className="text-xs text-muted-foreground">Sessions aujourd'hui</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <Timer className="h-8 w-8 mx-auto text-success mb-2" />
            <p className="text-2xl font-bold">{todayMinutes}</p>
            <p className="text-xs text-muted-foreground">Minutes aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-8 w-8 mx-auto text-warning mb-2" />
            <p className="text-2xl font-bold">{completedSessions}</p>
            <p className="text-xs text-muted-foreground">Sessions session</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-8 w-8 mx-auto text-accent mb-2" />
            <p className="text-2xl font-bold">{Math.round(todayMinutes / 60)}h</p>
            <p className="text-xs text-muted-foreground">Heures cumulées</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Sessions */}
      {sessions.length > 0 && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Sessions du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions.slice(0, 5).map((session) => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-2 rounded bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {session.session_type === 'work' ? (
                      <BookOpen className="h-4 w-4 text-primary" />
                    ) : (
                      <Coffee className="h-4 w-4 text-success" />
                    )}
                    <span className="text-sm">{session.task_name}</span>
                  </div>
                  <Badge variant="outline">
                    {session.duration_minutes}min
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
};

export default Pomodoro;
