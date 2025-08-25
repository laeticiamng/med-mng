// Complete ECOS Page with all sub-features
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EcosLayout } from "@/features/ecos/components/EcosLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Users, 
  Award, 
  Filter,
  Search,
  BookOpen,
  Stethoscope,
  Heart,
  Brain,
  Baby,
  Eye,
  Bone,
  CheckCircle,
  AlertCircle,
  Timer,
  BarChart3,
  Target,
  MessageSquare,
  FileText,
  Video,
  Mic
} from "lucide-react";
import { useNavAction } from "@/hooks/useNavAction";
import { analytics } from "@/lib/analytics";

// Mock ECOS scenarios data
const mockScenarios = [
  {
    id: "ecos-1",
    title: "Consultation Cardiologie - Douleur thoracique",
    specialty: "Cardiologie",
    difficulty: "Intermédiaire",
    duration: 15,
    type: "Consultation",
    description: "Patient de 45 ans consultant pour douleurs thoraciques",
    objectives: ["Anamnèse", "Examen clinique", "Diagnostic différentiel", "Prise en charge"],
    tags: ["urgence", "cardiologie", "douleur"],
    status: "available",
    participants: 1,
    averageScore: 78,
    attempts: 245
  },
  {
    id: "ecos-2", 
    title: "Urgence Pédiatrique - Fièvre du nourrisson",
    specialty: "Pédiatrie",
    difficulty: "Avancé",
    duration: 20,
    type: "Urgence",
    description: "Nourrisson de 3 mois avec fièvre",
    objectives: ["Évaluation urgence", "Examen pédiatrique", "Décision hospitalisation"],
    tags: ["pédiatrie", "urgence", "fièvre"],
    status: "available",
    participants: 1,
    averageScore: 65,
    attempts: 156
  },
  {
    id: "ecos-3",
    title: "Psychiatrie - Entretien dépression",
    specialty: "Psychiatrie", 
    difficulty: "Intermédiaire",
    duration: 25,
    type: "Entretien",
    description: "Patient présentant un épisode dépressif majeur",
    objectives: ["Entretien psychiatrique", "Évaluation risque", "Plan thérapeutique"],
    tags: ["psychiatrie", "dépression", "entretien"],
    status: "available",
    participants: 1,
    averageScore: 82,
    attempts: 198
  }
];

const mockUserHistory = [
  {
    id: "hist-1",
    scenarioId: "ecos-1",
    scenarioTitle: "Consultation Cardiologie",
    date: "2024-01-15",
    score: 85,
    duration: 14,
    status: "completed",
    feedback: "Excellente anamnèse, diagnostic correct"
  },
  {
    id: "hist-2", 
    scenarioId: "ecos-3",
    scenarioTitle: "Psychiatrie - Entretien dépression",
    date: "2024-01-12",
    score: 92,
    duration: 23,
    status: "completed",
    feedback: "Approche empathique, plan thérapeutique adapté"
  }
];

