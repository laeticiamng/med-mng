import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { POINTS_CONFIG, useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
    ArrowRight,
    BarChart3,
    CheckCircle,
    Heart,
    Music,
    Shield,
    Sparkles,
    Star,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Écran de Bienvenue Interactif pour Nouveaux Utilisateurs
 */
interface WelcomeScreenProps {
  onComplete?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { logActivity } = useActivityTracking();
  const { addPoints, loadStats } = useGamification();

  // Check user on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

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
      setProgress(_prev => {
        const newProgress = (currentStep + 1) * 25;
        return Math.min(newProgress, 100);
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentStep]);

  const handleNext = async () => {
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Track welcome completion and award points
      if (user) {
        await logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { action: 'welcome_complete' }
        });
        await addPoints(user.id, POINTS_CONFIG.dailyStreak, 'dailyStreak');
        loadStats(user.id);
      }
      onComplete?.();
    }
  };

  const handleSkip = async () => {
    // Track welcome skipped
    if (user) {
      await logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { action: 'welcome_skipped' }
      });
    }
    onComplete?.();
  };

  const handleActionClick = async (path) => {
    // Track feature exploration
    if (user) {
      await logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { action: 'welcome_feature_click', path }
      });
    }
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
                  <Star className="w-4 h-4 text-warning fill-current" />
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