import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { POINTS_CONFIG, useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { QcmQuestion, qcmService, QcmSession } from '@/services/qcmService';
import {
    BookOpen,
    Brain,
    CheckCircle,
    Clock,
    Loader2,
    Music,
    Play,
    RotateCcw,
    Target,
    Trophy,
    XCircle
} from "lucide-react";
import React, { useState } from 'react';
import { toast } from "sonner";

interface QcmPlayerProps {
  itemCode: string;
  itemTitle: string;
  sessionType: 'rang_a' | 'rang_b' | 'mixed';
  onComplete?: (session: QcmSession) => void;
  className?: string;
}

export const QcmPlayer: React.FC<QcmPlayerProps> = ({
  itemCode,
  itemTitle,
  sessionType,
  onComplete,
  className
}) => {
  const { logActivity } = useActivityTracking();
  const { addPoints, unlockBadge } = useGamification();
  const [phase, setPhase] = useState<'setup' | 'loading' | 'playing' | 'results'>('setup');
  const [questions, setQuestions] = useState<QcmQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [sessionId, setSessionId] = useState<string>('');
  const [sessionResults, setSessionResults] = useState<any>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [showExplanation, setShowExplanation] = useState(false);
  const [generatingErrorSong, setGeneratingErrorSong] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  const startQcm = async (questionCount: number = 10) => {
    try {
      setPhase('loading');
      toast.info('Génération des questions en cours...');

      // Track QCM start
      await logActivity({
        activity_type: 'exam',
        count: 1,
        metadata: { itemCode, sessionType, questionCount, action: 'qcm_start' }
      });

      // Generate questions
      const qcmData = await qcmService.generateQcm(itemCode, sessionType, questionCount);
      
      if (!qcmData.success || !qcmData.questions.length) {
        throw new Error('Aucune question générée');
      }

      // Start session
      const sessionData = await qcmService.startQcmSession(itemCode, sessionType, qcmData.questions);
      
      setQuestions(qcmData.questions);
      setSessionId(sessionData.session_id);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuestionStartTime(Date.now());
      setPhase('playing');
      
      toast.success(`QCM généré avec ${qcmData.questions.length} questions`);
    } catch (error) {
      console.error('Error starting QCM:', error);
      toast.error('Erreur lors de la génération du QCM');
      setPhase('setup');
    }
  };

  const submitAnswer = async (answer: string) => {
    if (!currentQuestion) return;

    const responseTime = Math.floor((Date.now() - questionStartTime) / 1000);
    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));

    try {
      // Submit response
      const response = await qcmService.submitResponse(
        sessionId,
        currentQuestion.id,
        currentQuestion.question,
        answer,
        currentQuestion.correct_answer,
        responseTime,
        currentQuestion.explanation,
        currentQuestion.medical_concept
      );

      setShowExplanation(true);
      
      // Track answer and award points
      await logActivity({
        activity_type: 'exam',
        count: 1,
        score: response.is_correct ? 100 : 0,
        metadata: { itemCode, questionIndex: currentQuestionIndex, isCorrect: response.is_correct }
      });
      
      if (response.is_correct) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await addPoints(user.id, POINTS_CONFIG.itemReviewed, 'itemReviewed');
        }
        toast.success('Bonne réponse ! 🎉');
      } else {
        toast.error('Réponse incorrecte');
      }

    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Erreur lors de la soumission');
    }
  };

  const nextQuestion = () => {
    if (isLastQuestion) {
      finishQcm();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
      setShowExplanation(false);
    }
  };

  const finishQcm = async () => {
    try {
      setPhase('loading');
      
      const results = await qcmService.completeSession(sessionId);
      setSessionResults(results);
      setPhase('results');
      
      onComplete?.(results.session);
      
      // Track completion and award badges
      await logActivity({
        activity_type: 'exam',
        count: 1,
        score: results.score,
        metadata: { itemCode, type: 'qcm_complete', correctAnswers: results.correct_answers, totalQuestions: results.total_questions }
      });
      
      // Award badge for perfect score
      if (results.score >= 100) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await unlockBadge(user.id, 'perfect_exam');
        }
      }
      
      const message = qcmService.getPerformanceMessage(results.score);
      toast.success(`QCM terminé ! Score: ${Math.round(results.score)}% - ${message}`);
      
    } catch (error) {
      console.error('Error finishing QCM:', error);
      toast.error('Erreur lors de la finalisation');
    }
  };

  const generateErrorSong = async () => {
    if (!sessionResults?.incorrect_responses?.length) return;

    try {
      setGeneratingErrorSong(true);
      toast.info('Génération de votre chanson d\'erreurs...');

      const result = await qcmService.generateErrorSong(
        sessionId,
        sessionResults.incorrect_responses
      );

      if (result.success) {
        toast.success('Chanson d\'erreurs générée avec succès ! 🎵');
        // Ici on pourrait ouvrir un player ou rediriger vers la bibliothèque
      }
    } catch (error) {
      console.error('Error generating error song:', error);
      toast.error('Erreur lors de la génération de la chanson');
    } finally {
      setGeneratingErrorSong(false);
    }
  };

  const resetQcm = () => {
    setPhase('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSessionId('');
    setSessionResults(null);
    setShowExplanation(false);
  };

  if (phase === 'setup') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            QCM - {itemTitle}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Session {sessionType === 'rang_a' ? 'Rang A' : sessionType === 'rang_b' ? 'Rang B' : 'Mixte'}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="p-6 bg-primary/5 rounded-lg">
              <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Prêt pour le QCM ?</h3>
              <p className="text-muted-foreground">
                Testez vos connaissances sur {itemTitle} avec des questions personnalisées
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <Button onClick={() => startQcm(5)} variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                5 questions
              </Button>
              <Button onClick={() => startQcm(10)}>
                <Target className="h-4 w-4 mr-2" />
                10 questions
              </Button>
              <Button onClick={() => startQcm(15)} variant="outline">
                <Brain className="h-4 w-4 mr-2" />
                15 questions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'loading') {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">
              {questions.length === 0 ? 'Génération des questions...' : 'Finalisation du QCM...'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'playing' && currentQuestion) {
    const userAnswer = userAnswers[currentQuestion.id];
    const hasAnswered = !!userAnswer;

    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Question {currentQuestionIndex + 1}/{questions.length}
            </CardTitle>
            <Badge variant="outline">
              {sessionType === 'rang_a' ? 'Rang A' : sessionType === 'rang_b' ? 'Rang B' : 'Mixte'}
            </Badge>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{currentQuestion.question}</p>
              {currentQuestion.medical_concept && (
                <Badge variant="secondary" className="mt-2">
                  {currentQuestion.medical_concept}
                </Badge>
              )}
            </div>
            
            <RadioGroup 
              value={userAnswer || ''} 
              onValueChange={submitAnswer}
              disabled={hasAnswered}
            >
              {currentQuestion.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index);
                const isCorrect = option === currentQuestion.correct_answer;
                const isUserChoice = option === userAnswer;
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-2 p-3 rounded border transition-colors ${
                      showExplanation 
                        ? isCorrect 
                          ? 'bg-success/10 border-success/30' 
                          : isUserChoice 
                            ? 'bg-destructive/10 border-destructive/30' 
                            : 'bg-muted'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      <span className="font-medium mr-2">{optionLetter}.</span>
                      {option}
                    </Label>
                    {showExplanation && isCorrect && (
                      <CheckCircle className="h-4 w-4 text-success" />
                    )}
                    {showExplanation && isUserChoice && !isCorrect && (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          </div>
          
          {showExplanation && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-medium">Explication</span>
                </div>
                <p className="text-sm text-muted-foreground bg-primary/10 p-3 rounded">
                  {currentQuestion.explanation}
                </p>
                <Button onClick={nextQuestion} className="w-full">
                  {isLastQuestion ? 'Terminer le QCM' : 'Question suivante'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (phase === 'results' && sessionResults) {
    const scoreColor = qcmService.getScoreColor(sessionResults.score);
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Résultats du QCM
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${scoreColor}`}>
              <Trophy className="h-5 w-5" />
              <span className="font-bold text-2xl">{Math.round(sessionResults.score)}%</span>
            </div>
            
            <p className="text-lg font-medium">
              {qcmService.getPerformanceMessage(sessionResults.score)}
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <CheckCircle className="h-6 w-6 mx-auto text-success" />
              <p className="text-sm text-muted-foreground">Bonnes réponses</p>
              <p className="font-bold text-success">{sessionResults.correct_answers}</p>
            </div>
            <div className="space-y-2">
              <XCircle className="h-6 w-6 mx-auto text-destructive" />
              <p className="text-sm text-muted-foreground">Erreurs</p>
              <p className="font-bold text-destructive">{sessionResults.incorrect_answers}</p>
            </div>
            <div className="space-y-2">
              <Target className="h-6 w-6 mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-bold text-primary">{sessionResults.total_questions}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            {sessionResults.can_generate_error_song && (
              <Button 
                onClick={generateErrorSong}
                disabled={generatingErrorSong}
                className="w-full"
                variant="outline"
              >
                {generatingErrorSong ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Music className="h-4 w-4 mr-2" />
                )}
                Générer chanson d'erreurs
              </Button>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={resetQcm} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Nouveau QCM
              </Button>
              <Button onClick={() => setPhase('setup')}>
                <Play className="h-4 w-4 mr-2" />
                Recommencer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
