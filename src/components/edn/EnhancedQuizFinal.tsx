import React, { useEffect } from 'react';
import { QuizFinal } from './QuizFinal';
import { QuizErrorSongGenerator } from './music/QuizErrorSongGenerator';
import { useQuizErrorTracker } from '@/hooks/useQuizErrorTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Music, AlertTriangle, BookOpen } from 'lucide-react';

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

  // Démarrer une session si elle n'existe pas
  useEffect(() => {
    if (!hasCurrentSession && questions) {
      const totalQuestions = (questions.qcm?.length || 0) + 
                           (questions.qru?.length || 0) + 
                           (questions.qroc?.length || 0) + 
                           (questions.zap?.length || 0);
      
      if (totalQuestions > 0) {
        startQuizSession(itemCode, itemTitle, totalQuestions);
      }
    }
  }, [questions, itemCode, itemTitle, hasCurrentSession, startQuizSession]);

  const handleQuizFinished = (finalScore: number) => {
    const completedSession = endQuizSession(finalScore);
    return completedSession;
  };

  const handleAddToLibrary = (song: any) => {
    console.log('🎵 Chanson d\'erreurs ajoutée à la bibliothèque:', song);
    // Ici on pourrait intégrer avec un système de bibliothèque musicale
  };

  // Wrapper pour le QuizFinal original avec tracking des erreurs
  const QuizWithErrorTracking = () => {
    // TODO: Intégrer le tracking des erreurs dans le composant QuizFinal
    // Pour l'instant, on utilise le composant original
    return (
      <QuizFinal 
        questions={questions} 
        rewards={rewards}
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
          <CardDescription>
            Quiz avec suivi des erreurs et génération de chansons personnalisées
          </CardDescription>
        </CardHeader>
        {hasCurrentSession && (
          <CardContent>
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

      {/* Informations de session (debug) */}
      {hasCurrentSession && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <div className="text-xs space-y-1 text-gray-600">
              <div><strong>Session ID:</strong> {currentSession?.id}</div>
              <div><strong>Démarrage:</strong> {currentSession?.startTime.toLocaleTimeString()}</div>
              <div><strong>Item:</strong> {itemCode} - {itemTitle}</div>
              <div><strong>Erreurs en temps réel:</strong> {currentErrors.length}</div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};