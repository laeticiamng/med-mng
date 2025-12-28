import React, { useEffect, useState } from 'react';
import { QuizFinal } from './QuizFinal';
import { QuizErrorSongGenerator } from './music/QuizErrorSongGenerator';
import { QuizSelector, QuizConfig } from './quiz/QuizSelector';
import { OicQuizGenerator } from './quiz/OicQuizGenerator';
import { useQuizErrorTracker } from '@/hooks/useQuizErrorTracker';
import { useGamification } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Music, AlertTriangle, BookOpen, RotateCcw, Settings, Star, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedQuizFinalProps {
  questions: {
    qcm?: any[];
    qru?: any[];
    qroc?: any[];
    zap?: any[];
    type?: string;
    title?: string;
    categories?: Array<{
      name: string;
      items: string[];
    }>;
  };
  rewards?: {
    [key: string]: string;
    completion?: string;
    badge?: string;
    message?: string;
  };
  itemCode: string;
  itemTitle: string;
}

export const EnhancedQuizFinal: React.FC<EnhancedQuizFinalProps> = ({
  questions,
  rewards,
  itemCode,
  itemTitle
}) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  
  const { addPoints, unlockBadge, checkAndUnlockBadges } = useGamification();
  const { logActivity } = useActivityTracking();
  
  const {
    startQuizSession,
    addQuizError,
    endQuizSession,
    currentSession,
    currentErrors,
    hasCurrentSession,
    loadSavedSessions
  } = useQuizErrorTracker();

  // Charger les sessions sauvegardées au montage
  useEffect(() => {
    loadSavedSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartQuiz = async (config: QuizConfig) => {
    setQuizConfig(config);
    setQuizStarted(true);
    
    // Démarrer une nouvelle session avec la configuration
    startQuizSession(itemCode, itemTitle, config.numberOfQuestions);
    
    // Log activity
    await logActivity({ activity_type: 'exam', count: 1, metadata: { itemCode, action: 'start' } });
  };

  const handleResetQuiz = () => {
    setQuizStarted(false);
    setQuizConfig(null);
  };

  const handleQuizFinished = async (finalScore: number) => {
    const completedSession = endQuizSession(finalScore);
    
    // Get user for gamification
    const { data: { user } } = await supabase.auth.getUser();
    
    // Gamification rewards
    if (user) {
      await addPoints(user.id, 'examCompleted');
      await logActivity({ activity_type: 'exam', count: 1, score: finalScore, metadata: { itemCode, action: 'complete' } });
      
      // Perfect score bonus
      if (finalScore === 100) {
        await addPoints(user.id, 'perfectExam');
        await unlockBadge(user.id, 'perfect_exam');
      }
      
      await checkAndUnlockBadges(user.id);
    }
    
    return completedSession;
  };

  // Calculer le nombre total de questions disponibles
  const totalAvailableQuestions = Array.isArray(questions) 
    ? questions.length 
    : (questions.qcm?.length || 0) + 
      (questions.qru?.length || 0) + 
      (questions.qroc?.length || 0) + 
      (questions.zap?.length || 0);

  // Si le quiz n'est pas encore configuré, afficher le sélecteur ou le quiz OIC
  if (!quizStarted) {
    // Si pas de questions prédéfinies, utiliser le quiz OIC dynamique
    if (totalAvailableQuestions === 0) {
      return (
        <div className="space-y-6">
          <OicQuizGenerator itemCode={itemCode} itemTitle={itemTitle} />
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <QuizSelector
          itemCode={itemCode}
          itemTitle={itemTitle}
          totalQuestions={totalAvailableQuestions}
          onStartQuiz={handleStartQuiz}
        />
      </div>
    );
  }

  // Wrapper pour le QuizFinal avec tracking des erreurs intégré
  const QuizWithErrorTracking = () => {
    return (
      <QuizFinal 
        questions={questions} 
        rewards={rewards}
        itemCode={itemCode}
        itemTitle={itemTitle}
        onQuizFinished={(score, totalQuestions) => {
          const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
          handleQuizFinished(percentage);
        }}
      />
    );
  };

  return (
    <div className="space-y-6">
      
      {/* En-tête du quiz amélioré */}
      <Card className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-warning">
            <Trophy className="h-6 w-6" />
            Quiz Interactif - {itemTitle}
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>Quiz avec suivi des erreurs et génération de chansons personnalisées</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetQuiz}
              className="text-warning border-warning/50 hover:bg-warning/10"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reconfigurer
            </Button>
          </CardDescription>
        </CardHeader>
        
        {/* Configuration active */}
        {quizConfig && (
          <CardContent>
            <div className="bg-card/60 rounded-lg p-4 mb-4 border border-warning/30">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-warning" />
                <span className="font-medium text-warning">Configuration active</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-warning/80">Questions:</span>
                  <div className="font-semibold">{quizConfig.numberOfQuestions}</div>
                </div>
                <div>
                  <span className="text-warning/80">Type:</span>
                  <div className="font-semibold">
                    {quizConfig.questionType === 'mixed' ? 'Mixte' :
                     quizConfig.questionType === 'rang-a' ? 'Rang A' : 'Rang B'}
                  </div>
                </div>
                <div>
                  <span className="text-warning/80">Difficulté:</span>
                  <div className="font-semibold capitalize">{quizConfig.difficulty}</div>
                </div>
                <div>
                  <span className="text-warning/80">Durée:</span>
                  <div className="font-semibold">{Math.ceil(quizConfig.numberOfQuestions * 1.5)} min</div>
                </div>
              </div>
            </div>
            
            {hasCurrentSession && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-card rounded-lg border border-warning/30">
                  <div className="text-lg font-bold text-warning">
                    {currentSession?.totalQuestions || 0}
                  </div>
                  <div className="text-xs text-warning/80">Questions totales</div>
                </div>
                <div className="text-center p-3 bg-card rounded-lg border border-warning/30">
                  <div className="text-lg font-bold text-destructive">
                    {currentErrors.length}
                  </div>
                  <div className="text-xs text-destructive">Erreurs détectées</div>
                </div>
                <div className="text-center p-3 bg-card rounded-lg border border-warning/30">
                  <div className="text-lg font-bold text-success">
                    {currentSession ? ((currentSession.totalQuestions - currentErrors.length) / currentSession.totalQuestions * 100).toFixed(0) : 0}%
                  </div>
                  <div className="text-xs text-success">Score actuel</div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="quiz" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Chanson d'erreurs
            {currentErrors.length > 0 && (
              <span className="ml-1 bg-destructive/10 text-destructive text-xs px-2 py-1 rounded-full">
                {currentErrors.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quiz" className="space-y-6">
          <QuizWithErrorTracking />
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          {currentErrors.length > 0 ? (
            <QuizErrorSongGenerator
              itemCode={itemCode || 'Quiz'}
              itemTitle={itemTitle}
            />
          ) : (
            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-success">
                  <Trophy className="h-6 w-6" />
                  Aucune erreur détectée !
                </CardTitle>
                <CardDescription>
                  Félicitations ! Vous n'avez fait aucune erreur pour le moment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-success font-medium">
                    Continuez comme ça ! Si vous faites des erreurs, 
                    vous pourrez générer une chanson personnalisée pour les réviser.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};