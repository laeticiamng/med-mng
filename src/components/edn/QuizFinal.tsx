import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Trophy, RotateCcw, Flame, Star, Share2 } from 'lucide-react';
import { useQuizWithErrorTracking } from '@/hooks/useQuizWithErrorTracking';
import { useGamification, POINTS_CONFIG } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
interface QuizQuestion {
  question: string;
  options?: string[];
  correct?: number;
  reponse?: string;
  points_cles?: string[];
  affirmation?: string;
  justification?: string;
}

interface QuizFinalProps {
  questions: {
    qcm?: QuizQuestion[];
    qru?: QuizQuestion[];
    qroc?: QuizQuestion[];
    zap?: QuizQuestion[];
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
  itemCode?: string;
  itemTitle?: string;
  onQuizFinished?: (score: number, totalQuestions: number) => void;
}

export const QuizFinal = ({ questions, rewards, itemCode = 'Quiz', itemTitle = 'Quiz EDN', onQuizFinished }: QuizFinalProps) => {
  const { addPoints, unlockBadge, stats } = useGamification();
  const { logActivity } = useActivityTracking();
  const { toast } = useToast();
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const [startTime] = useState(Date.now());
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);
  const {
    answers,
    currentQuestion,
    showResults,
    score,
    handleAnswer,
    finishQuiz,
    resetQuiz,
    setCurrentQuestion
  } = useQuizWithErrorTracking(itemCode, itemTitle);