export default function EcosComplete() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const executeAction = useNavAction();
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [specialtyFilter, setSpecialtyFilter] = React.useState("");
  const [difficultyFilter, setDifficultyFilter] = React.useState("");
  const [selectedScenario, setSelectedScenario] = React.useState<any>(null);
  
  // Current scenario state for simulation
  const [currentStep, setCurrentStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = React.useState(900); // 15 minutes
  const [isSimulationActive, setIsSimulationActive] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (scenarioId) {
      const scenario = mockScenarios.find(s => s.id === scenarioId);
      setSelectedScenario(scenario);
      analytics.trackEcosStart(scenarioId);
    } else {
      analytics.track('page', 'ecos_browse');
    }
  }, [scenarioId]);

  // Timer effect for active simulation
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulationActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulationActive, isPaused, timeRemaining]);

  const handleStartSimulation = (scenario: any) => {
    setSelectedScenario(scenario);
    setIsSimulationActive(true);
    setTimeRemaining(scenario.duration * 60);
    navigate(`/ecos/${scenario.id}`);
    analytics.trackEcosStart(scenario.id);
  };

  const handleSubmitSimulation = () => {
    if (!selectedScenario) return;
    
    const score = Math.floor(Math.random() * 40) + 60; // Mock score 60-100
    const duration = selectedScenario.duration * 60 - timeRemaining;
    
    analytics.trackEcosSubmit(selectedScenario.id, score, duration);
    analytics.trackEcosComplete(selectedScenario.id, score, duration);
    
    setIsSimulationActive(false);
    // Navigate to results page or show results modal
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredScenarios = mockScenarios.filter(scenario => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !specialtyFilter || scenario.specialty === specialtyFilter;
    const matchesDifficulty = !difficultyFilter || scenario.difficulty === difficultyFilter;
    
    return matchesSearch && matchesSpecialty && matchesDifficulty;
  });

  const ScenarioCard = ({ scenario }: { scenario: any }) => {
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'Débutant': return 'bg-green-100 text-green-800';
        case 'Intermédiaire': return 'bg-yellow-100 text-yellow-800';
        case 'Avancé': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getSpecialtyIcon = (specialty: string) => {
      switch (specialty) {
        case 'Cardiologie': return <Heart className="h-4 w-4" />;
        case 'Pédiatrie': return <Baby className="h-4 w-4" />;
        case 'Psychiatrie': return <Brain className="h-4 w-4" />;
        case 'Ophtalmologie': return <Eye className="h-4 w-4" />;
        case 'Orthopédie': return <Bone className="h-4 w-4" />;
        default: return <Stethoscope className="h-4 w-4" />;
      }
    };

    return (
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getSpecialtyIcon(scenario.specialty)}
              <Badge variant="outline">{scenario.specialty}</Badge>
            </div>
            <Badge className={getDifficultyColor(scenario.difficulty)}>
              {scenario.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-lg">{scenario.title}</CardTitle>
          <CardDescription>{scenario.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {scenario.duration} min
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {scenario.participants} participant
              </span>
            </div>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              {scenario.averageScore}% moy.
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Objectifs:</p>
            <div className="flex flex-wrap gap-1">
              {scenario.objectives.slice(0, 3).map((obj: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {obj}
                </Badge>
              ))}
              {scenario.objectives.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{scenario.objectives.length - 3}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => handleStartSimulation(scenario)}
            >
              <Play className="w-4 h-4 mr-2" />
              Commencer
            </Button>
            <Button 
              variant="outline"
              onClick={() => executeAction({ type: "modal", id: "scenario-details", payload: { scenario } })}
            >
              <BookOpen className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SimulationInterface = () => (
    <div className="space-y-6">
      {/* Simulation Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{selectedScenario?.title}</CardTitle>
              <CardDescription>Étape {currentStep + 1} sur 5</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span className={`font-mono ${timeRemaining < 300 ? 'text-red-600' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executeAction({ type: "modal", id: "simulation-help" })}
                >
                  ?
                </Button>
              </div>
            </div>
          </div>
          <Progress value={(currentStep / 5) * 100} className="mt-2" />
        </CardHeader>
      </Card>

      {/* Simulation Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contexte clinique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Patient:</strong> M. Dupont, 45 ans<br />
                  <strong>Motif de consultation:</strong> Douleur thoracique depuis 2 heures<br />
                  <strong>Contexte:</strong> Première fois, survenue au repos, irradiant vers le bras gauche
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Actions disponibles:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Interroger
                  </Button>
                  <Button variant="outline" size="sm">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Examiner
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Prescrire
                  </Button>
                  <Button variant="outline" size="sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Urgence
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Votre réponse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Quelle est votre première hypothèse diagnostique ?
                </label>
                <Select 
                  value={answers[`step-${currentStep}`] || ""}
                  onValueChange={(value) => setAnswers(prev => ({ ...prev, [`step-${currentStep}`]: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une hypothèse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infarctus">Infarctus du myocarde</SelectItem>
                    <SelectItem value="angor">Angor instable</SelectItem>
                    <SelectItem value="embolie">Embolie pulmonaire</SelectItem>
                    <SelectItem value="pericardite">Péricardite</SelectItem>
                    <SelectItem value="pneumothorax">Pneumothorax</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Justification et démarche diagnostique
                </label>
                <Textarea
                  placeholder="Expliquez votre raisonnement..."
                  value={answers[`justification-${currentStep}`] || ""}
                  onChange={(e) => setAnswers(prev => ({ 
                    ...prev, 
                    [`justification-${currentStep}`]: e.target.value 
                  }))}
                  rows={4}
                />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  Précédent
                </Button>
                {currentStep < 4 ? (
                  <Button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={!answers[`step-${currentStep}`]}
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitSimulation}
                    disabled={!answers[`step-${currentStep}`]}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terminer
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (selectedScenario && isSimulationActive) {
    return (
      <EcosLayout 
        scenario={selectedScenario}
        showProgress={true}
      >
        <SimulationInterface />
      </EcosLayout>
    );
  }

  return (
    <EcosLayout showFilters={true}>
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Rechercher des simulations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par titre, spécialité, type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                    <SelectItem value="Pédiatrie">Pédiatrie</SelectItem>
                    <SelectItem value="Psychiatrie">Psychiatrie</SelectItem>
                    <SelectItem value="Neurologie">Neurologie</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Difficulté" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="Avancé">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="scenarios" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scenarios">Simulations disponibles</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredScenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} />
              ))}
            </div>
            
            {filteredScenarios.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucune simulation trouvée avec ces critères.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => {
                      setSearchQuery("");
                      setSpecialtyFilter("");
                      setDifficultyFilter("");
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-4">
              {mockUserHistory.map((history) => (
                <Card key={history.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h4 className="font-medium">{history.scenarioTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        {history.date} • {history.duration} minutes
                      </p>
                      {history.feedback && (
                        <p className="text-sm text-green-600 mt-1">
                          {history.feedback}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={history.score >= 80 ? "default" : "secondary"}>
                        {history.score}%
                      </Badge>
                      <Button variant="outline" size="sm">
                        Refaire
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Complétées</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">87%</p>
                      <p className="text-sm text-muted-foreground">Score moyen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">14min</p>
                      <p className="text-sm text-muted-foreground">Temps moyen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">95%</p>
                      <p className="text-sm text-muted-foreground">Meilleur score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </EcosLayout>
  );
}