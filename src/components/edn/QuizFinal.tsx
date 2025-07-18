import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { useQuizWithErrorTracking } from '@/hooks/useQuizWithErrorTracking';

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
    [key: string]: string | undefined;
    completion?: string;
    badge?: string;
    message?: string;
  };
  itemCode?: string;
  itemTitle?: string;
}

export const QuizFinal = ({ questions, rewards, itemCode = 'Quiz', itemTitle = 'Quiz EDN' }: QuizFinalProps) => {
  console.log('QuizFinal - questions received:', questions);
  console.log('QuizFinal - rewards received:', rewards);

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
          <h2 className="text-3xl font-serif text-amber-900 mb-4">Quiz Final EDN</h2>
          <p className="text-amber-700">Questions non disponibles</p>
        </div>
      </div>
    );
  }

  // Si c'est un quiz de classification
  if (questions.type === 'classification' && questions.categories) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-amber-900 mb-4">
            {questions.title || 'Quiz de Classification'}
          </h2>
          <p className="text-amber-700 mb-6">
            Associez chaque élément à la bonne catégorie
          </p>
        </div>

        <div className="grid gap-6">
          {questions.categories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="p-6 bg-gradient-to-r from-amber-50 to-blue-50 border-amber-300">
              <h3 className="text-xl font-bold text-amber-900 mb-4 text-center">
                {category.name}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-white p-3 rounded-lg border border-amber-200 text-center text-amber-800 font-medium"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="p-6 bg-green-50 border-green-300">
            <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-xl text-green-800 font-bold">
              {rewards?.completion || 'Concepts maîtrisés !'}
            </p>
            <p className="text-green-700 mt-2">
              {rewards?.message || 'Vous avez acquis les connaissances essentielles.'}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Questions traditionnelles QCM/QRU/etc.
  const allQuestions: Array<{
    type: string;
    id: number;
    question: string;
    options?: string[];
    correct?: number;
    reponse?: string;
    points_cles?: string[];
    affirmation?: string;
    justification?: string;
  }> = [];
  
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
          <h2 className="text-3xl font-serif text-amber-900 mb-4">Quiz Final EDN</h2>
          <p className="text-amber-700">Aucune question disponible pour le moment</p>
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
            <h3 className="text-lg font-semibold text-amber-900">{question.question}</h3>
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
            >
              {question.options?.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="text-amber-800">
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
            <h3 className="text-lg font-semibold text-amber-900">{question.question}</h3>
            <Input
              placeholder="Votre réponse..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="border-amber-300 focus:border-amber-500"
            />
          </div>
        );

      case 'qroc':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-900">{question.question}</h3>
            <Input
              placeholder="Citez 2 éléments..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="border-amber-300 focus:border-amber-500"
            />
            {question.points_cles && (
              <p className="text-sm text-amber-600">
                Points clés attendus : {question.points_cles.join(', ')}
              </p>
            )}
          </div>
        );

      case 'zap':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-900">{question.affirmation}</h3>
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => handleAnswer(question.id, value === 'true')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="vrai" />
                <Label htmlFor="vrai" className="text-amber-800">Vrai</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="faux" />
                <Label htmlFor="faux" className="text-amber-800">Faux</Label>
              </div>
            </RadioGroup>
            {showResults && question.justification && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
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

  if (showResults) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-amber-600 mx-auto mb-4" />
          <h2 className="text-3xl font-serif text-amber-900 mb-4">Quiz Terminé !</h2>
          <div className="text-6xl font-bold text-amber-800 mb-4">
            {score}/{allQuestions.length}
          </div>
        </div>

        <Card className="p-8 bg-gradient-to-r from-amber-50 to-blue-50 border-amber-300">
          <div className="text-center">
            <p className="text-xl text-amber-900 font-medium mb-4">
              {getRewardMessage()}
            </p>
            <div className="flex justify-center space-x-2 mb-6">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < (score / allQuestions.length) * 10
                      ? 'bg-amber-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <Button
              onClick={resetQuiz}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Recommencer le quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-amber-900 mb-4">Quiz Final EDN</h2>
        <div className="flex justify-center space-x-4 mb-6">
          <Badge variant="outline" className="text-amber-700 border-amber-300">
            Question {currentQuestion + 1}/{allQuestions.length}
          </Badge>
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            {allQuestions[currentQuestion]?.type.toUpperCase()}
          </Badge>
        </div>
      </div>

      <Card className="p-4 md:p-8 bg-white/90 border-amber-200">
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
                    ? 'bg-amber-600'
                    : (allQuestions[index]?.id !== undefined && answers[allQuestions[index].id] !== undefined)
                    ? 'bg-green-400'
                    : 'bg-gray-200'
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
            className="border-amber-300 text-amber-700 hover:bg-amber-50 flex-1 md:flex-none"
          >
            Précédent
          </Button>

          {currentQuestion === allQuestions.length - 1 ? (
            <Button
              onClick={() => finishQuiz(questions)}
              className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none"
            >
              Terminer le quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(Math.min(allQuestions.length - 1, currentQuestion + 1))}
              className="bg-amber-600 hover:bg-amber-700 text-white flex-1 md:flex-none"
            >
              Suivant
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
