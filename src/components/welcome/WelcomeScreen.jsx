import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Music, 
  BarChart3, 
  Shield, 
  Users, 
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';

/**
 * Écran de Bienvenue Interactif pour Nouveaux Utilisateurs
 */
export const WelcomeScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const welcomeSteps = [
    {
      title: "Bienvenue sur MED-MNG",
      description: "La plateforme médicale intelligente qui révolutionne l'apprentissage",
      icon: Sparkles,
      color: "bg-primary",
      features: [
        "Génération de contenus musicaux thérapeutiques",
        "Analytics et monitoring temps réel", 
        "Système d'audit et conformité avancé",
        "Interface optimisée pour les professionnels de santé"
      ]
    },
    {
      title: "Dashboard Intelligent",
      description: "Surveillez vos métriques et performances en temps réel",
      icon: BarChart3,
      color: "bg-success",
      action: { label: "Voir le Dashboard", path: ROUTE_PATHS.dashboard }
    },
    {
      title: "Création Musicale",
      description: "Générez des contenus audio personnalisés pour vos patients",
      icon: Music,
      color: "bg-accent",
      action: { label: "Créer une Piste", path: ROUTE_PATHS.medMngCreate }
    },
    {
      title: "Monitoring Système", 
      description: "Système de surveillance avancé avec alertes intelligentes",
      icon: Shield,
      color: "bg-warning",
      action: { label: "Voir le Monitoring", path: ROUTE_PATHS.systemManagement }
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = (currentStep + 1) * 25;
        return Math.min(newProgress, 100);
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete?.();
    }
  };

  const handleSkip = () => {
    onComplete?.();
  };

  const handleActionClick = (path) => {
    navigate(path);
    onComplete?.();
  };

  const currentWelcomeStep = welcomeSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl medical-card shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-full ${currentWelcomeStep.color} flex items-center justify-center animate-gentle-float`}>
              <currentWelcomeStep.icon className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              {currentWelcomeStep.title}
            </CardTitle>
            <CardDescription className="text-lg">
              {currentWelcomeStep.description}
            </CardDescription>
          </div>

          <Progress value={progress} className="w-full max-w-md mx-auto" />
          <p className="text-sm text-muted-foreground">
            Étape {currentStep + 1} sur {welcomeSteps.length}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Fonctionnalités pour la première étape */}
          {currentStep === 0 && (
            <div className="grid gap-3">
              {currentWelcomeStep.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Aperçu des fonctionnalités pour les autres étapes */}
          {currentStep > 0 && (
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
                <h3 className="font-semibold mb-2">Fonctionnalité Clé</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cette section vous permettra d'optimiser votre workflow et d'améliorer l'efficacité de vos soins.
                </p>
                
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>Recommandé par 98% des utilisateurs</span>
                </div>
              </div>

              {currentWelcomeStep.action && (
                <Button
                  onClick={() => handleActionClick(currentWelcomeStep.action.path)}
                  className="medical-btn-primary"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {currentWelcomeStep.action.label}
                </Button>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="ghost" onClick={handleSkip}>
              Passer l'introduction
            </Button>

            <div className="flex items-center gap-2">
              {/* Indicateurs de progression */}
              <div className="flex gap-2">
                {welcomeSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <Button onClick={handleNext} className="medical-btn-primary">
                {currentStep === welcomeSteps.length - 1 ? (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Commencer
                  </>
                ) : (
                  <>
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;