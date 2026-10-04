import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { useOicCompetences } from '@/hooks/useOicCompetences';
import { genererQuestionsOic } from '@/utils/quizOic';
import { supabase } from '@/integrations/supabase/client';
import {
    Brain, CheckCircle,
    ChevronLeft, ChevronRight, Loader2,
    RotateCcw,
    Sparkles,
    Trophy,
    XCircle
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface OicQuizGeneratorProps {
  itemCode: string;
  itemTitle: string;
}

export const OicQuizGenerator: React.FC<OicQuizGeneratorProps> = ({
  itemCode,
  itemTitle,
}) => {
  const [selectedRang, setSelectedRang] = useState<'A' | 'B' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const { competences: competencesA, loading: loadingA } = useOicCompetences(itemCode, 'A');
  const { competences: competencesB, loading: loadingB } = useOicCompetences(itemCode, 'B');
  // Moins de quatre compétences dans l'item (ex. IC-8, IC-10) : pas assez
  // d'énoncés pour quatre options. On complète les distracteurs avec l'item
  // voisin (ce ne sont jamais des bonnes réponses).
  const numeroItem = parseInt(itemCode.replace(/\D/g, ''), 10) || 0;
  const besoinVoisin = !loadingA && !loadingB && numeroItem > 0 && competencesA.length + competencesB.length < 8;
  const codeVoisin = besoinVoisin ? `IC-${numeroItem < 367 ? numeroItem + 1 : numeroItem - 1}` : '';
  const { competences: voisinA } = useOicCompetences(codeVoisin, 'A');
  const { competences: voisinB } = useOicCompetences(codeVoisin, 'B');
  const { addPoints, unlockBadge } = useGamification();
  const { logActivity } = useActivityTracking();

  const questions = useMemo(() => {
    if (!selectedRang) return [];
    const cibles = selectedRang === 'A' ? competencesA : competencesB;
    const autres = selectedRang === 'A' ? competencesB : competencesA;
    return genererQuestionsOic(cibles, [...autres, ...voisinA, ...voisinB], 10);
  }, [selectedRang, competencesA, competencesB, voisinA, voisinB]);

  const handleStartQuiz = (rang: 'A' | 'B') => {
    setSelectedRang(rang);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleFinish = async () => {
    setShowResults(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const score = questions.filter(q => answers[q.id] === q.correctIndex).length;
      const percentage = Math.round((score / questions.length) * 100);

      // Sauvegarder en base de données. supabase-js ne lève pas sur erreur
      // PostgREST : le try/catch précédent n'attrapait rien et un score perdu
      // passait pour un score enregistré.
      const { error: erreurEnregistrement } = await supabase.from('quiz_results').insert({
        user_id: user.id,
        item_code: itemCode,
        item_title: itemTitle,
        score: percentage,
        total_questions: questions.length,
        correct_answers: score,
        wrong_answers: questions.length - score,
        time_spent: 0
      });

      if (erreurEnregistrement) {
        toast.error('Score non enregistré. Réessayez plus tard.');
      }

      await addPoints(user.id, percentage === 100 ? 200 : 100, percentage === 100 ? 'perfectExam' : 'examCompleted');
      await logActivity({
        activity_type: 'exam',
        count: 1,
        score: percentage,
        metadata: { itemCode, rang: selectedRang, type: 'oic_quiz' }
      });

      if (percentage === 100) {
        await unlockBadge(user.id, 'perfect_exam');
        toast.success('🏆 Score parfait ! Badge débloqué !');
      } else {
        toast.success(`Quiz terminé ! Score: ${score}/${questions.length}`);
      }
    }
  };

  const handleReset = () => {
    setQuizStarted(false);
    setSelectedRang(null);
    setShowResults(false);
    setAnswers({});
    setCurrentQuestion(0);
  };

  const isLoading = loadingA || loadingB;
  const totalCompetencesA = competencesA.length;
  const totalCompetencesB = competencesB.length;

  // Écran de sélection du rang
  if (!quizStarted) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Quiz de l'item {itemCode}
          </CardTitle>
          <CardDescription>
            Pour chaque compétence officielle, retrouvez l'énoncé qui lui correspond
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Chargement des compétences...</span>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Choisissez le rang à réviser
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {totalCompetencesA > 0 && (
                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 border-2 border-primary/30 hover:bg-primary/10 hover:border-primary"
                  onClick={() => handleStartQuiz('A')}
                >
                  <Badge className="bg-primary/10 text-primary border-primary/30">Rang A</Badge>
                  <span className="text-2xl font-bold text-primary">{totalCompetencesA}</span>
                  <span className="text-sm text-muted-foreground">Compétences de rang A</span>
                </Button>
                )}

                {totalCompetencesB > 0 && (
                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 border-2 border-accent/30 hover:bg-accent/10 hover:border-accent"
                  onClick={() => handleStartQuiz('B')}
                >
                  <Badge className="bg-accent/10 text-emerald-700 dark:text-emerald-400 border-accent/30">Rang B</Badge>
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{totalCompetencesB}</span>
                  <span className="text-sm text-muted-foreground">Compétences de rang B</span>
                </Button>
                )}
              </div>

              {totalCompetencesA === 0 && totalCompetencesB === 0 && !isLoading && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-warning/10 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Quiz en préparation</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Les compétences OIC pour <strong>{itemCode}</strong> n'ont pas encore été importées.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Le quiz sera automatiquement disponible une fois les compétences chargées.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-muted-foreground">
                    Item: {itemCode}
                  </Badge>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Écran de résultats
  if (showResults) {
    const score = questions.filter(q => answers[q.id] === q.correctIndex).length;
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    return (
      <Card className="border-2 border-success/30">
        <CardHeader className="bg-gradient-to-r from-success/10 to-primary/10 text-center">
          <Trophy className="h-16 w-16 text-success mx-auto mb-4 animate-bounce" />
          <CardTitle className="text-2xl">Quiz Terminé !</CardTitle>
          <CardDescription>
            Rang {selectedRang} - {itemCode}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6 text-center">
          <div className="text-6xl font-bold text-foreground">
            {score}/{questions.length}
          </div>
          
          <Badge 
            variant="outline" 
            className={`text-lg px-4 py-2 ${
              percentage >= 80 ? 'border-success text-success' :
              percentage >= 60 ? 'border-warning text-warning' :
              'border-destructive text-destructive'
            }`}
          >
            {percentage >= 80 ? '🌟 Excellent !' : percentage >= 60 ? '👍 Bien !' : '📚 À réviser'}
          </Badge>

          <Progress value={percentage} className="h-3" />

          <div className="flex justify-center gap-4">
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Recommencer
            </Button>
          </div>

          {/* Résumé des réponses */}
          <div className="mt-6 space-y-3 text-left max-h-96 overflow-y-auto">
            {questions.map((q, _idx) => {
              const isCorrect = answers[q.id] === q.correctIndex;
              return (
                <div 
                  key={q.id} 
                  className={`p-3 rounded-lg border ${isCorrect ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'}`}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{q.competence.objectif_id} — {q.competence.intitule}</p>
                      {/* La bonne réponse EST la description officielle : on l'affiche
                          une seule fois, en entier (auparavant tronquée puis répétée
                          dans l'explication avec l'intitulé déjà affiché au-dessus). */}
                      <p className="text-xs text-muted-foreground whitespace-pre-line">
                        {!isCorrect && <span className="font-medium">Bonne réponse : </span>}
                        {(q.competence.description || '').trim() || q.options[q.correctIndex]}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Écran de quiz
  const currentQ = questions[currentQuestion];
  if (!currentQ) {
    return (
      <Card className="border-2 border-warning/20">
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 text-warning mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune question générée. Veuillez recommencer.</p>
          <Button onClick={handleReset} className="mt-4" variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Recommencer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Quiz Rang {selectedRang}
          </CardTitle>
          <Badge variant="outline">
            Question {currentQuestion + 1}/{questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="text-center mb-4">
          <Badge variant="secondary" className="mb-2">{currentQ.competence.objectif_id}</Badge>
          <h3 className="text-lg font-semibold text-foreground">{currentQ.question}</h3>
        </div>

        {/* key + value « '' » : sans cela, la réponse de la question précédente
            restait cochée à l'écran sans être enregistrée, et recliquer la même
            position ne débloquait pas « Suivant ». */}
        <RadioGroup
          key={currentQ.id}
          value={answers[currentQ.id]?.toString() ?? ''}
          onValueChange={(value) => handleAnswer(currentQ.id, parseInt(value))}
          className="space-y-3"
        >
          {currentQ.options.map((option, index) => (
            <div 
              key={index} 
              className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <RadioGroupItem value={index.toString()} id={`${currentQ.id}-option-${index}`} />
              <Label 
                htmlFor={`${currentQ.id}-option-${index}`} 
                className="text-foreground cursor-pointer flex-1"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button onClick={handleFinish} className="bg-success hover:bg-success/90">
              Terminer
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={answers[currentQ.id] === undefined}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
