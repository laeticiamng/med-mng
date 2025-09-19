import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Timer, RefreshCw, TrendingUp, FileText } from 'lucide-react';
import { QuizManager } from '../quiz/QuizManager';
import { useQuizSessions } from '@/hooks/useQuizSessions';

interface AdvancedQuizInteractifProps {
  item: {
    id: string;
    title: string;
    quiz_questions?: any;
    item_code: string;
  };
  onProgress?: (progress: number) => void;
}

export const AdvancedQuizInteractif: React.FC<AdvancedQuizInteractifProps> = ({ item }) => {
  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    loadSessionsForItem,
    getStats,
  } = useQuizSessions();

  useEffect(() => {
    loadSessionsForItem(item.item_code);
  }, [item.item_code, loadSessionsForItem]);

  const stats = useMemo(() => getStats(), [sessions, getStats]);
  const lastSession = sessions[0] ?? null;

  const handleRefresh = () => {
    loadSessionsForItem(item.item_code);
  };

  const handleQuizSaved = () => {
    loadSessionsForItem(item.item_code);
  };

  return (
    <div id="section-quiz" className="space-y-6">
      <Card className="border-2 border-amber-200 bg-amber-50/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Trophy className="h-5 w-5" />
            QCM adaptatif – {item.title}
          </CardTitle>
          <CardDescription>
            Configurez un quiz OpenAI mixant Rang A/B, validez les questions générées puis suivez vos performances et
            corrections sauvegardées.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Skeleton className="h-12 w-full" />
            </div>
          ) : sessionsError ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {sessionsError}
            </div>
          ) : lastSession ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-white/60 bg-white/60 p-4">
                <div className="text-xs uppercase text-muted-foreground">Dernier score</div>
                <div className="mt-1 flex items-baseline gap-2 text-2xl font-semibold text-amber-900">
                  {lastSession.score}%
                  <Badge variant="secondary" className="uppercase">
                    {lastSession.rang.toUpperCase()}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(lastSession.created_at).toLocaleString('fr-FR')}
                </div>
              </div>
              <div className="rounded-lg border border-white/60 bg-white/60 p-4">
                <div className="text-xs uppercase text-muted-foreground">Temps passé</div>
                <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-amber-900">
                  <Timer className="h-4 w-4" />
                  {lastSession.time_spent_seconds
                    ? Math.round(lastSession.time_spent_seconds / 60)
                    : '—'}{' '}
                  min
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {lastSession.questions_count} questions · {lastSession.correct_answers} bonnes réponses
                </div>
              </div>
              <div className="rounded-lg border border-white/60 bg-white/60 p-4">
                <div className="text-xs uppercase text-muted-foreground">Tendance</div>
                <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-amber-900">
                  <TrendingUp className="h-4 w-4" />
                  {Math.round(stats.averageScore)}% moyenne
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {stats.totalSessions} sessions sauvegardées · meilleur score {stats.bestScore}%
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-amber-200 bg-white/60 p-4 text-sm text-muted-foreground">
              Aucun quiz sauvegardé pour le moment. Lancez une session pour suivre vos résultats et corrections.
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={sessionsLoading}>
              {sessionsLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Actualiser l'historique
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gestion du QCM et corrections
          </CardTitle>
          <CardDescription>
            Génération OpenAI, relecture manuelle et sauvegarde des scores/corrections dans Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuizManager item={item} onQuizSaved={handleQuizSaved} />
        </CardContent>
      </Card>

      <Card className="border border-muted/60 bg-muted/20">
        <CardHeader>
          <CardTitle>Historique des sessions</CardTitle>
          <CardDescription>Suivez vos dernières tentatives pour cet item EDN.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          {sessionsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-sm text-muted-foreground">Aucune session enregistrée pour l'instant.</div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-transparent bg-white/60 p-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {new Date(session.created_at).toLocaleString('fr-FR')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.questions_count} questions · {session.correct_answers} bonnes réponses
                    </div>
                  </div>
                  <Badge variant="outline">{session.score}%</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

