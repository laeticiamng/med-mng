import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  FileImage,
  Brain,
  FlaskConical,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  ArrowRight,
  ChevronLeft,
  Maximize2,
  X,
  Target,
} from 'lucide-react';
import { MedicalDisclaimer } from '@/components/legal';

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type MedicalImageType = 'radio' | 'ecg' | 'biologie' | 'scanner' | 'irm';

export type ClinicalStepType =
  | 'presentation'
  | 'examen_clinique'
  | 'hypotheses'
  | 'examens_complementaires'
  | 'diagnostic'
  | 'traitement';

export interface StepOption {
  id: string;
  label: string;
}

export interface ClinicalStep {
  id: string;
  type: ClinicalStepType;
  title: string;
  description: string;
  imageUrl?: string;
  imageType?: MedicalImageType;
  options: StepOption[];
  correctOptionId: string;
  explanation: string;
  feedback: {
    correct: string;
    incorrect: string;
  };
}

export interface PatientInfo {
  name: string;
  age: number;
  sex: 'M' | 'F';
  antecedents: string[];
  motifConsultation: string;
}

export interface ClinicalCaseData {
  id: string;
  title: string;
  specialty: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  patient: PatientInfo;
  learningObjectives: string[];
  steps: {
    presentation: ClinicalStep;
    examen_clinique: ClinicalStep;
    hypotheses: ClinicalStep;
    examens_complementaires: ClinicalStep;
    diagnostic: ClinicalStep;
    traitement: ClinicalStep;
  };
}

export interface StepScore {
  stepType: ClinicalStepType;
  isCorrect: boolean;
  timeSeconds: number;
  pointsEarned: number;
  pointsMax: number;
}

export interface CaseScore {
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  starRating: number;
  timeTotal: number;
  breakdown: StepScore[];
  objectivesAchieved: string[];
  recommendations: string[];
}

