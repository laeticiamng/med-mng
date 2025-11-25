import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Brain, ArrowLeft, Play, Pause, RotateCcw, Clock, Calendar, Smile, Meh, Frown, Sparkles, Wind, Heart, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';

type MeditationSession = {
  id: string;
  user_id: string;
  technique: string;
  duration: number;
  mood_before: number | null;
  mood_after: number | null;
  notes: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
};

const MEDITATION_TECHNIQUES = [
  { id: 'respiration', label: 'Respiration', icon: Wind, color: 'bg-blue-500', description: 'Concentration sur le souffle' },
  { id: 'body-scan', label: 'Body Scan', icon: Heart, color: 'bg-red-500', description: 'Scan corporel progressif' },
  { id: 'mindfulness', label: 'Pleine Conscience', icon: Sparkles, color: 'bg-purple-500', description: 'Observation sans jugement' },
  { id: 'relaxation', label: 'Relaxation', icon: Moon, color: 'bg-indigo-500', description: 'Relaxation profonde' },
  { id: 'gratitude', label: 'Gratitude', icon: Sun, color: 'bg-yellow-500', description: 'Pratique de la gratitude' },
];

const DURATION_OPTIONS = [5, 10, 15, 20, 30];

export default function MeditationSessions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Session state
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [selectedTechnique, setSelectedTechnique] = useState(MEDITATION_TECHNIQUES[0]);
  const [moodBefore, setMoodBefore] = useState(5);
  const [moodAfter, setMoodAfter] = useState(5);
  const [notes, setNotes] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);

  // Fetch sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['meditation-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as MeditationSession[];
    },
    enabled: !!user?.id
  });

  // Calculate statistics
  const stats = {
    totalSessions: sessions?.length || 0,
    totalMinutes: sessions?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0,
    averageMood: sessions?.length ?
      sessions.reduce((acc, s) => acc + ((s.mood_after || 0) - (s.mood_before || 0)), 0) / sessions.length : 0,
    streak: calculateStreak(sessions || []),
  };

  function calculateStreak(sessions: MeditationSession[]) {
    if (!sessions.length) return 0;
    const sortedSessions = [...sessions].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.created_at);
      sessionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }
    return streak;
  }

  // Create session mutation
  const createSession = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('meditation_sessions')
        .insert({
          user_id: user.id,
          technique: selectedTechnique.id,
          duration: selectedDuration,
          mood_before: moodBefore,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.id);
      setTimeLeft(selectedDuration * 60);
      setIsRunning(true);
      setShowStartDialog(false);
      queryClient.invalidateQueries({ queryKey: ['meditation-sessions'] });
    },
  });

  // Complete session mutation
  const completeSession = useMutation({
    mutationFn: async () => {
      if (!currentSessionId) throw new Error('No session in progress');
      const { error } = await supabase
        .from('meditation_sessions')
        .update({
          mood_after: moodAfter,
          notes: notes || null,
          completed_at: new Date().toISOString(),
        })
        .eq('id', currentSessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      setShowCompletionDialog(false);
      setCurrentSessionId(null);
      setNotes('');
      setMoodBefore(5);
      setMoodAfter(5);
      queryClient.invalidateQueries({ queryKey: ['meditation-sessions'] });
    },
  });

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowCompletionDialog(true);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleStartSession = () => {
    setShowStartDialog(true);
  };

  const handleConfirmStart = () => {
    createSession.mutate();
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setShowCompletionDialog(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 7) return <Smile className="w-5 h-5 text-green-500" />;
    if (mood >= 4) return <Meh className="w-5 h-5 text-yellow-500" />;
    return <Frown className="w-5 h-5 text-red-500" />;
  };

  const progress = selectedDuration > 0 ? ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100 : 0;

  return (
    <>
      <Helmet>
        <title>Sessions de Meditation | Med-Mng</title>
        <meta name="description" content="Pratiquez la meditation guidee pour votre bien-etre" />
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
            <Brain className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold">Meditation</h1>
              <p className="text-muted-foreground">Prenez soin de votre esprit</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Brain className="w-5 h-5 text-green-600" />
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMinutes}</p>
                  <p className="text-xs text-muted-foreground">Minutes meditees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.streak}</p>
                  <p className="text-xs text-muted-foreground">Jours consecutifs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Smile className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+{stats.averageMood.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Humeur moyenne</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {currentSessionId ? (
          // Active Session
          <Card className="mb-8">
            <CardHeader className="bg-green-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <selectedTechnique.icon className="w-5 h-5 text-green-600" />
                    {selectedTechnique.label}
                  </CardTitle>
                  <CardDescription>{selectedTechnique.description}</CardDescription>
                </div>
                <Badge className="bg-green-600">
                  {isRunning ? 'En cours' : 'En pause'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="text-8xl font-mono font-bold mb-4 text-green-600">
                  {formatTime(timeLeft)}
                </div>
                <Progress value={progress} className="h-3 mb-4" />
                <p className="text-muted-foreground">
                  Session de {selectedDuration} minutes
                </p>
              </div>

              <div className="flex justify-center gap-4">
                {isRunning ? (
                  <Button size="lg" variant="outline" onClick={handlePause}>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={handleResume}>
                    <Play className="w-5 h-5 mr-2" />
                    Reprendre
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={handleStop}>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Terminer
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Session Setup
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Choisir une technique</CardTitle>
                  <CardDescription>Selectionnez la technique de meditation adaptee a vos besoins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MEDITATION_TECHNIQUES.map((technique) => (
                      <Card
                        key={technique.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedTechnique.id === technique.id ? 'ring-2 ring-green-500' : ''
                        }`}
                        onClick={() => setSelectedTechnique(technique)}
                      >
                        <CardContent className="p-4">
                          <div className={`w-10 h-10 ${technique.color} rounded-lg flex items-center justify-center mb-3`}>
                            <technique.icon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold mb-1">{technique.label}</h3>
                          <p className="text-sm text-muted-foreground">{technique.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Duree de la session</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 flex-wrap">
                    {DURATION_OPTIONS.map((duration) => (
                      <Button
                        key={duration}
                        variant={selectedDuration === duration ? 'default' : 'outline'}
                        className={selectedDuration === duration ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => setSelectedDuration(duration)}
                      >
                        {duration} min
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6">
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={handleStartSession}>
                  <Play className="w-5 h-5 mr-2" />
                  Commencer la meditation
                </Button>
              </div>
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
                      {sessions.slice(0, 5).map((session) => {
                        const technique = MEDITATION_TECHNIQUES.find(t => t.id === session.technique);
                        return (
                          <div key={session.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{technique?.label || session.technique}</span>
                              <div className="flex items-center gap-1">
                                {getMoodIcon(session.mood_before || 5)}
                                <span className="text-xs text-muted-foreground">-&gt;</span>
                                {getMoodIcon(session.mood_after || 5)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{session.duration} min</span>
                              <span>-</span>
                              <span>
                                {new Date(session.created_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
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
        )}

        {/* Start Dialog */}
        <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Comment vous sentez-vous ?</DialogTitle>
              <DialogDescription>
                Evaluez votre humeur avant de commencer la meditation
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="flex items-center justify-between mb-4">
                <Frown className="w-6 h-6 text-red-500" />
                <Slider
                  value={[moodBefore]}
                  onValueChange={([value]) => setMoodBefore(value)}
                  max={10}
                  min={1}
                  step={1}
                  className="mx-4 flex-1"
                />
                <Smile className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-center text-2xl font-bold">{moodBefore}/10</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStartDialog(false)}>
                Annuler
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleConfirmStart}>
                <Play className="w-4 h-4 mr-2" />
                Demarrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Completion Dialog */}
        <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Session terminee</DialogTitle>
              <DialogDescription>
                Comment vous sentez-vous apres cette meditation ?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Humeur apres la session</label>
                <div className="flex items-center justify-between mb-2">
                  <Frown className="w-6 h-6 text-red-500" />
                  <Slider
                    value={[moodAfter]}
                    onValueChange={([value]) => setMoodAfter(value)}
                    max={10}
                    min={1}
                    step={1}
                    className="mx-4 flex-1"
                  />
                  <Smile className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-center text-xl font-bold">{moodAfter}/10</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optionnel)</label>
                <Textarea
                  placeholder="Comment s'est passee cette session ?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => completeSession.mutate()}
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
