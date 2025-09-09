import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Users, 
  Stethoscope,
  Heart,
  Brain,
  Activity
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface SceneImmersiveProps {
  item: any;
  sceneData?: any;
  onProgress?: (progress: number) => void;
}

export const SceneImmersive: React.FC<SceneImmersiveProps> = ({ 
  item, 
  sceneData, 
  onProgress 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Scénarios basés sur l'item médical
  const scenarios = [
    {
      id: 'consultation',
      title: 'Consultation initiale',
      description: 'Accueil et anamnèse du patient',
      duration: '5-10 min',
      icon: Users,
      steps: [
        'Accueillir le patient avec empathie',
        'Écouter activement ses plaintes',
        'Poser les bonnes questions',
        'Respecter la confidentialité'
      ]
    },
    {
      id: 'examen-clinique',
      title: 'Examen clinique',
      description: 'Examen physique systématique',
      duration: '10-15 min',
      icon: Stethoscope,
      steps: [
        'Préparer le matériel d\'examen',
        'Expliquer chaque geste au patient',
        'Réaliser l\'examen de façon méthodique',
        'Noter les observations importantes'
      ]
    },
    {
      id: 'diagnostic',
      title: 'Raisonnement diagnostique',
      description: 'Analyse et synthèse clinique',
      duration: '5-10 min',
      icon: Brain,
      steps: [
        'Analyser les signes cliniques',
        'Formuler des hypothèses diagnostiques',
        'Hiérarchiser les diagnostics',
        'Planifier les examens complémentaires'
      ]
    },
    {
      id: 'prise-en-charge',
      title: 'Prise en charge',
      description: 'Traitement et suivi',
      duration: '10-15 min',
      icon: Heart,
      steps: [
        'Expliquer le diagnostic au patient',
        'Proposer un plan thérapeutique',
        'Éduquer sur la maladie',
        'Planifier le suivi'
      ]
    }
  ];

  const currentScenario = scenarios[Math.floor(currentStep / 4)] || scenarios[0];
  const stepInScenario = currentStep % 4;

  useEffect(() => {
    const progress = (completedSteps.size / getTotalSteps()) * 100;
    onProgress?.(progress);
  }, [completedSteps, onProgress]);

  const getTotalSteps = () => {
    return scenarios.reduce((total, scenario) => total + scenario.steps.length, 0);
  };

  const nextStep = () => {
    if (currentStep < getTotalSteps() - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Header de simulation */}
      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <TranslatedText text="Simulation Clinique Interactive" />
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {item.title} - Environnement d'apprentissage immersif
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Simulation 3D
              </Badge>
              <Badge variant="outline">
                {item.item_code}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Zone de simulation principale */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Viewport de simulation */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Zone de simulation 3D simulée */}
              <div className="relative h-96 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <currentScenario.icon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {currentScenario.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {currentScenario.description}
                  </p>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    Étape {stepInScenario + 1}/4
                  </Badge>
                </div>

                {/* Overlay de contrôle */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <p className="font-medium text-foreground">
                          {currentScenario.steps[stepInScenario]}
                        </p>
                        <p className="text-muted-foreground">
                          Durée estimée: {currentScenario.duration}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={prevStep}
                          disabled={currentStep === 0}
                        >
                          Précédent
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={togglePlay}
                          className="bg-gradient-to-r from-green-500 to-emerald-600"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={nextStep}
                          disabled={currentStep >= getTotalSteps() - 1}
                        >
                          Suivant
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panneau de contrôle */}
        <div className="space-y-4">
          {/* Progression générale */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Étapes complétées</span>
                    <span>{completedSteps.size}/{getTotalSteps()}</span>
                  </div>
                  <Progress 
                    value={(completedSteps.size / getTotalSteps()) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-lg font-bold text-foreground">{currentStep + 1}</p>
                    <p className="text-xs text-muted-foreground">Étape actuelle</p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-lg font-bold text-foreground">{getTotalSteps()}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contrôles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contrôles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Démarrer
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={resetSimulation}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recommencer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scénarios disponibles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scénarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scenarios.map((scenario, index) => {
                  const scenarioProgress = scenario.steps.filter((_, stepIndex) => 
                    completedSteps.has(index * 4 + stepIndex)
                  ).length;
                  const isCurrentScenario = Math.floor(currentStep / 4) === index;
                  
                  return (
                    <div 
                      key={scenario.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isCurrentScenario 
                          ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setCurrentStep(index * 4)}
                    >
                      <div className="flex items-center gap-3">
                        <scenario.icon className={`w-5 h-5 ${
                          isCurrentScenario ? 'text-green-600' : 'text-muted-foreground'
                        }`} />
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${
                            isCurrentScenario ? 'text-green-700 dark:text-green-300' : 'text-foreground'
                          }`}>
                            {scenario.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {scenarioProgress}/{scenario.steps.length} étapes
                          </p>
                        </div>
                        {scenarioProgress === scenario.steps.length && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            ✓
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instructions détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions pour l'étape actuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">
                {currentScenario.title} - Étape {stepInScenario + 1}
              </h4>
              <p className="text-muted-foreground mb-4">
                {currentScenario.steps[stepInScenario]}
              </p>
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Points clés à retenir:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Maintenir un contact visuel approprié</li>
                  <li>• Utiliser un langage adapté au patient</li>
                  <li>• Respecter la temporalité de l'échange</li>
                  <li>• Prendre en compte l'état émotionnel</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-sm mb-3">Objectifs pédagogiques:</h5>
              <div className="space-y-2">
                <Badge variant="outline" className="mr-2 mb-2">
                  Communication thérapeutique
                </Badge>
                <Badge variant="outline" className="mr-2 mb-2">
                  Raisonnement clinique
                </Badge>
                <Badge variant="outline" className="mr-2 mb-2">
                  Gestes techniques
                </Badge>
                <Badge variant="outline" className="mr-2 mb-2">
                  Éthique médicale
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};