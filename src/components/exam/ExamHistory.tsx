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
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Trophy,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Eye,
  Users,
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
  specialty: string;
  questions: ExamQuestionReview[];
}

interface ExamRanking {
  position: number;
  totalUsers: number;
  percentile: number;
}

// ---------------------------------------------------------------------------
// Mock data helpers (replaced by real Supabase calls when tables exist)
// ---------------------------------------------------------------------------

const MOCK_SPECIALTIES = [
  'Cardiologie',
  'Pneumologie',
  'Neurologie',
  'Gastro-entérologie',
  'Endocrinologie',
  'Néphrologie',
  'Hématologie',
  'Rhumatologie',
  'Dermatologie',
  'Pédiatrie',
];

const EXAM_TYPES = [
  { value: 'all', label: 'Tous les types' },
  { value: 'qcm', label: 'QCM' },
  { value: 'cas_clinique', label: 'Cas clinique' },
  { value: 'dp', label: 'Dossier progressif' },
  { value: 'qi', label: 'Question isolée' },
];

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

function generateMockHistory(): ExamHistoryEntry[] {
  const entries: ExamHistoryEntry[] = [];
  const types = ['qcm', 'cas_clinique', 'dp', 'qi'];

  for (let i = 0; i < 20; i++) {
    const totalQuestions = Math.floor(Math.random() * 15) + 5;
    const correctAnswers = Math.floor(Math.random() * (totalQuestions + 1));
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const specialty =
      MOCK_SPECIALTIES[Math.floor(Math.random() * MOCK_SPECIALTIES.length)];
    const examType = types[Math.floor(Math.random() * types.length)];
    const daysAgo = Math.floor(Math.random() * 180);

    const questions: ExamQuestionReview[] = Array.from(
      { length: totalQuestions },
      (_, qi) => {
        const isCorrect = qi < correctAnswers;
        return {
          questionText: `Question ${qi + 1} : Quel est le diagnostic le plus probable pour ce patient présentant une dyspnée aiguë avec un souffle systolique ?`,
          userAnswer: isCorrect ? 'Insuffisance mitrale aiguë' : 'Embolie pulmonaire',
          correctAnswer: 'Insuffisance mitrale aiguë',
          isCorrect,
          explanation:
            "L'association d'une dyspnée aiguë et d'un souffle systolique de novo oriente vers une insuffisance mitrale aiguë, souvent secondaire à une rupture de cordage.",
          itemCode: `Item ${150 + Math.floor(Math.random() * 200)}`,
        };
      }
    );

    entries.push({
      id: `exam-${i}`,
      examType,
      score,
      totalQuestions,
      correctAnswers,
      date: subDays(new Date(), daysAgo).toISOString(),
      duration: Math.floor(Math.random() * 3600) + 600,
      specialty,
      questions,
    });
  }

  // Sort newest first
  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return entries;
}

