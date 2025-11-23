import logger from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  Music, 
  Trophy,
  Target,
  BookOpen,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUpdateProgressAfterQuiz } from '@/hooks/useQuizProgress';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  rang?: 'A' | 'B';
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface UserAnswer {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizSession {
  sessionId: string;
  itemCode: string;
  rang: 'A' | 'B' | 'mix';
  questions: QuizQuestion[];
  answers: UserAnswer[];
  startTime: Date;
  endTime?: Date;
  score: number;
  completed: boolean;
  timeSpent?: number; // Total time in milliseconds
}

interface EnhancedQuizProps {
  itemCode: string;
  itemTitle: string;
  questions: QuizQuestion[];
  rang: 'A' | 'B' | 'mix';
  onComplete?: (session: QuizSession) => void;
}

export const EnhancedQuiz: React.FC<EnhancedQuizProps> = ({
  itemCode,
  itemTitle,
  questions,
  rang,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showCorrection, setShowCorrection] = useState(true);
  const [sessionStartTime] = useState(new Date());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGeneratingErrorSong, setIsGeneratingErrorSong] = useState(false);

  // Hook to update EDN progress after quiz completion
  const updateProgress = useUpdateProgressAfterQuiz();

  // Timer pour chaque question
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Date.now() - questionStartTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [questionStartTime]);

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const score = answers.filter(a => a.isCorrect).length;
  const totalScore = answers.length > 0 ? Math.round((score / answers.length) * 100) : 0;

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null) return; // Déjà répondu

    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === currentQuestionData.correct;
    const timeForQuestion = Date.now() - questionStartTime;

    const userAnswer: UserAnswer = {
      questionId: currentQuestionData.id,
      selectedOption: optionIndex,
      isCorrect,
      timeSpent: timeForQuestion
    };

    setAnswers(prev => [...prev, userAnswer]);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
      setTimeSpent(0);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    // Calculate total time spent across all answers
    const totalTimeSpent = answers.reduce((sum, answer) => sum + answer.timeSpent, 0);

    const session: QuizSession = {
      sessionId: crypto.randomUUID(),
      itemCode,
      rang,
      questions,
      answers,
      startTime: sessionStartTime,
      endTime: new Date(),
      score: totalScore,
      completed: true,
      timeSpent: totalTimeSpent
    };

    setIsCompleted(true);
    onComplete?.(session);

    // Sauvegarder la session
    saveQuizSession(session);
  };

  const saveQuizSession = async (session: QuizSession) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        logger.warn('No user logged in, skipping quiz session save');
        return;
      }

      // Map 'mix' rang to 'AB' for database compatibility
      const dbRang = session.rang === 'mix' ? 'AB' : session.rang;

      // Convert milliseconds to seconds for database
      const timeInSeconds = session.timeSpent ? Math.round(session.timeSpent / 1000) : null;

      const { error } = await supabase.from('quiz_sessions').insert({
        user_id: user.id,
        item_code: session.itemCode,
        rang: dbRang,
        score: session.score,
        questions_count: session.questions.length,
        correct_answers: session.answers.filter(a => a.isCorrect).length,
        session_data: session,
        time_spent_seconds: timeInSeconds
      });

      if (error) {
        logger.error('Error saving quiz session:', error);
        toast.error('Impossible de sauvegarder la session de quiz');
      } else {
        logger.debug('✅ Quiz session saved successfully');
        toast.success('Session de quiz sauvegardée');

        // Update EDN progress after successful quiz save
        const timeInMinutes = timeInSeconds ? Math.round(timeInSeconds / 60) : 0;
        updateProgress.mutate({
          itemCode: session.itemCode,
          score: session.score,
          timeSpentMinutes: timeInMinutes,
        });
      }
    } catch (error) {
      logger.error('Error saving quiz session:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const generateErrorSong = async () => {
    setIsGeneratingErrorSong(true);
    
    try {
      const wrongAnswers = answers.filter(a => !a.isCorrect);
      const errorTopics = wrongAnswers.map(answer => {
        const question = questions.find(q => q.id === answer.questionId);
        return {
          question: question?.question,
          correctAnswer: question?.options[question.correct],
          explanation: question?.explanation
        };
      });

      const { data, error } = await supabase.functions.invoke('generate-error-correction-song', {
        body: {
          itemCode,
          itemTitle,
          errorTopics,
          rang
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('🎵 Chanson de correction générée !', {
          description: 'La chanson a été ajoutée à votre bibliothèque.'
        });
        
        // Ajouter à la bibliothèque utilisateur
        await supabase.from('med_mng_user_songs').insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          song_id: data.song_id
        });
      }
    } catch (error) {
      logger.error('Error generating error song:', error);
      toast.error('Erreur lors de la génération de la chanson');
    } finally {
      setIsGeneratingErrorSong(false);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuestionStartTime(Date.now());
    setTimeSpent(0);
    setIsCompleted(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Trophy className="h-6 w-6 text-green-600" />;
    if (score >= 60) return <Target className="h-6 w-6 text-yellow-600" />;
    return <AlertCircle className="h-6 w-6 text-red-600" />;
  };

  if (isCompleted) {
    const wrongAnswers = answers.filter(a => !a.isCorrect);
    
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            {getScoreIcon(totalScore)}
            <CardTitle className="text-2xl">Quiz Terminé !</CardTitle>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={cn("text-3xl font-bold", getScoreColor(totalScore))}>
                {totalScore}%
              </div>
              <p className="text-sm text-muted-foreground">Score Final</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {score}/{answers.length}
              </div>
              <p className="text-sm text-muted-foreground">Bonnes Réponses</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(answers.reduce((sum, a) => sum + a.timeSpent, 0) / 1000)}s
              </div>
              <p className="text-sm text-muted-foreground">Temps Total</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Actions principales */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={restartQuiz} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Refaire le Quiz
            </Button>
            
            {wrongAnswers.length > 0 && (
              <Button 
                onClick={generateErrorSong}
                disabled={isGeneratingErrorSong}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Music className="h-4 w-4 mr-2" />
                {isGeneratingErrorSong ? 'Génération...' : 'Chanson de mes Erreurs'}
              </Button>
            )}
          </div>

          {/* Résultats détaillés */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résultats Détaillés</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const userAnswer = answers.find(a => a.questionId === question.id);
                    if (!userAnswer) return null;

                    return (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          {userAnswer.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-1" />
                          )}
                          
                          <div className="flex-1 space-y-2">
                            <p className="font-medium">{question.question}</p>
                            
                            <div className="grid gap-1">
                              <div className={cn(
                                "text-sm p-2 rounded",
                                userAnswer.isCorrect 
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              )}>
                                Votre réponse: {question.options[userAnswer.selectedOption]}
                              </div>
                              
                              {!userAnswer.isCorrect && (
                                <div className="text-sm p-2 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Bonne réponse: {question.options[question.correct]}
                                </div>
                              )}
                            </div>
                            
                            {showCorrection && (
                              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                {question.explanation}
                              </div>
                            )}
                            
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline">{question.rang || 'Mix'}</Badge>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {Math.round(userAnswer.timeSpent / 1000)}s
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quiz {itemCode} - {rang === 'mix' ? 'Rang A+B' : `Rang ${rang}`}
            </CardTitle>
            <p className="text-muted-foreground">{itemTitle}</p>
          </div>
          
          <div className="text-right space-y-1">
            <div className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} / {questions.length}
            </div>
            {answers.length > 0 && (
              <div className={cn("text-sm font-medium", getScoreColor(totalScore))}>
                Score: {totalScore}% ({score}/{answers.length})
              </div>
            )}
          </div>
        </div>
        
        <Progress value={progress} className="w-full" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question actuelle */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {currentQuestionData.rang || 'Mix'}
                </Badge>
                {currentQuestionData.difficulty && (
                  <Badge variant="secondary">
                    {currentQuestionData.difficulty}
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {Math.round(timeSpent / 1000)}s
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <h3 className="text-lg font-medium mb-4">
              {currentQuestionData.question}
            </h3>
            
            <div className="grid gap-3">
              {currentQuestionData.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "justify-start text-left h-auto p-4 transition-all duration-200",
                    selectedOption === index && (
                      index === currentQuestionData.correct
                        ? "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    ),
                    selectedOption !== null && index === currentQuestionData.correct && selectedOption !== index &&
                      "bg-green-50 border-green-300 dark:bg-green-900/20",
                    selectedOption === null && "hover:bg-muted/50"
                  )}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedOption !== null}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                      selectedOption === index && (
                        index === currentQuestionData.correct
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-red-500 border-red-500 text-white"
                      ),
                      selectedOption !== null && index === currentQuestionData.correct && selectedOption !== index &&
                        "bg-green-500 border-green-500 text-white"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option}</span>
                    {selectedOption === index && (
                      index === currentQuestionData.correct 
                        ? <CheckCircle className="h-5 w-5 text-green-600" />
                        : <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    {selectedOption !== null && index === currentQuestionData.correct && selectedOption !== index && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Explication */}
        {showExplanation && showCorrection && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Explication
              </h4>
              <p className="text-sm">{currentQuestionData.explanation}</p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setShowCorrection(!showCorrection)}
            size="sm"
          >
            {showCorrection ? 'Cacher' : 'Afficher'} les corrections
          </Button>
          
          <Button
            onClick={nextQuestion}
            disabled={selectedOption === null}
            className="min-w-[120px]"
          >
            {currentQuestion < questions.length - 1 ? 'Suivant' : 'Terminer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};