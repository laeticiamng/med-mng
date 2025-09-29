import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, BookOpen, Music, Users, MessageSquare, 
  ArrowRight, ArrowLeft, CheckCircle, Play, Star 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface WelcomeScreenProps {
  onComplete: () => void;
}

interface WelcomeStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
  preview?: React.ReactNode;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: WelcomeStep[] = [
    {
      id: 'welcome',
      title: 'Bienvenue sur MED MNG ! 🎉',
      description: 'Découvrez la plateforme révolutionnaire qui transforme l\'apprentissage médical avec l\'intelligence artificielle et la musique.',
      icon: Sparkles,
      preview: (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">MED MNG</h3>
          <p className="text-center text-gray-600">Votre assistant IA pour l'apprentissage médical</p>
        </div>
      )
    },
    {
      id: 'edn-items',
      title: 'Base EDN Complète',
      description: 'Accédez à tous les 367 items IC avec un contenu enrichi, des visualisations immersives et 4,872 compétences OIC.',
      icon: BookOpen,
      action: {
        label: 'Explorer les items',
        onClick: () => navigate('/edn-complete')
      },
      preview: (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-semibold">IC-157 Diabète</h4>
              <p className="text-sm text-gray-600">Endocrinologie • Rang A & B</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Contenu complet</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Quiz interactif</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Scène immersive</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'music-generator',
      title: 'Générateur Musical IA',
      description: 'Transformez vos révisions en musique ! Générez des musiques personnalisées basées sur n\'importe quel item EDN.',
      icon: Music,
      action: {
        label: 'Générer ma première musique',
        onClick: () => navigate('/generator')
      },
      preview: (
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Style LoFi</h4>
              <p className="text-sm text-gray-600">Basé sur IC-042 Hypertension</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-purple-600" />
            <div className="flex-1 bg-purple-200 h-2 rounded-full">
              <div className="bg-purple-500 h-2 rounded-full w-1/3"></div>
            </div>
            <span className="text-xs text-gray-500">1:23 / 3:45</span>
          </div>
        </div>
      )
    },
    {
      id: 'ai-chat',
      title: 'Assistant IA Intelligent',
      description: 'Posez vos questions médicales à notre IA spécialisée. Elle connaît tous les items EDN et peut vous aider à comprendre les concepts complexes.',
      icon: MessageSquare,
      action: {
        label: 'Commencer à discuter',
        onClick: () => navigate('/chat')
      },
      preview: (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm">Peux-tu m'expliquer la physiopathologie du diabète de type 2 ?</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <p className="text-sm">
                🤖 Bien sûr ! Le diabète de type 2 résulte principalement de deux mécanismes...
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'gamification',
      title: 'Progression & Récompenses',
      description: 'Gagnez des points XP, débloquez des badges et suivez votre progression. L\'apprentissage devient un jeu !',
      icon: Star,
      action: {
        label: 'Voir mes achievements',
        onClick: () => navigate('/achievements')
      },
      preview: (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold">Niveau 12</h4>
              <p className="text-sm text-gray-600">Étudiant Avancé</p>
            </div>
            <div className="text-2xl">🏆</div>
          </div>
          <div className="space-y-2">
            <Progress value={75} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>2,450 XP</span>
              <span>3,000 XP</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTour = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-white shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <currentStepData.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                  <CardDescription>Étape {currentStep + 1} sur {steps.length}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={skipTour}>
                Passer le tour
              </Button>
            </div>
            
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="pb-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contenu principal */}
              <div className="space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {currentStepData.description}
                </p>

                {currentStepData.action && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Essayez maintenant !</h4>
                    <Button 
                      onClick={currentStepData.action.onClick}
                      className="w-full"
                    >
                      {currentStepData.action.label}
                    </Button>
                  </div>
                )}

                {/* Conseils */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">💡 Conseil</h4>
                  <p className="text-sm text-gray-600">
                    {currentStep === 0 && "Prenez votre temps pour explorer chaque fonctionnalité."}
                    {currentStep === 1 && "Utilisez la barre de recherche pour trouver rapidement un item spécifique."}
                    {currentStep === 2 && "Expérimentez avec différents styles musicaux pour trouver celui qui vous aide le mieux."}
                    {currentStep === 3 && "N'hésitez pas à poser des questions précises, l'IA comprend le contexte médical."}
                    {currentStep === 4 && "Consultez vos achievements régulièrement pour rester motivé !"}
                  </p>
                </div>
              </div>

              {/* Aperçu */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Aperçu</h4>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStepData.preview}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Précédent
              </Button>

              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <Button onClick={nextStep} className="flex items-center gap-2">
                {isLastStep ? 'Commencer' : 'Suivant'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};