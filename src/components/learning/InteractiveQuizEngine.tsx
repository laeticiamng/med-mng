/**
 * Moteur de quiz interactif simplifié - compatible avec les types existants
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  Trophy, 
  CheckCircle,
  XCircle,
  Brain,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/unified/useAuth';
import { useErrorHandler } from '@/hooks/unified/useErrorHandler';
import type { Question, QuizSession, QuizResult } from '@/types/quiz';

interface SimpleQuizEngineProps {
  questions: Question[];
  timeLimit?: number;
  passingScore?: number;
  onComplete: (result: QuizResult) => void;
}

export const SimpleInteractiveQuizEngine: React.FC<SimpleQuizEngineProps> = ({
  questions,
  timeLimit = 1800, // 30 minutes par défaut
  passingScore = 70,
  onComplete 
}) => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (!quizStarted || quizComplete || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizComplete, timeRemaining]);

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = useCallback(() => {
    if (quizComplete) return;

    try {
      const quizResult = calculateResults();
      setResult(quizResult);
      setQuizComplete(true);
      setShowResults(true);
      onComplete(quizResult);
    } catch (error) {
      handleError(error as Error, 'user_action');
    }
  }, [answers, questions, timeLimit, timeRemaining, onComplete, handleError, quizComplete]);

  const calculateResults = (): QuizResult => {
    let correctAnswers = 0;
    const detailedResults: any[] = [];

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = checkAnswer(question, userAnswer);
      
      if (isCorrect) correctAnswers++;

      detailedResults.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correct,
        isCorrect,
        points: isCorrect ? question.points : 0,
        timeSpent: 0,
        explanation: question.explanation
      });
    });

    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= passingScore;

    return {
      sessionId: crypto.randomUUID(),
      score: Math.round(score),
      totalQuestions: questions.length,
      correctAnswers,
      timeSpent: timeLimit - timeRemaining,
      passed,
      feedback: passed ? 'Félicitations ! Vous avez réussi le quiz.' : 'Continuez vos efforts. Vous pouvez recommencer.',
      detailedResults
    };
  };

  const checkAnswer = (question: Question, userAnswer: any): boolean => {
    if (question.type === 'multiple-choice') {
      return userAnswer === question.correct;
    }
    if (question.type === 'true-false') {
      return userAnswer === question.correct;
    }
    return false;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quizStarted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="h-6 w-6" />
            Quiz Interactif
          </CardTitle>
          <CardDescription>
            Testez vos connaissances avec {questions.length} questions
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Questions</h3>
              <p className="text-sm text-muted-foreground">{questions.length} questions</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Temps</h3>
              <p className="text-sm text-muted-foreground">{formatTime(timeLimit)}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Réussite</h3>
              <p className="text-sm text-muted-foreground">{passingScore}% requis</p>
            </div>
          </div>
          <Button onClick={startQuiz} size="lg" className="w-full md:w-auto">
            Commencer le Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults && result) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {result.passed ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            Résultats du Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className={result.passed ? "border-green-200" : "border-red-200"}>
            <AlertDescription className="text-center text-lg">
              {result.feedback}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{result.score}%</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{result.correctAnswers}/{result.totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Bonnes réponses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(result.timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Temps utilisé</div>
            </div>
            <div className="text-center">
              <Badge variant={result.passed ? "default" : "secondary"}>
                {result.passed ? "Réussi" : "Échec"}
              </Badge>
            </div>
          </div>

          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Recommencer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            Question {currentQuestionIndex + 1} sur {questions.length}
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(timeRemaining)}
          </Badge>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{currentQuestion.question}</h3>

          {currentQuestion.type === 'multiple-choice' && (
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onValueChange={(value) => handleAnswer(currentQuestion.id, parseInt(value))}
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === 'true-false' && (
            <RadioGroup
              value={answers[currentQuestion.id]?.toString() || ''}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value === 'true')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="cursor-pointer">Vrai</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="cursor-pointer">Faux</Label>
              </div>
            </RadioGroup>
          )}
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Précédent
          </Button>
          
          <div className="flex gap-2">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleComplete}>
                Terminer le Quiz
              </Button>
            ) : (
              <Button onClick={nextQuestion}>
                Suivant
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};