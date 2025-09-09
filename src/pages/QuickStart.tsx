import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Play, ArrowRight, BookOpen, Music, Brain, Users, Target, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  path: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  duration: string;
  difficulty: 'facile' | 'moyen' | 'avancé';
}

const QuickStart: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'explore-edn',
      title: 'Explorer les items EDN',
      description: 'Découvrez les 367 items EDN avec contenus immersifs et interactifs',
      action: 'Commencer l\'exploration',
      path: '/edn',
      icon: BookOpen,
      completed: false,
      duration: '10 min',
      difficulty: 'facile'
    },
    {
      id: 'create-music',
      title: 'Créer votre première musique',
      description: 'Utilisez l\'IA pour transformer un contenu médical en musique mémorable',
      action: 'Ouvrir le studio',
      path: '/med-mng/create',
      icon: Music,
      completed: false,
      duration: '15 min',
      difficulty: 'moyen'
    },
    {
      id: 'try-ecos',
      title: 'Simulation ECOS',
      description: 'Entraînez-vous avec des cas cliniques interactifs et immersifs',
      action: 'Lancer une simulation',
      path: '/ecos',
      icon: Target,
      completed: false,
      duration: '20 min',
      difficulty: 'avancé'
    },
    {
      id: 'join-community',
      title: 'Rejoindre la communauté',
      description: 'Échangez avec d\'autres étudiants et partagez vos créations',
      action: 'Découvrir la communauté',
      path: '/community',
      icon: Users,
      completed: false,
      duration: '5 min',
      difficulty: 'facile'
    },
    {
      id: 'ai-assistant',
      title: 'Assistant IA médical',
      description: 'Posez vos questions médicales à notre assistant IA spécialisé',
      action: 'Tester l\'assistant',
      path: '/chat',
      icon: Brain,
      completed: false,
      duration: '8 min',
      difficulty: 'facile'
    }
  ]);

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const handleStepAction = (step: OnboardingStep, index: number) => {
    // Marquer comme complété
    const updatedSteps = [...steps];
    updatedSteps[index].completed = true;
    setSteps(updatedSteps);
    
    toast({
      title: "Étape complétée !",
      description: `${step.title} marquée comme terminée.`
    });

    // Naviguer vers la page
    navigate(step.path);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'bg-green-100 text-green-700 border-green-200';
      case 'moyen': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'avancé': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <Helmet>
        <title>Démarrage Rapide - MED-MNG</title>
        <meta name="description" content="Guide de démarrage rapide pour maîtriser la plateforme MED-MNG - Items EDN, création musicale, simulations ECOS et plus encore" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Démarrage Rapide
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              Découvrez toute la puissance de MED-MNG en 5 étapes simples. 
              Chaque étape vous permet d'explorer une fonctionnalité clé de la plateforme.
            </p>
            
            {/* Progress global */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm mb-2">
                <span>Progression</span>
                <span>{completedSteps}/{steps.length} complétées</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </motion.div>

          {/* Étapes */}
          <div className="grid gap-6 lg:grid-cols-2">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  step.completed ? 'bg-green-50 border-green-200' : 'hover:scale-[1.02]'
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg transition-colors ${
                          step.completed ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <step.icon className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{step.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {step.duration}
                            </Badge>
                            <Badge className={getDifficultyColor(step.difficulty)}>
                              {step.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-muted-foreground">
                        {index + 1}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="text-base mb-6">
                      {step.description}
                    </CardDescription>
                    
                    <Button
                      onClick={() => handleStepAction(step, index)}
                      disabled={step.completed}
                      className="w-full"
                      variant={step.completed ? "outline" : "default"}
                    >
                      {step.completed ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Terminé
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          {step.action}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>

                  {step.completed && (
                    <div className="absolute top-0 right-0 w-0 h-0 border-l-[60px] border-l-transparent border-t-[60px] border-t-green-500">
                      <CheckCircle className="absolute -top-12 -right-4 h-4 w-4 text-white" />
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Actions finales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  {completedSteps === steps.length ? (
                    '🎉 Félicitations ! Vous maîtrisez MED-MNG'
                  ) : (
                    'Continuez votre découverte'
                  )}
                </h2>
                
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  {completedSteps === steps.length ? (
                    'Vous avez exploré toutes les fonctionnalités principales. Vous êtes maintenant prêt à utiliser MED-MNG de manière optimale pour vos études de médecine.'
                  ) : (
                    `Plus que ${steps.length - completedSteps} étape${steps.length - completedSteps > 1 ? 's' : ''} pour maîtriser toutes les fonctionnalités de base !`
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {completedSteps === steps.length ? (
                    <>
                      <Button onClick={() => navigate('/dashboard')} size="lg">
                        Accéder au tableau de bord
                      </Button>
                      <Button onClick={() => navigate('/profile')} variant="outline" size="lg">
                        Voir mon profil
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => navigate('/platform')} size="lg">
                        Explorer toutes les fonctionnalités
                      </Button>
                      <Button onClick={() => navigate('/documentation')} variant="outline" size="lg">
                        Consulter la documentation
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default QuickStart;