import { QuizResultsCard } from '@/components/quiz/QuizResultsCard';
import { AnimatedProgressRing } from '@/components/ui/animated-progress-ring';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfettiExplosion } from '@/components/ui/confetti-explosion';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTE_PATHS } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import { AIQuestion, useAIExam } from '@/hooks/useAIExam';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { ExamQuestion, ExamSession, useExamMode } from '@/hooks/useExamMode';
import { useGamification, POINTS_CONFIG } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Award, BarChart3, Brain,
    CheckCircle,
    ChevronLeft,
    Clock,
    Loader2,
    Play,
    RotateCcw,
    Sparkles,
    Target,
    Timer,
    TrendingUp,
    Trophy,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function ExamMode() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    loading, currentSession, questions, 
    startExam, submitAnswer, completeExam, getStats, resetExam 
  } = useExamMode();
  const { 
    loading: aiLoading, generating, session: aiSession, 
    startAIExam, submitAnswer: submitAIAnswer, completeExam: completeAIExam, resetExam: resetAIExam 
  } = useAIExam();
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats: loadGamificationStats, addPoints, unlockBadge } = useGamification();

  const [user, setUser] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getStats>> | null>(null);
  const [activeTab, setActiveTab] = useState('exam');
  const [examMode, setExamMode] = useState<'standard' | 'ai'>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

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
      getStats(user.id).then(setStats);
      loadGamificationStats(user.id);
    };
    checkAuth();
  }, [navigate, toast, getStats, loadGamificationStats]);

  // Timer for standard exam
  useEffect(() => {
    const activeSession = examMode === 'ai' ? aiSession : currentSession;
    if (!activeSession) return;
    
    const timeLimit = examMode === 'ai' ? aiSession?.timeLimitMinutes : currentSession?.time_limit_minutes;
    if (!timeLimit) return;
    
    const startTime = new Date(examMode === 'ai' ? aiSession!.startedAt : currentSession!.started_at).getTime();
    const endTime = startTime + (timeLimit * 60 * 1000);
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        handleCompleteExam();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession, aiSession, examMode]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartExam = async () => {
    if (!user) return;
    
    if (examMode === 'ai') {
      const specialty = selectedSpecialty !== 'all' ? selectedSpecialty : undefined;
      await startAIExam(user.id, 'ai_generated', 10, 20, aiDifficulty, undefined, specialty);
    } else {
      await startExam(user.id, 'standard', 20, 30);
    }
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
    
    if (examMode === 'ai' && aiSession) {
      const currentQ = aiSession.questions[currentQuestionIndex];
      submitAIAnswer(currentQ.id, [selectedAnswer], timeSpent);
    } else {
      submitAnswer(
        questions[currentQuestionIndex].id,
        selectedAnswer,
        timeSpent
      );
    }
    
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    const totalQuestions = examMode === 'ai' ? aiSession?.questions.length || 0 : questions.length;
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuestionStartTime(Date.now());
    } else {
      handleCompleteExam();
    }
  };

  const handleCompleteExam = async () => {
    if (examMode === 'ai') {
      const result = await completeAIExam();
      if (result && user) {
        // Award points
        await addPoints(user.id, POINTS_CONFIG.examCompleted, 'examCompleted');
        if (result.score === 100) {
          await addPoints(user.id, POINTS_CONFIG.perfectExam, 'perfectExam');
          await unlockBadge(user.id, 'perfect_exam');
        }
        loadGamificationStats(user.id);
      }
    } else {
      await completeExam();
      if (user) {
        const session = currentSession;
        await logActivity({
          activity_type: 'exam',
          count: 1,
          score: session?.score || 0,
          metadata: { exam_type: 'standard' }
        });
        await addPoints(user.id, POINTS_CONFIG.examCompleted, 'examCompleted');
        if (session?.score === 100) {
          await addPoints(user.id, POINTS_CONFIG.perfectExam, 'perfectExam');
          await unlockBadge(user.id, 'perfect_exam');
        }
        getStats(user.id).then(setStats);
        loadGamificationStats(user.id);
      }
    }
  };

  const handleNewExam = () => {
    if (examMode === 'ai') {
      resetAIExam();
    } else {
      resetExam();
    }
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  // Get current question based on mode
  const currentQuestion = examMode === 'ai' 
    ? aiSession?.questions[currentQuestionIndex]
    : questions[currentQuestionIndex];
  
  const totalQuestions = examMode === 'ai' 
    ? aiSession?.questions.length || 0 
    : questions.length;
  
  const progressPercent = totalQuestions > 0 
    ? ((currentQuestionIndex + (showResult ? 1 : 0)) / totalQuestions) * 100 
    : 0;

  const isExamActive = examMode === 'ai' 
    ? aiSession && !aiSession.completedAt 
    : currentSession && !currentSession.completed_at;

  const isExamCompleted = examMode === 'ai'
    ? aiSession?.completedAt
    : currentSession?.completed_at;
  const getAnswerStatus = (session: ExamSession) => {
    const correct = Object.values(session.answers).filter(a => a.correct).length;
    const total = Object.keys(session.answers).length;
    return { correct, total };
  };

  // Helper to check if answer is correct
  const isCorrectAnswer = (index: number) => {
    if (!currentQuestion) return false;
    if (examMode === 'ai') {
      return (currentQuestion as AIQuestion).correct_answers.includes(index);
    }
    return (currentQuestion as ExamQuestion).correct_answer === index;
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
              S'entraîner
            </h1>
            <p className="text-muted-foreground">Tu n'as pas besoin de tout savoir. Juste d'être prêt.</p>
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
            {/* Gamification Stats Banner */}
            {gamificationStats && !isExamActive && (
              <Card className="mb-6 bg-gradient-to-r from-accent/5 via-background to-primary/5 border-accent/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="gap-1">
                        🔥 {gamificationStats.currentStreak} jours
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        ⭐ Niveau {gamificationStats.level}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        🏆 {gamificationStats.badges?.length || 0} badges
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{gamificationStats.totalPoints} points</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mode Selection */}
            {!isExamActive && !isExamCompleted && (
              <div className="space-y-6 mb-6">
                {/* Mode cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg ${examMode === 'ai' ? 'ring-2 ring-primary border-primary' : ''}`}
                    onClick={() => setExamMode('ai')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-bold mb-2">Mode IA</h3>
                      <p className="text-sm text-muted-foreground mb-4">Questions générées par l'IA, uniques à chaque session</p>
                      {examMode === 'ai' && (
                        <div className="space-y-3">
                          <Select value={aiDifficulty} onValueChange={(v) => setAiDifficulty(v as any)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Difficulté" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Facile</SelectItem>
                              <SelectItem value="medium">Moyen</SelectItem>
                              <SelectItem value="hard">Difficile</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Toutes spécialités" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Toutes spécialités</SelectItem>
                              <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                              <SelectItem value="Pneumologie">Pneumologie</SelectItem>
                              <SelectItem value="Neurologie">Neurologie</SelectItem>
                              <SelectItem value="Gastro-entérologie">Gastro-entérologie</SelectItem>
                              <SelectItem value="Néphrologie">Néphrologie</SelectItem>
                              <SelectItem value="Endocrinologie">Endocrinologie</SelectItem>
                              <SelectItem value="Rhumatologie">Rhumatologie</SelectItem>
                              <SelectItem value="Dermatologie">Dermatologie</SelectItem>
                              <SelectItem value="Pédiatrie">Pédiatrie</SelectItem>
                              <SelectItem value="Gynécologie">Gynécologie</SelectItem>
                              <SelectItem value="Psychiatrie">Psychiatrie</SelectItem>
                              <SelectItem value="Urgences">Urgences</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg ${examMode === 'standard' ? 'ring-2 ring-accent border-accent' : ''}`}
                    onClick={() => setExamMode('standard')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/20 to-success/20 flex items-center justify-center">
                        <Brain className="h-8 w-8 text-accent" />
                      </div>
                      <h3 className="font-bold mb-2">Mode Standard</h3>
                      <p className="text-sm text-muted-foreground">Questions du référentiel EDN officiel</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Start Button */}
            {!isExamActive && !isExamCompleted && (
              <Card className="text-center">
                <CardContent className="p-8">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-accent" />
                  <h2 className="text-xl font-bold mb-2">Prêt pour l'examen ?</h2>
                  <p className="text-muted-foreground mb-6 text-sm">
                    {examMode === 'ai' ? '10 questions IA • 20 minutes' : '20 questions • 30 minutes'} • QCM EDN
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium">{examMode === 'ai' ? '20' : '30'} min</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <Target className="h-5 w-5 mx-auto mb-1 text-accent" />
                      <p className="text-xs font-medium">{examMode === 'ai' ? '10' : '20'} QCM</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <Award className="h-5 w-5 mx-auto mb-1 text-warning" />
                      <p className="text-xs font-medium">+50 pts</p>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleStartExam}
                    disabled={loading || aiLoading || generating}
                    className="gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Génération IA...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        Commencer
                      </>
                    )}
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
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSelectAnswer(index)}
                        disabled={showResult}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          showResult
                            ? isCorrectAnswer(index)
                              ? 'border-success bg-success/10'
                              : selectedAnswer === index
                                ? 'border-destructive bg-destructive/10'
                                : 'border-muted'
                            : selectedAnswer === index
                              ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                              : 'border-muted hover:border-primary/50 hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <motion.span 
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                              selectedAnswer === index 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                            animate={selectedAnswer === index ? { scale: [1, 1.1, 1] } : {}}
                          >
                            {String.fromCharCode(65 + index)}
                          </motion.span>
                          <span className="flex-1">{option}</span>
                          {showResult && isCorrectAnswer(index) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <CheckCircle className="h-5 w-5 text-success" />
                            </motion.div>
                          )}
                          {showResult && selectedAnswer === index && !isCorrectAnswer(index) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <XCircle className="h-5 w-5 text-destructive" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
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

            {/* Exam completed - Avec animations améliorées */}
            {currentSession?.completed_at && (
              <QuizResultsCard
                score={currentSession.score ?? 0}
                totalQuestions={getAnswerStatus(currentSession).total}
                correctAnswers={getAnswerStatus(currentSession).correct}
                onRestart={handleNewExam}
                onViewStats={() => setActiveTab('stats')}
              />
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
