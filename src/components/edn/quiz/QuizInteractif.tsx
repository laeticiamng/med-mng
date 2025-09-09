import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy, 
  Target,
  Lightbulb,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface QuizInteractifProps {
  item: any;
  questions?: any[];
  onProgress?: (progress: number) => void;
}

export const QuizInteractif: React.FC<QuizInteractifProps> = ({ 
  item, 
  questions = [], 
  onProgress 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [score, setScore] = useState(0);

  // Questions par défaut si pas de données
  const defaultQuestions = [
    {
      id: 1,
      question: `Concernant ${item.title}, quelle est la démarche diagnostique appropriée ?`,
      options: [
        'Commencer par des examens complémentaires coûteux',
        'Réaliser d\'abord un interrogatoire et un examen clinique',
        'Prescrire systématiquement une imagerie',
        'Orienter immédiatement vers un spécialiste'
      ],
      correct: 1,
      explanation: 'La démarche diagnostique doit toujours commencer par un interrogatoire minutieux et un examen clinique complet avant d\'envisager des examens complémentaires.',
      level: 'Fondamental',
      points: 10
    },
    {
      id: 2,
      question: `Dans le cadre de ${item.title}, quel est le principe thérapeutique de base ?`,
      options: [
        'Traitement symptomatique uniquement',
        'Approche personnalisée selon le patient',
        'Protocole standardisé pour tous',
        'Attendre l\'évolution spontanée'
      ],
      correct: 1,
      explanation: 'Chaque patient est unique et nécessite une approche thérapeutique personnalisée prenant en compte ses caractéristiques individuelles.',
      level: 'Intermédiaire',
      points: 15
    },
    {
      id: 3,
      question: `Pour le suivi d\'un patient avec ${item.title}, quelle attitude adopter ?`,
      options: [
        'Contrôle unique après traitement',
        'Suivi standardisé identique pour tous',
        'Suivi adapté à la gravité et au patient',
        'Pas de suivi si amélioration'
      ],
      correct: 2,
      explanation: 'Le suivi doit être adapté à chaque patient en fonction de la gravité de sa pathologie, de sa réponse au traitement et de ses facteurs de risque.',
      level: 'Avancé',
      points: 20
    }
  ];

  const quizQuestions = questions?.length > 0 ? questions : defaultQuestions;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0 && !showResults) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setShowResults(true);
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, showResults]);

  useEffect(() => {
    if (showResults) {
      calculateScore();
    }
  }, [showResults]);

  const startQuiz = () => {
    setIsTimerActive(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setTimeLeft(300);
  };

  const selectAnswer = (questionIndex: number, answerIndex: number) => {
    if (!showResults) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionIndex]: answerIndex
      }));
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const finishQuiz = () => {
    setShowResults(true);
    setIsTimerActive(false);
  };

  const calculateScore = () => {
    const correctAnswers = quizQuestions.filter((question, index) => 
      selectedAnswers[index] === question.correct
    ).length;
    
    const totalPoints = quizQuestions.reduce((total, question, index) => {
      return selectedAnswers[index] === question.correct 
        ? total + (question.points || 10)
        : total;
    }, 0);
    
    setScore(totalPoints);
    onProgress?.(Math.round((correctAnswers / quizQuestions.length) * 100));
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setTimeLeft(300);
    setIsTimerActive(false);
    setScore(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreLevel = () => {
    const percentage = (score / quizQuestions.reduce((total, q) => total + (q.points || 10), 0)) * 100;
    if (percentage >= 90) return { level: 'Excellent', color: 'from-green-500 to-emerald-600' };
    if (percentage >= 75) return { level: 'Très bien', color: 'from-blue-500 to-indigo-600' };
    if (percentage >= 60) return { level: 'Bien', color: 'from-yellow-500 to-orange-600' };
    return { level: 'À améliorer', color: 'from-red-500 to-pink-600' };
  };

  if (!isTimerActive && !showResults) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-500 to-yellow-600" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <TranslatedText text="Quiz Interactif" />
            </CardTitle>
            <p className="text-muted-foreground">
              Testez vos connaissances sur {item.title}
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-20 h-20 text-amber-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-foreground mb-4">
              <TranslatedText text="Prêt pour le défi ?" />
            </h3>
            <p className="text-muted-foreground mb-6">
              Ce quiz contient {quizQuestions.length} questions sur {item.title}.
              Vous avez 5 minutes pour répondre.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-muted rounded-lg">
                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="font-semibold">{quizQuestions.length} Questions</p>
                <p className="text-sm text-muted-foreground">Difficulté variée</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold">5 Minutes</p>
                <p className="text-sm text-muted-foreground">Temps limité</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="font-semibold">{quizQuestions.reduce((total, q) => total + (q.points || 10), 0)} Points</p>
                <p className="text-sm text-muted-foreground">Score maximum</p>
              </div>
            </div>

            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-lg px-8"
              onClick={startQuiz}
            >
              <Brain className="w-5 h-5 mr-2" />
              <TranslatedText text="Commencer le Quiz" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const scoreLevel = getScoreLevel();
    const correctAnswers = quizQuestions.filter((question, index) => 
      selectedAnswers[index] === question.correct
    ).length;

    return (
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${scoreLevel.color}`} />
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${scoreLevel.color} rounded-xl flex items-center justify-center`}>
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <TranslatedText text="Résultats du Quiz" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-8 text-center">
            <div className={`w-24 h-24 bg-gradient-to-br ${scoreLevel.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <Trophy className="w-12 h-12 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold text-foreground mb-2">
              {scoreLevel.level}
            </h3>
            <p className="text-xl text-muted-foreground mb-6">
              {correctAnswers}/{quizQuestions.length} bonnes réponses • {score} points
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-muted rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
                <p className="text-sm text-muted-foreground">Réponses correctes</p>
              </div>
              <div className="p-6 bg-muted rounded-xl">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <p className="text-2xl font-bold text-red-600">{quizQuestions.length - correctAnswers}</p>
                <p className="text-sm text-muted-foreground">Réponses incorrectes</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
                onClick={resetQuiz}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                <TranslatedText text="Recommencer" />
              </Button>
              <Button size="lg" variant="outline">
                <TranslatedText text="Voir les corrections" />
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Corrections détaillées */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Corrections détaillées</h3>
          {quizQuestions.map((question, index) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = userAnswer === question.correct;
            
            return (
              <Card key={question.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-foreground">
                          Question {index + 1}
                        </h4>
                        <Badge variant={isCorrect ? "default" : "destructive"}>
                          {isCorrect ? `+${question.points || 10} pts` : '0 pt'}
                        </Badge>
                      </div>
                      
                      <p className="text-foreground mb-4">{question.question}</p>
                      
                      <div className="space-y-2 mb-4">
                        {question.options.map((option: string, optionIndex: number) => {
                          const isUserChoice = userAnswer === optionIndex;
                          const isCorrectChoice = question.correct === optionIndex;
                          
                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border ${
                                isCorrectChoice 
                                  ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950'
                                  : isUserChoice && !isCorrect
                                  ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950'
                                  : 'border-border'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isCorrectChoice && <CheckCircle className="w-4 h-4 text-green-600" />}
                                {isUserChoice && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                                <span className={
                                  isCorrectChoice ? 'font-medium text-green-700 dark:text-green-300' :
                                  isUserChoice && !isCorrect ? 'font-medium text-red-700 dark:text-red-300' :
                                  'text-foreground'
                                }>
                                  {option}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Explication</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Quiz en cours
  const currentQ = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header avec timer */}
      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-amber-500 to-yellow-600" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                Quiz - Question {currentQuestion + 1}/{quizQuestions.length}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {item.title}
              </p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className={`font-mono text-lg ${timeLeft < 60 ? 'text-red-600' : 'text-foreground'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Badge variant={currentQ.level === 'Avancé' ? 'destructive' : currentQ.level === 'Intermédiaire' ? 'default' : 'secondary'}>
                {currentQ.level}
              </Badge>
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardContent className="p-8">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {currentQ.question}
            </h3>
            
            <div className="space-y-3">
              {currentQ.options.map((option: string, index: number) => {
                const isSelected = selectedAnswers[currentQuestion] === index;
                
                return (
                  <button
                    key={index}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:border-primary/50 ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => selectAnswer(currentQuestion, index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="text-foreground">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              Précédent
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={finishQuiz}>
                Terminer maintenant
              </Button>
              
              <Button 
                onClick={nextQuestion}
                disabled={selectedAnswers[currentQuestion] === undefined}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
              >
                {currentQuestion === quizQuestions.length - 1 ? 'Terminer' : 'Suivant'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};