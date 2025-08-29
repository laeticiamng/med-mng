import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle,
  Lightbulb,
  TrendingUp,
  Zap,
  RotateCcw,
  Award,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdaptiveQuestion {
  id: string;
  type: 'mcq' | 'multiple_select' | 'true_false' | 'scenario';
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  question: string;
  options: string[];
  correctAnswers: number[];
  explanation: string;
  hint?: string;
  context?: string;
  timeLimit?: number;
  adaptiveFactors: {
    conceptMastery: string[];
    cognitiveLoad: number;
    prerequisiteKnowledge: string[];
  };
}

interface UserPerformance {
  correctAnswers: number;
  totalAnswers: number;
  averageTime: number;
  strongConcepts: string[];
  weakConcepts: string[];
  difficultyLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  confidenceScore: number;
  learningSpeed: number;
}

interface AdaptiveQuizSystemProps {
  itemCode: string;
  concepts: string[];
  onComplete?: (performance: UserPerformance) => void;
}

export const AdaptiveQuizSystem: React.FC<AdaptiveQuizSystemProps> = ({
  itemCode,
  concepts,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const [performance, setPerformance] = useState<UserPerformance>({
    correctAnswers: 0,
    totalAnswers: 0,
    averageTime: 0,
    strongConcepts: [],
    weakConcepts: [],
    difficultyLevel: 'basic',
    confidenceScore: 50,
    learningSpeed: 1
  });

  const [adaptiveQuestions, setAdaptiveQuestions] = useState<AdaptiveQuestion[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Générateur de questions adaptatives basé sur l'item
  useEffect(() => {
    const generateAdaptiveQuestions = (itemCode: string): AdaptiveQuestion[] => {
      const questionBank = {
        'IC-1': [
          {
            id: 'ic1-basic-1',
            type: 'mcq' as const,
            difficulty: 'basic' as const,
            category: 'Communication',
            question: 'Quel est le principe fondamental de la communication médecin-patient ?',
            options: [
              'Donner rapidement toutes les informations',
              'Écouter activement et faire preuve d\'empathie',
              'Utiliser uniquement des termes médicaux',
              'Éviter les questions du patient'
            ],
            correctAnswers: [1],
            explanation: 'L\'écoute active et l\'empathie sont essentielles pour établir une relation de confiance.',
            hint: 'Pensez à ce qui vous rassurerait si vous étiez patient.',
            timeLimit: 30,
            adaptiveFactors: {
              conceptMastery: ['communication', 'empathie'],
              cognitiveLoad: 2,
              prerequisiteKnowledge: []
            }
          },
          {
            id: 'ic1-intermediate-1',
            type: 'scenario' as const,
            difficulty: 'intermediate' as const,
            category: 'Communication Complexe',
            question: 'Un patient âgé semble ne pas comprendre vos explications sur son traitement. Quelle approche adoptez-vous ?',
            options: [
              'Répéter la même explication plus fort',
              'Simplifier le langage et vérifier la compréhension',
              'Demander à la famille d\'expliquer',
              'Donner une brochure et partir'
            ],
            correctAnswers: [1],
            explanation: 'Il faut adapter sa communication à chaque patient et s\'assurer de sa compréhension.',
            context: 'Situation clinique courante nécessitant adaptation communicationnelle',
            timeLimit: 45,
            adaptiveFactors: {
              conceptMastery: ['adaptation', 'vérification', 'pédagogie'],
              cognitiveLoad: 4,
              prerequisiteKnowledge: ['communication de base']
            }
          },
          {
            id: 'ic1-advanced-1',
            type: 'multiple_select' as const,
            difficulty: 'advanced' as const,
            category: 'Éthique Communicationnelle',
            question: 'Dans l\'annonce d\'un diagnostic grave, quels éléments sont cruciaux ? (Plusieurs réponses possibles)',
            options: [
              'Choisir un environnement approprié',
              'Évaluer ce que le patient sait déjà',
              'Donner toutes les informations d\'un coup',
              'Offrir son soutien et des ressources',
              'Planifier un suivi rapproché'
            ],
            correctAnswers: [0, 1, 3, 4],
            explanation: 'L\'annonce d\'un diagnostic grave suit un protocole précis centré sur le patient.',
            timeLimit: 60,
            adaptiveFactors: {
              conceptMastery: ['annonce', 'diagnostic grave', 'protocole', 'soutien'],
              cognitiveLoad: 6,
              prerequisiteKnowledge: ['communication de base', 'empathie']
            }
          }
        ],
        'IC-91': [
          {
            id: 'ic91-basic-1',
            type: 'mcq' as const,
            difficulty: 'basic' as const,
            category: 'Neurologie',
            question: 'Le déficit neurologique aigu le plus fréquent est :',
            options: [
              'L\'épilepsie',
              'L\'AVC (Accident Vasculaire Cérébral)',
              'La migraine',
              'La sclérose en plaques'
            ],
            correctAnswers: [1],
            explanation: 'L\'AVC est la cause principale de déficit neurologique aigu et constitue une urgence médicale.',
            timeLimit: 25,
            adaptiveFactors: {
              conceptMastery: ['AVC', 'urgence', 'déficit'],
              cognitiveLoad: 3,
              prerequisiteKnowledge: []
            }
          }
        ]
      };

      const questions = questionBank[itemCode as keyof typeof questionBank] || [];
      
      // Ajouter des questions génériques si nécessaire
      if (questions.length === 0) {
        return [{
          id: 'generic-1',
          type: 'mcq',
          difficulty: 'basic',
          category: 'Général',
          question: `Concernant l'item ${itemCode}, quel aspect est le plus important ?`,
          options: [
            'La mémorisation des détails',
            'La compréhension des concepts',
            'L\'application pratique',
            'Tous les aspects sont équivalents'
          ],
          correctAnswers: [2],
          explanation: 'L\'application pratique permet d\'intégrer tous les autres aspects.',
          timeLimit: 30,
          adaptiveFactors: {
            conceptMastery: ['application', 'pratique'],
            cognitiveLoad: 2,
            prerequisiteKnowledge: []
          }
        }];
      }

      return questions;
    };

    setAdaptiveQuestions(generateAdaptiveQuestions(itemCode));
  }, [itemCode]);

  // Sélection de la prochaine question basée sur la performance
  const getNextQuestion = (currentPerformance: UserPerformance): AdaptiveQuestion | null => {
    const availableQuestions = adaptiveQuestions.filter(q => 
      !userAnswers.some((_, index) => adaptiveQuestions[index]?.id === q.id)
    );

    if (availableQuestions.length === 0) return null;

    // Logique adaptative
    let targetDifficulty = currentPerformance.difficultyLevel;
    
    // Ajuster la difficulté selon la performance récente
    const recentCorrect = performance.correctAnswers / Math.max(performance.totalAnswers, 1);
    if (recentCorrect > 0.8 && performance.totalAnswers >= 3) {
      // Augmenter la difficulté
      const difficultyLevels = ['basic', 'intermediate', 'advanced', 'expert'];
      const currentIndex = difficultyLevels.indexOf(targetDifficulty);
      if (currentIndex < difficultyLevels.length - 1) {
        targetDifficulty = difficultyLevels[currentIndex + 1] as any;
      }
    } else if (recentCorrect < 0.5 && performance.totalAnswers >= 2) {
      // Diminuer la difficulté
      const difficultyLevels = ['basic', 'intermediate', 'advanced', 'expert'];
      const currentIndex = difficultyLevels.indexOf(targetDifficulty);
      if (currentIndex > 0) {
        targetDifficulty = difficultyLevels[currentIndex - 1] as any;
      }
    }

    // Sélectionner une question de la difficulté cible
    const targetQuestions = availableQuestions.filter(q => q.difficulty === targetDifficulty);
    const selectedQuestions = targetQuestions.length > 0 ? targetQuestions : availableQuestions;

    // Prioriser les concepts faibles
    const conceptPriorityQuestions = selectedQuestions.filter(q =>
      q.adaptiveFactors.conceptMastery.some(concept => 
        currentPerformance.weakConcepts.includes(concept)
      )
    );

    const finalQuestions = conceptPriorityQuestions.length > 0 ? conceptPriorityQuestions : selectedQuestions;
    
    return finalQuestions[0] || null;
  };

  // Initialiser la première question
  useEffect(() => {
    if (adaptiveQuestions.length > 0 && !currentQuestion) {
      const firstQuestion = getNextQuestion(performance);
      setCurrentQuestion(firstQuestion);
      setQuestionStartTime(Date.now());
      setTimeRemaining(firstQuestion?.timeLimit || 30);
    }
  }, [adaptiveQuestions]);

  // Timer
  useEffect(() => {
    if (timeRemaining > 0 && !showExplanation) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !showExplanation) {
      handleSubmitAnswer();
    }
  }, [timeRemaining, showExplanation]);

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;

    const answerTime = Date.now() - questionStartTime;
    let correct = false;

    if (currentQuestion.type === 'multiple_select') {
      const selectedIndices = selectedAnswer.split(',').map(Number).filter(n => !isNaN(n));
      correct = selectedIndices.length === currentQuestion.correctAnswers.length &&
                selectedIndices.every(idx => currentQuestion.correctAnswers.includes(idx));
    } else {
      const selectedIndex = parseInt(selectedAnswer);
      correct = currentQuestion.correctAnswers.includes(selectedIndex);
    }

    setIsCorrect(correct);
    setShowExplanation(true);

    // Mettre à jour la performance
    const newPerformance = {
      ...performance,
      correctAnswers: performance.correctAnswers + (correct ? 1 : 0),
      totalAnswers: performance.totalAnswers + 1,
      averageTime: (performance.averageTime * performance.totalAnswers + answerTime) / (performance.totalAnswers + 1)
    };

    // Mettre à jour les concepts forts/faibles
    const questionConcepts = currentQuestion.adaptiveFactors.conceptMastery;
    if (correct) {
      newPerformance.strongConcepts = [...new Set([...newPerformance.strongConcepts, ...questionConcepts])];
      newPerformance.weakConcepts = newPerformance.weakConcepts.filter(c => !questionConcepts.includes(c));
    } else {
      newPerformance.weakConcepts = [...new Set([...newPerformance.weakConcepts, ...questionConcepts])];
    }

    // Calculer le score de confiance
    const successRate = newPerformance.correctAnswers / newPerformance.totalAnswers;
    newPerformance.confidenceScore = Math.round(successRate * 100);

    // Ajuster la vitesse d'apprentissage
    const timeBonus = answerTime < (currentQuestion.timeLimit || 30) * 1000 * 0.7 ? 0.1 : 0;
    newPerformance.learningSpeed = Math.min(2, newPerformance.learningSpeed + (correct ? 0.1 : -0.05) + timeBonus);

    setPerformance(newPerformance);
  };

  const nextQuestion = () => {
    const next = getNextQuestion(performance);
    
    if (!next) {
      setQuizCompleted(true);
      onComplete?.(performance);
      return;
    }

    setCurrentQuestion(next);
    setSelectedAnswer('');
    setShowExplanation(false);
    setIsCorrect(null);
    setShowHint(false);
    setQuestionStartTime(Date.now());
    setTimeRemaining(next.timeLimit || 30);
    setQuestionIndex(prev => prev + 1);
  };

  const resetQuiz = () => {
    setCurrentQuestion(null);
    setQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer('');
    setShowExplanation(false);
    setIsCorrect(null);
    setShowHint(false);
    setQuizCompleted(false);
    setPerformance({
      correctAnswers: 0,
      totalAnswers: 0,
      averageTime: 0,
      strongConcepts: [],
      weakConcepts: [],
      difficultyLevel: 'basic',
      confidenceScore: 50,
      learningSpeed: 1
    });
  };

  if (quizCompleted) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Award className="h-8 w-8 text-yellow-500" />
            Quiz Adaptatif Terminé !
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {Math.round((performance.correctAnswers / performance.totalAnswers) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Score Final</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{performance.totalAnswers}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(performance.averageTime / 1000)}s
              </div>
              <div className="text-sm text-gray-600">Temps Moyen</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {performance.confidenceScore}%
              </div>
              <div className="text-sm text-gray-600">Confiance</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Concepts Maîtrisés</h4>
              <div className="flex flex-wrap gap-1">
                {performance.strongConcepts.map(concept => (
                  <Badge key={concept} className="bg-green-100 text-green-800">
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">À Revoir</h4>
              <div className="flex flex-wrap gap-1">
                {performance.weakConcepts.map(concept => (
                  <Badge key={concept} className="bg-red-100 text-red-800">
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={resetQuiz}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Recommencer
            </Button>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Voir les Détails
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Génération des questions adaptatives...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête du quiz */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Quiz Adaptatif - {itemCode}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="capitalize">
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="secondary">
                Question {questionIndex + 1}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  {performance.correctAnswers}/{performance.totalAnswers} correct
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Confiance: {performance.confidenceScore}%</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className={`text-sm font-mono ${timeRemaining <= 10 ? 'text-red-600 font-bold' : ''}`}>
                {timeRemaining}s
              </span>
            </div>
          </div>
          
          <Progress 
            value={(timeRemaining / (currentQuestion.timeLimit || 30)) * 100} 
            className="h-2"
          />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Badge variant="outline" className="mb-3">
                {currentQuestion.category}
              </Badge>
              <h3 className="text-lg font-semibold leading-relaxed">
                {currentQuestion.question}
              </h3>
              {currentQuestion.context && (
                <p className="text-sm text-gray-600 mt-2 p-3 bg-blue-50 rounded-lg">
                  <strong>Contexte:</strong> {currentQuestion.context}
                </p>
              )}
            </div>
            
            {currentQuestion.hint && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowHint(!showHint)}
                className="ml-4"
              >
                <Lightbulb className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <AnimatePresence>
            {showHint && currentQuestion.hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Indice:</p>
                    <p className="text-sm text-yellow-700">{currentQuestion.hint}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>
        
        <CardContent>
          {!showExplanation ? (
            <div className="space-y-4">
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || timeRemaining === 0}
                  className="w-full max-w-xs"
                >
                  Valider la Réponse
                </Button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Réponse */}
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                {isCorrect ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div>
                  <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? 'Correct !' : 'Incorrect'}
                  </p>
                  <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect 
                      ? 'Excellente réponse ! Vous maîtrisez ce concept.'
                      : `La bonne réponse était : ${currentQuestion.options[currentQuestion.correctAnswers[0]]}`
                    }
                  </p>
                </div>
              </div>

              {/* Explication */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Explication</h4>
                <p className="text-blue-700">{currentQuestion.explanation}</p>
              </div>

              <div className="flex justify-center">
                <Button onClick={nextQuestion} className="w-full max-w-xs">
                  <Zap className="h-4 w-4 mr-2" />
                  Question Suivante
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Performance en temps réel */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {Math.round((performance.correctAnswers / Math.max(performance.totalAnswers, 1)) * 100)}%
                </div>
                <div className="text-xs text-gray-600">Réussite</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {performance.learningSpeed.toFixed(1)}x
                </div>
                <div className="text-xs text-gray-600">Vitesse</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{performance.strongConcepts.length}</div>
                <div className="text-xs text-gray-600">Maîtrisés</div>
              </div>
            </div>
            
            <Badge variant="outline" className="capitalize">
              Niveau: {performance.difficultyLevel}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};