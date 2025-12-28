import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { QuizConfig } from './QuizSelector';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  rang: 'A' | 'B';
  difficulty: 'easy' | 'medium' | 'hard';
  commonErrors: string[];
  tags: string[];
}

interface QuizInterfaceProps {
  itemCode: string;
  itemTitle: string;
  config: QuizConfig;
  questions: QuizQuestion[];
  onQuizComplete: (results: QuizResults) => void;
  onReturnToConfig: () => void;
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

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  itemCode,
  itemTitle,
  config,
  questions,
  onQuizComplete,
  onReturnToConfig
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestion]);

  const currentQ = questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQuestion] !== undefined;
  const isCorrect = isAnswered && selectedAnswers[currentQuestion] === currentQ?.correctAnswer;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }));
    
    // Afficher l'explication après un délai court
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowExplanation(selectedAnswers[currentQuestion - 1] !== undefined);
    }
  };

  const completeQuiz = async () => {
    const quizResults = calculateResults();
    setResults(quizResults);
    setIsCompleted(true);
    onQuizComplete(quizResults);
    
    // Sauvegarder en base de données
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('quiz_results').insert({
          user_id: user.id,
          item_code: itemCode,
          item_title: itemTitle,
          score: quizResults.score,
          total_questions: quizResults.totalQuestions,
          correct_answers: quizResults.correctAnswers,
          wrong_answers: quizResults.wrongAnswers,
          time_spent: quizResults.timeSpent,
          performance: quizResults.performance,
          answers: quizResults.answers
        });
        console.log('✅ Quiz results saved to database');
      }
    } catch (err) {
      console.warn('Failed to save quiz results:', err);
    }
    
    toast({
      title: "Quiz terminé !",
      description: `Score: ${quizResults.score}% (${quizResults.correctAnswers}/${quizResults.totalQuestions})`,
    });
  };

  const calculateResults = (): QuizResults => {
    let correctAnswers = 0;
    const answers = [];
    const performance = {
      rangA: { correct: 0, total: 0 },
      rangB: { correct: 0, total: 0 },
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 }
    };

    questions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      const isCorrect = selectedAnswer === question.correctAnswer;
      
      if (isCorrect) correctAnswers++;
      
      answers.push({
        questionId: question.id,
        selectedAnswer: selectedAnswer || -1,
        isCorrect,
        timeSpent: 60 // Estimation
      });

      // Mettre à jour les performances par catégorie
      if (question.rang === 'A') {
        performance.rangA.total++;
        if (isCorrect) performance.rangA.correct++;
      } else {
        performance.rangB.total++;
        if (isCorrect) performance.rangB.correct++;
      }

      performance[question.difficulty].total++;
      if (isCorrect) performance[question.difficulty].correct++;
    });

    return {
      score: Math.round((correctAnswers / questions.length) * 100),
      totalQuestions: questions.length,
      timeSpent,
      correctAnswers,
      wrongAnswers: questions.length - correctAnswers,
      answers,
      performance
    };
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setTimeSpent(0);
    setIsCompleted(false);
    setResults(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted && results) {
    return (
      <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-success">
            <CheckCircle className="h-6 w-6" />
            Quiz Terminé - {itemCode}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score principal */}
          <div className="text-center p-6 bg-background/60 rounded-lg border border-success/20">
            <div className="text-4xl font-bold text-success mb-2">
              {results.score}%
            </div>
            <div className="text-lg text-success/80">
              {results.correctAnswers} / {results.totalQuestions} bonnes réponses
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Temps total: {formatTime(results.timeSpent)}
            </div>
          </div>

          {/* Détail des performances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background/60 rounded-lg p-4 border border-success/20">
              <h4 className="font-semibold text-success mb-3">Par niveau</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Rang A:</span>
                  <span>{results.performance.rangA.correct}/{results.performance.rangA.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rang B:</span>
                  <span>{results.performance.rangB.correct}/{results.performance.rangB.total}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-background/60 rounded-lg p-4 border border-success/20">
              <h4 className="font-semibold text-success mb-3">Par difficulté</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Facile:</span>
                  <span>{results.performance.easy.correct}/{results.performance.easy.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Moyen:</span>
                  <span>{results.performance.medium.correct}/{results.performance.medium.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficile:</span>
                  <span>{results.performance.hard.correct}/{results.performance.hard.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={restartQuiz} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Refaire le quiz
            </Button>
            <Button onClick={onReturnToConfig} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Nouvelle configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQ) {
    return (
      <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
        <CardContent className="p-6 text-center">
          <div className="text-destructive">Aucune question disponible pour cette configuration.</div>
          <Button onClick={onReturnToConfig} className="mt-4">
            Retour à la configuration
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-primary">
            <Clock className="h-5 w-5" />
            Quiz {itemCode} - Question {currentQuestion + 1}/{questions.length}
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{formatTime(timeSpent)}</Badge>
            <Badge variant={currentQ.rang === 'A' ? 'default' : 'secondary'}>
              Rang {currentQ.rang}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {currentQ.difficulty}
            </Badge>
          </div>
        </div>
        <Progress value={(currentQuestion / questions.length) * 100} className="mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question */}
        <div className="bg-background/60 rounded-lg p-6 border border-primary/20">
          <h3 className="text-lg font-semibold text-primary mb-4">
            {currentQ.question}
          </h3>
          
          {/* Options de réponse */}
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion] === index;
              const isCorrectOption = index === currentQ.correctAnswer;
              
              let optionClass = "p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/30";
              
              if (showExplanation) {
                if (isCorrectOption) {
                  optionClass += " bg-success/10 border-success text-success";
                } else if (isSelected && !isCorrectOption) {
                  optionClass += " bg-destructive/10 border-destructive text-destructive";
                } else {
                  optionClass += " bg-muted/50 border-border text-muted-foreground";
                }
              } else if (isSelected) {
                optionClass += " bg-primary/10 border-primary text-primary";
              } else {
                optionClass += " bg-background border-border hover:bg-primary/5";
              }

              return (
                <div
                  key={index}
                  className={optionClass}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1">{option}</div>
                    {showExplanation && isCorrectOption && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    {showExplanation && isSelected && !isCorrectOption && (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explication */}
        {showExplanation && (
          <div className={`rounded-lg p-4 border-2 ${isCorrect ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'}`}>
            <h4 className={`font-semibold mb-2 ${isCorrect ? 'text-success' : 'text-warning'}`}>
              {isCorrect ? '✅ Bonne réponse !' : '❌ Réponse incorrecte'}
            </h4>
            <p className={isCorrect ? 'text-success/80' : 'text-warning-foreground'}>
              {currentQ.explanation}
            </p>
            
            {!isCorrect && currentQ.commonErrors.length > 0 && (
              <div className="mt-3 p-3 bg-warning/10 rounded border border-warning/20">
                <h5 className="font-medium text-warning-foreground mb-1">Erreurs fréquentes à éviter :</h5>
                <ul className="text-sm text-warning-foreground/80 list-disc list-inside">
                  {currentQ.commonErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
          
          <Button
            onClick={handleNextQuestion}
            disabled={!showExplanation}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {currentQuestion === questions.length - 1 ? 'Terminer' : 'Suivant'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
