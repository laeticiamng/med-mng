// ============================================================================
// QCM First Method View Component
// ============================================================================

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
  PlayCircle,
  TrendingDown,
  Award,
  Target
} from 'lucide-react';
import { TodayRevisionItem, QCMFirstSession } from '@/types/revision-methods';
import { useRevisionMethods } from '@/hooks/useRevisionMethods';

interface QCMFirstViewProps {
  todayItems: TodayRevisionItem[];
  todaySession: QCMFirstSession | null;
}

export const QCMFirstView: React.FC<QCMFirstViewProps> = ({ todayItems, todaySession }) => {
  const { createQCMSession, markFicheReviewed, completeQCMSession, loading } = useRevisionMethods();
  const [sessionStarted, setSessionStarted] = useState(!!todaySession);

  // Mock data for demonstration - in real app, this would come from actual QCM results
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(todaySession?.correct_answers || 0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(todaySession?.incorrect_answers || 0);

  const totalQuestions = 20; // Default questions per session
  const answeredQuestions = correctAnswers + incorrectAnswers;
  const successRate = todaySession?.success_rate || 0;

  const handleStartSession = async () => {
    setSessionStarted(true);
    // In real implementation, this would launch the actual QCM interface
  };

  const handleCompleteSession = async () => {
    // Mock suggested fiches based on errors
    const suggestedFiches = ['fiche-1', 'fiche-2', 'fiche-3']; // Would come from error analysis

    const result = await createQCMSession({
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      incorrect_answers: incorrectAnswers,
      suggested_fiches: suggestedFiches
    });

    if (result.success) {
      // Session created, show suggested fiches
    }
  };

  const handleMarkFicheReviewed = async (ficheId: string) => {
    if (!todaySession) return;

    await markFicheReviewed(todaySession.id, ficheId);
  };

  const handleCompleteAllReviews = async () => {
    if (!todaySession) return;

    await completeQCMSession(todaySession.id);
  };

  // If no session today, show start screen
  if (!sessionStarted || !todaySession) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Méthode QCM First - Session du jour
          </CardTitle>
          <CardDescription>
            Commence par te tester, puis révise les fiches où tu as fait des erreurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white rounded-lg p-6 text-center space-y-4">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <PlayCircle className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Prêt pour ta session QCM ?</h3>
              <p className="text-sm text-gray-600">
                Tu vas répondre à <strong>{totalQuestions} questions</strong> variées. Ensuite,
                nous t'indiquerons les fiches à revoir en priorité.
              </p>
            </div>
            <Button size="lg" onClick={handleStartSession} className="w-full">
              <PlayCircle className="h-5 w-5 mr-2" />
              Démarrer la session QCM
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{totalQuestions}</p>
              <p className="text-xs text-gray-600">Questions</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">~15min</p>
              <p className="text-xs text-gray-600">Durée estimée</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">Auto</p>
              <p className="text-xs text-gray-600">Fiches suggérées</p>
            </div>
          </div>

          {/* Method Info */}
          <Card className="bg-orange-50/50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-sm">Comment ça marche ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Badge className="bg-orange-600 text-white shrink-0">1</Badge>
                <p className="text-gray-700">
                  Tu réponds à {totalQuestions} questions (QCM ou cas cliniques)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="bg-orange-600 text-white shrink-0">2</Badge>
                <p className="text-gray-700">
                  Nous analysons tes erreurs et identifions tes points faibles
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="bg-orange-600 text-white shrink-0">3</Badge>
                <p className="text-gray-700">
                  Tu révises uniquement les fiches correspondant à tes lacunes
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  // If session completed, show results and suggested fiches
  const suggestedFiches = todaySession.suggested_fiches || [];
  const reviewedFiches = todaySession.fiches_reviewed || [];
  const remainingFiches = suggestedFiches.filter((f) => !reviewedFiches.includes(f));

  return (
    <div className="space-y-6">
      {/* Session Results */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Résultats de ta session QCM
          </CardTitle>
          <CardDescription>
            {new Date(todaySession.session_date).toLocaleDateString('fr-FR')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">{todaySession.correct_answers}</p>
              <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Bonnes réponses
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-3xl font-bold text-red-600">{todaySession.incorrect_answers}</p>
              <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <XCircle className="h-3 w-3" />
                Erreurs
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-600">{Math.round(successRate)}%</p>
              <p className="text-xs text-gray-600">Taux de réussite</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>
                {todaySession.correct_answers}/{todaySession.total_questions}
              </span>
            </div>
            <Progress value={successRate} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Suggested Fiches to Review */}
      {suggestedFiches.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              Fiches à revoir en priorité
            </CardTitle>
            <CardDescription>
              Basé sur tes erreurs, nous te recommandons de réviser ces{' '}
              {suggestedFiches.length} fiches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {remainingFiches.length > 0 ? (
              <>
                {remainingFiches.map((ficheId, index) => (
                  <Card key={ficheId} className="border-orange-300 bg-orange-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-orange-600 text-white">
                              Fiche {index + 1}/{remainingFiches.length}
                            </Badge>
                            <span className="font-mono text-sm text-gray-600">{ficheId}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Tu as fait des erreurs sur cette thématique
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkFicheReviewed(ficheId)}
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Voir la fiche
                          </Button>
                          <Button size="sm" onClick={() => handleMarkFicheReviewed(ficheId)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Révision faite
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {reviewedFiches.length > 0 && (
                  <div className="text-center pt-4">
                    <Button onClick={handleCompleteAllReviews}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Terminer la session ({reviewedFiches.length}/{suggestedFiches.length} fiches
                      revues)
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-green-500 mb-3" />
                  <h3 className="font-semibold text-green-800 mb-1">Toutes les fiches revues !</h3>
                  <p className="text-sm text-green-600">
                    Excellent travail ! Tu as révisé toutes les fiches suggérées.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Today's revision items (scheduled from previous sessions) */}
      {todayItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Fiches planifiées aujourd'hui
            </CardTitle>
            <CardDescription>
              Fiches à revoir suite à tes sessions QCM précédentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayItems.map((item) => (
              <Card key={item.id} className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-mono text-sm text-gray-600">{item.item_code}</span>
                      </div>
                      <p className="text-xs text-gray-500">Planifié suite à tes erreurs</p>
                    </div>
                    <Button size="sm">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Révision faite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Method Info */}
      <Card className="bg-orange-50/50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-lg">Pourquoi la Méthode QCM First fonctionne ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>Apprentissage actif :</strong> Se tester d'abord force ton cerveau à chercher
            l'information, ce qui crée des connexions neuronales plus fortes.
          </p>
          <p>
            <strong>Révisions ciblées :</strong> Tu ne perds pas de temps sur ce que tu maîtrises
            déjà. Tu te concentres uniquement sur tes points faibles.
          </p>
          <p>
            <strong>Feedback immédiat :</strong> Tu sais immédiatement où tu en es et ce qu'il faut
            travailler.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
