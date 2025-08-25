import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Clock, User, BookOpen, Award, Target, Users, Brain, Stethoscope } from 'lucide-react';

interface ECOSScenario {
  id: string;
  title: string;
  description: string;
  specialty: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  duration: number;
  skills: string[];
  objectives: string[];
  completed: boolean;
  score?: number;
}

const mockScenarios: ECOSScenario[] = [
  {
    id: '1',
    title: 'Consultation cardiologique',
    description: 'Patient de 65 ans présentant des douleurs thoraciques',
    specialty: 'Cardiologie',
    difficulty: 'Intermédiaire',
    duration: 20,
    skills: ['Anamnèse', 'Examen clinique', 'ECG', 'Diagnostic différentiel'],
    objectives: ['Mener un interrogatoire structuré', 'Réaliser un examen cardiovasculaire', 'Interpréter un ECG'],
    completed: true,
    score: 85
  },
  {
    id: '2',
    title: 'Urgence pédiatrique',
    description: 'Enfant de 5 ans avec fièvre et éruption cutanée',
    specialty: 'Pédiatrie',
    difficulty: 'Avancé',
    duration: 15,
    skills: ['Examen pédiatrique', 'Communication avec les parents', 'Diagnostic urgent'],
    objectives: ['Adapter lexamen à lâge', 'Rassurer les parents', 'Poser un diagnostic rapide'],
    completed: false
  },
  {
    id: '3',
    title: 'Consultation gynécologique',
    description: 'Femme de 30 ans pour suivi contraceptif',
    specialty: 'Gynécologie',
    difficulty: 'Débutant',
    duration: 25,
    skills: ['Interrogatoire intime', 'Examen gynécologique', 'Conseil contraceptif'],
    objectives: ['Créer un climat de confiance', 'Réaliser lexamen avec respect', 'Proposer une contraception adaptée'],
    completed: true,
    score: 92
  },
  {
    id: '4',
    title: 'Trauma orthopédique',
    description: 'Sportif avec entorse de cheville',
    specialty: 'Orthopédie',
    difficulty: 'Intermédiaire',
    duration: 18,
    skills: ['Examen traumatologique', 'Radiologie', 'Thérapeutique'],
    objectives: ['Évaluer la gravité', 'Prescrire les examens', 'Proposer le traitement'],
    completed: false
  }
];

export function ECOSPage() {
  const [scenarios, setScenarios] = useState<ECOSScenario[]>(mockScenarios);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [filteredScenarios, setFilteredScenarios] = useState<ECOSScenario[]>(scenarios);
  const [currentScenario, setCurrentScenario] = useState<ECOSScenario | null>(null);
  const [inProgress, setInProgress] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    filterScenarios();
  }, [scenarios, selectedSpecialty, selectedDifficulty]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (inProgress && currentScenario) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [inProgress, currentScenario]);

  const filterScenarios = () => {
    let filtered = scenarios;

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(scenario => scenario.specialty === selectedSpecialty);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(scenario => scenario.difficulty === selectedDifficulty);
    }

    setFilteredScenarios(filtered);
  };

  const startScenario = (scenario: ECOSScenario) => {
    setCurrentScenario(scenario);
    setInProgress(true);
    setTimeElapsed(0);
  };

  const endScenario = () => {
    if (currentScenario) {
      const updatedScenarios = scenarios.map(s => 
        s.id === currentScenario.id 
          ? { ...s, completed: true, score: Math.floor(Math.random() * 30) + 70 }
          : s
      );
      setScenarios(updatedScenarios);
    }
    setCurrentScenario(null);
    setInProgress(false);
    setTimeElapsed(0);
  };

  const specialties = [...new Set(scenarios.map(s => s.specialty))];
  const completedScenarios = scenarios.filter(s => s.completed).length;
  const averageScore = scenarios.filter(s => s.score).reduce((acc, s) => acc + (s.score || 0), 0) / scenarios.filter(s => s.score).length || 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-500';
      case 'Intermédiaire': return 'bg-yellow-500';
      case 'Avancé': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Simulations ECOS
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Entraînez-vous avec des simulations cliniques interactives et réalistes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Scénarios disponibles</p>
                <p className="text-2xl font-bold">{scenarios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Complétés</p>
                <p className="text-2xl font-bold">{completedScenarios}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Score moyen</p>
                <p className="text-2xl font-bold">{Math.round(averageScore)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Spécialités</p>
                <p className="text-2xl font-bold">{specialties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Scenario */}
      {inProgress && currentScenario && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-primary">En cours: {currentScenario.title}</CardTitle>
                <CardDescription>{currentScenario.description}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-muted-foreground">/ {currentScenario.duration} min</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={(timeElapsed / (currentScenario.duration * 60)) * 100} className="w-full" />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setInProgress(false)}>
                Pause
              </Button>
              <Button onClick={endScenario} className="bg-green-600 hover:bg-green-700">
                Terminer le scénario
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les spécialités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les spécialités</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les niveaux" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="Débutant">Débutant</SelectItem>
                <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                <SelectItem value="Avancé">Avancé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredScenarios.map((scenario) => (
          <Card key={scenario.id} className={`transition-all hover:shadow-lg ${scenario.completed ? 'bg-green-50 dark:bg-green-950' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center space-x-2">
                    <span>{scenario.title}</span>
                    {scenario.completed && <Award className="h-4 w-4 text-green-600" />}
                  </CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant="outline">{scenario.specialty}</Badge>
                  <div className={`w-3 h-3 rounded-full ${getDifficultyColor(scenario.difficulty)}`} title={scenario.difficulty}></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{scenario.duration} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Brain className="h-4 w-4" />
                  <span>{scenario.skills.length} compétences</span>
                </div>
              </div>

              {scenario.completed && scenario.score && (
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-green-600 font-medium">Score: {scenario.score}%</div>
                  <Progress value={scenario.score} className="flex-1 h-2" />
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Objectifs:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {scenario.objectives.slice(0, 2).map((objective, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Target className="h-3 w-3 mt-1 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                onClick={() => startScenario(scenario)} 
                disabled={inProgress}
                className="w-full"
                variant={scenario.completed ? "outline" : "default"}
              >
                <Play className="h-4 w-4 mr-2" />
                {scenario.completed ? 'Refaire' : 'Commencer'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}