import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Brain, Trophy, Target, Lightbulb, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  competence: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  explanation: string;
  medicalContext: string;
  timeLimit: number;
}

interface AdvancedQuizInteractifProps {
  itemData: {
    title: string;
    subtitle: string;
    item_code: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
  competences: string[];
}

export const AdvancedQuizInteractif = ({ itemData, competences }: AdvancedQuizInteractifProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Génération de questions adaptées aux compétences
  const generateQuestions = (): QuizQuestion[] => {
    const questionTemplates = {
      'Cardiologie': [
        {
          question: 'Un patient de 65 ans présente une douleur thoracique constrictive. Quelle est votre première action ?',
          options: ['Prescrire des anxiolytiques', 'Réaliser un ECG', 'Demander une radio thorax', 'Prescrire du repos'],
          correctAnswer: 1,
          explanation: 'L\'ECG est l\'examen prioritaire devant toute douleur thoracique suspecte d\'origine cardiaque.',
          medicalContext: 'Urgence cardiologique',
          timeLimit: 60
        }
      ],
      'Neurologie': [
        {
          question: 'Lors d\'un examen neurologique, que teste le réflexe rotulien ?',
          options: ['L2-L3', 'L3-L4', 'L4-L5', 'L5-S1'],
          correctAnswer: 1,
          explanation: 'Le réflexe rotulien teste les racines L3-L4 par l\'intermédiaire du nerf fémoral.',
          medicalContext: 'Examen neurologique',
          timeLimit: 45
        }
      ],
      'Diagnostic': [
        {
          question: 'Devant une fièvre isolée chez l\'adulte, quelle est la conduite à tenir ?',
          options: ['Antibiotique immédiat', 'Examens complémentaires', 'Surveillance simple', 'Hospitalisation'],
          correctAnswer: 1,
          explanation: 'Une fièvre isolée nécessite un bilan para-clinique pour identifier la cause.',
          medicalContext: 'Démarche diagnostique',
          timeLimit: 50
        }
      ]
    };

    let questions: QuizQuestion[] = [];
    
    competences.forEach((comp, index) => {
      const templates = questionTemplates[comp as keyof typeof questionTemplates];
      if (templates) {
        templates.forEach((template, qIndex) => {
          questions.push({
            id: `q-${comp}-${qIndex}`,
            competence: comp,
            difficulty: index === 0 ? 'facile' : index === 1 ? 'moyen' : 'difficile',
            ...template
          });
        });
      }
    });

    // Questions génériques si pas de compétences spécifiques
    if (questions.length === 0) {
      questions = [
        {
          id: 'q-general-1',
          question: 'Quel est le principe de base de l\'anamnèse ?',
          options: ['Poser des questions fermées', 'Laisser parler le patient', 'Faire un examen physique', 'Prescrire des examens'],
          correctAnswer: 1,
          competence: 'Communication',
          difficulty: 'facile',
          explanation: 'L\'anamnèse commence par laisser le patient s\'exprimer librement sur ses symptômes.',
          medicalContext: 'Consultation médicale',
          timeLimit: 45
        }
      ];
    }

    return questions;
  };

  const [questions] = useState<QuizQuestion[]>(generateQuestions());

  useEffect(() => {
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && quizStarted && !showExplanation) {
      handleTimeUp();
    }
  }, [timeRemaining, quizStarted, quizCompleted, showExplanation]);

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeRemaining(questions[0]?.timeLimit || 60);
  };

  const handleTimeUp = () => {
    if (selectedAnswer === null) {
      setSelectedAnswer(-1); // Marquer comme non répondu
    }
    setShowExplanation(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showExplanation) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      setAnswers(prev => ({
        ...prev,
        [questions[currentQuestion].id]: selectedAnswer
      }));

      if (selectedAnswer === questions[currentQuestion].correctAnswer) {
        setScore(prev => prev + 1);
      }
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeRemaining(questions[currentQuestion + 1]?.timeLimit || 60);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowExplanation(false);
    setTimeRemaining(0);
    setQuizStarted(false);
    setQuizCompleted(false);
    setScore(0);
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (!quizStarted) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Quiz Interactif Avancé</h1>
            <p className="text-muted-foreground text-lg">
              Testez vos connaissances sur : {itemData.title}
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted/20 p-4 rounded-lg">
                <div className="font-semibold text-primary">{questions.length}</div>
                <div>Questions</div>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <div className="font-semibold text-primary">{competences.length}</div>
                <div>Compétences</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Compétences évaluées :</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {competences.map((comp) => (
                  <Badge key={comp} variant="secondary">{comp}</Badge>
                ))}
              </div>
            </div>

            <Button onClick={startQuiz} size="lg" className="px-8 py-4">
              <Target className="w-5 h-5 mr-2" />
              Commencer le Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-green-900 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-10 h-10 text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold">Quiz Terminé !</h1>
            
            <div className="text-6xl font-bold text-green-500">
              {percentage}%
            </div>
            
            <p className="text-lg text-muted-foreground">
              Vous avez obtenu {score} bonnes réponses sur {questions.length}
            </p>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="font-semibold text-green-600">{score}</div>
                <div>Correctes</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="font-semibold text-red-600">{questions.length - score}</div>
                <div>Incorrectes</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="font-semibold text-blue-600">{percentage >= 70 ? 'Réussi' : 'À revoir'}</div>
                <div>Résultat</div>
              </div>
            </div>

            <Button onClick={resetQuiz} className="px-8 py-4">
              <RotateCcw className="w-5 h-5 mr-2" />
              Recommencer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-purple-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* En-tête avec progression */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline">
              Question {currentQuestion + 1} / {questions.length}
            </Badge>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className={`font-mono ${timeRemaining <= 10 ? 'text-red-500' : ''}`}>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Badge variant="secondary">{currentQ?.competence}</Badge>
              <Badge variant="outline">{currentQ?.difficulty}</Badge>
            </div>

            <h2 className="text-2xl font-semibold leading-relaxed">
              {currentQ?.question}
            </h2>

            <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
              <strong>Contexte :</strong> {currentQ?.medicalContext}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQ?.options.map((option, index) => {
                let buttonVariant: "outline" | "default" | "destructive" = "outline";
                let iconComponent = null;

                if (showExplanation) {
                  if (index === currentQ.correctAnswer) {
                    buttonVariant = "default";
                    iconComponent = <CheckCircle className="w-5 h-5 text-green-500" />;
                  } else if (selectedAnswer === index) {
                    buttonVariant = "destructive";
                    iconComponent = <XCircle className="w-5 h-5 text-red-500" />;
                  }
                } else if (selectedAnswer === index) {
                  buttonVariant = "default";
                }

                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: showExplanation ? 1 : 1.02 }}
                    whileTap={{ scale: showExplanation ? 1 : 0.98 }}
                  >
                    <Button
                      variant={buttonVariant}
                      className="w-full p-6 text-left justify-start h-auto"
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showExplanation}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {iconComponent}
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {/* Explication */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-blue-500"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Explication :</h4>
                      <p className="text-sm leading-relaxed">{currentQ?.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-muted-foreground">
                Score actuel : {score}/{currentQuestion + (showExplanation ? 1 : 0)}
              </div>
              
              {!showExplanation ? (
                <Button
                  onClick={() => setShowExplanation(true)}
                  disabled={selectedAnswer === null}
                >
                  Valider
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {currentQuestion < questions.length - 1 ? 'Question suivante' : 'Terminer'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};