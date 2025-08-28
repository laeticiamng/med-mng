import { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Brain, Star, Award } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  rang: 'A' | 'B';
}

interface EnhancedQuizSectionProps {
  quizData: { questions: QuizQuestion[] };
  itemCode: string;
}

export const EnhancedQuizSection = ({ quizData, itemCode }: EnhancedQuizSectionProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const shuffledQuestions = useMemo(() => {
    if (!quizData?.questions) return [];
    const questions = [...quizData.questions];
    const rangA = questions.filter(q => q.rang === 'A');
    const rangB = questions.filter(q => q.rang === 'B');
    
    const selectedA = rangA.slice(0, Math.ceil(10 * 0.7));
    const selectedB = rangB.slice(0, Math.floor(10 * 0.3));
    
    return [...selectedA, ...selectedB].slice(0, 10);
  }, [quizData]);

  const nextQuestion = () => {
    if (selectedAnswer !== null) {
      const isCorrect = selectedAnswer === shuffledQuestions[currentQuestion].correctAnswer;
      if (isCorrect) setScore(score + 1);
      
      setAnsweredQuestions([...answeredQuestions, selectedAnswer]);
      
      if (currentQuestion === shuffledQuestions.length - 1) {
        setShowResults(true);
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      }
    }
  };

  if (showResults) {
    const percentage = Math.round((score / shuffledQuestions.length) * 100);
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="text-8xl mb-6">{percentage >= 80 ? '🏆' : percentage >= 60 ? '🥉' : '📚'}</div>
          <h2 className="text-4xl font-bold text-green-800 mb-4">Quiz Terminé !</h2>
          <p className="text-2xl text-green-600 mb-8">
            Score : {score}/{shuffledQuestions.length} ({percentage}%)
          </p>
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-800">{score}</div>
              <div className="text-blue-600">Bonnes réponses</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Star className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-800">{percentage}%</div>
              <div className="text-purple-600">Réussite</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Award className="h-12 w-12 text-amber-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-amber-800">
                {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Bien' : 'À revoir'}
              </div>
              <div className="text-amber-600">Niveau</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!shuffledQuestions.length) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Quiz en préparation</h3>
        <p className="text-gray-600">Le quiz pour cet item sera bientôt disponible !</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 shadow-xl">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🧠</div>
        <h2 className="text-3xl font-bold text-blue-800 mb-4">Quiz Interactif</h2>
        <p className="text-blue-600 text-lg">{shuffledQuestions.length} questions • Maîtrise complète</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
        <div className="flex justify-between items-center mb-6">
          <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold">
            Question {currentQuestion + 1}/{shuffledQuestions.length}
          </span>
          <span className={`px-4 py-2 rounded-full font-bold ${
            shuffledQuestions[currentQuestion]?.rang === 'A' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>
            Rang {shuffledQuestions[currentQuestion]?.rang}
          </span>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-8">
          {shuffledQuestions[currentQuestion]?.question}
        </h3>

        <div className="grid gap-4 mb-8">
          {shuffledQuestions[currentQuestion]?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(index)}
              className={`p-6 rounded-xl border-2 text-left transition-all duration-300 hover:scale-102 ${
                selectedAnswer === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                  selectedAnswer === index ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {selectedAnswer === index && <div className="w-3 h-3 bg-white rounded-full"></div>}
                </div>
                <span className="text-lg font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={nextQuestion}
          disabled={selectedAnswer === null}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-50 hover:scale-105 transition-transform shadow-lg"
        >
          {currentQuestion === shuffledQuestions.length - 1 ? 'Terminer' : 'Question suivante'}
        </button>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progression</span>
          <span>{Math.round(((currentQuestion + 1) / shuffledQuestions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};