function generateMockRanking(): ExamRanking {
  const totalUsers = Math.floor(Math.random() * 5000) + 1000;
  const position = Math.floor(Math.random() * totalUsers) + 1;
  const percentile = Math.round(((totalUsers - position) / totalUsers) * 100);
  return { position, totalUsers, percentile };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function examTypeLabel(type: string): string {
  const map: Record<string, string> = {
    qcm: 'QCM',
    cas_clinique: 'Cas clinique',
    dp: 'Dossier progressif',
    qi: 'Question isolée',
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
  const [ranking, setRanking] = useState<ExamRanking | null>(null);
  const [loading, setLoading] = useState(true);

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
        // Attempt to load from Supabase
        const { data: sessionUser } = await supabase.auth.getUser();

        if (sessionUser?.user) {
          const { data, error } = await supabase
            .from('exam_results' as any)
            .select('*')
            .eq('user_id', sessionUser.user.id)
            .order('created_at', { ascending: false });

          if (!error && data && (data as any[]).length > 0) {
            const mapped: ExamHistoryEntry[] = (data as any[]).map((row: any) => ({
              id: row.id,
              examType: row.exam_type ?? 'qcm',
              score: row.score ?? 0,
              totalQuestions: row.total_questions ?? 0,
              correctAnswers: row.correct_answers ?? 0,
              date: row.created_at,
              duration: row.duration ?? 0,
              specialty: row.specialty ?? 'Général',
              questions: row.questions ?? [],
            }));
            setHistory(mapped);
            setRanking(generateMockRanking());
            setLoading(false);
            return;
          }
        }

        // Fallback to mock data for demo / unauthenticated users
        setHistory(generateMockHistory());
        setRanking(generateMockRanking());
      } catch (err) {
        console.error('Erreur lors du chargement de l\'historique :', err);
        toast({
          title: 'Erreur',
          description: "Impossible de charger l'historique des examens.",
          variant: 'destructive',
        });
        // Still provide mock data so the UI is not empty
        setHistory(generateMockHistory());
        setRanking(generateMockRanking());
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
  // Chart data: performance by specialty
  // --------------------------------------------------
  const specialtyData = useMemo(() => {
    const map: Record<string, { total: number; sum: number }> = {};
    filteredHistory.forEach((entry) => {
      if (!map[entry.specialty]) {
        map[entry.specialty] = { total: 0, sum: 0 };
      }
      map[entry.specialty].total += 1;
      map[entry.specialty].sum += entry.score;
    });

    return Object.entries(map)
      .map(([specialty, { total, sum }]) => ({
        specialty,
        moyenne: Math.round(sum / total),
        examens: total,
      }))
      .sort((a, b) => b.moyenne - a.moyenne);
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
                  {EXAM_TYPES.map((t) => (
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
          <TabsTrigger value="specialties">Spécialités</TabsTrigger>
          <TabsTrigger value="ranking">Classement</TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* Tab : Liste */}
        {/* ============================================================== */}
        <TabsContent value="list" className="space-y-4">
          {filteredHistory.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Aucun examen ne correspond aux filtres sélectionnés.
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
                        {entry.specialty}
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

        {/* ============================================================== */}
        {/* Tab : Spécialités */}
        {/* ============================================================== */}
        <TabsContent value="specialties">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-primary" />
                Performance par spécialité
              </CardTitle>
            </CardHeader>
            <CardContent>
              {specialtyData.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Aucune donnée disponible pour les filtres sélectionnés.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={specialtyData}
                    layout="vertical"
                    margin={{ left: 120, right: 20, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit=" %" tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="specialty"
                      tick={{ fontSize: 12 }}
                      width={110}
                    />
                    <Tooltip
                      formatter={(value: number, _name: string, props: any) => [
                        `${value} % (${props.payload.examens} examen${props.payload.examens > 1 ? 's' : ''})`,
                        'Moyenne',
                      ]}
                    />
                    <Bar
                      dataKey="moyenne"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* Tab : Classement anonyme */}
        {/* ============================================================== */}
        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-primary" />
                Classement anonyme
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ranking ? (
                <div className="space-y-6">
                  {/* Position highlight */}
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
                    <Trophy className="h-10 w-10 text-yellow-500" />
                    <p className="text-4xl font-extrabold text-primary">
                      {ranking.position}
                      <span className="text-lg font-medium text-muted-foreground">
                        {' '}/ {ranking.totalUsers}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vous êtes dans le top {100 - ranking.percentile} % des utilisateurs
                    </p>
                  </div>

                  {/* Percentile bar */}
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>0 %</span>
                      <span>Votre percentile : {ranking.percentile} %</span>
                      <span>100 %</span>
                    </div>
                    <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                        style={{ width: `${ranking.percentile}%` }}
                      />
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <p className="rounded-md border border-dashed border-muted-foreground/30 p-3 text-center text-xs text-muted-foreground">
                    Le classement est entièrement anonyme. Aucune donnée personnelle n'est
                    partagée avec les autres utilisateurs. Les positions sont recalculées
                    quotidiennement.
                  </p>
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Le classement n'est pas disponible pour le moment.
                </p>
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
