import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    BookOpen,
    CheckCircle,
    Clock,
    Flame,
    Music,
    RotateCcw,
    Star,
    Target,
    Trophy,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
  const [user, setUser] = useState<any>(null);

  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, addPoints, unlockBadge, loadStats } = useGamification();

  // Check user on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
    };
    checkUser();
  }, [loadStats]);

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

  const completeQuiz = async () => {
    const session: QuizSession = {
      sessionId: crypto.randomUUID(),
      itemCode,
      rang,
      questions,
      answers,
      startTime: sessionStartTime,
      endTime: new Date(),
      score: totalScore,
      completed: true
    };

    setIsCompleted(true);
    onComplete?.(session);
    
    // Track activity and award points
    if (user) {
      await logActivity({
        activity_type: 'exam',
        count: 1,
        metadata: { 
          itemCode,
          rang,
          score: totalScore,
          questionsCount: questions.length 
        }
      });
      
      // Award points based on score
      if (totalScore === 100) {
        await addPoints(user.id, 'perfectExam');
        await unlockBadge(user.id, 'perfect_exam');
        toast.success('🏆 Badge "Sans Faute" débloqué !');
      } else {
        await addPoints(user.id, 'examCompleted');
      }
      
      loadStats(user.id);
    }
    
    // Sauvegarder la session
    saveQuizSession(session);
  };

  const saveQuizSession = async (session: QuizSession) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.log('Quiz session completed (not logged in):', session.sessionId);
        return;
      }

      const timeSpent = session.endTime 
        ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000) 
        : 0;
      const correctAnswers = session.answers.filter(a => a.isCorrect).length;
      const wrongAnswers = session.answers.length - correctAnswers;

      // 1. Save to quiz_results table for analytics
      await supabase.from('quiz_results').insert({
        user_id: currentUser.id,
        item_code: session.itemCode,
        item_title: itemTitle,
        score: session.score,
        total_questions: session.questions.length,
        correct_answers: correctAnswers,
        wrong_answers: wrongAnswers,
        time_spent: timeSpent,
        answers: session.answers.map(a => ({
          questionId: a.questionId,
          selectedOption: a.selectedOption,
          isCorrect: a.isCorrect,
          timeSpent: a.timeSpent
        })),
        created_at: new Date().toISOString()
      });

      // 2. Save to user_activity_log for activity tracking
      await supabase.from('user_activity_log').insert({
        user_id: currentUser.id,
        activity_type: 'exam',
        activity_date: new Date().toISOString().split('T')[0],
        count: 1,
        metadata: {
          session_id: session.sessionId,
          item_code: session.itemCode,
          rang: session.rang,
          score: session.score,
          questions_count: session.questions.length,
          correct_answers: correctAnswers,
          time_spent: timeSpent
        }
      });

      // 3. Save to gamification_activities for points
      await supabase.from('gamification_activities').insert({
        user_id: currentUser.id,
        activity_type: 'quiz_completed',
        activity_name: `Quiz ${session.itemCode} - ${session.rang}`,
        points_earned: session.score >= 80 ? 100 : session.score >= 60 ? 50 : 25,
        created_at: new Date().toISOString()
      } as any);

      console.log('Quiz session saved to quiz_results:', session.sessionId);
    } catch (error) {
      console.error('Error saving quiz session:', error);
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
      console.error('Error generating error song:', error);
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
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Trophy className="h-6 w-6 text-success" />;
    if (score >= 60) return <Target className="h-6 w-6 text-warning" />;
    return <AlertCircle className="h-6 w-6 text-destructive" />;
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
          
          {/* Gamification Stats */}
          {user && gamificationStats && (
            <div className="flex justify-center">
              <div className="flex items-center gap-4 px-4 py-2 bg-muted/50 rounded-full">
                <div className="flex items-center gap-1 text-warning">
                  <Flame className="h-4 w-4" />
                  <span className="font-bold">{gamificationStats.currentStreak}</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-4 w-4" />
                  <span className="font-bold">Nv.{gamificationStats.level}</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <Badge variant="secondary">{gamificationStats.totalPoints} XP</Badge>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={cn("text-3xl font-bold", getScoreColor(totalScore))}>
                {totalScore}%
              </div>
              <p className="text-sm text-muted-foreground">Score Final</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">
                {score}/{answers.length}
              </div>
              <p className="text-sm text-muted-foreground">Bonnes Réponses</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
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
                className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
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
                  {questions.map((question, _index) => {
                    const userAnswer = answers.find(a => a.questionId === question.id);
                    if (!userAnswer) return null;

                    return (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          {userAnswer.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-success mt-1" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive mt-1" />
                          )}
                          
                          <div className="flex-1 space-y-2">
                            <p className="font-medium">{question.question}</p>
                            
                            <div className="grid gap-1">
                              <div className={cn(
                                "text-sm p-2 rounded",
                                userAnswer.isCorrect 
                                  ? "bg-success/10 text-success"
                                  : "bg-destructive/10 text-destructive"
                              )}>
                                Votre réponse: {question.options[userAnswer.selectedOption]}
                              </div>
                              
                              {!userAnswer.isCorrect && (
                                <div className="text-sm p-2 rounded bg-success/10 text-success">
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
                        ? "bg-success/10 border-success text-success"
                        : "bg-destructive/10 border-destructive text-destructive"
                    ),
                    selectedOption !== null && index === currentQuestionData.correct && selectedOption !== index &&
                      "bg-success/5 border-success/30",
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
                          ? "bg-success border-success text-success-foreground"
                          : "bg-destructive border-destructive text-destructive-foreground"
                      ),
                      selectedOption !== null && index === currentQuestionData.correct && selectedOption !== index &&
                        "bg-success border-success text-success-foreground"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option}</span>
                    {selectedOption === index && (
                      index === currentQuestionData.correct 
                        ? <CheckCircle className="h-5 w-5 text-success" />
                        : <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    {selectedOption !== null && index === currentQuestionData.correct && selectedOption !== index && (
                      <CheckCircle className="h-5 w-5 text-success" />
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