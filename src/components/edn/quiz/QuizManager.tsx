import React, { useEffect, useMemo, useState } from 'react';
import { QuizSelector, QuizConfig } from './QuizSelector';
import { QuizInterface } from './QuizInterface';
import { QuizGenerator } from './QuizGenerator';
import { QuizErrorSongGenerator } from '../music/QuizErrorSongGenerator';
import { useQuizErrorTracker } from '@/hooks/useQuizErrorTracker';
import { useQuizSessions } from '@/hooks/useQuizSessions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  RotateCcw,
  Music,
  Brain,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { logger } from '@/utils/structuredLogger';
import { RateLimitNotice } from '@/components/system/RateLimitNotice';
import { RateLimitExceededError } from '@/utils/errors/rateLimit';
import { trackCanonicalEvent } from '@/services/CanonicalAnalyticsTracker';

interface QuizQuestionDraft {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  rang: 'A' | 'B';
  difficulty?: string;
  validated: boolean;
  notes?: string;
}

interface TableauSection {
  concepts?: Array<Record<string, unknown>>;
}

interface QuizItem {
  id: string;
  item_code: string;
  title: string;
  tableau_rang_a?: TableauSection;
  tableau_rang_b?: TableauSection;
  quiz_questions?: Record<string, unknown>;
}

interface QuizManagerProps {
  item: QuizItem;
  onClose?: () => void;
  onQuizSaved?: (results: QuizResults, config: QuizConfig, reviewedQuestions: QuizQuestionDraft[]) => void;
}

