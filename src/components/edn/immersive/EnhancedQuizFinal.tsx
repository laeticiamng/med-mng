import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  Target,
  Zap,
  Star,
  Timer,
  Award,
  Sparkles
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  category: string;
}

interface EnhancedQuizFinalProps {
  questions: QuizQuestion[];
  itemCode: string;
  itemTitle: string;
}

export const EnhancedQuizFinal = ({ questions, itemCode, itemTitle }: EnhancedQuizFinalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, showResult]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);

    // Check if correct
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(Math.max(maxStreak, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    // Auto advance after 2 seconds
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        finishQuiz();
      }
    }, 2000);
  };

  const finishQuiz = () => {
    const correctCount = selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
    setScore(Math.round((correctCount / questions.length) * 100));
    setShowResult(true);
  };

  const getScoreColor = () => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Bien';
    return 'À revoir';
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-black/30 backdrop-blur-xl border border-white/20">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2 }}
                className="mb-6"
              >
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Quiz Terminé !</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className={`text-3xl font-bold ${getScoreColor()}`}>{score}%</div>
                  <div className="text-gray-300 text-sm">Score Final</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-400">{maxStreak}</div>
                  <div className="text-gray-300 text-sm">Meilleure Série</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-400">{Math.floor((300 - timeLeft) / 60)}min</div>
                  <div className="text-gray-300 text-sm">Temps Total</div>
                </div>
              </div>
              
              <Badge className={`${score >= 70 ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-2 text-lg`}>
                {getScoreBadge()}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const hasAnswered = selectedAnswers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Header */}
      <Card className="bg-black/30 backdrop-blur-xl border border-white/20 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">Quiz Final Interactif</CardTitle>
              <p className="text-gray-300">{itemTitle}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-white border-white/30">
                {itemCode}
              </Badge>
              <div className="flex items-center gap-2 text-white">
                <Timer className="h-4 w-4" />
                <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2 mt-4" />
        </CardHeader>
      </Card>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
                  {currentQuestion + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{currentQ.question}</h3>
                  <Badge variant="outline" className="text-purple-300 border-purple-400/30">
                    {currentQ.category}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {currentQ.options.map((option, index) => {
                  const isSelected = selectedAnswers[currentQuestion] === index;
                  const isCorrect = index === currentQ.correctAnswer;
                  const showCorrection = hasAnswered;

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: hasAnswered ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !hasAnswered && handleAnswerSelect(index)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        hasAnswered
                          ? isCorrect
                            ? 'border-green-500 bg-green-500/20 text-white'
                            : isSelected
                            ? 'border-red-500 bg-red-500/20 text-white'
                            : 'border-white/20 bg-white/5 text-gray-300'
                          : 'border-white/20 bg-white/5 hover:bg-white/10 text-white'
                      }`}
                      disabled={hasAnswered}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showCorrection && isCorrect && (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        )}
                        {showCorrection && isSelected && !isCorrect && (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {hasAnswered && currentQ.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30"
                >
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-1">Explication</h4>
                      <p className="text-blue-100 text-sm">{currentQ.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Stats */}
      <Card className="bg-black/20 backdrop-blur-xl border border-white/20 mt-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-400" />
                <span className="text-sm">Série: {streak}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">Record: {maxStreak}</span>
              </div>
            </div>
            <div className="text-sm text-gray-300">
              Question {currentQuestion + 1} / {questions.length}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};