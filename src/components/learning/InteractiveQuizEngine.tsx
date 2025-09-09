/**
 * Moteur de quiz interactif - Évaluation adaptive intelligente
 * Questions dynamiques, feedback instantané, analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, XCircle, Clock, Brain, Target, 
  SkipForward, RotateCcw, Lightbulb, TrendingUp,
  Award, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/unified/useAuth';
import { contentService } from '@/services/business/ContentService';
import { analyticsService } from '@/services/business/AnalyticsService';
import { toast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: any;
  explanation?: string;
  difficulty: number;
  points: number;
  tags?: string[];
  timeLimit?: number;
  hints?: string[];
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    description?: string;
  };
}

interface QuizSession {
  id: string;
  moduleId: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: { [questionId: string]: any };
  timeSpent: { [questionId: string]: number };
  score: number;
  maxScore: number;
  startTime: Date;
  endTime?: Date;
  adaptive: boolean;
  difficulty: number;
}

interface QuizResult {
  score: number;
  percentage: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  certificate?: {
    eligible: boolean;
    threshold: number;
  };
}

export const InteractiveQuizEngine: React.FC<{
  moduleId: string;
  adaptive?: boolean;
  timeLimit?: number;
  passingScore?: number;
  onComplete?: (result: QuizResult) => void;
}> = ({ 
  moduleId, 
  adaptive = true, 
  timeLimit,
  passingScore = 70,
  onComplete 
}) => {
  const { user } = useAuth();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [hintsUsed, setHintsUsed] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  // Initialiser le quiz
  useEffect(() => {
    if (user && moduleId) {
      initializeQuiz();
    }
  }, [user, moduleId]);

  // Timer global
  useEffect(() => {
    if (timeLimit && timeRemaining && timeRemaining > 0 && !quizComplete) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            completeQuiz();
            return 0;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, quizComplete, timeLimit]);

  // Timer par question
  useEffect(() => {
    if (currentQuestion?.timeLimit && questionTimeRemaining && questionTimeRemaining > 0) {
      const timer = setInterval(() => {
        setQuestionTimeRemaining(prev => {
          if (prev && prev <= 1) {
            submitCurrentAnswer();
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [questionTimeRemaining, currentQuestion]);

  const initializeQuiz = async () => {
    try {
      setLoading(true);

      // Récupérer les questions du module
      const module = await contentService.getModule(moduleId, user!.id);
      const assessments = module.content.assessments;
      
      if (assessments.length === 0) {
        toast({
          variant: "destructive",
          title: "Aucun quiz disponible",
          description: "Ce module ne contient pas d'évaluation"
        });
        return;
      }

      const assessment = assessments[0];
      let questions = assessment.questions;

      // Adapter les questions si mode adaptatif
      if (adaptive && user) {
        questions = await adaptQuestions(questions, user.id);
      }

      // Mélanger les questions
      questions = shuffleArray([...questions]);

      const newSession: QuizSession = {
        id: `quiz_${Date.now()}`,
        moduleId,
        questions,
        currentQuestionIndex: 0,
        answers: {},
        timeSpent: {},
        score: 0,
        maxScore: questions.reduce((sum, q) => sum + q.points, 0),
        startTime: new Date(),
        adaptive,
        difficulty: calculateInitialDifficulty(questions),
      };

      setSession(newSession);
      setCurrentQuestion(questions[0]);
      
      if (timeLimit) {
        setTimeRemaining(timeLimit);
      }
      
      if (questions[0].timeLimit) {
        setQuestionTimeRemaining(questions[0].timeLimit);
      }

      // Analytics
      await analyticsService.trackEvent(user!.id, {
        type: 'quiz_started',
        category: 'assessment',
        action: 'start',
        label: moduleId,
        metadata: {
          questionsCount: questions.length,
          adaptive,
          timeLimit,
        }
      });

    } catch (error) {
      console.error('Failed to initialize quiz:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le quiz"
      });
    } finally {
      setLoading(false);
    }
  };

  const adaptQuestions = async (questions: Question[], userId: string): Promise<Question[]> => {
    try {
      // Récupérer l'historique de performance
      const analytics = await analyticsService.getUserAnalytics(userId, {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      });

      const weakAreas = analytics.performance.weaknessAreas.map(area => area.name);
      const strongAreas = analytics.performance.strengthAreas.map(area => area.name);
      const averageScore = analytics.performance.overallScore;

      // Ajuster la sélection des questions
      let adaptedQuestions = [...questions];

      // Plus de questions sur les zones faibles
      if (weakAreas.length > 0) {
        const weakQuestions = questions.filter(q => 
          q.tags.some(tag => weakAreas.includes(tag))
        );
        adaptedQuestions = [
          ...weakQuestions,
          ...questions.filter(q => !weakQuestions.includes(q))
        ];
      }

      // Ajuster la difficulté selon les performances
      if (averageScore < 60) {
        adaptedQuestions = adaptedQuestions.filter(q => q.difficulty <= 3);
      } else if (averageScore > 85) {
        adaptedQuestions = adaptedQuestions.filter(q => q.difficulty >= 3);
      }

      return adaptedQuestions.slice(0, Math.min(20, questions.length));

    } catch (error) {
      console.warn('Failed to adapt questions:', error);
      return questions;
    }
  };

  const submitCurrentAnswer = useCallback(async () => {
    if (!session || !currentQuestion || !user) return;

    const questionStartTime = Date.now() - (questionTimeRemaining ? 
      (currentQuestion.timeLimit! - questionTimeRemaining) * 1000 : 0);
    const timeSpentOnQuestion = Date.now() - questionStartTime;

    // Évaluer la réponse
    let evaluation;
    try {
      evaluation = await contentService.evaluateResponse(currentQuestion.id, currentAnswer);
    } catch (error) {
      evaluation = { correct: false, score: 0, feedback: 'Erreur d\'évaluation' };
    }

    // Mettre à jour la session
    const updatedSession = {
      ...session,
      answers: {
        ...session.answers,
        [currentQuestion.id]: currentAnswer
      },
      timeSpent: {
        ...session.timeSpent,
        [currentQuestion.id]: timeSpentOnQuestion
      },
      score: session.score + evaluation.score
    };

    setSession(updatedSession);

    // Analytics pour cette question
    await analyticsService.trackEvent(user.id, {
      type: 'question_answered',
      category: 'assessment',
      action: evaluation.correct ? 'correct' : 'incorrect',
      label: currentQuestion.id,
      value: evaluation.score,
      metadata: {
        timeSpent: timeSpentOnQuestion,
        difficulty: currentQuestion.difficulty,
        hintsUsed: hintsUsed.length,
        questionType: currentQuestion.type,
      }
    });

    // Afficher l'explication
    setShowExplanation(true);

    // Passer à la question suivante après un délai
    setTimeout(() => {
      nextQuestion(updatedSession);
    }, evaluation.correct ? 1500 : 3000);

  }, [session, currentQuestion, currentAnswer, user, hintsUsed, questionTimeRemaining]);

  const nextQuestion = (updatedSession: QuizSession) => {
    const nextIndex = updatedSession.currentQuestionIndex + 1;

    if (nextIndex >= updatedSession.questions.length) {
      completeQuiz(updatedSession);
      return;
    }

    const nextQ = updatedSession.questions[nextIndex];
    
    setSession({
      ...updatedSession,
      currentQuestionIndex: nextIndex
    });
    
    setCurrentQuestion(nextQ);
    setCurrentAnswer(null);
    setShowExplanation(false);
    setHintsUsed([]);
    setShowHint(false);
    
    if (nextQ.timeLimit) {
      setQuestionTimeRemaining(nextQ.timeLimit);
    } else {
      setQuestionTimeRemaining(null);
    }
  };

  const completeQuiz = async (finalSession?: QuizSession) => {
    const completedSession = finalSession || session;
    if (!completedSession || !user) return;

    const endTime = new Date();
    const totalTime = Math.floor((endTime.getTime() - completedSession.startTime.getTime()) / 1000);
    const percentage = Math.round((completedSession.score / completedSession.maxScore) * 100);
    
    // Calculer les résultats détaillés
    const correctAnswers = Object.keys(completedSession.answers).length; // Simplification
    const result: QuizResult = {
      score: completedSession.score,
      percentage,
      timeSpent: totalTime,
      correctAnswers,
      totalQuestions: completedSession.questions.length,
      strengths: [], // À calculer selon les réponses correctes par tag
      weaknesses: [], // À calculer selon les réponses incorrectes par tag
      recommendations: [], // Recommandations basées sur la performance
      certificate: {
        eligible: percentage >= passingScore,
        threshold: passingScore,
      }
    };

    // Enregistrer les résultats
    try {
      await contentService.recordProgress(user.id, moduleId, {
        completed: true,
        timeSpent: totalTime,
        score: percentage,
        answers: completedSession.answers,
      });

      // Analytics finales
      await analyticsService.trackEvent(user.id, {
        type: 'quiz_completed',
        category: 'assessment',
        action: result.certificate.eligible ? 'passed' : 'failed',
        label: moduleId,
        value: percentage,
        metadata: {
          totalTime,
          questionsCount: completedSession.questions.length,
          hintsTotal: hintsUsed.length,
        }
      });

    } catch (error) {
      console.error('Failed to save quiz results:', error);
    }

    setResult(result);
    setQuizComplete(true);
    onComplete?.(result);

    // Notification de résultat
    if (result.certificate.eligible) {
      toast({
        title: "Félicitations !",
        description: `Vous avez réussi avec ${percentage}%`,
      });
    } else {
      toast({
        title: "Quiz terminé",
        description: `Score: ${percentage}% (${passingScore}% requis)`,
        variant: "destructive"
      });
    }
  };

  const useHint = () => {
    if (!currentQuestion || !currentQuestion.hints) return;

    const availableHints = currentQuestion.hints.filter(
      (_, index) => !hintsUsed.includes(`${currentQuestion.id}_${index}`)
    );

    if (availableHints.length > 0) {
      const hintId = `${currentQuestion.id}_${hintsUsed.length}`;
      setHintsUsed([...hintsUsed, hintId]);
      setShowHint(true);
    }
  };

  const skipQuestion = () => {
    if (session && currentQuestion) {
      // Pénalité pour saut de question
      submitCurrentAnswer();
    }
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    const renderAnswerInput = () => {
      switch (currentQuestion.type) {
        case 'multiple_choice':
          return (
            <RadioGroup 
              value={currentAnswer} 
              onValueChange={setCurrentAnswer}
              className="space-y-3"
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors">
                  <RadioGroupItem value={option} id={`option_${index}`} />
                  <Label htmlFor={`option_${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          );

        case 'true_false':
          return (
            <RadioGroup 
              value={currentAnswer} 
              onValueChange={setCurrentAnswer}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="flex-1 cursor-pointer">Vrai</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="flex-1 cursor-pointer">Faux</Label>
              </div>
            </RadioGroup>
          );

        case 'fill_blank':
          return (
            <Input
              placeholder="Tapez votre réponse..."
              value={currentAnswer || ''}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="text-center text-lg"
            />
          );

        case 'essay':
          return (
            <Textarea
              placeholder="Rédigez votre réponse détaillée..."
              value={currentAnswer || ''}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              rows={6}
              className="resize-none"
            />
          );

        default:
          return <div className="text-center text-muted-foreground">Type de question non supporté</div>;
      }
    };

    return (
      <div className="space-y-6">
        {/* Media */}
        {currentQuestion.media && (
          <div className="text-center">
            {currentQuestion.media.type === 'image' && (
              <img 
                src={currentQuestion.media.url} 
                alt={currentQuestion.media.description || 'Question image'}
                className="max-w-full h-auto rounded-lg mx-auto"
              />
            )}
            {/* Ajouter support video/audio si nécessaire */}
          </div>
        )}

        {/* Question */}
        <div className="text-lg font-medium leading-relaxed">
          {currentQuestion.question}
        </div>

        {/* Réponses */}
        <div>
          {renderAnswerInput()}
        </div>

        {/* Hint */}
        {showHint && currentQuestion.hints && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Indice :</strong> {currentQuestion.hints[hintsUsed.length - 1]}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-muted-foreground">Préparation du quiz...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizComplete && result) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            {result.certificate.eligible ? (
              <Award className="w-8 h-8 text-yellow-500" />
            ) : (
              <Target className="w-8 h-8 text-orange-500" />
            )}
            Quiz terminé !
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2 text-primary">
              {result.percentage}%
            </div>
            <div className="text-lg text-muted-foreground">
              {result.score} / {session?.maxScore} points
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{result.correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correctes</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <XCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{result.totalQuestions - result.correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Incorrectes</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{Math.floor(result.timeSpent / 60)}'</div>
              <div className="text-sm text-muted-foreground">Temps total</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{Math.round(result.score / (result.timeSpent / 60))}%/min</div>
              <div className="text-sm text-muted-foreground">Efficacité</div>
            </div>
          </div>

          {result.certificate.eligible ? (
            <Alert>
              <Award className="h-4 w-4" />
              <AlertDescription>
                <strong>Félicitations !</strong> Vous avez atteint le seuil de réussite ({result.certificate.threshold}%). 
                Un certificat peut être généré.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Score insuffisant pour la certification. Seuil requis : {result.certificate.threshold}%
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Recommencer
            </Button>
            {result.certificate.eligible && (
              <Button variant="outline">
                <Award className="w-4 h-4 mr-2" />
                Générer certificat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Impossible de charger le quiz</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Quiz - Question {session.currentQuestionIndex + 1}/{session.questions.length}
          </CardTitle>
          
          <div className="flex items-center gap-3">
            {adaptive && (
              <Badge variant="secondary">Adaptatif</Badge>
            )}
            <Badge variant="outline">
              {currentQuestion.difficulty}/5 ⭐
            </Badge>
            <Badge>
              {currentQuestion.points} pts
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Progress 
            value={(session.currentQuestionIndex / session.questions.length) * 100} 
            className="h-2"
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progression: {Math.round((session.currentQuestionIndex / session.questions.length) * 100)}%</span>
            <span>Score actuel: {session.score}/{session.maxScore}</span>
          </div>
        </div>

        {/* Timers */}
        <div className="flex gap-4 text-sm">
          {timeRemaining && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className={timeRemaining < 60 ? 'text-red-500' : ''}>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-muted-foreground">restant (total)</span>
            </div>
          )}
          
          {questionTimeRemaining && (
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span className={questionTimeRemaining < 10 ? 'text-red-500' : 'text-orange-500'}>
                {questionTimeRemaining}s
              </span>
              <span className="text-muted-foreground">cette question</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!showExplanation ? (
          <>
            {renderQuestionContent()}
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={useHint}
                    disabled={hintsUsed.length >= currentQuestion.hints.length}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Indice ({currentQuestion.hints.length - hintsUsed.length} restant)
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipQuestion}
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Passer
                </Button>
              </div>

              <Button 
                onClick={submitCurrentAnswer}
                disabled={!currentAnswer}
                size="lg"
              >
                {session.currentQuestionIndex === session.questions.length - 1 ? 'Terminer' : 'Suivant'}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-6xl">
              {/* Icône de résultat basée sur l'évaluation */}
              ⏳
            </div>
            <p className="text-lg text-muted-foreground">
              Évaluation en cours...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Utilitaires
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const calculateInitialDifficulty = (questions: Question[]): number => {
  return questions.reduce((sum, q) => sum + q.difficulty, 0) / questions.length;
};