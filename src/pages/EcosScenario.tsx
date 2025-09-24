
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EcosHeader } from '@/components/ecos/EcosHeader';
import { PatientCard } from '@/components/ecos/PatientCard';
import { StepProgress } from '@/components/ecos/StepProgress';
import { StepContent } from '@/components/ecos/StepContent';
import { QuizSection } from '@/components/ecos/QuizSection';
import { useEcosTimer } from '@/hooks/useEcosTimer';
import { scenarioData, quizQuestions } from '@/data/ecosData';
import { useEcosPdfExport, EcosPrintableScenario } from '@/features/export/hooks/useEcosPdfExport';
import { EcosPdfTemplate } from '@/features/export/components/EcosPdfTemplate';

const EcosScenario = () => {
  const { scenarioId: scenarioParam } = useParams<{ scenarioId: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<{[key: string]: string}>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: string}>({});

  const { timeLeft, formatTime } = useEcosTimer(900);

  const printableScenario = useMemo<EcosPrintableScenario>(() => ({
    id: scenarioData.id,
    itemSlug: scenarioData.itemSlug ?? scenarioParam ?? scenarioData.id,
    title: scenarioData.title,
    specialty: scenarioData.specialty,
    duration: scenarioData.duration,
    pitch: scenarioData.pitch,
    patient: scenarioData.patient,
    steps: scenarioData.steps,
  }), [scenarioParam]);

  const computedSlug = useMemo(() => {
    const rawSlug = printableScenario.itemSlug ?? scenarioParam ?? scenarioData.id;

    if (!rawSlug) {
      return 'ecos-item';
    }

    const normalized = rawSlug
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return normalized || 'ecos-item';
  }, [printableScenario.itemSlug, scenarioParam]);

  const itemPath = `/edn-production/${computedSlug}`;
  const itemUrl = typeof window !== 'undefined'
    ? new URL(itemPath, window.location.origin).toString()
    : itemPath;

  const { exportPdf, printState, isGenerating } = useEcosPdfExport({
    scenario: printableScenario,
    itemUrl,
  });

  const handleResponse = (field: string, value: string) => {
    setResponses(prev => ({...prev, [field]: value}));
  };

  const handleQuizAnswer = (questionIndex: number, answer: string) => {
    setQuizAnswers(prev => ({...prev, [questionIndex]: answer}));
  };

  const nextStep = () => {
    if (currentStep < scenarioData.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowQuiz(true);
    }
  };

  return (
    <>
      <ConsistentBackground variant="primary">
      <PageHeader
        title="Simulation ECOS"
        subtitle="Examen Clinique Objectif Structuré"
        backTo="/ecos"
      />
      
      <div className="container mx-auto px-4 py-8">
        <EcosHeader
          timeLeft={timeLeft}
          formatTime={formatTime}
          scenarioId={scenarioData.id}
          specialty={scenarioData.specialty}
          onExportPdf={exportPdf}
          isExporting={isGenerating}
        />

        {/* Scenario header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{scenarioData.title}</h1>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            {scenarioData.pitch}
          </p>
        </div>

        <PatientCard patient={scenarioData.patient} />
        
        <StepProgress 
          currentStep={currentStep}
          totalSteps={scenarioData.steps.length}
        />

        {!showQuiz ? (
          <StepContent
            step={scenarioData.steps[currentStep]}
            currentStep={currentStep}
            totalSteps={scenarioData.steps.length}
            responses={responses}
            onResponseChange={handleResponse}
            onNext={nextStep}
          />
        ) : (
          <QuizSection
            questions={quizQuestions}
            answers={quizAnswers}
            onAnswerChange={handleQuizAnswer}
          />
        )}
      </div>
      </ConsistentBackground>
      <EcosPdfTemplate
        scenario={printableScenario}
        printState={printState}
        itemUrl={itemUrl}
      />
    </>
  );
};

export default EcosScenario;