  // Gestion du cas où les questions sont dans un format différent
  if (!questions) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-foreground mb-4">Quiz Final EDN</h2>
          <p className="text-muted-foreground">Questions non disponibles</p>
        </div>
      </div>
    );
  }

  // Si c'est un quiz de classification
  if (questions.type === 'classification' && questions.categories) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-foreground mb-4">
            {questions.title || 'Quiz de Classification'}
          </h2>
          <p className="text-muted-foreground mb-6">
            Associez chaque élément à la bonne catégorie
          </p>
        </div>

        <div className="grid gap-6">
          {questions.categories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="p-6 bg-gradient-to-r from-warning/10 to-primary/10 border-warning/30">
              <h3 className="text-xl font-bold text-foreground mb-4 text-center">
                {category.name}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-card p-3 rounded-lg border border-warning/20 text-center text-foreground font-medium"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="p-6 bg-success/10 border-success">
            <Trophy className="h-12 w-12 text-success mx-auto mb-4" />
            <p className="text-xl text-success font-bold">
              {rewards?.completion || 'Concepts maîtrisés !'}
            </p>
            <p className="text-success mt-2">
              {rewards?.message || 'Vous avez acquis les connaissances essentielles.'}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Questions traditionnelles QCM/QRU/etc.
  const allQuestions = [];
  
  if (questions.qcm) {
    allQuestions.push(...questions.qcm.map((q, i) => ({ ...q, type: 'qcm', id: i })));
  }
  if (questions.qru) {
    const startId = questions.qcm?.length || 0;
    allQuestions.push(...questions.qru.map((q, i) => ({ ...q, type: 'qru', id: i + startId })));
  }
  if (questions.qroc) {
    const startId = (questions.qcm?.length || 0) + (questions.qru?.length || 0);
    allQuestions.push(...questions.qroc.map((q, i) => ({ ...q, type: 'qroc', id: i + startId })));
  }
  if (questions.zap) {
    const startId = (questions.qcm?.length || 0) + (questions.qru?.length || 0) + (questions.qroc?.length || 0);
    allQuestions.push(...questions.zap.map((q, i) => ({ ...q, type: 'zap', id: i + startId })));
  }

  if (allQuestions.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-foreground mb-4">Quiz Final EDN</h2>
          <p className="text-muted-foreground">Aucune question disponible pour le moment</p>
        </div>
      </div>
    );
  }

  // Les fonctions sont maintenant gérées par le hook useQuizWithErrorTracking

  const getRewardMessage = () => {
    if (!rewards) return "Quiz terminé !";
    
    const percentage = (score / allQuestions.length) * 10;
    if (rewards['10'] && percentage === 10) return rewards['10'];
    if (rewards['8-9'] && percentage >= 8) return rewards['8-9'];
    if (rewards['< 8']) return rewards['< 8'];
    return rewards.completion || "Félicitations !";
  };

  const renderQuestion = (question: any) => {
    switch (question.type) {
      case 'qcm':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{question.question}</h3>
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
            >
              {question.options?.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="text-foreground">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'qru':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{question.question}</h3>
            <Input
              placeholder="Votre réponse..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="border-warning/30 focus:border-warning"
            />
          </div>
        );

      case 'qroc':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{question.question}</h3>
            <Input
              placeholder="Citez 2 éléments..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="border-warning/30 focus:border-warning"
            />
            {question.points_cles && (
              <p className="text-sm text-warning">
                Points clés attendus : {question.points_cles.join(', ')}
              </p>
            )}
          </div>
        );

      case 'zap':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{question.affirmation}</h3>
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => handleAnswer(question.id, value === 'true')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="vrai" />
                <Label htmlFor="vrai" className="text-foreground">Vrai</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="faux" />
                <Label htmlFor="faux" className="text-foreground">Faux</Label>
              </div>
            </RadioGroup>
            {showResults && question.justification && (
              <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded">
                <p className="text-sm text-primary">
                  <strong>Justification :</strong> {question.justification}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Award points when results are shown
  useEffect(() => {
    if (showResults && !pointsAwarded && allQuestions.length > 0 && userId) {
      const percentage = (score / allQuestions.length) * 100;
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      // Award points based on score
      const isPerfect = percentage === 100;
      addPoints(userId, isPerfect ? 'perfectExam' : 'examCompleted');
      
      // Log activity
      logActivity({
        activity_type: 'exam',
        count: 1,
        duration_seconds: duration,
        score: percentage,
        metadata: { 
          itemCode, 
          itemTitle, 
          questionsCount: allQuestions.length,
          correctAnswers: score
        }
      });
      
      // Check for perfect score badge
      if (isPerfect) {
        unlockBadge(userId, 'perfect_exam');
        toast({
          title: "🏆 Score parfait !",
          description: `Badge débloqué !`,
        });
      } else {
        toast({
          title: "✅ Quiz terminé !",
          description: `XP gagnés !`,
        });
      }
      
      // Notify parent component
      onQuizFinished?.(score, allQuestions.length);
      
      setPointsAwarded(true);
    }
  }, [showResults, pointsAwarded, score, allQuestions.length, userId, onQuizFinished]);

  if (showResults) {
    const percentage = allQuestions.length > 0 ? (score / allQuestions.length) * 100 : 0;
    
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-warning mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-serif text-foreground mb-4">Quiz Terminé !</h2>
          <div className="text-6xl font-bold text-foreground mb-4">
            {score}/{allQuestions.length}
          </div>
          <Badge variant="outline" className="text-lg px-4 py-1">
            {percentage >= 80 ? '🌟 Excellent !' : percentage >= 60 ? '👍 Bien !' : '📚 À réviser'}
          </Badge>
        </div>

        {/* Gamification Stats */}
        {stats && (
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="gap-1 text-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              Série: {stats.currentStreak} jours
            </Badge>
            <Badge variant="outline" className="gap-1 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              Niveau {stats.level}
            </Badge>
          </div>
        )}

        <Card className="p-8 bg-gradient-to-r from-warning/10 to-primary/10 border-warning/30">
          <div className="text-center">
            <p className="text-xl text-foreground font-medium mb-4">
              {getRewardMessage()}
            </p>
            <div className="flex justify-center space-x-2 mb-6">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all ${
                    i < (score / allQuestions.length) * 10
                      ? 'bg-warning scale-110'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-center gap-3">
              <Button
                onClick={resetQuiz}
                className="bg-warning hover:bg-warning/90 text-warning-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Recommencer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Quiz ${itemCode}`,
                      text: `J'ai obtenu ${score}/${allQuestions.length} au quiz ${itemTitle} !`,
                    });
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-foreground mb-4">Quiz Final EDN</h2>
        <div className="flex justify-center space-x-4 mb-6">
          <Badge variant="outline" className="text-warning border-warning/30">
            Question {currentQuestion + 1}/{allQuestions.length}
          </Badge>
          <Badge variant="outline" className="text-primary border-primary/30">
            {allQuestions[currentQuestion].type.toUpperCase()}
          </Badge>
        </div>
      </div>

      <Card className="p-4 md:p-8 bg-card/90 border-warning/20">
        {renderQuestion(allQuestions[currentQuestion])}
      </Card>

      {/* Navigation mobile optimisée */}
      <div className="space-y-4">
        {/* Indicateurs de progression */}
        <div className="flex justify-center">
          <div className="flex space-x-1 overflow-x-auto max-w-full px-2">
            {allQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors flex-shrink-0 ${
                  index === currentQuestion
                    ? 'bg-warning'
                    : answers[allQuestions[index].id] !== undefined
                    ? 'bg-success'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Boutons de navigation */}
        <div className="flex justify-between items-center gap-4">
          <Button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            variant="outline"
            className="border-warning/30 text-warning hover:bg-warning/10 flex-1 md:flex-none"
          >
            Précédent
          </Button>

          {currentQuestion === allQuestions.length - 1 ? (
            <Button
              onClick={() => finishQuiz(questions)}
              className="bg-success hover:bg-success/90 text-primary-foreground flex-1 md:flex-none"
            >
              Terminer le quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(Math.min(allQuestions.length - 1, currentQuestion + 1))}
              className="bg-warning hover:bg-warning/90 text-warning-foreground flex-1 md:flex-none"
            >
              Suivant
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