export interface ClinicalCaseEngineProps {
  caseData: ClinicalCaseData;
  onComplete?: (score: CaseScore) => void;
  onExit?: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEP_ORDER: ClinicalStepType[] = [
  'presentation',
  'examen_clinique',
  'hypotheses',
  'examens_complementaires',
  'diagnostic',
  'traitement',
];

const STEP_META: Record<
  ClinicalStepType,
  { label: string; icon: React.ElementType; color: string }
> = {
  presentation: {
    label: 'Presentation du patient',
    icon: Stethoscope,
    color: 'text-blue-500',
  },
  examen_clinique: {
    label: 'Examen clinique',
    icon: Stethoscope,
    color: 'text-emerald-500',
  },
  hypotheses: {
    label: 'Hypotheses diagnostiques',
    icon: Brain,
    color: 'text-violet-500',
  },
  examens_complementaires: {
    label: 'Examens complementaires',
    icon: FlaskConical,
    color: 'text-amber-500',
  },
  diagnostic: {
    label: 'Diagnostic final',
    icon: CheckCircle,
    color: 'text-rose-500',
  },
  traitement: {
    label: 'Plan de traitement',
    icon: FileImage,
    color: 'text-teal-500',
  },
};

const POINTS_PER_STEP = 100;
const TIME_BONUS_THRESHOLD_SECONDS = 30;
const TIME_BONUS_POINTS = 20;

const IMAGE_TYPE_LABELS: Record<MedicalImageType, string> = {
  radio: 'Radiographie',
  ecg: 'Electrocardiogramme',
  biologie: 'Bilan biologique',
  scanner: 'Scanner',
  irm: 'IRM',
};

const DIFFICULTY_VARIANT = {
  facile: 'default',
  moyen: 'warning',
  difficile: 'destructive',
} as const;

// ---------------------------------------------------------------------------
// Helper: compute star rating (1-5) from percentage
// ---------------------------------------------------------------------------

function computeStarRating(percentage: number): number {
  if (percentage >= 95) return 5;
  if (percentage >= 80) return 4;
  if (percentage >= 60) return 3;
  if (percentage >= 40) return 2;
  return 1;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Stepper / timeline showing progress through the 6 clinical steps. */
const CaseTimeline: React.FC<{
  currentIndex: number;
  completedSteps: Set<number>;
}> = ({ currentIndex, completedSteps }) => (
  <div className="flex items-center justify-between w-full mb-8 overflow-x-auto py-2 gap-1">
    {STEP_ORDER.map((stepType, idx) => {
      const meta = STEP_META[stepType];
      const Icon = meta.icon;
      const isActive = idx === currentIndex;
      const isDone = completedSteps.has(idx);

      return (
        <React.Fragment key={stepType}>
          {idx > 0 && (
            <div
              className={`flex-1 h-0.5 min-w-[16px] ${
                isDone || isActive ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
          <div className="flex flex-col items-center gap-1 min-w-[64px]">
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
                isActive
                  ? 'border-primary bg-primary/10'
                  : isDone
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted bg-muted/30'
              }`}
            >
              {isDone ? (
                <CheckCircle className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Icon
                  className={`h-4 w-4 ${isActive ? meta.color : 'text-muted-foreground'}`}
                />
              )}
            </div>
            <span
              className={`text-[10px] text-center leading-tight ${
                isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'
              }`}
            >
              {meta.label}
            </span>
          </div>
        </React.Fragment>
      );
    })}
  </div>
);

/** Lightbox-style medical image viewer. */
const MedicalImageViewer: React.FC<{
  imageUrl: string;
  imageType: MedicalImageType;
}> = ({ imageUrl, imageType }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <div className="relative group rounded-lg overflow-hidden border border-border bg-black/5 mb-4">
        <Badge variant="secondary" className="absolute top-2 left-2 z-10">
          {IMAGE_TYPE_LABELS[imageType]}
        </Badge>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Agrandir l'image : ${IMAGE_TYPE_LABELS[imageType]}`}
        >
          <img
            src={imageUrl}
            alt={`Image medicale - ${IMAGE_TYPE_LABELS[imageType]}`}
            className="w-full max-h-64 object-contain"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
      </div>

      {/* Lightbox overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          role="dialog"
          aria-label={`Visualisation : ${IMAGE_TYPE_LABELS[imageType]}`}
        >
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Fermer"
          >
            <X className="h-8 w-8" />
          </button>
          <Badge variant="secondary" className="absolute top-4 left-4">
            {IMAGE_TYPE_LABELS[imageType]}
          </Badge>
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            src={imageUrl}
            alt={`Image medicale - ${IMAGE_TYPE_LABELS[imageType]}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
};

/** Patient info card shown at the top of the engine. */
const PatientBanner: React.FC<{ patient: PatientInfo }> = ({ patient }) => (
  <Card className="mb-4 border-primary/20 bg-primary/5">
    <CardContent className="p-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
          <Stethoscope className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{patient.name}</p>
          <p className="text-sm text-muted-foreground">
            {patient.age} ans &bull; {patient.sex === 'M' ? 'Homme' : 'Femme'}
          </p>
        </div>
      </div>
      <div className="flex-1 min-w-[200px]">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Motif :</span>{' '}
          {patient.motifConsultation}
        </p>
        {patient.antecedents.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-foreground">ATCD :</span>{' '}
            {patient.antecedents.join(', ')}
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

/** Renders the answer options for a clinical step. */
const OptionsList: React.FC<{
  options: StepOption[];
  selectedId: string | null;
  correctId: string;
  isAnswered: boolean;
  onSelect: (id: string) => void;
}> = ({ options, selectedId, correctId, isAnswered, onSelect }) => (
  <div className="space-y-3 mt-4">
    {options.map((option) => {
      const isSelected = selectedId === option.id;
      const isCorrect = option.id === correctId;

      let borderClass = 'border-border hover:border-primary/50';
      if (isAnswered && isCorrect) {
        borderClass = 'border-emerald-500 bg-emerald-500/10';
      } else if (isAnswered && isSelected && !isCorrect) {
        borderClass = 'border-destructive bg-destructive/10';
      } else if (isSelected && !isAnswered) {
        borderClass = 'border-primary bg-primary/5';
      }

      return (
        <motion.button
          key={option.id}
          type="button"
          disabled={isAnswered}
          onClick={() => onSelect(option.id)}
          className={`w-full text-left p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${borderClass} ${
            isAnswered ? 'cursor-default' : 'cursor-pointer'
          }`}
          whileTap={!isAnswered ? { scale: 0.98 } : undefined}
        >
          {isAnswered && isCorrect && (
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          )}
          {isAnswered && isSelected && !isCorrect && (
            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          )}
          {!isAnswered && (
            <div
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
              }`}
            >
              {isSelected && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                </div>
              )}
            </div>
          )}
          <span className="text-sm text-foreground">{option.label}</span>
        </motion.button>
      );
    })}
  </div>
);

/** Star display used in the summary. */
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-6 w-6 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'
        }`}
      />
    ))}
  </div>
);

/** Formats seconds to mm:ss. */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/** The case completion summary screen. */
const CaseSummary: React.FC<{
  caseData: ClinicalCaseData;
  score: CaseScore;
  onExit?: () => void;
}> = ({ caseData, score, onExit }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="space-y-6"
  >
    {/* Header */}
    <Card className="border-primary/20">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Cas clinique termine</CardTitle>
        <p className="text-muted-foreground">{caseData.title}</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pt-2">
        <StarRating rating={score.starRating} />
        <div className="text-4xl font-bold text-foreground">
          {score.totalPoints}{' '}
          <span className="text-lg font-normal text-muted-foreground">
            / {score.maxPoints} pts
          </span>
        </div>
        <Progress value={score.percentage} className="h-3 w-full max-w-md" />
        <Badge
          variant={
            (score.percentage >= 80
              ? 'default'
              : score.percentage >= 50
                ? 'warning'
                : 'destructive') as 'default' | 'warning' | 'destructive'
          }
        >
          {score.percentage >= 80
            ? 'Excellent'
            : score.percentage >= 50
              ? 'Peut mieux faire'
              : 'A retravailler'}
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Temps total : {formatTime(score.timeTotal)}</span>
        </div>
      </CardContent>
    </Card>

    {/* Breakdown per step */}
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Detail par etape</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {score.breakdown.map((step) => {
          const meta = STEP_META[step.stepType];
          const Icon = meta.icon;
          return (
            <div
              key={step.stepType}
              className="flex items-center gap-3 p-3 rounded-lg border border-border"
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${meta.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {meta.label}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Progress
                    value={(step.pointsEarned / step.pointsMax) * 100}
                    className="h-1.5 flex-1"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {step.pointsEarned}/{step.pointsMax} pts
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(step.timeSeconds)}
              </div>
              {step.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>

    {/* Learning objectives */}
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Objectifs pedagogiques</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {caseData.learningObjectives.map((obj, i) => {
            const achieved = score.objectivesAchieved.includes(obj);
            return (
              <li key={i} className="flex items-start gap-2 text-sm">
                {achieved ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}
                <span
                  className={
                    achieved ? 'text-foreground' : 'text-muted-foreground line-through'
                  }
                >
                  {obj}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>

    {/* ECOS Competency Grid */}
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Grille de competences ECOS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(() => {
            const competences = [
              { label: 'Raisonnement clinique', steps: ['hypotheses', 'diagnostic'] as ClinicalStepType[], poids: 30 },
              { label: 'Examen clinique', steps: ['examen_clinique'] as ClinicalStepType[], poids: 20 },
              { label: 'Examens complementaires', steps: ['examens_complementaires'] as ClinicalStepType[], poids: 15 },
              { label: 'Prise en charge', steps: ['traitement'] as ClinicalStepType[], poids: 25 },
              { label: 'Communication', steps: ['presentation'] as ClinicalStepType[], poids: 10 },
            ];
            return competences.map((comp) => {
              const relevant = score.breakdown.filter(b => comp.steps.includes(b.stepType));
              const earned = relevant.reduce((a, b) => a + b.pointsEarned, 0);
              const max = relevant.reduce((a, b) => a + b.pointsMax, 0);
              const pct = max > 0 ? Math.round((earned / max) * 100) : 0;
              return (
                <div key={comp.label} className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="min-w-[50px] justify-center text-xs">{comp.poids}%</Badge>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-foreground">{comp.label}</span>
                      <span className={`text-xs font-semibold ${pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-warning' : 'text-destructive'}`}>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </div>
              );
            });
          })()}
        </div>
        <p className="text-xs text-muted-foreground mt-4">Pondération basée sur les grilles UNESS officielles.</p>
      </CardContent>
    </Card>

    {/* Recommendations */}
    {score.recommendations.length > 0 && (
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-warning" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {score.recommendations.map((rec, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-warning" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    )}

    {/* Actions */}
    <div className="flex justify-center">
      {onExit && (
        <Button onClick={onExit} size="lg">
          Retour aux cas cliniques
        </Button>
      )}
    </div>

    <MedicalDisclaimer variant="minimal" />
  </motion.div>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const ClinicalCaseEngine: React.FC<ClinicalCaseEngineProps> = ({
  caseData,
  onComplete,
  onExit,
}) => {
  // --- State ---------------------------------------------------------------
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepScores, setStepScores] = useState<StepScore[]>([]);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  const [showSummary, setShowSummary] = useState(false);
  const [finalScore, setFinalScore] = useState<CaseScore | null>(null);

  // --- Derived -------------------------------------------------------------
  const stepsArray = STEP_ORDER.map((type) => caseData.steps[type]);
  const currentStep = stepsArray[currentStepIndex];
  const progressPercent = ((currentStepIndex + 1) / STEP_ORDER.length) * 100;

  // --- Callbacks -----------------------------------------------------------

  const handleSelectOption = useCallback((optionId: string) => {
    setSelectedOptionId(optionId);
  }, []);

  const handleValidate = useCallback(() => {
    if (!selectedOptionId || isAnswered) return;

    const elapsedSeconds = Math.round((Date.now() - stepStartTime) / 1000);
    const correct = selectedOptionId === currentStep.correctOptionId;
    const basePoints = correct ? POINTS_PER_STEP : 0;
    const timeBonus =
      correct && elapsedSeconds <= TIME_BONUS_THRESHOLD_SECONDS
        ? TIME_BONUS_POINTS
        : 0;

    const score: StepScore = {
      stepType: currentStep.type,
      isCorrect: correct,
      timeSeconds: elapsedSeconds,
      pointsEarned: basePoints + timeBonus,
      pointsMax: POINTS_PER_STEP + TIME_BONUS_POINTS,
    };

    setStepScores((prev) => [...prev, score]);
    setIsAnswered(true);
    setCompletedSteps((prev) => new Set(prev).add(currentStepIndex));
  }, [selectedOptionId, isAnswered, stepStartTime, currentStep, currentStepIndex]);

  const buildFinalScore = useCallback(
    (scores: StepScore[]): CaseScore => {
      const totalPoints = scores.reduce((sum, s) => sum + s.pointsEarned, 0);
      const maxPoints = scores.reduce((sum, s) => sum + s.pointsMax, 0);
      const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
      const timeTotal = scores.reduce((sum, s) => sum + s.timeSeconds, 0);

      const correctCount = scores.filter((s) => s.isCorrect).length;

      // Determine achieved objectives proportionally
      const objectivesAchieved = caseData.learningObjectives.filter(
        (_, i) =>
          i < Math.ceil((correctCount / STEP_ORDER.length) * caseData.learningObjectives.length)
      );

      // Build recommendations based on performance
      const recommendations: string[] = [];
      scores.forEach((s) => {
        if (!s.isCorrect) {
          const meta = STEP_META[s.stepType];
          recommendations.push(
            `Revoir les notions liees a l'etape "${meta.label}".`
          );
        }
        if (s.timeSeconds > 120) {
          const meta = STEP_META[s.stepType];
          recommendations.push(
            `Ameliorer votre rapidite pour l'etape "${meta.label}" (${formatTime(s.timeSeconds)}).`
          );
        }
      });
      if (percentage < 60) {
        recommendations.push(
          'Il est recommande de refaire ce cas clinique apres revision des notions fondamentales.'
        );
      }

      return {
        totalPoints,
        maxPoints,
        percentage,
        starRating: computeStarRating(percentage),
        timeTotal,
        breakdown: scores,
        objectivesAchieved,
        recommendations,
      };
    },
    [caseData.learningObjectives]
  );

  const handleNext = useCallback(() => {
    if (currentStepIndex < STEP_ORDER.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setStepStartTime(Date.now());
    } else {
      // Case complete
      const allScores = [...stepScores];
      const score = buildFinalScore(allScores);
      setFinalScore(score);
      setShowSummary(true);
      onComplete?.(score);
    }
  }, [currentStepIndex, stepScores, buildFinalScore, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      // Restore answered state for previously completed steps
      const prevIdx = currentStepIndex - 1;
      if (completedSteps.has(prevIdx)) {
        setIsAnswered(true);
        const prevScore = stepScores.find(
          (s) => s.stepType === STEP_ORDER[prevIdx]
        );
        if (prevScore?.isCorrect) {
          setSelectedOptionId(stepsArray[prevIdx].correctOptionId);
        }
      } else {
        setSelectedOptionId(null);
        setIsAnswered(false);
      }
    }
  }, [currentStepIndex, completedSteps, stepScores, stepsArray]);

  // --- Summary view --------------------------------------------------------
  if (showSummary && finalScore) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <CaseSummary
          caseData={caseData}
          score={finalScore}
          onExit={onExit}
        />
      </div>
    );
  }

  // --- Main step view ------------------------------------------------------
  const meta = STEP_META[currentStep.type];
  const StepIcon = meta.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{caseData.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{caseData.specialty}</Badge>
            <Badge variant={DIFFICULTY_VARIANT[caseData.difficulty]}>
              {caseData.difficulty.charAt(0).toUpperCase() + caseData.difficulty.slice(1)}
            </Badge>
          </div>
        </div>
        {onExit && (
          <Button variant="ghost" size="sm" onClick={onExit}>
            <X className="h-4 w-4 mr-1" />
            Quitter
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <Progress value={progressPercent} className="h-2 flex-1" />
        <span className="text-sm font-medium text-muted-foreground">
          {currentStepIndex + 1}/{STEP_ORDER.length}
        </span>
      </div>

      {/* Timeline stepper */}
      <CaseTimeline
        currentIndex={currentStepIndex}
        completedSteps={completedSteps}
      />

      {/* Patient banner */}
      <PatientBanner patient={caseData.patient} />

      {/* Current step card */}
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full bg-muted/50`}
              >
                <StepIcon className={`h-5 w-5 ${meta.color}`} />
              </div>
              <div>
                <CardTitle className="text-lg">{currentStep.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Etape {currentStepIndex + 1} sur {STEP_ORDER.length}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step description */}
            <p className="text-sm text-foreground leading-relaxed">
              {currentStep.description}
            </p>

            {/* Medical image (if any) */}
            {currentStep.imageUrl && currentStep.imageType && (
              <MedicalImageViewer
                imageUrl={currentStep.imageUrl}
                imageType={currentStep.imageType}
              />
            )}

            {/* Answer options */}
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Quelle est votre decision ?
              </p>
              <OptionsList
                options={currentStep.options}
                selectedId={selectedOptionId}
                correctId={currentStep.correctOptionId}
                isAnswered={isAnswered}
                onSelect={handleSelectOption}
              />
            </div>

            {/* Feedback after answering */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-lg border ${
                  selectedOptionId === currentStep.correctOptionId
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-destructive/30 bg-destructive/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  {selectedOptionId === currentStep.correctOptionId ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-sm text-foreground mb-1">
                      {selectedOptionId === currentStep.correctOptionId
                        ? currentStep.feedback.correct
                        : currentStep.feedback.incorrect}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentStep.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Precedent
              </Button>

              {!isAnswered ? (
                <Button
                  onClick={handleValidate}
                  disabled={!selectedOptionId}
                  size="sm"
                >
                  Valider ma reponse
                </Button>
              ) : (
                <Button onClick={handleNext} size="sm">
                  {currentStepIndex < STEP_ORDER.length - 1 ? (
                    <>
                      Etape suivante
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Voir le bilan
                      <Star className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Medical disclaimer */}
      <MedicalDisclaimer variant="minimal" />
    </div>
  );
};

export default ClinicalCaseEngine;
