import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Clock,
  Brain,
  Target,
  Settings2,
  AlertTriangle,
  Zap,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExamType =
  | 'edn_blanc'
  | 'session_rapide'
  | 'par_specialite'
  | 'personnalise';

export type QuestionType = 'QCM' | 'QRU' | 'QROC' | 'Mixte';

export type Difficulty = 'Facile' | 'Moyen' | 'Difficile' | 'Progressif';

export interface ExamConfiguration {
  examType: ExamType;
  questionType: QuestionType;
  difficulty: Difficulty;
  questionCount: number;
  timerMinutes: number;
  specialties: string[];
  ednRealConditions: boolean;
  randomizeQuestions: boolean;
  penaltyForWrongQRU: boolean;
  noPauseDuringExam: boolean;
  hideExplanationsDuringExam: boolean;
  strictTimer: boolean;
}

interface ExamConfigProps {
  onStart: (config: ExamConfiguration) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPECIALTIES: string[] = [
  'Cardiologie',
  'Pneumologie',
  'Gastro-entérologie',
  'Neurologie',
  'Endocrinologie',
  'Néphrologie',
  'Hématologie',
  'Rhumatologie',
  'Dermatologie',
  'Pédiatrie',
  'Gynécologie-Obstétrique',
  'Psychiatrie',
  'Chirurgie générale',
  'ORL',
  'Ophtalmologie',
  'Médecine interne',
  'Infectiologie',
  'Urologie',
];

interface ExamTypePreset {
  label: string;
  description: string;
  icon: React.ReactNode;
  questionCountRange: [number, number];
  timerRange: [number, number];
  defaultQuestionCount: number;
  defaultTimer: number;
}

const EXAM_TYPE_PRESETS: Record<ExamType, ExamTypePreset> = {
  edn_blanc: {
    label: 'EDN Blanc complet',
    description: '120 dossiers — simulation complète des conditions réelles',
    icon: <Target className="h-5 w-5" />,
    questionCountRange: [120, 120],
    timerRange: [180, 180],
    defaultQuestionCount: 120,
    defaultTimer: 180,
  },
  session_rapide: {
    label: 'Session rapide',
    description: 'Entraînement court pour réviser efficacement',
    icon: <Zap className="h-5 w-5" />,
    questionCountRange: [10, 20],
    timerRange: [15, 30],
    defaultQuestionCount: 15,
    defaultTimer: 20,
  },
  par_specialite: {
    label: 'Par spécialité',
    description: 'Focus sur une ou plusieurs spécialités médicales',
    icon: <BookOpen className="h-5 w-5" />,
    questionCountRange: [20, 40],
    timerRange: [30, 60],
    defaultQuestionCount: 30,
    defaultTimer: 45,
  },
  personnalise: {
    label: 'Personnalisé',
    description: 'Configurez chaque paramètre selon vos besoins',
    icon: <Settings2 className="h-5 w-5" />,
    questionCountRange: [5, 200],
    timerRange: [5, 300],
    defaultQuestionCount: 30,
    defaultTimer: 45,
  },
};

const QUESTION_TYPE_INFO: Record<
  QuestionType,
  { label: string; description: string }
> = {
  QCM: {
    label: 'QCM',
    description: 'Questions à Choix Multiples — plusieurs réponses correctes',
  },
  QRU: {
    label: 'QRU',
    description: 'Question à Réponse Unique — une seule réponse correcte',
  },
  QROC: {
    label: 'QROC',
    description: 'Question à Réponse Ouverte Courte — réponse libre courte',
  },
  Mixte: {
    label: 'Mixte',
    description: 'Tous les types de questions combinés',
  },
};

const DIFFICULTY_INFO: Record<
  Difficulty,
  { label: string; color: string; description: string }
> = {
  Facile: {
    label: 'Facile',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    description: 'Questions fondamentales',
  },
  Moyen: {
    label: 'Moyen',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    description: 'Niveau attendu à l\'EDN',
  },
  Difficile: {
    label: 'Difficile',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    description: 'Questions discriminantes',
  },
  Progressif: {
    label: 'Progressif',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    description: 'Difficulté croissante',
  },
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const cardHoverVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ExamConfig: React.FC<ExamConfigProps> = ({ onStart }) => {
  // --- State ---
  const [examType, setExamType] = useState<ExamType>('session_rapide');
  const [questionType, setQuestionType] = useState<QuestionType>('QCM');
  const [difficulty, setDifficulty] = useState<Difficulty>('Moyen');
  const [questionCount, setQuestionCount] = useState<number>(
    EXAM_TYPE_PRESETS.session_rapide.defaultQuestionCount
  );
  const [timerMinutes, setTimerMinutes] = useState<number>(
    EXAM_TYPE_PRESETS.session_rapide.defaultTimer
  );
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [ednRealConditions, setEdnRealConditions] = useState<boolean>(false);
  const [randomizeQuestions, setRandomizeQuestions] = useState<boolean>(true);

  // --- Derived state ---
  const preset = EXAM_TYPE_PRESETS[examType];
  const isFixed = examType === 'edn_blanc';
  const isCustom = examType === 'personnalise';
  const showSpecialtyFilter =
    examType === 'par_specialite' || examType === 'personnalise';

  // --- Handlers ---

  const handleExamTypeChange = (type: ExamType) => {
    setExamType(type);
    const p = EXAM_TYPE_PRESETS[type];
    setQuestionCount(p.defaultQuestionCount);
    setTimerMinutes(p.defaultTimer);

    if (type === 'edn_blanc') {
      setEdnRealConditions(true);
      setRandomizeQuestions(true);
    }
    if (type !== 'par_specialite' && type !== 'personnalise') {
      setSelectedSpecialties([]);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleStart = () => {
    const config: ExamConfiguration = {
      examType,
      questionType,
      difficulty,
      questionCount,
      timerMinutes,
      specialties: selectedSpecialties,
      ednRealConditions,
      randomizeQuestions,
      penaltyForWrongQRU: ednRealConditions,
      noPauseDuringExam: ednRealConditions,
      hideExplanationsDuringExam: ednRealConditions,
      strictTimer: ednRealConditions,
    };
    onStart(config);
  };

  // --- Validation ---
  const canStart =
    questionCount > 0 &&
    timerMinutes > 0 &&
    (showSpecialtyFilter ? selectedSpecialties.length > 0 : true);

  // --- Render ---

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      {/* ----------------------------------------------------------------- */}
      {/* Title                                                             */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Configuration de l&apos;examen
        </h1>
        <p className="mt-1 text-muted-foreground">
          Personnalisez votre session d&apos;entraînement pour les EDN
        </p>
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* 1. Exam type selector                                             */}
      {/* ----------------------------------------------------------------- */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Type d&apos;examen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.entries(EXAM_TYPE_PRESETS) as [ExamType, ExamTypePreset][]).map(
                ([key, value]) => (
                  <motion.button
                    key={key}
                    variants={cardHoverVariants}
                    initial="rest"
                    whileHover="hover"
                    type="button"
                    onClick={() => handleExamTypeChange(key)}
                    className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                      examType === key
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <span
                      className={`mt-0.5 shrink-0 ${
                        examType === key ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {value.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{value.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </motion.button>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ----------------------------------------------------------------- */}
      {/* 2. Question type                                                  */}
      {/* ----------------------------------------------------------------- */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.05 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              Type de questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.entries(QUESTION_TYPE_INFO) as [QuestionType, { label: string; description: string }][]).map(
                ([key, info]) => (
                  <motion.button
                    key={key}
                    variants={cardHoverVariants}
                    initial="rest"
                    whileHover="hover"
                    type="button"
                    onClick={() => setQuestionType(key as QuestionType)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      questionType === key
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <p className="font-semibold">{info.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {info.description}
                    </p>
                  </motion.button>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ----------------------------------------------------------------- */}
      {/* 3. Difficulty                                                     */}
      {/* ----------------------------------------------------------------- */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-primary" />
              Niveau de difficulté
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {(Object.entries(DIFFICULTY_INFO) as [Difficulty, typeof DIFFICULTY_INFO[Difficulty]][]).map(
                ([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDifficulty(key as Difficulty)}
                    className="focus:outline-none"
                  >
                    <Badge
                      variant={difficulty === key ? 'default' as const : 'outline' as const}
                      className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                        difficulty === key ? info.color : ''
                      }`}
                    >
                      <span className="flex flex-col items-center gap-0.5">
                        <span className="font-semibold">{info.label}</span>
                        <span className="text-[10px] font-normal opacity-80">
                          {info.description}
                        </span>
                      </span>
                    </Badge>
                  </button>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ----------------------------------------------------------------- */}
      {/* 4. Timer & question count                                         */}
      {/* ----------------------------------------------------------------- */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Durée et nombre de questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question count */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Nombre de questions
                </Label>
                <span className="text-sm font-semibold tabular-nums text-primary">
                  {questionCount}
                </span>
              </div>
              {isFixed ? (
                <p className="text-xs text-muted-foreground">
                  Fixé à {preset.defaultQuestionCount} questions pour l&apos;EDN
                  Blanc complet
                </p>
              ) : (
                <Slider
                  min={preset.questionCountRange[0]}
                  max={preset.questionCountRange[1]}
                  step={isCustom ? 1 : 5}
                  value={[questionCount]}
                  onValueChange={([val]) => setQuestionCount(val)}
                />
              )}
              {!isFixed && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{preset.questionCountRange[0]}</span>
                  <span>{preset.questionCountRange[1]}</span>
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Durée (minutes)</Label>
                <span className="text-sm font-semibold tabular-nums text-primary">
                  {timerMinutes} min
                </span>
              </div>
              {isFixed ? (
                <p className="text-xs text-muted-foreground">
                  Fixé à {preset.defaultTimer} minutes pour l&apos;EDN Blanc
                  complet
                </p>
              ) : (
                <Slider
                  min={preset.timerRange[0]}
                  max={preset.timerRange[1]}
                  step={5}
                  value={[timerMinutes]}
                  onValueChange={([val]) => setTimerMinutes(val)}
                />
              )}
              {!isFixed && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{preset.timerRange[0]} min</span>
                  <span>{preset.timerRange[1]} min</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ----------------------------------------------------------------- */}
      {/* 5. Specialty filter (conditional)                                  */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence>
        {showSpecialtyFilter && (
          <motion.section
            key="specialty-filter"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Spécialités
                  {selectedSpecialties.length > 0 && (
                    <Badge variant={'secondary' as const} className="ml-2">
                      {selectedSpecialties.length} sélectionnée
                      {selectedSpecialties.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((specialty) => {
                    const isSelected = selectedSpecialties.includes(specialty);
                    return (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => toggleSpecialty(specialty)}
                        className="focus:outline-none"
                      >
                        <Badge
                          variant={isSelected ? 'default' as const : 'outline' as const}
                          className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:border-primary/40'
                          }`}
                        >
                          {specialty}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
                {selectedSpecialties.length === 0 && (
                  <p className="mt-3 text-xs text-destructive">
                    Veuillez sélectionner au moins une spécialité
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------------------- */}
      {/* 6. EDN real conditions                                            */}
      {/* ----------------------------------------------------------------- */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings2 className="h-5 w-5 text-primary" />
              Options avancées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* EDN Real conditions toggle */}
            <div className="flex items-start gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="edn-real-conditions"
                    className="text-sm font-semibold"
                  >
                    Conditions réelles EDN
                  </Label>
                  <Switch
                    id="edn-real-conditions"
                    checked={ednRealConditions}
                    onCheckedChange={setEdnRealConditions}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Active le chronomètre strict, désactive la pause et les
                  explications pendant l&apos;examen, et applique les pénalités
                  pour mauvaises réponses QRU (comme aux vraies EDN).
                </p>
                <AnimatePresence>
                  {ednRealConditions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-300">
                        <li className="flex items-center gap-1.5">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Chronomètre strict — pas de temps supplémentaire
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Pause désactivée pendant toute la session
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Explications masquées jusqu&apos;à la fin
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Pénalité sur les mauvaises réponses QRU
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Randomize toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="randomize-questions"
                  className="text-sm font-medium"
                >
                  Ordre aléatoire des questions
                </Label>
                <p className="text-xs text-muted-foreground">
                  Mélange l&apos;ordre des questions à chaque session
                </p>
              </div>
              <Switch
                id="randomize-questions"
                checked={randomizeQuestions}
                onCheckedChange={setRandomizeQuestions}
              />
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ----------------------------------------------------------------- */}
      {/* 7. Summary & start                                                */}
      {/* ----------------------------------------------------------------- */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.25 }}
      >
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Récapitulatif
            </h3>
            <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <span className="text-muted-foreground">Mode : </span>
                <span className="font-medium">{preset.label}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Questions : </span>
                <span className="font-medium">{questionCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Durée : </span>
                <span className="font-medium">{timerMinutes} min</span>
              </div>
              <div>
                <span className="text-muted-foreground">Type : </span>
                <span className="font-medium">
                  {QUESTION_TYPE_INFO[questionType].label}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Difficulté : </span>
                <span className="font-medium">{difficulty}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Conditions EDN : </span>
                <span className="font-medium">
                  {ednRealConditions ? 'Oui' : 'Non'}
                </span>
              </div>
              {selectedSpecialties.length > 0 && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-muted-foreground">Spécialités : </span>
                  <span className="font-medium">
                    {selectedSpecialties.join(', ')}
                  </span>
                </div>
              )}
            </div>

            <Button
              size="lg"
              className="w-full text-base font-semibold"
              disabled={!canStart}
              onClick={handleStart}
            >
              <Zap className="mr-2 h-5 w-5" />
              Lancer l&apos;examen
            </Button>

            {!canStart && (
              <p className="mt-2 text-center text-xs text-destructive">
                Veuillez compléter la configuration avant de démarrer
              </p>
            )}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
};

export default ExamConfig;
