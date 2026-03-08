import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ErrorState } from '@/components/ui/ErrorState';
import { CheckCircle2, XCircle, Music, Brain, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickRevisionItem {
  item_code: string;
  title: string;
  subtitle: string;
}

interface QcmQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

type RevisionStep = 'loading' | 'listen' | 'quiz' | 'results';

// Simple QCM generation from item data
function generateQcm(item: QuickRevisionItem): QcmQuestion[] {
  return [
    {
      question: `Quel est le rang de l'item ${item.item_code} « ${item.title} » ?`,
      options: ['Rang A – Connaissances fondamentales', 'Rang B – Connaissances avancées', 'Rang C – Expertise', 'Hors programme'],
      correctIndex: 0,
    },
    {
      question: `L'item ${item.item_code} relève principalement de :`,
      options: [item.subtitle || 'Médecine générale', 'Chirurgie orthopédique', 'Psychiatrie', 'Ophtalmologie'],
      correctIndex: 0,
    },
    {
      question: `Parmi les compétences suivantes, laquelle est la plus pertinente pour l'item « ${item.title} » ?`,
      options: ['Diagnostic positif', 'Chirurgie réparatrice', 'Analyse financière', 'Droit du travail'],
      correctIndex: 0,
    },
  ];
}

export const QuickRevisionMode = () => {
  const [step, setStep] = useState<RevisionStep>('loading');
  const [item, setItem] = useState<QuickRevisionItem | null>(null);
  const [questions, setQuestions] = useState<QcmQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRandomItem = async () => {
    setStep('loading');
    setError(null);
    try {
      // Get a random item from edn_items_complete
      const { data, error: fetchErr } = await supabase
        .from('edn_items_complete')
        .select('item_code, title, subtitle')
        .limit(50);

      if (fetchErr) throw fetchErr;
      if (!data || data.length === 0) throw new Error('Aucun item trouvé');

      const randomItem = data[Math.floor(Math.random() * data.length)];
      setItem(randomItem);
      const qcm = generateQcm(randomItem);
      setQuestions(qcm);
      setCurrentQ(0);
      setAnswers(new Array(qcm.length).fill(null));
      setSelectedAnswer(null);
      setShowFeedback(false);
      setStep('listen');
    } catch (e) {
      setError((e as Error).message);
      setStep('loading');
    }
  };

  useEffect(() => {
    loadRandomItem();
  }, []);

  const handleAnswer = (idx: number) => {
    if (showFeedback) return;
    setSelectedAnswer(idx);
    setShowFeedback(true);
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setStep('results');
    }
  };

  const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const totalQuestions = questions.length;
  const scorePercent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  if (error) {
    return <ErrorState title="Erreur de chargement" message={error} onRetry={loadRandomItem} />;
  }

  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Chargement d'un item aléatoire…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Révision rapide</span>
          <span>
            {step === 'listen' ? '1/3' : step === 'quiz' ? `Question ${currentQ + 1}/${totalQuestions}` : 'Résultats'}
          </span>
        </div>
        <Progress 
          value={
            step === 'listen' ? 15 
            : step === 'quiz' ? 30 + ((currentQ + 1) / totalQuestions) * 55 
            : 100
          } 
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Listen */}
        {step === 'listen' && item && (
          <motion.div
            key="listen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Item #{item.item_code}</Badge>
                  <Badge className="bg-primary/10 text-primary">{item.subtitle}</Badge>
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-6 text-center space-y-3">
                  <Music className="h-10 w-10 text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    🎵 La chanson associée à cet item sera jouée ici.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Connectez-vous pour écouter les chansons médicales générées par IA.
                  </p>
                </div>

                <Button onClick={() => setStep('quiz')} className="w-full" size="lg">
                  <Brain className="h-5 w-5 mr-2" />
                  Passer au quiz
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Quiz */}
        {step === 'quiz' && (
          <motion.div
            key={`quiz-${currentQ}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <Card>
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  Question {currentQ + 1} / {totalQuestions}
                </Badge>
                <CardTitle className="text-lg">{questions[currentQ].question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {questions[currentQ].options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === questions[currentQ].correctIndex;
                  const showCorrect = showFeedback && isCorrect;
                  const showWrong = showFeedback && isSelected && !isCorrect;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={showFeedback}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showCorrect
                          ? 'border-green-500 bg-green-500/10'
                          : showWrong
                          ? 'border-destructive bg-destructive/10'
                          : isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm">{option}</span>
                        {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto shrink-0" />}
                        {showWrong && <XCircle className="h-5 w-5 text-destructive ml-auto shrink-0" />}
                      </div>
                    </button>
                  );
                })}

                {showFeedback && (
                  <Button onClick={nextQuestion} className="w-full mt-4">
                    {currentQ < totalQuestions - 1 ? 'Question suivante' : 'Voir les résultats'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <CardContent className="pt-8 pb-6 text-center space-y-6">
                <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
                  scorePercent >= 80 ? 'bg-green-500/10' : scorePercent >= 50 ? 'bg-yellow-500/10' : 'bg-destructive/10'
                }`}>
                  <Trophy className={`h-10 w-10 ${
                    scorePercent >= 80 ? 'text-green-500' : scorePercent >= 50 ? 'text-yellow-500' : 'text-destructive'
                  }`} />
                </div>

                <div>
                  <p className="text-4xl font-bold text-foreground">{score}/{totalQuestions}</p>
                  <p className="text-muted-foreground mt-1">
                    {scorePercent >= 80 ? 'Excellent ! 🎉' : scorePercent >= 50 ? 'Pas mal ! Continue 💪' : 'À retravailler 📚'}
                  </p>
                </div>

                {item && (
                  <p className="text-sm text-muted-foreground">
                    Item #{item.item_code} — {item.title}
                  </p>
                )}

                <div className="flex gap-3 justify-center pt-2">
                  <Button onClick={loadRandomItem} variant="default">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Nouvel item
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
