import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTE_PATHS } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import { useAIClinicalCases } from '@/hooks/useAIClinicalCases';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useClinicalCases } from '@/hooks/useClinicalCases';
import { useGamification, POINTS_CONFIG } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { MedicalDisclaimer } from '@/components/legal';
import {
    ArrowRight, Award,
    Baby,
    BarChart3,
    Bone,
    Brain,
    CheckCircle,
    ChevronLeft,
    Clock,
    Heart,
    Loader2,
    Play,
    Sparkles,
    Stethoscope,
    TrendingUp,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

const SPECIALTY_ICONS: Record<string, React.ReactNode> = {
  'Cardiologie': <Heart className="h-5 w-5" />,
  'Pédiatrie': <Baby className="h-5 w-5" />,
  'Orthopédie': <Bone className="h-5 w-5" />,
  'Neurologie': <Brain className="h-5 w-5" />,
  'Pneumologie': <Stethoscope className="h-5 w-5" />,
  'Gastro-entérologie': <Stethoscope className="h-5 w-5" />,
  'Néphrologie': <Stethoscope className="h-5 w-5" />,
  'Endocrinologie': <Stethoscope className="h-5 w-5" />,
  'Rhumatologie': <Bone className="h-5 w-5" />,
  'Dermatologie': <Stethoscope className="h-5 w-5" />,
  'Gynécologie': <Stethoscope className="h-5 w-5" />,
  'Psychiatrie': <Brain className="h-5 w-5" />,
  'Urgences': <Stethoscope className="h-5 w-5" />,
  'Médecine générale': <Stethoscope className="h-5 w-5" />,
};

export default function ClinicalCases() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    cases, currentProgress,
    getCases, startCase, submitDecision, completeCase, getStats, getCurrentCase
  } = useClinicalCases();
  const { generateCase, loading: aiLoading } = useAIClinicalCases();
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats: loadGamificationStats, addPoints, unlockBadge } = useGamification();

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('cases');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; feedback: string } | null>(null);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getStats>> | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Connectez-vous pour accéder aux cas cliniques",
          variant: "destructive"
        });
        navigate(ROUTE_PATHS.medMngLogin);
        return;
      }
      setUser(user);
      getCases();
      getStats(user.id).then(setStats);
      loadGamificationStats(user.id);
    };
    checkAuth();
  }, [navigate, toast, getCases, getStats, loadGamificationStats]);

  const currentCase = getCurrentCase();
  const currentStep = currentCase?.steps[currentProgress?.currentStepIndex || 0];

  const handleStartCase = (caseId: string) => {
    startCase(caseId);
    setStepStartTime(Date.now());
    setActiveTab('active');
  };

  const handleSelectOption = (optionId: string) => {
    if (feedback) return;
    setSelectedOption(optionId);
  };

  const handleSubmitDecision = () => {
    if (!selectedOption) return;
    
    const timeSpent = Date.now() - stepStartTime;
    const result = submitDecision(selectedOption, timeSpent);
    
    if (result) {
      setFeedback({ isCorrect: result.isCorrect, feedback: result.feedback });
    }
  };

  const handleNextStep = () => {
    if (!currentCase || !currentProgress) return;

    if (currentProgress.currentStepIndex >= currentCase.steps.length - 1 || 
        feedback?.isCorrect) {
      // Move to next step or complete
      if (currentProgress.currentStepIndex >= currentCase.steps.length - 1) {
        handleCompleteCase();
      } else {
        setSelectedOption(null);
        setFeedback(null);
        setStepStartTime(Date.now());
      }
    }
  };

  const handleCompleteCase = async () => {
    if (!user) return;
    await completeCase(user.id);
    
    // Log activity
    await logActivity({
      activity_type: 'clinical_case',
      count: 1,
      score: currentProgress ? Math.round((currentProgress.correctAnswers / currentProgress.totalAnswers) * 100) : 0,
      metadata: { case_id: currentProgress?.caseId }
    });
    
    // Award gamification points
    await addPoints(user.id, POINTS_CONFIG.clinicalCase, 'clinicalCase');
    
    // Check for clinical master badge
    const newStats = await getStats(user.id);
    if ((newStats?.totalCasesCompleted || 0) >= 10) {
      await unlockBadge(user.id, 'clinical_master');
    }
    
    setStats(newStats);
    loadGamificationStats(user.id);
    setSelectedOption(null);
    setFeedback(null);
    setActiveTab('cases');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-success/10 text-success';
      case 'intermediate': return 'bg-warning/10 text-warning';
      case 'advanced': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-success/5">
      <Helmet>
        <title>Cas Cliniques | MED-MNG</title>
        <meta name="description" content="Cas cliniques interactifs pour l'apprentissage médical" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
              Cas Cliniques
            </h1>
            <p className="text-muted-foreground">Scénarios médicaux interactifs</p>
          </div>
        </div>

        {/* Disclaimer médical obligatoire */}
        <MedicalDisclaimer variant="banner" className="mb-6" />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="cases" className="gap-2">
              <Stethoscope className="h-4 w-4" />
              Cas
            </TabsTrigger>
            <TabsTrigger value="active" disabled={!currentProgress} className="gap-2">
              <Play className="h-4 w-4" />
              En cours
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Cases list */}
          <TabsContent value="cases">
            {/* AI Generation Card */}
            <Card className="mb-6 border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Générer un cas clinique IA</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  L'IA créera un cas clinique unique basé sur les items EDN
                </p>
                <Button 
                  onClick={async () => {
                    if (!user) return;
                    setGeneratingAI(true);
                    try {
                      const newCase = await generateCase(user.id, 'intermediate');
                      if (newCase) {
                        toast({ title: "Cas généré !", description: newCase.title });
                        getCases();
                      }
                    } catch (error) {
                      toast({ title: "Erreur", description: "Impossible de générer le cas", variant: "destructive" });
                    } finally {
                      setGeneratingAI(false);
                    }
                  }}
                  disabled={generatingAI || aiLoading}
                  className="gap-2"
                >
                  {generatingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Générer avec l'IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {cases.map((clinicalCase) => (
                <Card key={clinicalCase.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {SPECIALTY_ICONS[clinicalCase.specialty] || <Stethoscope className="h-5 w-5" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{clinicalCase.title}</CardTitle>
                          <CardDescription>{clinicalCase.specialty}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getDifficultyColor(clinicalCase.difficulty)}>
                        {getDifficultyLabel(clinicalCase.difficulty)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{clinicalCase.description}</p>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {clinicalCase.estimatedTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Brain className="h-4 w-4" />
                        {clinicalCase.steps.length} étapes
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {clinicalCase.learningObjectives.slice(0, 2).map((obj, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {obj.slice(0, 40)}...
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      onClick={() => handleStartCase(clinicalCase.id)}
                      className="w-full gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Commencer le cas
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Active case */}
          <TabsContent value="active">
            {currentCase && currentProgress && currentStep && (
              <div className="space-y-6">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentCase.title}</span>
                    <span>Étape {currentProgress.currentStepIndex + 1} / {currentCase.steps.length}</span>
                  </div>
                  <Progress 
                    value={(currentProgress.currentStepIndex / currentCase.steps.length) * 100} 
                    className="h-2" 
                  />
                </div>

                {/* Patient presentation (first step only) */}
                {currentProgress.currentStepIndex === 0 && !feedback && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Présentation du patient
                      </h4>
                      <p className="text-sm">{currentCase.patientPresentation}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Current step */}
                <Card>
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">{currentStep.title}</Badge>
                    <p className="text-muted-foreground">{currentStep.description}</p>
                    <CardTitle className="text-xl mt-4">{currentStep.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentStep.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleSelectOption(option.id)}
                        disabled={!!feedback}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          feedback
                            ? option.isCorrect
                              ? 'border-success bg-success/10'
                              : selectedOption === option.id
                                ? 'border-destructive bg-destructive/10'
                                : 'border-muted'
                            : selectedOption === option.id
                              ? 'border-primary bg-primary/10'
                              : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex-1">{option.text}</span>
                          {feedback && option.isCorrect && (
                            <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                          )}
                          {feedback && selectedOption === option.id && !option.isCorrect && (
                            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}

                    {/* Feedback */}
                    {feedback && (
                      <div className={`p-4 rounded-lg ${
                        feedback.isCorrect ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'
                      }`}>
                        <div className="flex items-start gap-3">
                          {feedback.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-semibold mb-1">
                              {feedback.isCorrect ? 'Correct !' : 'Incorrect'}
                            </h4>
                            <p className="text-sm">{feedback.feedback}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-4">
                      {!feedback ? (
                        <Button 
                          onClick={handleSubmitDecision}
                          disabled={!selectedOption}
                        >
                          Valider ma décision
                        </Button>
                      ) : (
                        <Button onClick={handleNextStep} className="gap-2">
                          {currentProgress.currentStepIndex >= currentCase.steps.length - 1 
                            ? 'Terminer le cas' 
                            : feedback.isCorrect 
                              ? 'Étape suivante' 
                              : 'Réessayer'}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Score indicator */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Score actuel</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="font-medium">
                          {currentProgress.correctAnswers} / {currentProgress.totalAnswers}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Statistics */}
          <TabsContent value="stats">
            {stats && (
              <div className="space-y-6">
                {/* Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Stethoscope className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{stats.totalCasesStarted}</p>
                      <p className="text-sm text-muted-foreground">Cas commencés</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                      <p className="text-2xl font-bold">{stats.totalCasesCompleted}</p>
                      <p className="text-sm text-muted-foreground">Cas terminés</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-accent" />
                      <p className="text-2xl font-bold">{stats.averageScore}%</p>
                      <p className="text-sm text-muted-foreground">Score moyen</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-warning" />
                      <p className="text-2xl font-bold">{Object.keys(stats.bySpecialty).length}</p>
                      <p className="text-sm text-muted-foreground">Spécialités</p>
                    </CardContent>
                  </Card>
                </div>

                {/* By specialty */}
                {Object.keys(stats.bySpecialty).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Par spécialité</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(stats.bySpecialty).map(([specialty, data]) => (
                          <div key={specialty} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {SPECIALTY_ICONS[specialty] || <Stethoscope className="h-5 w-5" />}
                              <span>{specialty}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline">{data.completed} cas</Badge>
                              <Badge>{data.score}%</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent cases */}
                {stats.recentCases.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Cas récents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {stats.recentCases.map((c, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">{c.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(c.date).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <Badge variant={c.score >= 70 ? 'default' : c.score >= 50 ? 'secondary' : 'destructive'}>
                              {c.score}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
