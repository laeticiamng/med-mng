
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background effects unified */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.3),transparent_50%)]"></div>
      
      <div className="relative z-10">

      <div className="relative z-10">
        <EcosHeader 
          timeLeft={timeLeft}
          formatTime={formatTime}
          scenarioId={scenarioData.id}
          specialty={scenarioData.specialty}
        />

        <div className="container mx-auto px-4 py-8">
          {/* Scenario header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">{scenarioData.title}</h1>
            <p className="text-xl text-emerald-200 max-w-3xl mx-auto bg-black/20 rounded-lg p-4">
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
      </div>
      </div>
    </div>
  );
};

export default EcosScenario;
