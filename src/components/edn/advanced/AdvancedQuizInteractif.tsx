import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Brain, RotateCcw, Trophy, Target, Sparkles, Timer } from 'lucide-react';
import MicroInteractions from '@/components/experience/MicroInteractions';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface AdvancedQuizInteractifProps {
  itemData: {
    id: string;
    title: string;
    quiz_questions?: Question[];
    item_code?: string;
  };
  competences: string[];
  onProgress?: (progress: number) => void;
}

export const AdvancedQuizInteractif: React.FC<AdvancedQuizInteractifProps> = ({
  itemData,
  competences,
  onProgress
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [quizMode, setQuizMode] = useState<'practice' | 'timed' | 'exam'>('practice');

  // Questions par défaut si aucune fournie
  const defaultQuestions: Question[] = [
    {
      id: '1',
      question: 'Quelle est la fonction principale de cette notion ?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 1,
      explanation: 'La réponse B est correcte car...',
      difficulty: 'medium'
    },
    {
      id: '2',
      question: 'Comment appliquer ce concept dans la pratique ?',
      options: ['Méthode 1', 'Méthode 2', 'Méthode 3', 'Méthode 4'],
      correctAnswer: 2,
      explanation: 'La méthode 3 est la plus appropriée...',
      difficulty: 'hard'
    }
  ];

  const questions = itemData.quiz_questions?.length ? itemData.quiz_questions : defaultQuestions;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
  }, [isTimerActive, timeLeft]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(quizMode === 'timed' ? 30 : 0);
    } else {
      finishQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const finishQuiz = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    setScore(correctAnswers);
    setShowResults(true);
    setIsTimerActive(false);
    
    const progressPercentage = (correctAnswers / totalQuestions) * 100;
    onProgress?.(progressPercentage);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setScore(0);
    setTimeLeft(quizMode === 'timed' ? 30 : 0);
    setIsTimerActive(false);
    onProgress?.(0);
  };

  const startQuiz = (mode: 'practice' | 'timed' | 'exam') => {
    setQuizMode(mode);
    setIsTimerActive(mode === 'timed');
    if (mode === 'timed') {
      setTimeLeft(30);
    }
    resetQuiz();
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (showResults) {
    return (
      <Card className="min-h-[600px] bg-gradient-to-br from-background/80 to-muted/40 backdrop-blur-sm">
          <CardHeader className="bg-background/90 backdrop-blur-xl border-b">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              Résultats du Quiz
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 text-center">
            <div className="mb-8">
              <div className={`text-6xl font-bold mb-4 ${getScoreColor()}`}>
                {score}/{totalQuestions}
              </div>
              <p className="text-xl text-muted-foreground mb-2">
                Score: {Math.round((score / totalQuestions) * 100)}%
              </p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {score === totalQuestions ? 'Parfait!' : 
                 score >= totalQuestions * 0.8 ? 'Excellent!' :
                 score >= totalQuestions * 0.6 ? 'Bien!' : 'À améliorer'}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Répartition des réponses</h4>
                {questions.map((question, index) => (
                  <div key={question.id} className="flex items-center gap-2 mb-1">
                    {selectedAnswers[index] === question.correctAnswer ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Question {index + 1}</span>
                  </div>
                ))}
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Compétences validées
                </h4>
                <div className="flex flex-wrap gap-1">
                  {competences.map((comp, index) => (
                    <Badge 
                      key={index}
                      variant={score >= totalQuestions * 0.7 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {comp}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={resetQuiz} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Recommencer
              </Button>
              <Button onClick={() => startQuiz('practice')} className="gap-2">
                <Brain className="h-4 w-4" />
                Nouveau Quiz
              </Button>
            </div>
          </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[600px] bg-gradient-to-br from-background/80 to-muted/40 backdrop-blur-sm">
        <CardHeader className="bg-background/90 backdrop-blur-xl border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Quiz Interactif
                  <Badge variant="secondary">
                    {currentQuestionIndex + 1} / {totalQuestions}
                  </Badge>
                  {currentQuestion.difficulty && (
                    <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                      {currentQuestion.difficulty}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {itemData.title} - Évaluation interactive
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {quizMode === 'timed' && (
                <div className="flex items-center gap-2 text-sm">
                  <Timer className="h-4 w-4" />
                  <span className={timeLeft <= 10 ? 'text-red-600 font-bold' : ''}>
                    {timeLeft}s
                  </span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={resetQuiz}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Progress 
              value={((currentQuestionIndex + 1) / totalQuestions) * 100} 
              className="h-2"
            />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!isTimerActive && currentQuestionIndex === 0 && selectedAnswers.length === 0 && (
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-4">Choisissez votre mode de quiz</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => startQuiz('practice')}
                  className="h-20 flex-col gap-2"
                >
                  <Brain className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Pratique</div>
                    <div className="text-xs">Sans limite de temps</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => startQuiz('timed')}
                  className="h-20 flex-col gap-2"
                >
                  <Timer className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Chronométré</div>
                    <div className="text-xs">30s par question</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => startQuiz('exam')}
                  className="h-20 flex-col gap-2"
                >
                  <Target className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Examen</div>
                    <div className="text-xs">Mode évaluation</div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {currentQuestion.question}
              </h3>

              <RadioGroup
                value={selectedAnswers[currentQuestionIndex]?.toString()}
                onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="gap-2"
            >
              Précédent
            </Button>

            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentQuestionIndex] === undefined}
              className="gap-2"
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Terminer' : 'Suivant'}
            </Button>
          </div>

          {/* Compétences évaluées */}
          <Card className="mt-6 bg-background/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                Compétences évaluées
              </h4>
              <div className="flex flex-wrap gap-2">
                {competences.map((comp, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                  >
                    {comp}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
    </Card>
  );
};