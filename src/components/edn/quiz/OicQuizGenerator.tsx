import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { OicCompetence, useOicCompetences } from '@/hooks/useOicCompetences';
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

interface GeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  competence: OicCompetence;
}

/**
 * Génère des questions de quiz à partir des compétences OIC réelles
 */
const QUESTION_TEMPLATES = [
  { template: 'definition', question: (comp: OicCompetence) => `Concernant "${comp.intitule}", quelle affirmation est correcte ?` },
  { template: 'objectif', question: (comp: OicCompetence) => `L'objectif ${comp.objectif_id} correspond à :` },
  { template: 'rubrique', question: (comp: OicCompetence) => `Dans quelle catégorie se situe la compétence "${comp.objectif_id}" ?` },
  { template: 'identification', question: (_comp: OicCompetence) => `Identifiez la compétence UNESS officielle :` },
  { template: 'association', question: (comp: OicCompetence) => `Quelle compétence est associée à l'item parent ${comp.item_parent} ?` },
  { template: 'vrai_faux', question: (comp: OicCompetence) => `L'affirmation suivante est-elle vraie ? "${comp.intitule}"` },
  { template: 'qcm_negatif', question: (comp: OicCompetence) => `Parmi ces affirmations, laquelle n'est PAS correcte pour ${comp.objectif_id} ?` },
  { template: 'cas_clinique', question: (_comp: OicCompetence) => `Un patient présente un tableau clinique. Quelle compétence UNESS est concernée ?` },
  { template: 'hierarchie', question: (comp: OicCompetence) => `Quel est l'ordre de priorité pour la compétence ${comp.objectif_id} ?` },
  { template: 'diagnostic', question: (_comp: OicCompetence) => `Pour établir le diagnostic, identifiez la compétence requise :` },
];

