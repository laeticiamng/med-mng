// ==========================================
// ENHANCED LOADING STATES - États de chargement exceptionnels
// ==========================================

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Music, 
  BookOpen, 
  Stethoscope, 
  Brain,
  Heart,
  Zap,
  Sparkles,
  Download,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Pulsing Dots Loader
export const PulsingDots = memo(({ 
  size = "md", 
  color = "primary" 
}: { 
  size?: "sm" | "md" | "lg"; 
  color?: "primary" | "secondary" | "accent"; 
}) => {
  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3", 
    lg: "w-4 h-4"
  };

  const colors = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent"
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn("rounded-full", sizes[size], colors[color])}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );
});

// Medical Loading Animation
export const MedicalLoader = memo(({ 
  type = "general",
  message = "Chargement en cours...",
  showMessage = true
}: { 
  type?: "general" | "music" | "edn" | "analysis" | "upload";
  message?: string;
  showMessage?: boolean;
}) => {
  const getIcon = () => {
    switch (type) {
      case "music": return Music;
      case "edn": return BookOpen;
      case "analysis": return Brain;
      case "upload": return Upload;
      default: return Stethoscope;
    }
  };

  const getColor = () => {
    switch (type) {
      case "music": return "from-purple-500 to-pink-500";
      case "edn": return "from-blue-500 to-cyan-500";
      case "analysis": return "from-amber-500 to-orange-500";
      case "upload": return "from-green-500 to-emerald-500";
      default: return "from-primary to-accent";
    }
  };

  const Icon = getIcon();

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className={cn("w-16 h-16 rounded-full bg-gradient-to-r opacity-20", getColor())}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className={cn("p-3 rounded-full bg-gradient-to-r", getColor())}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={cn("absolute w-1 h-1 rounded-full bg-gradient-to-r", getColor())}
            style={{
              left: "50%",
              top: "50%",
              transformOrigin: `${20 + i * 10}px 0px`
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {showMessage && (
        <motion.p
          className="text-sm text-muted-foreground text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
});

// Skeleton Loader for Cards
export const SkeletonCard = memo(({ 
  lines = 3,
  showAvatar = false,
  showImage = false 
}: { 
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
}) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        {/* Header with avatar */}
        {showAvatar && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="w-24 h-3 bg-muted rounded animate-pulse" />
              <div className="w-16 h-2 bg-muted rounded animate-pulse" />
            </div>
          </div>
        )}

        {/* Image placeholder */}
        {showImage && (
          <div className="w-full h-48 bg-muted rounded-lg animate-pulse" />
        )}

        {/* Text lines */}
        <div className="space-y-3">
          {[...Array(lines)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-3 bg-muted rounded animate-pulse",
                i === lines - 1 ? "w-3/4" : "w-full"
              )}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <div className="w-20 h-8 bg-muted rounded animate-pulse" />
          <div className="w-16 h-8 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
});

// Progress Loader with Steps
export const SteppedProgress = memo(({ 
  steps,
  currentStep = 0,
  showLabels = true 
}: { 
  steps: string[];
  currentStep?: number;
  showLabels?: boolean;
}) => {
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="relative">
        <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
        
        {/* Step indicators */}
        <div className="absolute inset-0 flex justify-between items-center">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                index <= currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-muted-foreground/30 text-muted-foreground"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {index < currentStep ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                index + 1
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Step labels */}
      {showLabels && (
        <div className="grid grid-cols-3 gap-4 text-sm">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={cn(
                "text-center transition-colors duration-300",
                index <= currentStep
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {step}
            </motion.div>
          ))}
        </div>
      )}

      {/* Current step highlight */}
      <motion.div
        className="text-center"
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <p className="text-sm text-muted-foreground">
          Étape {currentStep + 1} sur {steps.length}
        </p>
        <p className="font-medium">{steps[currentStep]}</p>
      </motion.div>
    </div>
  );
});

// Floating Elements Loader
export const FloatingElements = memo(({ 
  elements = ["🩺", "💊", "🫀", "🧬"],
  duration = 3 
}: { 
  elements?: string[];
  duration?: number;
}) => {
  return (
    <div className="relative w-32 h-32 mx-auto">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute text-2xl"
          style={{
            left: "50%",
            top: "50%",
            transformOrigin: `0 ${40 + index * 10}px`
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: {
              duration: duration + index * 0.5,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              delay: index * 0.3
            }
          }}
        >
          {element}
        </motion.div>
      ))}
      
      {/* Center pulse */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      />
    </div>
  );
});

// Full Screen Loading Overlay
export const LoadingOverlay = memo(({ 
  visible = false,
  type = "general",
  message = "Chargement en cours...",
  progress,
  onCancel
}: { 
  visible?: boolean;
  type?: "general" | "music" | "edn" | "analysis" | "upload";
  message?: string;
  progress?: number;
  onCancel?: () => void;
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl"
          >
            <div className="text-center space-y-6">
              <MedicalLoader type={type} message={message} />
              
              {progress !== undefined && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {Math.round(progress)}% terminé
                  </p>
                </div>
              )}

              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Annuler
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default {
  PulsingDots,
  MedicalLoader,
  SkeletonCard,
  SteppedProgress,
  FloatingElements,
  LoadingOverlay
};