interface QuizResults {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  correctAnswers: number;
  wrongAnswers: number;
  answers: Array<{
    questionId: number;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }>;
  performance: {
    rangA: { correct: number; total: number };
    rangB: { correct: number; total: number };
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
}

type SanitizedQuizQuestion = Omit<QuizQuestionDraft, 'validated' | 'notes'>;

export const QuizManager: React.FC<QuizManagerProps> = ({ item, onClose, onQuizSaved }) => {
  const [currentView, setCurrentView] = useState<'config' | 'review' | 'quiz' | 'results'>('config');
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<QuizQuestionDraft[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<SanitizedQuizQuestion[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [rateLimit, setRateLimit] = useState<{ message: string; retryAt?: number | null; retryAfterSeconds?: number } | null>(null);

  const { toast } = useToast();

  const {
    currentErrors,
    hasCurrentSession,
    startQuizSession,
    endQuizSession,
    loadSavedSessions,
  } = useQuizErrorTracker();

  const { saveSession } = useQuizSessions();

  useEffect(() => {
    loadSavedSessions();
  }, [loadSavedSessions]);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUserId(data.user?.id ?? null);
      })
      .catch(() => setUserId(null));
  }, []);

  // Calculer le nombre total de questions disponibles
  const calculateTotalQuestions = () => {
    let total = 0;

    if (item.quiz_questions?.questions && Array.isArray(item.quiz_questions.questions)) {
      total += (item.quiz_questions.questions as unknown[]).length;
    }

    if (item.tableau_rang_a?.concepts) {
      item.tableau_rang_a.concepts.forEach(() => {
        total += 2;
      });
    }

    if (item.tableau_rang_b?.concepts) {
      item.tableau_rang_b.concepts.forEach(() => {
        total += 2;
      });
    }

    return Math.max(total, 20);
  };

  const handleStartQuiz = (config: QuizConfig) => {
    logger.info('Configuration du quiz', {
      component: 'QuizManager',
      metadata: {
        itemCode: item.item_code,
        numberOfQuestions: config.numberOfQuestions,
        difficulty: config.difficulty,
      },
    });

    const generatedQuestions = QuizGenerator.generateQuestions(item, config);

    const drafts: QuizQuestionDraft[] = generatedQuestions.map((question, index) => ({
      id: typeof question.id === 'number' ? question.id : index + 1,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      rang: question.rang,
      difficulty: question.difficulty,
      validated: false,
      notes: '',
    }));

    setQuizConfig(config);
    setReviewQuestions(drafts);
    setQuizQuestions([]);
    setQuizResults(null);
    setCurrentView('review');
    setRateLimit(null);
  };

  const handleUpdateQuestion = (index: number, updater: (question: QuizQuestionDraft) => QuizQuestionDraft) => {
    setReviewQuestions((prev) => prev.map((question, idx) => (idx === index ? updater(question) : question)));
  };

  const handleValidateAll = () => {
    setReviewQuestions((prev) => prev.map((question) => ({ ...question, validated: true })));
  };

  const handleLaunchQuiz = () => {
    if (!quizConfig) return;

    const pendingValidation = reviewQuestions.some((question) => !question.validated);
    if (pendingValidation) {
      toast({
        title: 'Validation requise',
        description: 'Validez chaque question avant de lancer le quiz.',
        variant: 'destructive',
      });
      return;
    }

    const sanitized = reviewQuestions.map(({ validated, notes, ...question }) => question);
    setQuizQuestions(sanitized);
    startQuizSession(item.item_code, item.title, quizConfig.numberOfQuestions);
    setCurrentView('quiz');
    void trackCanonicalEvent({
      type: 'qcm_start',
      contentId: item.id,
      metadata: {
        item_code: item.item_code,
        item_title: item.title,
        question_count: sanitized.length,
        difficulty: quizConfig.difficulty,
        question_type: quizConfig.questionType,
      },
    });
  };

  const handleQuizComplete = async (results: QuizResults) => {
    logger.info('Quiz terminé', {
      component: 'QuizManager',
      metadata: {
        itemCode: item.item_code,
        score: results.score,
        totalQuestions: results.totalQuestions,
        correctAnswers: results.correctAnswers,
      },
    });

    setQuizResults(results);
    const completedSession = endQuizSession(results.score);
    const config = quizConfig;

    if (config) {
      setIsSavingSession(true);
      let sessionPersisted = false;
      try {
        if (userId) {
          const rang: 'A' | 'B' | 'mix' =
            config.questionType === 'rang-a'
              ? 'A'
              : config.questionType === 'rang-b'
                ? 'B'
                : 'mix';

          await saveSession({
            user_id: userId,
            item_code: item.item_code,
            rang,
            score: results.score,
            questions_count: results.totalQuestions,
            correct_answers: results.correctAnswers,
            time_spent_seconds: results.timeSpent,
            completed: true,
            session_data: {
              answers: results.answers,
              performance: results.performance,
              configuration: config,
              reviewedQuestions: reviewQuestions,
              quizSessionId: completedSession?.id,
            },
          });
          sessionPersisted = true;
        }

        onQuizSaved?.(results, config, reviewQuestions);
      } catch (error) {
        if (error instanceof RateLimitExceededError) {
          setRateLimit({
            message: error.message,
            retryAt: error.retryAt ?? (error.retryAfterSeconds ? Date.now() + error.retryAfterSeconds * 1000 : undefined),
            retryAfterSeconds: error.retryAfterSeconds,
          });
        } else {
          const message = error instanceof Error ? error.message : "Impossible d'enregistrer la session";
          toast({
            title: 'Sauvegarde partielle',
            description: message,
            variant: 'destructive',
          });
        }
      } finally {
        setIsSavingSession(false);
        void trackCanonicalEvent({
          type: 'qcm_complete',
          contentId: item.id,
          metadata: {
            item_code: item.item_code,
            item_title: item.title,
            score: results.score,
            question_count: results.totalQuestions,
            correct_answers: results.correctAnswers,
            time_spent_seconds: results.timeSpent,
            difficulty: config.difficulty,
            question_type: config.questionType,
            session_persisted: sessionPersisted,
          },
        });
      }
    }

    setCurrentView('results');
  };

  const handleReturnToConfig = () => {
    setCurrentView('config');
    setQuizConfig(null);
    setReviewQuestions([]);
    setQuizQuestions([]);
    setQuizResults(null);
  };

  const handleRestartQuiz = () => {
    setCurrentView('config');
    setQuizResults(null);
    setReviewQuestions([]);
    setQuizQuestions([]);
  };

  const pendingValidation = useMemo(
    () => reviewQuestions.length === 0 || reviewQuestions.some((question) => !question.validated),
    [reviewQuestions],
  );

  const currentConfigSummary = useMemo(() => {
    if (!quizConfig) return null;

    const questionTypeLabel =
      quizConfig.questionType === 'rang-a'
        ? 'Rang A'
        : quizConfig.questionType === 'rang-b'
          ? 'Rang B'
          : 'Mix A/B';

    return {
      questionCount: quizConfig.numberOfQuestions,
      difficulty: quizConfig.difficulty,
      typeLabel: questionTypeLabel,
    };
  }, [quizConfig]);

  const rateLimitBanner = rateLimit ? (
    <RateLimitNotice
      scope="quiz"
      message={rateLimit.message}
      retryAt={rateLimit.retryAt}
      retryAfterSeconds={rateLimit.retryAfterSeconds}
      onDismiss={() => setRateLimit(null)}
    />
  ) : null;

  if (currentView === 'config') {
    return (
      <div className="space-y-4">
        {rateLimitBanner}
        <QuizSelector
          itemCode={item.item_code}
          itemTitle={item.title}
          totalQuestions={calculateTotalQuestions()}
          onStartQuiz={handleStartQuiz}
        />
      </div>
    );
  }

  if (currentView === 'review' && quizConfig) {
    return (
      <div className="space-y-6">
        {rateLimitBanner}
        <Card className="border-2 border-emerald-200 bg-emerald-50/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <ShieldCheck className="h-5 w-5" />
              Validation des questions générées
            </CardTitle>
            <CardDescription>
              Révisez, ajustez et validez chaque question avant de lancer le quiz interactif pour {item.item_code}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentConfigSummary && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-xs uppercase text-muted-foreground">Nombre de questions</div>
                  <div className="text-lg font-semibold">{currentConfigSummary.questionCount}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-muted-foreground">Difficulté</div>
                  <div className="text-lg font-semibold capitalize">{currentConfigSummary.difficulty}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-muted-foreground">Type</div>
                  <div className="text-lg font-semibold">{currentConfigSummary.typeLabel}</div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleStartQuiz(quizConfig)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Regénérer les questions
              </Button>
              <Button variant="outline" size="sm" onClick={handleValidateAll}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Tout valider
              </Button>
              <Button
                size="sm"
                onClick={handleLaunchQuiz}
                disabled={pendingValidation}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Lancer le quiz
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReturnToConfig}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Modifier la configuration
              </Button>
            </div>

            {pendingValidation && (
              <div className="text-sm text-amber-700">
                <AlertTriangle className="mr-2 inline h-4 w-4" />
                Au moins une question doit être validée pour activer le lancement du quiz.
              </div>
            )}
          </CardContent>
        </Card>

        <ScrollArea className="max-h-[60vh] rounded-lg border">
          <div className="space-y-6 p-4">
            {reviewQuestions.map((question, index) => (
              <Card key={question.id} className="border border-muted">
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Pencil className="h-4 w-4" />
                      Question {index + 1}
                    </CardTitle>
                    <CardDescription>
                      Ajustez l’énoncé, les réponses et l’explication. Marquez la question comme validée une fois relue.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Rang {question.rang}</Badge>
                    {question.difficulty && (
                      <Badge variant="outline">{question.difficulty}</Badge>
                    )}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`validate-${question.id}`}
                        checked={question.validated}
                        onCheckedChange={(value) =>
                          handleUpdateQuestion(index, (prev) => ({ ...prev, validated: value === true }))
                        }
                      />
                      <Label htmlFor={`validate-${question.id}`} className="text-sm">
                        Validée
                      </Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${question.id}`}>Énoncé</Label>
                    <Textarea
                      id={`question-${question.id}`}
                      value={question.question}
                      onChange={(event) =>
                        handleUpdateQuestion(index, (prev) => ({ ...prev, question: event.target.value }))
                      }
                      minRows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Propositions</Label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center">
                        <Button
                          variant={question.correctAnswer === optionIndex ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            handleUpdateQuestion(index, (prev) => ({ ...prev, correctAnswer: optionIndex }))
                          }
                        >
                          {question.correctAnswer === optionIndex ? 'Bonne réponse' : 'Marquer correcte'}
                        </Button>
                        <Input
                          value={option}
                          onChange={(event) =>
                            handleUpdateQuestion(index, (prev) => ({
                              ...prev,
                              options: prev.options.map((existing, idx) =>
                                idx === optionIndex ? event.target.value : existing,
                              ),
                            }))
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`explanation-${question.id}`}>Explication / Correction</Label>
                    <Textarea
                      id={`explanation-${question.id}`}
                      value={question.explanation ?? ''}
                      onChange={(event) =>
                        handleUpdateQuestion(index, (prev) => ({ ...prev, explanation: event.target.value }))
                      }
                      minRows={2}
                      placeholder="Ajoutez la correction ou le raisonnement attendu."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`notes-${question.id}`}>Notes pédagogiques</Label>
                    <Textarea
                      id={`notes-${question.id}`}
                      value={question.notes ?? ''}
                      onChange={(event) =>
                        handleUpdateQuestion(index, (prev) => ({ ...prev, notes: event.target.value }))
                      }
                      minRows={2}
                      placeholder="Ajouter une consigne, une statistique ou un complément clinique."
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (currentView === 'quiz' && quizConfig) {
    return (
      <div className="space-y-4">
        {rateLimitBanner}
        <QuizInterface
          questions={quizQuestions as any}
          config={quizConfig}
          itemCode={item.item_code}
          itemTitle={item.title}
          onQuizComplete={handleQuizComplete}
          onReturnToConfig={handleReturnToConfig}
        />
      </div>
    );
  }

  if (currentView === 'results' && quizResults && quizConfig) {
    return (
      <div className="space-y-6">
        {rateLimitBanner}
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Résultats
            </TabsTrigger>
            <TabsTrigger value="song" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Chanson d'erreurs
              {currentErrors.length > 0 && (
                <span className="ml-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                  {currentErrors.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-800">
                  <Trophy className="h-6 w-6" />
                  Résultats du Quiz {item.item_code}
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Quiz terminé avec {quizResults.correctAnswers} bonnes réponses sur {quizResults.totalQuestions}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-white/60 p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((quizResults.score / quizResults.totalQuestions) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                  <div className="rounded-lg bg-white/60 p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{quizResults.correctAnswers}</div>
                    <div className="text-sm text-gray-600">Correctes</div>
                  </div>
                  <div className="rounded-lg bg-white/60 p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">{quizResults.wrongAnswers}</div>
                    <div className="text-sm text-gray-600">Erreurs</div>
                  </div>
                  <div className="rounded-lg bg-white/60 p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(quizResults.timeSpent / 60)} min</div>
                    <div className="text-sm text-gray-600">Temps</div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={handleRestartQuiz} variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Nouveau Quiz
                  </Button>
                  <Button variant="ghost" onClick={handleReturnToConfig}>
                    <Brain className="mr-2 h-4 w-4" />
                    Changer les paramètres
                  </Button>
                  {isSavingSession && (
                    <span className="text-xs text-muted-foreground">Sauvegarde des résultats en cours…</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="song" className="space-y-4">
            {currentErrors.length > 0 ? (
              <QuizErrorSongGenerator itemCode={item.item_code} itemTitle={item.title} />
            ) : (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-green-800">
                    <Trophy className="h-6 w-6" />
                    Quiz parfait !
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Aucune erreur détectée - pas besoin de chanson d'aide-mémoire
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <Brain className="mx-auto mb-2 h-12 w-12 text-green-500" />
                    <p className="text-green-700">
                      Excellent travail ! Vous maîtrisez parfaitement {item.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-6 text-center">
      <div className="text-gray-600">Chargement du quiz...</div>
    </div>
  );
};

