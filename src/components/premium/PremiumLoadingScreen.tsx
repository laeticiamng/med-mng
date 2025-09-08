// ==========================================
// MED-MNG PREMIUM LOADING SCREEN
// Écran de chargement premium avec animations
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, Heart, Brain, Music, Crown, 
  Zap, Shield, CheckCircle, Loader2 
} from 'lucide-react';

interface PremiumLoadingScreenProps {
  loadingText?: string;
  subText?: string;
  progress?: number;
  showProgress?: boolean;
}

export const PremiumLoadingScreen: React.FC<PremiumLoadingScreenProps> = ({
  loadingText = "Chargement de MED-MNG",
  subText = "Préparation de votre environnement d'apprentissage premium",
  progress = 0,
  showProgress = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);

  const loadingSteps = [
    { icon: Crown, text: "Initialisation de la plateforme premium", color: "text-yellow-500" },
    { icon: Shield, text: "Vérification des accès sécurisés", color: "text-blue-500" },
    { icon: Brain, text: "Chargement de l'intelligence artificielle", color: "text-purple-500" },
    { icon: Music, text: "Préparation des outils musicaux", color: "text-pink-500" },
    { icon: Stethoscope, text: "Synchronisation des contenus médicaux", color: "text-green-500" },
    { icon: CheckCircle, text: "Finalisation et optimisation", color: "text-emerald-500" }
  ];

  // Animation du progrès des étapes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return 0; // Loop back to start
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [loadingSteps.length]);

  // Animation du progrès numérique
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        const target = showProgress ? progress : Math.min(prev + Math.random() * 3, 95);
        return Math.min(target, prev + 1);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [progress, showProgress]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center z-50">
      {/* Animations d'arrière-plan */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="text-center relative z-10 max-w-md mx-auto px-6">
        {/* Logo Premium Animé */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl"
              animate={{ 
                rotateY: [0, 360],
                boxShadow: [
                  "0 20px 40px rgba(59, 130, 246, 0.3)",
                  "0 20px 60px rgba(59, 130, 246, 0.5)", 
                  "0 20px 40px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ 
                rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 2, repeat: Infinity }
              }}
            >
              <Stethoscope className="text-white h-10 w-10" />
            </motion.div>
            
            {/* Couronne premium */}
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Crown className="text-white h-4 w-4" />
            </motion.div>
          </div>
        </motion.div>

        {/* Textes principaux */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {loadingText}
          </h1>
          <p className="text-muted-foreground text-lg">
            {subText}
          </p>
        </motion.div>

        {/* Étape actuelle */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-3 bg-card/50 backdrop-blur border border-border rounded-full px-6 py-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              {React.createElement(loadingSteps[currentStep].icon, {
                className: `w-5 h-5 ${loadingSteps[currentStep].color}`
              })}
            </motion.div>
            <span className="text-sm font-medium">
              {loadingSteps[currentStep].text}
            </span>
          </div>
        </motion.div>

        {/* Barre de progression */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className="bg-muted/30 rounded-full h-2 overflow-hidden backdrop-blur">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${displayProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
            <span>Chargement en cours...</span>
            <motion.span
              key={Math.floor(displayProgress)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono"
            >
              {Math.floor(displayProgress)}%
            </motion.span>
          </div>
        </motion.div>

        {/* Indicateurs de progression des étapes */}
        <div className="flex justify-center gap-2">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index <= currentStep ? 'bg-primary' : 'bg-muted/40'
              }`}
              animate={{
                scale: index === currentStep ? [1, 1.3, 1] : 1
              }}
              transition={{
                duration: 1,
                repeat: index === currentStep ? Infinity : 0
              }}
            />
          ))}
        </div>

        {/* Message d'encouragement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Heart className="w-4 h-4 text-red-500" />
            <span>Merci de votre patience, l'excellence prend du temps</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumLoadingScreen;