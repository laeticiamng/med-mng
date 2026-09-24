import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Trophy,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExamQuestionReview {
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  itemCode: string;
}

interface ExamHistoryEntry {
  id: string;
  examType: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  date: string;
  duration: number;
  questions: ExamQuestionReview[];
}

// ---------------------------------------------------------------------------
// Sources de données réelles (vérifiées sur la base)
//
//   exam_history     : id, user_id, exam_type, score, total_questions,
//                      questions (jsonb), answers (jsonb), started_at,
//                      completed_at, created_at, time_limit_minutes
//   ai_exam_history  : mêmes colonnes + ai_generated
//
// Les tables `exam_results` (lue auparavant par ce composant) et `exam_rankings`
// n'existent PAS : PostgREST renvoie une 404 PGRST205. L'onglet « Classement »
// et la génération de données de démonstration ont donc été retirés — ils
// affichaient des examens et un rang entièrement inventés.
// Ni `specialty`, ni `correct_answers`, ni `duration` n'existent en base : la
// durée est calculée à partir de started_at/completed_at, le nombre de bonnes
// réponses est déduit du jsonb `answers`, et l'onglet « Spécialités » a été
// retiré faute de donnée.
// ---------------------------------------------------------------------------

const DATE_RANGES = [
  { value: 'all', label: 'Toutes les dates' },
  { value: '7', label: '7 derniers jours' },
  { value: '30', label: '30 derniers jours' },
  { value: '90', label: '3 derniers mois' },
  { value: '365', label: '12 derniers mois' },
];

const SCORE_RANGES = [
  { value: 'all', label: 'Tous les scores' },
  { value: '0-25', label: '0 – 25 %' },
  { value: '25-50', label: '25 – 50 %' },
  { value: '50-75', label: '50 – 75 %' },
  { value: '75-100', label: '75 – 100 %' },
];

interface StoredAnswer {
  selected?: number | number[];
  correct?: boolean;
  timeSpent?: number;
}

/** Libellé d'une option à partir de son index, quel que soit le format stocké. */
function optionLabel(options: unknown, index: unknown): string | null {
  if (!Array.isArray(options)) return null;
  if (typeof index !== 'number') return null;
  const value = options[index];
  return typeof value === 'string' ? value : null;
}

/** Réponse attendue : `correct_answer` (QCM simple) ou `correct_answers` (QCM multiple). */
function expectedAnswerLabel(question: Record<string, unknown>): string {
  const options = question.options;
  const single = optionLabel(options, question.correct_answer);
  if (single) return single;

  const multiple = question.correct_answers;
  if (Array.isArray(multiple)) {
    const labels = multiple
      .map((i) => optionLabel(options, i))
      .filter((l): l is string => Boolean(l));
    if (labels.length > 0) return labels.join(' + ');
  }
  return 'Non renseignée';
}

/** Réponse de l'utilisateur, telle qu'elle a été enregistrée. */
function givenAnswerLabel(question: Record<string, unknown>, answer?: StoredAnswer): string {
  const selected = answer?.selected;
  const options = question.options;

  if (Array.isArray(selected)) {
    const labels = selected
      .map((i) => optionLabel(options, i))
      .filter((l): l is string => Boolean(l));
    if (labels.length > 0) return labels.join(' + ');
  }

  const single = optionLabel(options, selected);
  if (single) return single;

  return 'Non répondu';
}

/** Transforme une ligne exam_history / ai_exam_history en entrée d'historique. */
function mapExamRow(row: Record<string, any>): ExamHistoryEntry {
  const answers: Record<string, StoredAnswer> =
    row.answers && typeof row.answers === 'object' && !Array.isArray(row.answers)
      ? (row.answers as Record<string, StoredAnswer>)
      : {};

  const rawQuestions: Record<string, any>[] = Array.isArray(row.questions) ? row.questions : [];

  const questions: ExamQuestionReview[] = rawQuestions.map((q, index) => {
    // L'examen standard fusionne la réponse dans la question, l'examen IA la
    // stocke uniquement dans `answers` : on accepte les deux.
    const answer: StoredAnswer | undefined =
      (q.userAnswer as StoredAnswer | undefined) ?? answers[String(q.id)];

    return {
      questionText:
        typeof q.question_text === 'string' ? q.question_text : `Question ${index + 1}`,
      userAnswer: givenAnswerLabel(q, answer),
      correctAnswer: expectedAnswerLabel(q),
      isCorrect: answer?.correct === true,
      explanation:
        typeof q.explanation === 'string' && q.explanation.trim()
          ? q.explanation
          : 'Aucune explication enregistrée pour cette question.',
      itemCode: typeof q.item_code === 'string' ? q.item_code : '',
    };
  });

  const totalQuestions =
    typeof row.total_questions === 'number' ? row.total_questions : rawQuestions.length;
  const score = typeof row.score === 'number' ? row.score : 0;

  // `correct_answers` n'existe pas en base : on compte les réponses marquées
  // correctes, et à défaut on le déduit du score.
  const answeredCorrect = Object.values(answers).filter((a) => a?.correct === true).length;
  const correctAnswers =
    Object.keys(answers).length > 0
      ? answeredCorrect
      : Math.round((score / 100) * totalQuestions);

  const date = row.completed_at ?? row.created_at ?? row.started_at ?? new Date().toISOString();

  // Durée réelle de la session, en secondes.
  let duration = 0;
  if (row.started_at && row.completed_at) {
    const delta =
      new Date(row.completed_at).getTime() - new Date(row.started_at).getTime();
    if (Number.isFinite(delta) && delta > 0) duration = Math.round(delta / 1000);
  }

  return {
    id: String(row.id),
    examType: typeof row.exam_type === 'string' && row.exam_type ? row.exam_type : 'standard',
    score,
    totalQuestions,
    correctAnswers,
    date,
    duration,
    questions,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Valeurs réellement écrites en base : 'standard' (useExamMode) et
// 'ai_generated' (useAIExam). Tout autre type est affiché tel quel.
function examTypeLabel(type: string): string {
  const map: Record<string, string> = {
    standard: 'Examen standard',
    ai_generated: 'Examen généré par IA',
    national_simulation: 'Simulation nationale',
  };
  return map[type] ?? type;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} min ${s.toString().padStart(2, '0')} s`;
}

function scoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (score >= 75) return 'default';
  if (score >= 50) return 'secondary';
  return 'destructive';
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface QuestionReviewCardProps {
  question: ExamQuestionReview;
  index: number;
}

const QuestionReviewCard: React.FC<QuestionReviewCardProps> = ({ question, index }) => {
  const borderClass = question.isCorrect
    ? 'border-l-4 border-l-green-500'
    : 'border-l-4 border-l-red-500';
  const bgClass = question.isCorrect ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className={`rounded-lg border p-4 ${borderClass} ${bgClass}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">
          {index + 1}. {question.questionText}
        </p>
        <Badge variant={question.isCorrect ? 'default' : 'destructive'} className="shrink-0">
          {question.isCorrect ? 'Correct' : 'Incorrect'}
        </Badge>
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <p>
          <span className="font-medium text-gray-600">Votre réponse :</span>{' '}
          <span className={question.isCorrect ? 'text-green-700' : 'text-red-700 line-through'}>
            {question.userAnswer}
          </span>
        </p>
        {!question.isCorrect && (
          <p>
            <span className="font-medium text-gray-600">Bonne réponse :</span>{' '}
            <span className="font-semibold text-green-700">{question.correctAnswer}</span>
          </p>
        )}
      </div>

      <div className="mt-3 rounded-md bg-white/70 p-3 text-sm text-gray-700">
        <p className="mb-1 font-medium text-gray-500">Explication :</p>
        <p>{question.explanation}</p>
      </div>

      <div className="mt-2">
        <a
          href={`/items/${question.itemCode.replace(/\s/g, '-').toLowerCase()}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
        >
          <Eye className="h-3 w-3" />
          Voir {question.itemCode}
        </a>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const ExamHistory: React.FC = React.memo(() => {
  const { toast } = useToast();

  // Data state
  const [history, setHistory] = useState<ExamHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);

  // Filter state
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');

  // Expanded corrections per exam id
  const [expandedExams, setExpandedExams] = useState<Record<string, boolean>>({});

  // --------------------------------------------------
  // Fetch data
  // --------------------------------------------------
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data: sessionUser } = await supabase.auth.getUser();

        if (!sessionUser?.user) {
          // Pas de session : pas d'historique. On ne fabrique rien.
          setAuthenticated(false);
          setHistory([]);
          return;
        }

        setAuthenticated(true);
        const userId = sessionUser.user.id;

        // Les deux tables d'historique réellement présentes en base.
        const [standard, ai] = await Promise.all([
          supabase
            .from('exam_history')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false }),
          supabase
            .from('ai_exam_history')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false }),
        ]);

        const firstError = standard.error ?? ai.error;
        if (firstError) throw firstError;

        const merged = [
          ...((standard.data ?? []) as Record<string, any>[]),
          ...((ai.data ?? []) as Record<string, any>[]),
        ]
          .map(mapExamRow)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setHistory(merged);
      } catch (err) {
        console.error("Erreur lors du chargement de l'historique :", err);
        // L'échec est signalé au lieu d'être masqué par des données fictives.
        setHistory([]);
        toast({
          title: 'Erreur',
          description:
            (err as Error)?.message ?? "Impossible de charger l'historique des examens.",
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------
  // Filtering
  // --------------------------------------------------
  // Les types proposés au filtre sont ceux réellement présents dans l'historique.
  const examTypeOptions = useMemo(() => {
    const types = Array.from(new Set(history.map((e) => e.examType))).sort();
    return [
      { value: 'all', label: "Tous les types" },
      ...types.map((t) => ({ value: t, label: examTypeLabel(t) })),
    ];
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      // Type filter
      if (typeFilter !== 'all' && entry.examType !== typeFilter) return false;

      // Date filter
      if (dateFilter !== 'all') {
        const daysAgo = parseInt(dateFilter, 10);
        const cutoff = subDays(new Date(), daysAgo);
        if (new Date(entry.date) < cutoff) return false;
      }

      // Score filter
      if (scoreFilter !== 'all') {
        const [minStr, maxStr] = scoreFilter.split('-');
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        if (entry.score < min || entry.score > max) return false;
      }

      return true;
    });
  }, [history, typeFilter, dateFilter, scoreFilter]);

  // --------------------------------------------------
  // Chart data: score progression
  // --------------------------------------------------
  const progressionData = useMemo(() => {
    return [...filteredHistory]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry) => ({
        date: format(new Date(entry.date), 'dd/MM/yy'),
        score: entry.score,
        type: examTypeLabel(entry.examType),
      }));
  }, [filteredHistory]);

  // --------------------------------------------------
  // Stats
  // --------------------------------------------------
  const stats = useMemo(() => {
    if (filteredHistory.length === 0)
      return { avgScore: 0, totalExams: 0, bestScore: 0, totalTime: 0 };
    const avgScore = Math.round(
      filteredHistory.reduce((s, e) => s + e.score, 0) / filteredHistory.length
    );
    const bestScore = Math.max(...filteredHistory.map((e) => e.score));
    const totalTime = filteredHistory.reduce((s, e) => s + e.duration, 0);
    return { avgScore, totalExams: filteredHistory.length, bestScore, totalTime };
  }, [filteredHistory]);

  // --------------------------------------------------
  // Expand / collapse helpers
  // --------------------------------------------------
  const toggleExam = (id: string) => {
    setExpandedExams((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Historique des examens</h2>
          <p className="text-sm text-muted-foreground">
            Consultez vos résultats passés et suivez votre progression
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Summary cards */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Examens passés
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalExams}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Score moyen
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.avgScore} %</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Meilleur score
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.bestScore} %</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Temps total
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Math.floor(stats.totalTime / 3600)} h{' '}
              {Math.floor((stats.totalTime % 3600) / 60)} min
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Filters */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Type d'examen
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  {examTypeOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Période
              </label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les dates" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Plage de score
              </label>
              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les scores" />
                </SelectTrigger>
                <SelectContent>
                  {SCORE_RANGES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Tabs */}
      {/* ------------------------------------------------------------------ */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="progression">Progression</TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* Tab : Liste */}
        {/* ============================================================== */}
        <TabsContent value="list" className="space-y-4">
          {filteredHistory.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  {!authenticated
                    ? 'Connectez-vous pour retrouver vos examens passés.'
                    : history.length === 0
                      ? "Vous n'avez pas encore passé d'examen. Votre historique apparaîtra ici."
                      : 'Aucun examen ne correspond aux filtres sélectionnés.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredHistory.map((entry) => {
              const isExpanded = expandedExams[entry.id] ?? false;

              return (
                <Card key={entry.id} className="overflow-hidden">
                  {/* Summary row */}
                  <button
                    type="button"
                    onClick={() => toggleExam(entry.id)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                      <Badge variant={scoreBadgeVariant(entry.score)}>
                        {entry.score} %
                      </Badge>
                      <span className="text-sm font-semibold">
                        {examTypeLabel(entry.examType)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {entry.correctAnswers}/{entry.totalQuestions} bonnes réponses
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(entry.duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {format(new Date(entry.date), 'dd/MM/yyyy HH:mm')}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded correction */}
                  {isExpanded && (
                    <CardContent className="border-t pt-4">
                      <h4 className="mb-3 text-sm font-semibold text-gray-700">
                        Correction détaillée
                      </h4>
                      <div className="space-y-3">
                        {entry.questions.map((q, qi) => (
                          <QuestionReviewCard key={qi} question={q} index={qi} />
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* ============================================================== */}
        {/* Tab : Progression */}
        {/* ============================================================== */}
        <TabsContent value="progression">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-primary" />
                Évolution des scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {progressionData.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Aucune donnée disponible pour les filtres sélectionnés.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={progressionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit=" %" />
                    <Tooltip
                      formatter={(value: number) => [`${value} %`, 'Score']}
                      labelFormatter={(label: string) => `Date : ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#3b82f6' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
});

ExamHistory.displayName = 'ExamHistory';

export default ExamHistory;
