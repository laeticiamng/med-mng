import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { EcosHeader } from '@/components/ecos/EcosHeader';
import { PatientCard } from '@/components/ecos/PatientCard';
import { StepProgress } from '@/components/ecos/StepProgress';
import { StepContent } from '@/components/ecos/StepContent';
import { QuizSection } from '@/components/ecos/QuizSection';
import { useEcosTimer } from '@/hooks/useEcosTimer';
import { scenarioData, quizQuestions } from '@/data/ecosData';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Flame, Star } from 'lucide-react';

const EcosScenario = () => {
  const { slug } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<{[key: string]: string}>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: string}>({});
  const [user, setUser] = useState<any>(null);
  
  const { timeLeft, formatTime } = useEcosTimer(900);
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats, addPoints, unlockBadge } = useGamification();

  // Load user and gamification stats
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
    };
    checkUser();
  }, [loadStats]);

  const handleResponse = (field: string, value: string) => {
    setResponses(prev => ({...prev, [field]: value}));
  };

  const handleQuizAnswer = async (questionIndex: number, answer: string) => {
    setQuizAnswers(prev => ({...prev, [questionIndex]: answer}));
    
    // Track quiz answer
    if (user) {
      await logActivity({
        activity_type: 'ecos',
        count: 1,
        metadata: { scenarioId: scenarioData.id, questionIndex, answer }
      });
    }
  };

  const nextStep = async () => {
    if (currentStep < scenarioData.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Track step progression
      if (user) {
        await logActivity({
          activity_type: 'ecos',
          count: 1,
          metadata: { scenarioId: scenarioData.id, step: currentStep + 1 }
        });
      }
    } else {
      setShowQuiz(true);
      
      // Award points for completing scenario steps
      if (user) {
        await addPoints(user.id, 'clinicalCase');
        await unlockBadge(user.id, 'clinical_master');
        loadStats(user.id);
      }
    }
  };

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
          scenarioId={scenarioData.id}
          specialty={scenarioData.specialty}
        />

        <div className="container mx-auto px-4 py-8">
          {/* Gamification Stats Banner */}
          {user && gamificationStats && (
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-4 px-6 py-3 bg-card/80 backdrop-blur-sm rounded-full border border-border">
                <div className="flex items-center gap-2 text-warning">
                  <Flame className="h-5 w-5" />
                  <span className="font-bold">{gamificationStats.currentStreak}</span>
                  <span className="text-sm text-muted-foreground">jours</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2 text-primary">
                  <Star className="h-5 w-5" />
                  <span className="font-bold">Niv. {gamificationStats.level}</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <Badge variant="secondary">{gamificationStats.totalPoints} XP</Badge>
              </div>
            </div>
          )}
          
          {/* Scenario header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">{scenarioData.title}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border">
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
  );
};

export default EcosScenario;
