import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Target, ArrowLeft, Plus, Play, Pause, RotateCcw, Clock, Calendar, TrendingUp, Zap, Coffee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';

type FocusSession = {
  id: string;
  user_id: string;
  mode: string;
  duration_minutes: number;
  pomodoro_duration: number;
  break_duration: number;
  pomodoros_completed: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  start_tempo: number;
  peak_tempo: number;
  end_tempo: number;
  tracks_generated: number | null;
};

const POMODORO_PRESETS = [
  { label: '25/5 (Classique)', work: 25, break: 5 },
  { label: '50/10 (Long)', work: 50, break: 10 },
  { label: '15/3 (Court)', work: 15, break: 3 },
  { label: '90/20 (Deep Work)', work: 90, break: 20 },
];

export default function FocusSessions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Fetch sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['focus-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as FocusSession[];
    },
    enabled: !!user?.id
  });

  // Calculate statistics
  const stats = {
    totalSessions: sessions?.length || 0,
    totalMinutes: sessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0,
    totalPomodoros: sessions?.reduce((acc, s) => acc + (s.pomodoros_completed || 0), 0) || 0,
    completedToday: sessions?.filter(s => {
      if (!s.completed_at) return false;
      const today = new Date().toDateString();
      return new Date(s.completed_at).toDateString() === today;
    }).length || 0,
  };

  // Create session mutation
  const createSession = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: user.id,
          mode: 'pomodoro',
          duration_minutes: workDuration,
          pomodoro_duration: workDuration,
          break_duration: breakDuration,
          started_at: new Date().toISOString(),
          pomodoros_completed: 0,
          start_tempo: 120,
          peak_tempo: 140,
          end_tempo: 100,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.id);
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
    },
  });

  // Update session mutation
  const updateSession = useMutation({
    mutationFn: async ({ id, pomodoros }: { id: string; pomodoros: number }) => {
      const { error } = await supabase
        .from('focus_sessions')
        .update({
          pomodoros_completed: pomodoros,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
    },
  });

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      if (!isBreak) {
        // Work session completed
        const newPomodoros = pomodorosCompleted + 1;
        setPomodorosCompleted(newPomodoros);

        if (currentSessionId) {
          updateSession.mutate({ id: currentSessionId, pomodoros: newPomodoros });
        }

        // Start break
        setIsBreak(true);
        setTimeLeft(breakDuration * 60);
      } else {
        // Break completed, start new work session
        setIsBreak(false);
        setTimeLeft(workDuration * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, workDuration, breakDuration, pomodorosCompleted, currentSessionId]);

  const handleStart = useCallback(() => {
    if (!isRunning && !currentSessionId) {
      createSession.mutate();
    }
    setIsRunning(true);
  }, [isRunning, currentSessionId, createSession]);

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workDuration * 60);
    setPomodorosCompleted(0);
    setCurrentSessionId(null);
  };

  const handlePresetChange = (preset: string) => {
    const selected = POMODORO_PRESETS.find(p => p.label === preset);
    if (selected) {
      setWorkDuration(selected.work);
      setBreakDuration(selected.break);
      setTimeLeft(selected.work * 60);
      setIsRunning(false);
      setIsBreak(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak
    ? ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100
    : ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100;

  return (
    <>
      <Helmet>
        <title>Sessions de Focus | Med-Mng</title>
        <meta name="description" content="Timer Pomodoro pour vos sessions de focus et d'etude" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <Link to={ROUTE_PATHS.sessions}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold">Sessions de Focus</h1>
              <p className="text-muted-foreground">Timer Pomodoro pour maximiser votre concentration</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMinutes}</p>
                  <p className="text-xs text-muted-foreground">Minutes totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPomodoros}</p>
                  <p className="text-xs text-muted-foreground">Pomodoros completes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                  <p className="text-xs text-muted-foreground">Sessions totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completedToday}</p>
                  <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className={`${isBreak ? 'bg-green-50' : 'bg-purple-50'} border-b`}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {isBreak ? (
                        <>
                          <Coffee className="w-5 h-5 text-green-600" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 text-purple-600" />
                          Focus
                        </>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {isBreak ? 'Prenez une pause bien meritee' : 'Concentrez-vous sur votre tache'}
                    </CardDescription>
                  </div>
                  <Badge variant={isBreak ? 'default' : 'secondary'} className={isBreak ? 'bg-green-600' : 'bg-purple-600'}>
                    {pomodorosCompleted} pomodoro{pomodorosCompleted !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                {/* Timer Display */}
                <div className="text-center mb-8">
                  <div className={`text-8xl font-mono font-bold mb-4 ${isBreak ? 'text-green-600' : 'text-purple-600'}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <Progress value={progress} className="h-3 mb-4" />
                  <p className="text-muted-foreground">
                    {isBreak ? `Pause de ${breakDuration} minutes` : `Session de ${workDuration} minutes`}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mb-8">
                  {!isRunning ? (
                    <Button
                      size="lg"
                      onClick={handleStart}
                      className={isBreak ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {currentSessionId ? 'Reprendre' : 'Demarrer'}
                    </Button>
                  ) : (
                    <Button size="lg" variant="outline" onClick={handlePause}>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button size="lg" variant="outline" onClick={handleReset}>
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reinitialiser
                  </Button>
                </div>

                {/* Preset Selection */}
                <div className="max-w-xs mx-auto">
                  <label className="text-sm font-medium mb-2 block">Preset Pomodoro</label>
                  <Select onValueChange={handlePresetChange} defaultValue={POMODORO_PRESETS[0].label}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POMODORO_PRESETS.map((preset) => (
                        <SelectItem key={preset.label} value={preset.label}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sessions recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : sessions && sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{session.mode}</span>
                          <Badge variant="outline" className="text-xs">
                            {session.pomodoros_completed || 0} pomodoros
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{session.duration_minutes} min</span>
                          <span>-</span>
                          <span>
                            {session.created_at ? new Date(session.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune session encore
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
