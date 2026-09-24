import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification, POINTS_CONFIG } from '@/hooks/useGamification';
import { Helmet } from 'react-helmet-async';
import confetti from 'canvas-confetti';
import {
  Play, Clock, AlertTriangle, CheckCircle, XCircle,
  Shield, Trophy, Target, Brain, Loader2, ArrowLeft,
  Timer, BarChart3, TrendingUp, Award, Users,
  Zap, Medal, Crown, ChevronRight, Lock,
} from 'lucide-react';

interface ExamQuestion {
  id: string;
  item_code: string;
  specialty: string;
  rang: 'A' | 'B';
  question_text: string;
  options: string[];
  correct_answers: number[];
  explanation: string;
  coefficient: number;
}

interface ExamAnswer {
  questionId: string;
  selectedAnswers: number[];
  timeSpent: number;
  isCorrect: boolean;
}

type ExamPhase = 'intro' | 'generating' | 'active' | 'results';

interface NationalRanking {
  percentile: number;
  rank: number;
  totalCandidates: number;
  medal: 'gold' | 'silver' | 'bronze' | 'none';
  scoreWeighted: number;
  rangAScore: number;
  rangBScore: number;
  specialtyBreakdown: { specialty: string; score: number; total: number }[];
}

const NationalExamSimulation: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();
  const { addPoints, unlockBadge } = useGamification();

  const [phase, setPhase] = useState<ExamPhase>('intro');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(180 * 60 * 1000); // 3h in ms
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [ranking, setRanking] = useState<NationalRanking | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const endTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/med-mng/login');
        return;
      }
      setUser(user);
    });
  }, [navigate]);

  // Timer
  useEffect(() => {
    if (phase !== 'active' || !endTimeRef.current) return;
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, endTimeRef.current! - Date.now());
      setTimeRemaining(remaining);
      if (remaining === 0) {
        handleAutoComplete();
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startExam = async () => {
    if (!user) return;
    setPhase('generating');
    setGenerationProgress(0);

    // Simulate generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + 2, 95));
    }, 800);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-national-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ userId: user.id, questionCount: 120 }),
      });

      clearInterval(progressInterval);

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur de génération');
      }

      const data = await resp.json();
      setQuestions(data.questions || []);
      setSessionId(data.sessionId);
      setGenerationProgress(100);

      // Start exam after brief pause
      setTimeout(() => {
        endTimeRef.current = Date.now() + 180 * 60 * 1000;
        setPhase('active');
        setQuestionStartTime(Date.now());
      }, 500);
    } catch (e) {
      clearInterval(progressInterval);
      toast({
        title: 'Erreur',
        description: e instanceof Error ? e.message : 'Impossible de générer l\'examen',
        variant: 'destructive',
      });
      setPhase('intro');
    }
  };

  const toggleAnswer = (index: number) => {
    setSelectedAnswers(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const submitAnswer = useCallback(() => {
    if (selectedAnswers.length === 0) return;
    const q = questions[currentIndex];
    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = selectedAnswers.length === q.correct_answers.length &&
      selectedAnswers.every(a => q.correct_answers.includes(a));

    const answer: ExamAnswer = {
      questionId: q.id,
      selectedAnswers: [...selectedAnswers],
      timeSpent,
      isCorrect,
    };

    setAnswers(prev => [...prev, answer]);

    // NO BACKTRACK: move to next or complete
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswers([]);
      setQuestionStartTime(Date.now());
    } else {
      completeExam([...answers, answer]);
    }
  }, [selectedAnswers, currentIndex, questions, questionStartTime, answers]);

  const handleAutoComplete = useCallback(() => {
    // Auto-submit remaining as unanswered
    const remainingAnswers: ExamAnswer[] = [];
    for (let i = answers.length; i < questions.length; i++) {
      remainingAnswers.push({
        questionId: questions[i].id,
        selectedAnswers: [],
        timeSpent: 0,
        isCorrect: false,
      });
    }
    completeExam([...answers, ...remainingAnswers]);
  }, [answers, questions]);

  const completeExam = async (allAnswers: ExamAnswer[]) => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate scores
    const correctCount = allAnswers.filter(a => a.isCorrect).length;
    const totalScore = Math.round((correctCount / questions.length) * 100);

    // Weighted score by coefficient
    let weightedCorrect = 0;
    let totalWeight = 0;
    const specialtyMap = new Map<string, { correct: number; total: number }>();

    questions.forEach((q, i) => {
      const answer = allAnswers[i];
      const coeff = q.coefficient || (q.rang === 'A' ? 1.0 : 0.5);
      totalWeight += coeff;
      if (answer?.isCorrect) weightedCorrect += coeff;

      const spec = specialtyMap.get(q.specialty) || { correct: 0, total: 0 };
      spec.total++;
      if (answer?.isCorrect) spec.correct++;
      specialtyMap.set(q.specialty, spec);
    });

    const weightedScore = Math.round((weightedCorrect / totalWeight) * 100);

    // Rang A / B breakdown
    const rangAQs = questions.filter(q => q.rang === 'A');
    const rangBQs = questions.filter(q => q.rang === 'B');
    const rangACorrect = rangAQs.filter((q, i) => {
      const qIdx = questions.indexOf(q);
      return allAnswers[qIdx]?.isCorrect;
    }).length;
    const rangBCorrect = rangBQs.filter((q) => {
      const qIdx = questions.indexOf(q);
      return allAnswers[qIdx]?.isCorrect;
    }).length;

    // Simulate national ranking (Gaussian distribution simulation)
    const simulatePercentile = (score: number): number => {
      // EDN averages ~55-65%, with std dev ~12%
      const mean = 58;
      const stdDev = 12;
      const z = (score - mean) / stdDev;
      // Approximate CDF of normal distribution
      const t = 1 / (1 + 0.2316419 * Math.abs(z));
      const d = 0.3989422804 * Math.exp(-z * z / 2);
      const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
      return Math.round((z > 0 ? 1 - p : p) * 100);
    };

    const percentile = simulatePercentile(weightedScore);
    const totalCandidates = 9847; // Simulated cohort size
    const rank = Math.max(1, Math.round((1 - percentile / 100) * totalCandidates));

    let medal: 'gold' | 'silver' | 'bronze' | 'none';
    if (percentile >= 95) medal = 'gold';
    else if (percentile >= 80) medal = 'silver';
    else if (percentile >= 60) medal = 'bronze';
    else medal = 'none';

    const specialtyBreakdown = Array.from(specialtyMap.entries()).map(([specialty, stats]) => ({
      specialty,
      score: Math.round((stats.correct / stats.total) * 100),
      total: stats.total,
    })).sort((a, b) => b.total - a.total);

    const rankingResult: NationalRanking = {
      percentile,
      rank,
      totalCandidates,
      medal,
      scoreWeighted: weightedScore,
      rangAScore: rangAQs.length > 0 ? Math.round((rangACorrect / rangAQs.length) * 100) : 0,
      rangBScore: rangBQs.length > 0 ? Math.round((rangBCorrect / rangBQs.length) * 100) : 0,
      specialtyBreakdown,
    };

    setRanking(rankingResult);
    setPhase('results');

    // Save to DB
    if (sessionId) {
      await (supabase as any).from('ai_exam_history').update({
        completed_at: new Date().toISOString(),
        score: weightedScore,
        answers: allAnswers,
      }).eq('id', sessionId);
    }

    // Gamification
    if (user) {
      await addPoints(user.id, POINTS_CONFIG.examCompleted * 3, 'examCompleted');
      if (weightedScore === 100) {
        await addPoints(user.id, POINTS_CONFIG.perfectExam, 'perfectExam');
        await unlockBadge(user.id, 'perfect_exam');
      }
      if (percentile >= 95) {
        await unlockBadge(user.id, 'top_5_national');
      }
      await logActivity({
        activity_type: 'exam',
        count: 1,
        score: weightedScore,
        duration_seconds: Math.round((180 * 60 * 1000 - timeRemaining) / 1000),
        metadata: { exam_type: 'national_simulation', percentile, rank, questions: questions.length },
      });
    }

    // Confetti for good results
    if (percentile >= 60) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  };

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;
  const isTimeCritical = timeRemaining < 15 * 60 * 1000; // last 15 min

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Examen Blanc National EDN | MED-MNG</title>
        <meta name="description" content="Simulation d'examen blanc EDN en conditions réelles : 120 questions, 3 heures, classement national simulé." />
      </Helmet>

      {/* INTRO PHASE */}
      {phase === 'intro' && (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Button>

          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Examen Blanc National EDN
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Conditions réelles de l'examen. Pas de retour en arrière.
              Ton score sera comparé à une cohorte nationale simulée.
            </p>
          </div>

          {/* Rules */}
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Règles de l'examen
              </h2>
              <div className="grid gap-3 text-sm">
                {[
                  { icon: Brain, label: '120 questions QCM', desc: '70% Rang A • 30% Rang B • Toutes spécialités' },
                  { icon: Timer, label: '3 heures chronométrées', desc: 'Timer strict, soumission auto à expiration' },
                  { icon: Lock, label: 'Pas de retour arrière', desc: 'Chaque réponse est définitive, comme au vrai examen' },
                  { icon: Trophy, label: 'Classement national simulé', desc: 'Percentile et rang parmi ~10 000 candidats simulés' },
                  { icon: BarChart3, label: 'Score pondéré', desc: 'Coefficient ×1.0 Rang A • ×0.5 Rang B' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              size="lg"
              onClick={startExam}
              className="gap-2 text-lg px-10 py-6 rounded-2xl"
            >
              <Play className="w-6 h-6" />
              Commencer l'examen
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Assure-toi d'avoir 3 heures devant toi sans interruption.
            </p>
          </div>
        </div>
      )}

      {/* GENERATING PHASE */}
      {phase === 'generating' && (
        <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          >
            <Brain className="w-16 h-16 text-primary mx-auto" />
          </motion.div>
          <h2 className="text-xl font-bold text-foreground">Génération de l'examen</h2>
          <p className="text-muted-foreground">
            120 questions générées par IA à partir du référentiel EDN...
          </p>
          <div className="space-y-2">
            <Progress value={generationProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">{generationProgress}%</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Cela peut prendre 1 à 2 minutes
          </p>
        </div>
      )}

      {/* ACTIVE EXAM PHASE */}
      {phase === 'active' && currentQ && (
        <div className="flex flex-col min-h-screen">
          {/* Sticky header with timer */}
          <div className={cn(
            'sticky top-0 z-50 border-b backdrop-blur-xl',
            isTimeCritical ? 'bg-destructive/10 border-destructive/30' : 'bg-background/80 border-border/50'
          )}>
            <div className="max-w-3xl mx-auto px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    Q{currentIndex + 1}/{questions.length}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    currentQ.rang === 'A' ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-400'
                  )}>
                    Rang {currentQ.rang}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {currentQ.specialty}
                  </span>
                </div>
                <div className={cn(
                  'flex items-center gap-2 font-mono text-lg font-bold',
                  isTimeCritical ? 'text-destructive animate-pulse' : 'text-foreground'
                )}>
                  <Clock className="w-4 h-4" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <Progress value={progressPercent} className="h-1 mt-2" />
            </div>
          </div>

          {/* Question */}
          <div className="flex-1 max-w-3xl mx-auto px-4 py-6 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Question text */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                        {currentIndex + 1}
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {currentQ.item_code} • {currentQ.specialty} • Rang {currentQ.rang}
                        </p>
                        <p className="text-foreground leading-relaxed">{currentQ.question_text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Options */}
                <div className="space-y-2">
                  {currentQ.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => toggleAnswer(i)}
                      className={cn(
                        'w-full text-left p-4 rounded-xl border transition-all',
                        selectedAnswers.includes(i)
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                          : 'border-border/50 hover:border-border hover:bg-muted/30'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cn(
                          'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                          selectedAnswers.includes(i)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm text-foreground">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-muted-foreground">
                    {selectedAnswers.length} réponse{selectedAnswers.length > 1 ? 's' : ''} sélectionnée{selectedAnswers.length > 1 ? 's' : ''}
                    {' • '}
                    <span className="text-orange-400 font-medium">Pas de retour possible</span>
                  </p>
                  <Button
                    onClick={submitAnswer}
                    disabled={selectedAnswers.length === 0}
                    className="gap-2"
                  >
                    {currentIndex < questions.length - 1 ? 'Valider & Suivante' : 'Terminer l\'examen'}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* RESULTS PHASE */}
      {phase === 'results' && ranking && (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-4">
            {ranking.medal === 'gold' && <Crown className="w-16 h-16 text-yellow-400 mx-auto" />}
            {ranking.medal === 'silver' && <Medal className="w-16 h-16 text-gray-300 mx-auto" />}
            {ranking.medal === 'bronze' && <Award className="w-16 h-16 text-orange-400 mx-auto" />}
            {ranking.medal === 'none' && <Target className="w-16 h-16 text-muted-foreground mx-auto" />}

            <h1 className="text-3xl font-bold text-foreground">Résultats de l'examen</h1>
            <p className="text-muted-foreground">Examen blanc national EDN • {questions.length} questions</p>
          </div>

          {/* Main Score Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-card border-primary/20">
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-6xl font-bold text-primary">{ranking.scoreWeighted}%</div>
              <p className="text-sm text-muted-foreground">Score pondéré (Rang A ×1.0, Rang B ×0.5)</p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <p className="text-2xl font-bold text-primary">{ranking.rangAScore}%</p>
                  <p className="text-xs text-muted-foreground">Rang A</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <p className="text-2xl font-bold text-orange-400">{ranking.rangBScore}%</p>
                  <p className="text-xs text-muted-foreground">Rang B</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* National Ranking Card */}
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Classement national simulé
              </h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-foreground">{ranking.rank}</p>
                  <p className="text-xs text-muted-foreground">Rang</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{ranking.percentile}e</p>
                  <p className="text-xs text-muted-foreground">Percentile</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-muted-foreground">{ranking.totalCandidates.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Candidats</p>
                </div>
              </div>

              {/* Percentile bar */}
              <div className="space-y-1">
                <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ranking.percentile}%` }}
                    transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full',
                      ranking.percentile >= 90 ? 'bg-yellow-400' :
                      ranking.percentile >= 70 ? 'bg-emerald-400' :
                      ranking.percentile >= 50 ? 'bg-blue-400' : 'bg-orange-400'
                    )}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0%</span>
                  <span>Top {100 - ranking.percentile}%</span>
                  <span>100%</span>
                </div>
              </div>

              {ranking.medal !== 'none' && (
                <div className={cn(
                  'p-3 rounded-xl text-center text-sm font-medium',
                  ranking.medal === 'gold' ? 'bg-yellow-500/10 text-yellow-400' :
                  ranking.medal === 'silver' ? 'bg-gray-400/10 text-gray-300' :
                  'bg-orange-500/10 text-orange-400'
                )}>
                  🏅 Médaille {ranking.medal === 'gold' ? "d'Or" : ranking.medal === 'silver' ? "d'Argent" : 'de Bronze'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specialty Breakdown */}
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-3">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Performance par spécialité
              </h2>
              <div className="space-y-2">
                {ranking.specialtyBreakdown.slice(0, 12).map(spec => (
                  <div key={spec.specialty} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-32 truncate shrink-0">{spec.specialty}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${spec.score}%` }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className={cn(
                          'h-full rounded-full',
                          spec.score >= 80 ? 'bg-emerald-400' :
                          spec.score >= 60 ? 'bg-blue-400' :
                          spec.score >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                        )}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-foreground w-10 text-right">
                      {spec.score}%
                    </span>
                    <span className="text-[10px] text-muted-foreground w-8">({spec.total}q)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weak specialties recommendation */}
          {ranking.specialtyBreakdown.filter(s => s.score < 50).length > 0 && (
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardContent className="p-6 space-y-3">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  Spécialités à renforcer
                </h2>
                <div className="grid gap-2">
                  {ranking.specialtyBreakdown.filter(s => s.score < 50).slice(0, 5).map(spec => (
                    <div key={spec.specialty} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <span className="text-sm text-foreground">{spec.specialty}</span>
                      <Badge variant="outline" className="text-orange-400 border-orange-500/30">{spec.score}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <Button variant="outline" onClick={() => navigate('/progress-dashboard')}>
              Voir mes progrès
            </Button>
            <Button variant="outline" onClick={() => navigate('/srs-playlist')}>
              <Zap className="w-4 h-4 mr-2" />
              Réviser les points faibles
            </Button>
            <Button onClick={() => { setPhase('intro'); setAnswers([]); setCurrentIndex(0); setQuestions([]); }}>
              Nouveau blanc
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalExamSimulation;