const generateQuestionsFromCompetences = (
  competences: OicCompetence[],
  maxQuestions: number = 10
): GeneratedQuestion[] => {
  if (competences.length === 0) return [];

  // Deterministic shuffle using Fisher-Yates with seed
  const shuffled = [...competences];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (i * 17 + competences.length) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selected = shuffled.slice(0, Math.min(maxQuestions, competences.length));

  // Distracteurs médicaux génériques pour compléter si nécessaire
  const MEDICAL_DISTRACTORS = [
    "Absence de corrélation clinico-biologique établie",
    "Critère diagnostique non retenu par les recommandations actuelles",
    "Modalité thérapeutique de deuxième intention uniquement",
    "Signe clinique aspécifique sans valeur discriminante",
    "Approche diagnostique obsolète selon HAS 2024",
    "Élément sémiologique fréquent mais non pathognomonique",
    "Traitement symptomatique sans effet sur l'évolution",
    "Critère d'exclusion plutôt que d'inclusion diagnostique",
    "Manifestation atypique nécessitant confirmation",
    "Option non validée par les études de niveau de preuve élevé"
  ];

  return selected.map((comp, index) => {
    // Sélectionner un template de question aléatoire
    const templateIndex = index % QUESTION_TEMPLATES.length;
    const template = QUESTION_TEMPLATES[templateIndex];
    
    // Générer des distracteurs variés basés sur d'autres compétences
    const otherComps = competences.filter(c => c.objectif_id !== comp.objectif_id);
    // Deterministic distractor selection based on index
    const sortedOthers = [...otherComps].sort((a, b) => 
      (a.objectif_id || '').localeCompare(b.objectif_id || '')
    );
    const distractors = sortedOthers
      .slice(0, 3)
      .map(c => {
        // Varier le type de distracteur selon le template
        if (template.template === 'rubrique' && c.rubrique) return c.rubrique;
        if (template.template === 'definition' && c.description) return c.description.substring(0, 100) + '...';
        return c.intitule;
      });

    // Compléter avec des distracteurs médicaux réalistes si insuffisant
    let distIdx = 0;
    while (distractors.length < 3 && distIdx < MEDICAL_DISTRACTORS.length) {
      const candidate = MEDICAL_DISTRACTORS[distIdx];
      if (!distractors.includes(candidate)) {
        distractors.push(candidate);
      }
      distIdx++;
    }

    // Générer la bonne réponse selon le template
    let correctAnswer = comp.intitule;
    if (template.template === 'rubrique' && comp.rubrique) correctAnswer = comp.rubrique;
    if (template.template === 'definition' && comp.description) correctAnswer = comp.description.substring(0, 100) + '...';
    
    // Deterministic options order based on index
    const allOptions = [correctAnswer, ...distractors.filter(d => d !== correctAnswer)].slice(0, 4);
    // Rotate options based on index for variety but deterministic
    const rotation = index % allOptions.length;
    const shuffledOptions = [...allOptions.slice(rotation), ...allOptions.slice(0, rotation)];
    const correctIndex = shuffledOptions.indexOf(correctAnswer);

    return {
      id: `q-${index}-${comp.objectif_id}`,
      question: template.question(comp),
      options: shuffledOptions,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      explanation: `${comp.objectif_id}: ${comp.intitule}${comp.description ? `\n\n${comp.description}` : ''}`,
      competence: comp,
    };
  });
};

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
  const { addPoints, unlockBadge } = useGamification();
  const { logActivity } = useActivityTracking();

  const questions = useMemo(() => {
    if (!selectedRang) return [];
    const comps = selectedRang === 'A' ? competencesA : competencesB;
    return generateQuestionsFromCompetences(comps, 10);
  }, [selectedRang, competencesA, competencesB]);

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
      const percentage = (score / questions.length) * 100;

      // Sauvegarder en base de données
      try {
        await supabase.from('quiz_results').insert({
          user_id: user.id,
          item_code: itemCode,
          item_title: itemTitle,
          score: percentage,
          total_questions: questions.length,
          correct_answers: score,
          wrong_answers: questions.length - score,
          time_spent: 0
        });
      } catch {
        // Erreur silencieuse
      }

      await addPoints(user.id, percentage === 100 ? 'perfectExam' : 'examCompleted');
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
            Quiz OIC Dynamique - {itemCode}
          </CardTitle>
          <CardDescription>
            Testez vos connaissances sur les compétences officielles UNESS
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
                  Choisissez un niveau pour générer un quiz personnalisé
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 border-2 border-primary/30 hover:bg-primary/10 hover:border-primary"
                  onClick={() => handleStartQuiz('A')}
                  disabled={totalCompetencesA === 0}
                >
                  <Badge className="bg-primary/10 text-primary border-primary/30">Rang A</Badge>
                  <span className="text-2xl font-bold text-primary">{totalCompetencesA}</span>
                  <span className="text-sm text-muted-foreground">Compétences fondamentales</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 border-2 border-accent/30 hover:bg-accent/10 hover:border-accent"
                  onClick={() => handleStartQuiz('B')}
                  disabled={totalCompetencesB === 0}
                >
                  <Badge className="bg-accent/10 text-accent-foreground border-accent/30">Rang B</Badge>
                  <span className="text-2xl font-bold text-accent-foreground">{totalCompetencesB}</span>
                  <span className="text-sm text-muted-foreground">Compétences expertes</span>
                </Button>
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
          <div className="mt-6 space-y-3 text-left max-h-64 overflow-y-auto">
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
                    <div className="flex-1">
                      <p className="text-sm font-medium">{q.competence.objectif_id}</p>
                      <p className="text-xs text-muted-foreground">{q.competence.intitule}</p>
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

        <RadioGroup
          value={answers[currentQ.id]?.toString()}
          onValueChange={(value) => handleAnswer(currentQ.id, parseInt(value))}
          className="space-y-3"
        >
          {currentQ.options.map((option, index) => (
            <div 
              key={index} 
              className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label 
                htmlFor={`option-${index}`} 
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
