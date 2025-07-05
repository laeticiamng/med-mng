import React, { useEffect, useState } from 'react';
import { QuizFinal } from './QuizFinal';
import { QuizErrorSongGenerator } from './music/QuizErrorSongGenerator';
import { QuizSelector, QuizConfig } from './quiz/QuizSelector';
import { useQuizErrorTracker } from '@/hooks/useQuizErrorTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Music, AlertTriangle, BookOpen, RotateCcw, Settings } from 'lucide-react';

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
  }, [loadSavedSessions]);

  const handleStartQuiz = (config: QuizConfig) => {
    setQuizConfig(config);
    setQuizStarted(true);
    
    // Démarrer une nouvelle session avec la configuration
    startQuizSession(itemCode, itemTitle, config.numberOfQuestions);
  };

  const handleResetQuiz = () => {
    setQuizStarted(false);
    setQuizConfig(null);
  };

  const handleQuizFinished = (finalScore: number) => {
    const completedSession = endQuizSession(finalScore);
    return completedSession;
  };

  // Calculer le nombre total de questions disponibles
  const totalAvailableQuestions = Array.isArray(questions) 
    ? questions.length 
    : (questions.qcm?.length || 0) + 
      (questions.qru?.length || 0) + 
      (questions.qroc?.length || 0) + 
      (questions.zap?.length || 0);

  // Si le quiz n'est pas encore configuré, afficher le sélecteur
  if (!quizStarted) {
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
      />
    );
  };

  return (
    <div className="space-y-6">
      
      {/* En-tête du quiz amélioré */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-amber-800">
            <Trophy className="h-6 w-6" />
            Quiz Interactif - {itemTitle}
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>Quiz avec suivi des erreurs et génération de chansons personnalisées</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetQuiz}
              className="text-amber-700 border-amber-300 hover:bg-amber-100"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reconfigurer
            </Button>
          </CardDescription>
        </CardHeader>
        
        {/* Configuration active */}
        {quizConfig && (
          <CardContent>
            <div className="bg-white/60 rounded-lg p-4 mb-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">Configuration active</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-amber-700">Questions:</span>
                  <div className="font-semibold">{quizConfig.numberOfQuestions}</div>
                </div>
                <div>
                  <span className="text-amber-700">Type:</span>
                  <div className="font-semibold">
                    {quizConfig.questionType === 'mixed' ? 'Mixte' :
                     quizConfig.questionType === 'rang-a' ? 'Rang A' : 'Rang B'}
                  </div>
                </div>
                <div>
                  <span className="text-amber-700">Difficulté:</span>
                  <div className="font-semibold capitalize">{quizConfig.difficulty}</div>
                </div>
                <div>
                  <span className="text-amber-700">Durée:</span>
                  <div className="font-semibold">{Math.ceil(quizConfig.numberOfQuestions * 1.5)} min</div>
                </div>
              </div>
            </div>
            
            {hasCurrentSession && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                  <div className="text-lg font-bold text-amber-600">
                    {currentSession?.totalQuestions || 0}
                  </div>
                  <div className="text-xs text-amber-700">Questions totales</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                  <div className="text-lg font-bold text-red-600">
                    {currentErrors.length}
                  </div>
                  <div className="text-xs text-red-700">Erreurs détectées</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                  <div className="text-lg font-bold text-green-600">
                    {currentSession ? ((currentSession.totalQuestions - currentErrors.length) / currentSession.totalQuestions * 100).toFixed(0) : 0}%
                  </div>
                  <div className="text-xs text-green-700">Score actuel</div>
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
              <span className="ml-1 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
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
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-800">
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
                  <p className="text-green-700 font-medium">
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