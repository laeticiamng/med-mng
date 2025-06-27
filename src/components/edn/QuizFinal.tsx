
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';

interface QuizFinalProps {
  questions: {
    qcm: Array<{
      question: string;
      options: string[];
      correct: number;
    }>;
    qru: Array<{
      question: string;
      reponse: string;
    }>;
    qroc: Array<{
      question: string;
      points_cles: string[];
    }>;
    zap: Array<{
      affirmation: string;
      correct: boolean;
      justification: string;
    }>;
  };
  rewards: {
    [key: string]: string;
  };
}

export const QuizFinal = ({ questions, rewards }: QuizFinalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const allQuestions = [
    ...questions.qcm.map((q, i) => ({ ...q, type: 'qcm', id: i })),
    ...questions.qru.map((q, i) => ({ ...q, type: 'qru', id: i + questions.qcm.length })),
    ...questions.qroc.map((q, i) => ({ ...q, type: 'qroc', id: i + questions.qcm.length + questions.qru.length })),
    ...questions.zap.map((q, i) => ({ ...q, type: 'zap', id: i + questions.qcm.length + questions.qru.length + questions.qroc.length }))
  ];

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    
    // QCM scoring
    questions.qcm.forEach((q, i) => {
      if (answers[i] === q.correct) totalScore++;
    });

    // QRU scoring
    questions.qru.forEach((q, i) => {
      const id = i + questions.qcm.length;
      const userAnswer = answers[id]?.toLowerCase() || '';
      if (userAnswer.includes(q.reponse.toLowerCase())) totalScore++;
    });

    // QROC scoring
    questions.qroc.forEach((q, i) => {
      const id = i + questions.qcm.length + questions.qru.length;
      const userAnswer = answers[id]?.toLowerCase() || '';
      const matchedPoints = q.points_cles.filter(point => 
        userAnswer.includes(point.toLowerCase())
      );
      if (matchedPoints.length >= 2) totalScore++;
    });

    // ZAP scoring
    questions.zap.forEach((q, i) => {
      const id = i + questions.qcm.length + questions.qru.length + questions.qroc.length;
      if (answers[id] === q.correct) totalScore++;
    });

    return totalScore;
  };

  const finishQuiz = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const getRewardMessage = () => {
    const percentage = (score / allQuestions.length) * 10;
    if (percentage === 10) return rewards['10'];
    if (percentage >= 8) return rewards['8-9'];
    return rewards['< 8'];
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
              {question.options.map((option: string, index: number) => (
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
            <p className="text-sm text-amber-600">
              Points clés attendus : {question.points_cles.join(', ')}
            </p>
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
            {showResults && (
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
            {allQuestions[currentQuestion].type.toUpperCase()}
          </Badge>
        </div>
      </div>

      <Card className="p-8 bg-white/90 border-amber-200">
        {renderQuestion(allQuestions[currentQuestion])}
      </Card>

      <div className="flex justify-between items-center">
        <Button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          variant="outline"
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          Précédent
        </Button>

        <div className="flex space-x-2">
          {allQuestions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentQuestion
                  ? 'bg-amber-600'
                  : answers[allQuestions[index].id] !== undefined
                  ? 'bg-green-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {currentQuestion === allQuestions.length - 1 ? (
          <Button
            onClick={finishQuiz}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Terminer le quiz
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion(Math.min(allQuestions.length - 1, currentQuestion + 1))}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Suivant
          </Button>
        )}
      </div>
    </div>
  );
};
