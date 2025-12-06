import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, RotateCcw, CheckCircle, Volume2, 
  Music, BookOpen, Brain, Lightbulb, Target
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  duration: number;
  interactive?: boolean;
}

interface InteractiveDemoProps {
  title: string;
  description: string;
  steps: DemoStep[];
  autoPlay?: boolean;
  showProgress?: boolean;
}

/**
 * Démonstration interactive des fonctionnalités
 */
export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({
  title,
  description,
  steps,
  autoPlay = false,
  showProgress = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, steps[currentStep]?.duration || 3000);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, steps]);

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsPlaying(false);
  };

  const markStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="medical-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              {title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {description}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
              className="w-20"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Jouer
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={resetDemo}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progression</span>
              <span>{currentStep + 1} / {steps.length}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Navigation des étapes */}
        <div className="flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <Button
              key={step.id}
              variant={currentStep === index ? "default" : "outline"}
              size="sm"
              onClick={() => handleStepClick(index)}
              className="flex items-center gap-2"
            >
              {completedSteps.has(index) && (
                <CheckCircle className="w-3 h-3 text-success" />
              )}
              Étape {index + 1}
            </Button>
          ))}
        </div>

        {/* Contenu de l'étape actuelle */}
        <div className="min-h-[300px]">
          {steps[currentStep] && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1">
                  Étape {currentStep + 1}
                </Badge>
                <h3 className="text-lg font-semibold">
                  {steps[currentStep].title}
                </h3>
              </div>
              
              <p className="text-muted-foreground">
                {steps[currentStep].description}
              </p>
              
              <div className="border rounded-lg p-6 bg-muted/30">
                {steps[currentStep].content}
              </div>
              
              {steps[currentStep].interactive && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => markStepComplete(currentStep)}
                    disabled={completedSteps.has(currentStep)}
                  >
                    {completedSteps.has(currentStep) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complété
                      </>
                    ) : (
                      'Marquer comme fait'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Précédent
          </Button>
          
          <div className="flex items-center gap-2">
            {currentStep === steps.length - 1 ? (
              <Button onClick={resetDemo} className="medical-btn-primary">
                Recommencer la démo
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="medical-btn-primary"
              >
                Suivant
              </Button>
            )}
          </div>
        </div>

        {/* Résumé de progression */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progression de la démo</span>
            <span className="text-muted-foreground">
              {completedSteps.size} / {steps.length} étapes complétées
            </span>
          </div>
          {completedSteps.size === steps.length && (
            <div className="mt-2 flex items-center gap-2 text-success">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Félicitations ! Démo terminée avec succès
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Démonstrations prédéfinies
export const MedMngDemos = {
  musicGeneration: {
    title: "Génération Musicale IA",
    description: "Découvrez comment créer des contenus musicaux éducatifs avec l'IA",
    steps: [
      {
        id: 'choose-topic',
        title: 'Choisir un sujet médical',
        description: 'Sélectionnez l\'item EDN ou le thème médical pour votre création',
        content: (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Item IC-234: Cardiologie</p>
                <p className="text-sm text-muted-foreground">Insuffisance cardiaque</p>
              </div>
            </div>
            <p className="text-sm">
              L'IA va analyser les compétences requises pour cet item et créer un contenu musical adapté.
            </p>
          </div>
        ),
        duration: 4000,
        interactive: true
      },
      {
        id: 'configure-style',
        title: 'Configurer le style musical',
        description: 'Personnalisez le style et le ton de votre création musicale',
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg text-center">
                <Music className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Style: Éducatif</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <Volume2 className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Tempo: Modéré</p>
              </div>
            </div>
            <p className="text-sm">
              Le style éducatif optimise la mémorisation des concepts médicaux.
            </p>
          </div>
        ),
        duration: 3500,
        interactive: true
      },
      {
        id: 'generation',
        title: 'Génération en cours',
        description: 'L\'IA crée votre contenu musical personnalisé',
        content: (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <div className="text-center">
              <p className="font-medium">Génération en cours...</p>
              <p className="text-sm text-muted-foreground">
                Analyse des compétences • Création des paroles • Composition musicale
              </p>
            </div>
          </div>
        ),
        duration: 5000
      },
      {
        id: 'result',
        title: 'Résultat prêt !',
        description: 'Votre contenu musical éducatif est maintenant disponible',
        content: (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-success/5">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <p className="font-medium text-success">Génération réussie !</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm"><strong>Titre:</strong> "Cardiologie en Musique - IC-234"</p>
                <p className="text-sm"><strong>Durée:</strong> 3 min 24 sec</p>
                <p className="text-sm"><strong>Style:</strong> Éducatif, Mémorable</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="medical-btn-primary">
                  <Play className="w-4 h-4 mr-2" />
                  Écouter
                </Button>
                <Button size="sm" variant="outline">
                  Télécharger
                </Button>
              </div>
            </div>
          </div>
        ),
        duration: 4000,
        interactive: true
      }
    ]
  },

  ecosSimulation: {
    title: "Simulation ECOS Interactive",
    description: "Entraînez-vous aux examens cliniques avec des scénarios réalistes",
    steps: [
      {
        id: 'scenario-intro',
        title: 'Présentation du scénario',
        description: 'Découvrez le cas clinique à résoudre',
        content: (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-primary/5">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-5 h-5 text-primary" />
                <p className="font-medium">Cas Clinique ECOS #47</p>
              </div>
              <p className="text-sm">
                <strong>Patient:</strong> Homme, 65 ans<br/>
                <strong>Motif:</strong> Douleur thoracique depuis 2 heures<br/>
                <strong>Contexte:</strong> Service d'urgences
              </p>
            </div>
          </div>
        ),
        duration: 4000,
        interactive: true
      },
      {
        id: 'examination',
        title: 'Examen clinique',
        description: 'Effectuez l\'examen physique du patient virtuel',
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <Target className="w-5 h-5 mb-2 text-primary" />
                <p className="text-sm font-medium">Auscultation</p>
                <p className="text-xs text-muted-foreground">Bruits du cœur</p>
              </div>
              <div className="p-3 border rounded-lg">
                <Target className="w-5 h-5 mb-2 text-primary" />
                <p className="text-sm font-medium">Palpation</p>
                <p className="text-xs text-muted-foreground">Pouls, tension</p>
              </div>
            </div>
            <p className="text-sm">
              Cliquez sur les zones d'examen pour découvrir les signes cliniques.
            </p>
          </div>
        ),
        duration: 5000,
        interactive: true
      }
    ]
  }
};