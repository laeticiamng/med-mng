import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Users, Clock, Award, TrendingUp, Camera, Mic } from 'lucide-react';

interface ECOSScenario {
  id: string;
  title: string;
  specialty: string;
  duration: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  completed: boolean;
  score?: number;
  type: 'Communication' | 'Examen clinique' | 'Gestes techniques' | 'Urgences';
}

export const ECOSSimulationEngine = () => {
  const [scenarios] = useState<ECOSScenario[]>([
    {
      id: '1',
      title: 'Annonce de diagnostic - Cancer du sein',
      specialty: 'Oncologie',
      duration: 15,
      difficulty: 'Difficile',
      completed: true,
      score: 87,
      type: 'Communication'
    },
    {
      id: '2',
      title: 'Examen cardiovasculaire complet',
      specialty: 'Cardiologie',
      duration: 20,
      difficulty: 'Moyen',
      completed: true,
      score: 92,
      type: 'Examen clinique'
    },
    {
      id: '3',
      title: 'Suture simple - Plaie au front',
      specialty: 'Chirurgie',
      duration: 10,
      difficulty: 'Facile',
      completed: false,
      type: 'Gestes techniques'
    },
    {
      id: '4',
      title: 'Prise en charge ACR',
      specialty: 'Urgences',
      duration: 12,
      difficulty: 'Difficile',
      completed: false,
      type: 'Urgences'
    }
  ]);

  const [currentScenario, setCurrentScenario] = useState<ECOSScenario | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [selectedTab, setSelectedTab] = useState('scenarios');

  const completedScenarios = scenarios.filter(s => s.completed);
  const averageScore = completedScenarios.length > 0 
    ? completedScenarios.reduce((sum, s) => sum + (s.score || 0), 0) / completedScenarios.length 
    : 0;

  const startSimulation = (scenario: ECOSScenario) => {
    setCurrentScenario(scenario);
    setIsSimulating(true);
    setSimulationTime(0);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setCurrentScenario(null);
    setSimulationTime(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimulationTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-100 text-green-800';
      case 'Moyen': return 'bg-yellow-100 text-yellow-800';
      case 'Difficile': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques ECOS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Scénarios</p>
                <p className="text-2xl font-bold">{scenarios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Complétés</p>
                <p className="text-2xl font-bold">{completedScenarios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Score moyen</p>
                <p className="text-2xl font-bold">{averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Temps total</p>
                <p className="text-2xl font-bold">2h 47min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulation active */}
      {isSimulating && currentScenario && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Simulation en cours</span>
              <Badge variant="secondary">{formatTime(simulationTime)} / {currentScenario.duration}:00</Badge>
            </CardTitle>
            <CardDescription>{currentScenario.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress 
                value={(simulationTime / (currentScenario.duration * 60)) * 100} 
                className="h-3"
              />
              <div className="flex gap-4">
                <Button onClick={stopSimulation} variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button onClick={stopSimulation} variant="destructive">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Arrêter
                </Button>
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
                <Button variant="outline">
                  <Mic className="h-4 w-4 mr-2" />
                  Audio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interface principale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Moteur de Simulation ECOS
          </CardTitle>
          <CardDescription>
            Environnement immersif pour maîtriser les situations cliniques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scenarios">Scénarios</TabsTrigger>
              <TabsTrigger value="create">Créer</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scenarios" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarios.map((scenario) => (
                  <Card key={scenario.id} className={`hover:shadow-md transition-shadow ${scenario.completed ? 'border-green-200' : ''}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="font-medium text-sm leading-tight">{scenario.title}</h3>
                            <p className="text-xs text-muted-foreground">{scenario.specialty}</p>
                          </div>
                          {scenario.completed && scenario.score && (
                            <Badge variant="secondary" className="text-green-700 bg-green-100">
                              {scenario.score}%
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getDifficultyColor(scenario.difficulty)}>
                            {scenario.difficulty}
                          </Badge>
                          <Badge variant="outline">{scenario.type}</Badge>
                          <Badge variant="outline">{scenario.duration} min</Badge>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          {!isSimulating ? (
                            <Button 
                              size="sm" 
                              onClick={() => startSimulation(scenario)}
                              className="flex-1"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Démarrer
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled className="flex-1">
                              En cours...
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Prévisualiser
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Créateur de Scénarios ECOS</CardTitle>
                  <CardDescription>
                    Créez vos propres situations cliniques avec l'IA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Spécialité</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option>Cardiologie</option>
                        <option>Neurologie</option>
                        <option>Urgences</option>
                        <option>Pédiatrie</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type de station</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option>Communication</option>
                        <option>Examen clinique</option>
                        <option>Gestes techniques</option>
                        <option>Urgences</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description du cas</label>
                    <textarea 
                      className="w-full px-3 py-2 border rounded-md h-24"
                      placeholder="Décrivez la situation clinique..."
                    />
                  </div>
                  
                  <Button className="w-full">
                    Générer le Scénario avec l'IA
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-4">
                {completedScenarios.map((scenario) => (
                  <Card key={scenario.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{scenario.title}</h3>
                          <p className="text-sm text-muted-foreground">{scenario.specialty}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{scenario.score}%</p>
                          <p className="text-xs text-muted-foreground">Il y a 2 jours</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance par Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Communication', 'Examen clinique', 'Gestes techniques', 'Urgences'].map((type, index) => (
                        <div key={type} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{type}</span>
                            <span>{82 + index * 4}%</span>
                          </div>
                          <Progress value={82 + index * 4} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progression Mensuelle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Scénarios ce mois</p>
                        <p className="text-2xl font-bold">23</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amélioration moyenne</p>
                        <p className="text-xl font-semibold text-green-600">+12%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};