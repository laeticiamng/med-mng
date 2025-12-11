import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Clock, CheckCircle, XCircle, Play, Pause, RotateCcw,
  Trophy, Target, TrendingUp, AlertTriangle, ChevronLeft,
  Timer, Award, BarChart3, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useExamMode, ExamQuestion, ExamSession } from '@/hooks/useExamMode';
import { useToast } from '@/hooks/use-toast';
import { ROUTE_PATHS } from '@/config/routes';

export default function ExamMode() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    loading, currentSession, questions, 
    startExam, submitAnswer, completeExam, getStats, resetExam 
  } = useExamMode();

  const [user, setUser] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);
  const [activeTab, setActiveTab] = useState('exam');

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Connectez-vous pour accéder au mode examen",
          variant: "destructive"
        });
        navigate(ROUTE_PATHS.medMngLogin);
        return;
      }
      setUser(user);
      setStats(getStats(user.id));
    };
    checkAuth();
  }, [navigate, toast, getStats]);

  // Timer
  useEffect(() => {
    if (!currentSession || !currentSession.time_limit_minutes) return;
    
    const startTime = new Date(currentSession.started_at).getTime();
    const endTime = startTime + (currentSession.time_limit_minutes * 60 * 1000);
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        handleCompleteExam();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartExam = async () => {
    if (!user) return;
    await startExam(user.id, 'standard', 20, 30);
    setCurrentQuestionIndex(0);
    setQuestionStartTime(Date.now());
  };

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = submitAnswer(
      questions[currentQuestionIndex].id,
      selectedAnswer,
      timeSpent
    );
    
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuestionStartTime(Date.now());
    } else {
      handleCompleteExam();
    }
  };

  const handleCompleteExam = async () => {
    await completeExam();
    if (user) {
      setStats(getStats(user.id));
    }
  };

  const handleNewExam = () => {
    resetExam();
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = questions.length > 0 
    ? ((currentQuestionIndex + (showResult ? 1 : 0)) / questions.length) * 100 
    : 0;

  const getAnswerStatus = (session: ExamSession) => {
    const correct = Object.values(session.answers).filter(a => a.correct).length;
    const total = Object.keys(session.answers).length;
    return { correct, total };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Helmet>
        <title>Mode Examen | MED-MNG</title>
        <meta name="description" content="Simulez un examen EDN avec questions chronométrées" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Mode Examen
            </h1>
            <p className="text-muted-foreground">Simulez les conditions d'examen EDN</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
            <TabsTrigger value="exam" className="gap-2">
              <Brain className="h-4 w-4" />
              Examen
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exam">
            {/* No active exam - Start screen */}
            {!currentSession && (
              <Card className="text-center">
                <CardContent className="p-12">
                  <Trophy className="h-20 w-20 mx-auto mb-6 text-accent" />
                  <h2 className="text-2xl font-bold mb-4">Prêt pour l'examen ?</h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    20 questions • 30 minutes • QCM basés sur le référentiel EDN
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">30 min</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <Target className="h-6 w-6 mx-auto mb-2 text-accent" />
                      <p className="text-sm font-medium">20 QCM</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <Award className="h-6 w-6 mx-auto mb-2 text-warning" />
                      <p className="text-sm font-medium">Feedback</p>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleStartExam}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Play className="h-5 w-5" />
                    Commencer l'examen
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Active exam */}
            {currentSession && !currentSession.completed_at && currentQuestion && (
              <div className="space-y-6">
                {/* Timer and progress */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="gap-2 text-lg px-4 py-2">
                    <Timer className="h-4 w-4" />
                    {formatTime(timeRemaining)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} / {questions.length}
                  </span>
                </div>
                
                <Progress value={progressPercent} className="h-2" />

                {/* Question card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        currentQuestion.difficulty === 'easy' ? 'secondary' :
                        currentQuestion.difficulty === 'medium' ? 'default' : 'destructive'
                      }>
                        {currentQuestion.difficulty === 'easy' ? 'Facile' :
                         currentQuestion.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                      </Badge>
                      <Badge variant="outline">{currentQuestion.item_code}</Badge>
                    </div>
                    <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        disabled={showResult}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          showResult
                            ? index === currentQuestion.correct_answer
                              ? 'border-success bg-success/10'
                              : selectedAnswer === index
                                ? 'border-destructive bg-destructive/10'
                                : 'border-muted'
                            : selectedAnswer === index
                              ? 'border-primary bg-primary/10'
                              : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="flex-1">{option}</span>
                          {showResult && index === currentQuestion.correct_answer && (
                            <CheckCircle className="h-5 w-5 text-success" />
                          )}
                          {showResult && selectedAnswer === index && index !== currentQuestion.correct_answer && (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                      </button>
                    ))}

                    {/* Explanation */}
                    {showResult && (
                      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Explication</h4>
                        <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-4">
                      {!showResult ? (
                        <Button 
                          onClick={handleSubmitAnswer}
                          disabled={selectedAnswer === null}
                        >
                          Valider
                        </Button>
                      ) : (
                        <Button onClick={handleNextQuestion}>
                          {currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Terminer'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Exam completed */}
            {currentSession?.completed_at && (
              <Card className="text-center">
                <CardContent className="p-12">
                  {(currentSession.score ?? 0) >= 70 ? (
                    <Trophy className="h-20 w-20 mx-auto mb-6 text-success" />
                  ) : (currentSession.score ?? 0) >= 50 ? (
                    <Target className="h-20 w-20 mx-auto mb-6 text-warning" />
                  ) : (
                    <AlertTriangle className="h-20 w-20 mx-auto mb-6 text-destructive" />
                  )}
                  
                  <h2 className="text-3xl font-bold mb-2">
                    {currentSession.score}%
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    {getAnswerStatus(currentSession).correct} / {getAnswerStatus(currentSession).total} réponses correctes
                  </p>

                  {/* Results breakdown */}
                  <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                    <div className="bg-success/10 rounded-lg p-4">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2 text-success" />
                      <p className="text-2xl font-bold text-success">{getAnswerStatus(currentSession).correct}</p>
                      <p className="text-sm text-muted-foreground">Correctes</p>
                    </div>
                    <div className="bg-destructive/10 rounded-lg p-4">
                      <XCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
                      <p className="text-2xl font-bold text-destructive">
                        {getAnswerStatus(currentSession).total - getAnswerStatus(currentSession).correct}
                      </p>
                      <p className="text-sm text-muted-foreground">Incorrectes</p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
                      Retour aux items
                    </Button>
                    <Button onClick={handleNewExam} className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Nouvel examen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats">
            {stats && (
              <div className="space-y-6">
                {/* Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{stats.totalExams}</p>
                      <p className="text-sm text-muted-foreground">Examens passés</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
                      <p className="text-2xl font-bold">{stats.averageScore}%</p>
                      <p className="text-sm text-muted-foreground">Score moyen</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-warning" />
                      <p className="text-2xl font-bold">{stats.bestScore}%</p>
                      <p className="text-sm text-muted-foreground">Meilleur score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-accent" />
                      <p className="text-2xl font-bold">{stats.correctAnswers}</p>
                      <p className="text-sm text-muted-foreground">Bonnes réponses</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Weak topics */}
                {stats.weakTopics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        Points à travailler
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.weakTopics.map((topic, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <Badge variant="outline" className="mb-1">{topic.item_code}</Badge>
                              <p className="text-sm">{topic.title}</p>
                            </div>
                            <Badge variant="destructive">
                              {Math.round(topic.errorRate * 100)}% erreurs
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent exams */}
                {stats.recentExams.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Examens récents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {stats.recentExams.map((exam, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">
                              {new Date(exam.date).toLocaleDateString('fr-FR')}
                            </span>
                            <Badge variant={exam.score >= 70 ? 'default' : exam.score >= 50 ? 'secondary' : 'destructive'}>
                              {exam.score}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
