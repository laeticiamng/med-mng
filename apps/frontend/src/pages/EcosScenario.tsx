
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFetchEcosSituationBySdId, useFetchEvaluationCriteria, useCreateUserSession } from '@/hooks/useEcos';
import { EcosHeader } from '@/components/ecos/EcosHeader';
import { PatientCard } from '@/components/ecos/PatientCard';
import { StepProgress } from '@/components/ecos/StepProgress';
import { StepContent } from '@/components/ecos/StepContent';
import { QuizSection } from '@/components/ecos/QuizSection';
import { useEcosTimer } from '@/hooks/useEcosTimer';
import { scenarioData, quizQuestions } from '@/data/ecosData';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const EcosScenario = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<{[key: string]: string}>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: string}>({});
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Extract SD ID from slug (e.g., "sd-003" -> 3)
  const sdId = slug ? parseInt(slug.replace(/\D/g, '')) : 0;

  // Fetch real ECOS situation from database
  const { data: situation, isLoading: situationLoading } = useFetchEcosSituationBySdId(sdId);
  const { data: criteria = [], isLoading: criteriaLoading } = useFetchEvaluationCriteria(situation?.id || '');
  const createSessionMutation = useCreateUserSession();

  const { timeLeft, formatTime } = useEcosTimer(900);

  // Create session on component mount
  useEffect(() => {
    if (user && situation && criteria.length > 0 && !sessionId) {
      const maxScore = criteria.reduce((sum, c) => sum + c.max_points, 0);
      createSessionMutation.mutate({
        userId: user.id,
        situationId: situation.id,
        maxPossibleScore: maxScore,
      }, {
        onSuccess: (newSessionId) => {
          if (newSessionId) {
            setSessionId(newSessionId);
          }
        },
      });
    }
  }, [user, situation, criteria, sessionId]);

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

  // Loading state
  if (situationLoading || criteriaLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-8">
        <div className="container mx-auto space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Error state - scenario not found
  if (!situation && !situationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-8">
        <div className="container mx-auto">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
              <h2 className="text-2xl font-bold mb-2">Scénario introuvable</h2>
              <p className="text-muted-foreground mb-4">
                Le scénario ECOS demandé (SD-{sdId}) n'existe pas dans la base de données.
              </p>
              <p className="text-sm text-muted-foreground">
                Note: Les scénarios ECOS doivent être importés depuis UNESS.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Use real data if available, fallback to mock data for steps structure
  const displayData = situation ? {
    id: `SD${situation.sd_id.toString().padStart(3, '0')}`,
    title: situation.intitule_sd,
    specialty: situation.competences_associees?.[0] || scenarioData.specialty,
    duration: 15,
    pitch: situation.contenu_complet_html
      ? situation.contenu_complet_html.substring(0, 200).replace(/<[^>]*>/g, '') + '...'
      : scenarioData.pitch,
    patient: scenarioData.patient, // Keep mock patient data for now
    steps: scenarioData.steps, // Keep mock steps structure (TODO: parse from HTML or store structured data)
  } : scenarioData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <EcosHeader
          timeLeft={timeLeft}
          formatTime={formatTime}
          scenarioId={displayData.id}
          specialty={displayData.specialty}
        />

        <div className="container mx-auto px-4 py-8">
          {/* Scenario header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">{displayData.title}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border">
              {displayData.pitch}
            </p>
            {situation && (
              <p className="text-xs text-muted-foreground mt-2">
                Session ID: {sessionId || 'Création en cours...'}
                {criteria.length > 0 && ` | ${criteria.length} critères d'évaluation`}
              </p>
            )}
          </div>

          <PatientCard patient={displayData.patient} />

          <StepProgress
            currentStep={currentStep}
            totalSteps={displayData.steps.length}
          />

          {!showQuiz ? (
            <StepContent
              step={displayData.steps[currentStep]}
              currentStep={currentStep}
              totalSteps={displayData.steps.length}
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
  );
};

export default EcosScenario;
