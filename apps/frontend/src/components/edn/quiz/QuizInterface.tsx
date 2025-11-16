import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { QuizConfig } from './QuizSelector';
import { useToast } from '@/hooks/use-toast';

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

  const completeQuiz = () => {
    const quizResults = calculateResults();
    setResults(quizResults);
    setIsCompleted(true);
    onQuizComplete(quizResults);
    
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
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-green-800">
            <CheckCircle className="h-6 w-6" />
            Quiz Terminé - {itemCode}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score principal */}
          <div className="text-center p-6 bg-white/60 rounded-lg border border-green-200">
            <div className="text-4xl font-bold text-green-700 mb-2">
              {results.score}%
            </div>
            <div className="text-lg text-green-600">
              {results.correctAnswers} / {results.totalQuestions} bonnes réponses
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Temps total: {formatTime(results.timeSpent)}
            </div>
          </div>

          {/* Détail des performances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3">Par niveau</h4>
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
            
            <div className="bg-white/60 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3">Par difficulté</h4>
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
      <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
        <CardContent className="p-6 text-center">
          <div className="text-red-600">Aucune question disponible pour cette configuration.</div>
          <Button onClick={onReturnToConfig} className="mt-4">
            Retour à la configuration
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-blue-800">
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
        <div className="bg-white/60 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            {currentQ.question}
          </h3>
          
          {/* Options de réponse */}
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion] === index;
              const isCorrectOption = index === currentQ.correctAnswer;
              
              let optionClass = "p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-blue-300";
              
              if (showExplanation) {
                if (isCorrectOption) {
                  optionClass += " bg-green-100 border-green-400 text-green-800";
                } else if (isSelected && !isCorrectOption) {
                  optionClass += " bg-red-100 border-red-400 text-red-800";
                } else {
                  optionClass += " bg-gray-50 border-gray-200 text-gray-600";
                }
              } else if (isSelected) {
                optionClass += " bg-blue-100 border-blue-400 text-blue-800";
              } else {
                optionClass += " bg-white border-gray-200 hover:bg-blue-50";
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
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {showExplanation && isSelected && !isCorrectOption && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explication */}
        {showExplanation && (
          <div className={`rounded-lg p-4 border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
            <h4 className={`font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-orange-800'}`}>
              {isCorrect ? '✅ Bonne réponse !' : '❌ Réponse incorrecte'}
            </h4>
            <p className={isCorrect ? 'text-green-700' : 'text-orange-700'}>
              {currentQ.explanation}
            </p>
            
            {!isCorrect && currentQ.commonErrors.length > 0 && (
              <div className="mt-3 p-3 bg-orange-100 rounded border border-orange-200">
                <h5 className="font-medium text-orange-800 mb-1">Erreurs fréquentes à éviter :</h5>
                <ul className="text-sm text-orange-700 list-disc list-inside">
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
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {currentQuestion === questions.length - 1 ? 'Terminer' : 'Suivant'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};