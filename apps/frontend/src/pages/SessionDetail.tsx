import { Helmet } from 'react-helmet-async';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowLeft, Clock, Calendar, Target, Brain, TrendingUp, Smile, Meh, Frown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

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
};

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

export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const sessionType = searchParams.get('type') || 'focus';
  const { user } = useAuth();

  // Fetch focus session
  const { data: focusSession, isLoading: focusLoading } = useQuery({
    queryKey: ['focus-session', sessionId],
    queryFn: async () => {
      if (!sessionId || !user?.id) return null;
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as FocusSession | null;
    },
    enabled: !!sessionId && !!user?.id && sessionType === 'focus'
  });

  // Fetch meditation session
  const { data: meditationSession, isLoading: meditationLoading } = useQuery({
    queryKey: ['meditation-session', sessionId],
    queryFn: async () => {
      if (!sessionId || !user?.id) return null;
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as MeditationSession | null;
    },
    enabled: !!sessionId && !!user?.id && sessionType === 'meditation'
  });

  const isLoading = focusLoading || meditationLoading;
  const session = sessionType === 'focus' ? focusSession : meditationSession;

  const getMoodIcon = (mood: number | null) => {
    if (!mood) return <Meh className="w-6 h-6 text-gray-400" />;
    if (mood >= 7) return <Smile className="w-6 h-6 text-green-500" />;
    if (mood >= 4) return <Meh className="w-6 h-6 text-yellow-500" />;
    return <Frown className="w-6 h-6 text-red-500" />;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (start: string | null, end: string | null) => {
    if (!start) return 0;
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    return Math.round((endTime - startTime) / 1000 / 60);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-64 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to={ROUTE_PATHS.sessions}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Session introuvable</h2>
            <p className="text-muted-foreground mb-4">
              Cette session n'existe pas ou vous n'avez pas les droits pour la consulter.
            </p>
            <Link to={ROUTE_PATHS.sessions}>
              <Button>Retour aux sessions</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render Focus Session
  if (sessionType === 'focus' && focusSession) {
    const actualDuration = calculateDuration(focusSession.started_at, focusSession.completed_at);
    const completionRate = focusSession.duration_minutes > 0
      ? Math.min(100, (actualDuration / focusSession.duration_minutes) * 100)
      : 0;

    return (
      <>
        <Helmet>
          <title>Session Focus | Med-Mng</title>
        </Helmet>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to={ROUTE_PATHS.focusSessions}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux sessions de focus
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <Target className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold">Session de Focus</h1>
              <p className="text-muted-foreground">
                {formatDate(focusSession.started_at || focusSession.created_at)}
              </p>
            </div>
            <Badge className={focusSession.completed_at ? 'bg-green-600' : 'bg-yellow-600'}>
              {focusSession.completed_at ? 'Terminee' : 'En cours'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Duree
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {actualDuration} min
                </div>
                <p className="text-sm text-muted-foreground">
                  sur {focusSession.duration_minutes} min prevues
                </p>
                <Progress value={completionRate} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Pomodoros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {focusSession.pomodoros_completed || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  pomodoros completes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mode</span>
                    <span className="font-medium capitalize">{focusSession.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duree pomodoro</span>
                    <span className="font-medium">{focusSession.pomodoro_duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duree pause</span>
                    <span className="font-medium">{focusSession.break_duration} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Horaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Debut</span>
                    <span className="font-medium">
                      {focusSession.started_at
                        ? new Date(focusSession.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fin</span>
                    <span className="font-medium">
                      {focusSession.completed_at
                        ? new Date(focusSession.completed_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                        : 'En cours'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // Render Meditation Session
  if (sessionType === 'meditation' && meditationSession) {
    const moodChange = (meditationSession.mood_after || 0) - (meditationSession.mood_before || 0);

    return (
      <>
        <Helmet>
          <title>Session de Meditation | Med-Mng</title>
        </Helmet>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to={ROUTE_PATHS.meditationSessions}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux sessions de meditation
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold">Session de Meditation</h1>
              <p className="text-muted-foreground">
                {formatDate(meditationSession.started_at || meditationSession.created_at)}
              </p>
            </div>
            <Badge className={meditationSession.completed_at ? 'bg-green-600' : 'bg-yellow-600'}>
              {meditationSession.completed_at ? 'Terminee' : 'En cours'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Duree
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {meditationSession.duration} min
                </div>
                <p className="text-sm text-muted-foreground">
                  de meditation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  Technique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 mb-2 capitalize">
                  {meditationSession.technique.replace('-', ' ')}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  Evolution de l'humeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Avant</p>
                    {getMoodIcon(meditationSession.mood_before)}
                    <p className="text-2xl font-bold mt-2">{meditationSession.mood_before || '-'}/10</p>
                  </div>
                  <div className="text-4xl text-muted-foreground">-&gt;</div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Apres</p>
                    {getMoodIcon(meditationSession.mood_after)}
                    <p className="text-2xl font-bold mt-2">{meditationSession.mood_after || '-'}/10</p>
                  </div>
                  <div className="ml-8 text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Changement</p>
                    <p className={`text-3xl font-bold ${moodChange > 0 ? 'text-green-600' : moodChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {moodChange > 0 ? '+' : ''}{moodChange}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {meditationSession.notes && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {meditationSession.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </>
    );
  }

  return null;
}
