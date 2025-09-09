import React, { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Heart, Brain, Sparkles } from 'lucide-react';

interface SmartLoadingIndicatorProps {
  message?: string;
  progress?: number;
  showProgress?: boolean;
  variant?: 'minimal' | 'detailed' | 'interactive';
}

const SmartLoadingIndicator = memo<SmartLoadingIndicatorProps>(({ 
  message = 'Chargement en cours...', 
  progress = 0, 
  showProgress = false,
  variant = 'minimal'
}) => {
  const [currentIcon, setCurrentIcon] = useState(0);
  const [loadingTips, setLoadingTips] = useState('');

  const icons = [Stethoscope, Heart, Brain, Sparkles];
  const tips = [
    'Saviez-vous ? L\'IA musicale améliore la mémorisation de 40%',
    'Astuce : Utilisez les raccourcis clavier pour naviguer plus vite',
    'Info : Plus de 10 000 étudiants utilisent déjà MED-MNG',
    'Conseil : Activez le mode focus pour une concentration optimale'
  ];

  // Rotation des icônes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 800);

    return () => clearInterval(interval);
  }, [icons.length]);

  // Conseils rotatifs pour le chargement long
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTips(tips[Math.floor(Math.random() * tips.length)]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const CurrentIcon = icons[currentIcon];

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 text-primary"
        >
          <CurrentIcon className="w-full h-full" />
        </motion.div>
        <span className="ml-3 text-muted-foreground">{message}</span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-6" role="status" aria-live="polite">
        {/* Icône animée */}
        <div className="relative">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-16 h-16 text-primary relative z-10"
          >
            <CurrentIcon className="w-full h-full" />
          </motion.div>
          
          {/* Effet de pulsation */}
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-primary/20 rounded-full"
          />
        </div>

        {/* Message principal */}
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">{message}</p>
          
          {/* Barre de progression */}
          {showProgress && (
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          )}
        </div>

        {/* Conseils et astuces */}
        <AnimatePresence mode="wait">
          {loadingTips && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center max-w-md"
            >
              <p className="text-sm text-muted-foreground italic">
                {loadingTips}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Variant interactive
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-8" role="status" aria-live="polite">
      {/* Animation interactive */}
      <div className="relative w-24 h-24">
        {icons.map((Icon, index) => (
          <motion.div
            key={index}
            className={`absolute inset-0 w-full h-full ${
              index === currentIcon ? 'text-primary' : 'text-muted'
            }`}
            animate={{
              scale: index === currentIcon ? 1 : 0.5,
              opacity: index === currentIcon ? 1 : 0.3,
              rotate: index === currentIcon ? 0 : -90
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <Icon className="w-full h-full" />
          </motion.div>
        ))}
        
        {/* Cercles concentriques */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 border-2 border-primary/20 rounded-full"
            animate={{
              scale: [1, 1 + ring * 0.3],
              opacity: [0.3, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: ring * 0.5,
              ease: "easeOut"
            }}
            style={{
              width: `${100 + ring * 20}%`,
              height: `${100 + ring * 20}%`,
              left: `${-ring * 10}%`,
              top: `${-ring * 10}%`
            }}
          />
        ))}
      </div>

      {/* Interface interactive */}
      <div className="text-center space-y-4">
        <motion.h3 
          className="text-xl font-semibold text-foreground"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.h3>
        
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-80 h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]"
                initial={{ width: '0%' }}
                animate={{ 
                  width: `${progress}%`,
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ 
                  width: { duration: 0.5, ease: "easeOut" },
                  backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
                }}
              />
            </div>
          </div>
        )}

        {/* Points d'activité */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: dot * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      {/* Astuce en bas */}
      <AnimatePresence mode="wait">
        {loadingTips && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-card border rounded-lg p-4 max-w-sm text-center shadow-soft"
          >
            <p className="text-sm text-muted-foreground">
              💡 {loadingTips}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

SmartLoadingIndicator.displayName = 'SmartLoadingIndicator';

export default SmartLoadingIndicator;