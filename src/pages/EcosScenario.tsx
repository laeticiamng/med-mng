
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { EcosHeader } from '@/components/ecos/EcosHeader';
import { PatientCard } from '@/components/ecos/PatientCard';
import { StepProgress } from '@/components/ecos/StepProgress';
import { StepContent } from '@/components/ecos/StepContent';
import { QuizSection } from '@/components/ecos/QuizSection';
import { useEcosTimer } from '@/hooks/useEcosTimer';
import { scenarioData, quizQuestions } from '@/data/ecosData';

const EcosScenario = () => {
  const { slug } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<{[key: string]: string}>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: string}>({});
  
  const { timeLeft, formatTime } = useEcosTimer(900);

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
  );
};

export default EcosScenario;
