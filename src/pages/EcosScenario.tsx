import { EcosHeader } from '@/components/ecos/EcosHeader';
import { EcosEvaluationGrid } from '@/components/ecos/EcosEvaluationGrid';
import { EcosRealTimeTimer } from '@/components/ecos/EcosRealTimeTimer';
import { PatientCard } from '@/components/ecos/PatientCard';
import { QuizSection } from '@/components/ecos/QuizSection';
import { StepContent } from '@/components/ecos/StepContent';
import { StepProgress } from '@/components/ecos/StepProgress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { quizQuestions as fallbackQuestions, scenarioData as fallbackScenario } from '@/data/ecosData';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useEcosTimer } from '@/hooks/useEcosTimer';
import { useGamification, POINTS_CONFIG } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Flame, HandIcon, Loader2, MessageCircle, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

interface EcosScenarioData {
  sd_id: number | string;
  intitule_sd: string;
  competences_associees: string | string[] | null;
  contenu_complet_html: string | null;
}

// Parse HTML content to extract structured steps
const parseHtmlToSteps = (html: string | null) => {
  if (!html) return null;
  
  const steps = [];
  
  // Extract "Je dis" section - questions from interrogatoire
  const questions = [];
  const questionMatches = html.matchAll(/<li[^>]*>([^<]+)<\/li>/gi);
  for (const match of questionMatches) {
    if (match[1] && match[1].includes('?')) {
      questions.push(match[1].trim());
    }
  }
  
  steps.push({
    title: 'Je dis',
    subtitle: 'Interrogatoire dirigé',
    icon: MessageCircle,
    questions: questions.length > 0 ? questions.slice(0, 5) : [
      'Depuis quand présentez-vous ces symptômes ?',
      'Comment décririez-vous la douleur ?',
      'Avez-vous des antécédents médicaux ?',
      'Prenez-vous des médicaments ?',
      'Y a-t-il des symptômes associés ?'
    ]
  });
  
  // Extract "Je fais" section - clinical exam actions
  const actions = [];
  const actionKeywords = ['examen', 'palpation', 'auscultation', 'inspection', 'constantes'];
  actionKeywords.forEach(keyword => {
    if (html.toLowerCase().includes(keyword)) {
      actions.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  
  steps.push({
    title: 'Je fais',
    subtitle: 'Examen clinique',
    icon: HandIcon,
    actions: actions.length > 0 ? actions : [
      'Prise des constantes vitales',
      'Inspection générale',
      'Auscultation',
      'Palpation',
      'Examens complémentaires ciblés'
    ]
  });
  
  // Extract "Je conclus" section
  steps.push({
    title: 'Je conclus',
    subtitle: 'Synthèse et prise en charge',
    icon: FileText,
    elements: [
      'Résumé de la situation clinique',
      'Hypothèses diagnostiques',
      'Examens complémentaires à demander',
      'Prise en charge immédiate proposée'
    ]
  });
  
  return steps;
};

// Generate quiz questions from competencies
const generateQuizFromCompetences = (competences: string | null, _title: string) => {
  if (!competences) return fallbackQuestions;
  
  const compList = competences.split(',').map(c => c.trim()).filter(Boolean);
  if (compList.length === 0) return fallbackQuestions;
  
  return compList.slice(0, 4).map((comp, idx) => ({
    question: `Quelle est la conduite à tenir prioritaire pour : ${comp} ?`,
    options: [
      'Évaluation clinique complète',
      'Examens complémentaires en urgence',
      'Traitement symptomatique immédiat',
      'Surveillance et réévaluation'
    ],
    correct: idx % 4 // Rotation pour éviter pattern prévisible
  }));
};

const EcosScenario = () => {
  const { scenarioId: slug } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<{[key: string]: string}>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: string}>({});
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbScenario, setDbScenario] = useState<EcosScenarioData | null>(null);
  const [timerPaused, setTimerPaused] = useState(true);
  
  const { timeLeft, formatTime } = useEcosTimer({ initialTime: 900 });
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats, addPoints, unlockBadge } = useGamification();

  // Fetch scenario from database
  useEffect(() => {
    const fetchScenario = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      
      try {
        // Try to find by sd_id first, then by slug pattern
        const sdId = slug.toUpperCase().startsWith('SD') ? slug.toUpperCase() : `SD${slug.padStart(3, '0')}`;
        
        const { data, error } = await supabase
          .from('ecos_situations_uness')
          .select('sd_id, intitule_sd, competences_associees, contenu_complet_html')
          .or(`sd_id.eq.${sdId},sd_id.ilike.%${slug}%`)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setDbScenario(data);
        }
      } catch (err) {
        console.error('Error fetching ECOS scenario:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchScenario();
  }, [slug]);

  // Helper to normalize competences to string
  const normalizeCompetences = (comp: string | string[] | null): string => {
    if (!comp) return '';
    if (Array.isArray(comp)) return comp.join(', ');
    return comp;
  };

  // Build scenario data from DB or fallback
  const scenarioData = useMemo(() => {
    if (!dbScenario) return fallbackScenario;
    
    const parsedSteps = parseHtmlToSteps(dbScenario.contenu_complet_html);
    const competencesStr = normalizeCompetences(dbScenario.competences_associees);
    
    return {
      id: String(dbScenario.sd_id),
      title: dbScenario.intitule_sd,
      specialty: 'Médecine Générale',
      duration: 15,
      pitch: `Situation clinique : ${dbScenario.intitule_sd}. Prenez en charge ce patient de manière structurée.`,
      patient: {
        name: 'Patient(e)',
        age: 45,
        sex: 'Non précisé',
        avatar: '🏥',
        background: competencesStr || 'Consultez le dossier médical'
      },
      steps: parsedSteps || fallbackScenario.steps
    };
  }, [dbScenario]);

  const quizQuestions = useMemo(() => {
    if (!dbScenario) return fallbackQuestions;
    const competencesStr = normalizeCompetences(dbScenario.competences_associees);
    return generateQuizFromCompetences(competencesStr, dbScenario.intitule_sd);
  }, [dbScenario]);

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
      
      if (user) {
        await logActivity({
          activity_type: 'ecos',
          count: 1,
          metadata: { scenarioId: scenarioData.id, step: currentStep + 1 }
        });
      }
    } else {
      setShowQuiz(true);
      
      if (user) {
        await addPoints(user.id, POINTS_CONFIG.clinicalCase, 'clinicalCase');
        await unlockBadge(user.id, 'clinical_master');
        loadStats(user.id);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement du scénario...</p>
        </div>
      </div>
    );
  }

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

          {/* Real-time Timer */}
          <div className="mb-8">
            <EcosRealTimeTimer 
              durationMinutes={7}
              autoStart={false}
              onTimeUp={() => setShowQuiz(true)}
            />
          </div>

          <PatientCard patient={scenarioData.patient} />
          
          <StepProgress 
            currentStep={currentStep}
            totalSteps={scenarioData.steps.length}
          />

          {!showQuiz && !showEvaluation ? (
            <StepContent
              step={scenarioData.steps[currentStep]}
              currentStep={currentStep}
              totalSteps={scenarioData.steps.length}
              responses={responses}
              onResponseChange={handleResponse}
              onNext={nextStep}
            />
          ) : showQuiz && !showEvaluation ? (
            <div className="space-y-6">
              <QuizSection
                questions={quizQuestions}
                answers={quizAnswers}
                onAnswerChange={handleQuizAnswer}
              />
              <div className="flex justify-center">
                <Button 
                  onClick={() => setShowEvaluation(true)}
                  size="lg"
                  className="gap-2"
                >
                  <FileText className="h-5 w-5" />
                  Accéder à la grille d'évaluation ECOS
                </Button>
              </div>
            </div>
          ) : (
            <EcosEvaluationGrid
              scenarioId={scenarioData.id}
              scenarioTitle={scenarioData.title}
              onComplete={(score, total, items) => {
                console.log('Evaluation complete:', { score, total, items });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EcosScenario;
