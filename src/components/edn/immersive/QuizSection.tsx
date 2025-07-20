
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explication: string;
  rang: 'A' | 'B';
}

interface QuizSectionProps {
  quizData: any;
  itemCode: string;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ quizData, itemCode }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  // Répartition 70% Rang A / 30% Rang B
  const questions: QuizQuestion[] = useMemo(() => {
    if (!quizData?.questions) return [];
    
    const allQuestions = quizData.questions;
    const rangAQuestions = allQuestions.filter((q: QuizQuestion) => q.rang === 'A');
    const rangBQuestions = allQuestions.filter((q: QuizQuestion) => q.rang === 'B');
    
    // Calculer le nombre de questions pour chaque rang (70% A, 30% B)
    const totalQuestions = Math.min(10, allQuestions.length); // Maximum 10 questions
    const nbRangA = Math.ceil(totalQuestions * 0.7);
    const nbRangB = totalQuestions - nbRangA;
    
    // Sélectionner les questions selon la répartition
    const selectedRangA = rangAQuestions.slice(0, nbRangA);
    const selectedRangB = rangBQuestions.slice(0, nbRangB);
    
    return [...selectedRangA, ...selectedRangB].sort(() => Math.random() - 0.5);
  }, [quizData]);

  if (!quizData || !questions.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">⚠️ Quiz - Contenu indisponible</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Les questions du quiz ne sont pas encore disponibles dans Supabase.</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (!answeredQuestions.has(currentQuestionIndex)) {
      setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]));
      setScore(prev => ({
        correct: prev.correct + (answerIndex === currentQuestion.correct ? 1 : 0),
        total: prev.total + 1
      }));
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, total: 0 });
    setAnsweredQuestions(new Set());
  };

  const getScorePercentage = () => {
    return score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Quiz {itemCode}</span>
            <Badge variant={currentQuestion.rang === 'A' ? 'default' : 'secondary'}>
              Rang {currentQuestion.rang}
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1}/{questions.length}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
          <span className="text-sm text-blue-700">Répartition: 70% Rang A, 30% Rang B</span>
          <span className="text-sm font-medium">Score: {score.correct}/{score.total} ({getScorePercentage()}%)</span>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
          
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showExplanation}
                className={`w-full p-3 text-left rounded border transition-colors ${
                  showExplanation
                    ? index === currentQuestion.correct
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : selectedAnswer === index
                      ? 'bg-red-100 border-red-500 text-red-800'
                      : 'bg-gray-50 border-gray-300'
                    : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showExplanation && (
                    <>
                      {index === currentQuestion.correct && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {selectedAnswer === index && index !== currentQuestion.correct && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>

          {showExplanation && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-yellow-800">
                <strong>Explication :</strong> {currentQuestion.explication}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            onClick={resetQuiz}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Recommencer
          </Button>
          
          {showExplanation && !isLastQuestion && (
            <Button onClick={nextQuestion}>
              Question suivante
            </Button>
          )}
          
          {showExplanation && isLastQuestion && (
            <div className="text-right">
              <p className="text-lg font-semibold">
                Quiz terminé ! Score final : {getScorePercentage()}%
              </p>
              {getScorePercentage() >= 80 && (
                <p className="text-green-600">🎉 Excellent travail !</p>
              )}
              {getScorePercentage() >= 60 && getScorePercentage() < 80 && (
                <p className="text-yellow-600">👍 Bon travail, continuez vos efforts !</p>
              )}
              {getScorePercentage() < 60 && (
                <p className="text-red-600">📚 Révisez et réessayez !</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
