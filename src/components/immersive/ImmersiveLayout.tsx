import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveParticles } from './InteractiveParticles';
import { FloatingActionButton } from './FloatingActionButton';
import { PersonalizedWelcome } from './PersonalizedWelcome';
import { PlatformHeader } from '@/components/platform/PlatformHeader';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Settings, 
  Palette,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

interface ImmersiveLayoutProps {
  children: React.ReactNode;
  showParticles?: boolean;
  showWelcome?: boolean;
  theme?: 'default' | 'focus' | 'energy' | 'calm';
}

const themes = {
  default: {
    particles: ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'],
    background: 'primary',
    name: 'Classique'
  },
  focus: {
    particles: ['#3B82F6', '#1E40AF', '#1D4ED8'],
    background: 'secondary',
    name: 'Focus'
  },
  energy: {
    particles: ['#EF4444', '#F97316', '#EAB308', '#EC4899'],
    background: 'primary',
    name: 'Énergie'
  },
  calm: {
    particles: ['#10B981', '#059669', '#06B6D4', '#0891B2'],
    background: 'light',
    name: 'Zen'
  }
};

export const ImmersiveLayout: React.FC<ImmersiveLayoutProps> = ({
  children,
  showParticles = true,
  showWelcome = true,
  theme = 'default'
}) => {
  const { user } = useAuth();
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [particlesEnabled, setParticlesEnabled] = useState(showParticles);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>(theme);
  const [showSettings, setShowSettings] = useState(false);

  // Effets sonores
  useEffect(() => {
    if (!soundEnabled) return;

    const playHoverSound = () => {
      // Simulation d'un effet sonore doux
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    };

    // Ajouter des événements sonores aux boutons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', playHoverSound);
    });

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', playHoverSound);
      });
    };
  }, [soundEnabled]);

  const currentThemeConfig = themes[currentTheme];

  const settingsVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: -20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <ConsistentBackground variant={currentThemeConfig.background as any}>
        <div />
      </ConsistentBackground>
      
      {/* Particules interactives */}
      {particlesEnabled && (
        <InteractiveParticles 
          colors={currentThemeConfig.particles}
          density={isImmersiveMode ? 1.5 : 0.8}
          interactive={true}
        />
      )}

      {/* Header */}
      <PlatformHeader />

      {/* Contrôles d'immersion */}
      <div className="fixed top-20 right-4 z-40 space-y-2">
        {/* Bouton paramètres immersifs */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="bg-background/80 backdrop-blur-sm border-white/20 hover:bg-background/90"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Panel de contrôles */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              variants={settingsVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-background/95 backdrop-blur-sm border border-white/20 rounded-lg p-4 space-y-3 w-64 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Expérience
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {currentThemeConfig.name}
                </Badge>
              </div>

              {/* Mode immersif */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Mode Immersif</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsImmersiveMode(!isImmersiveMode)}
                  className={isImmersiveMode ? 'text-purple-600' : ''}
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </div>

              {/* Sons */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Effets Sonores</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={soundEnabled ? 'text-green-600' : 'text-red-600'}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>

              {/* Particules */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Particules</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setParticlesEnabled(!particlesEnabled)}
                  className={particlesEnabled ? 'text-blue-600' : 'text-gray-400'}
                >
                  {particlesEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>

              {/* Thèmes */}
              <div className="space-y-2">
                <span className="text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Thème
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(themes).map(([key, themeConfig]) => (
                    <Button
                      key={key}
                      variant={currentTheme === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentTheme(key as keyof typeof themes)}
                      className="text-xs"
                    >
                      {themeConfig.name}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contenu principal */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 py-8">
          {/* Message de bienvenue personnalisé */}
          {showWelcome && user && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-8"
            >
              <PersonalizedWelcome />
            </motion.div>
          )}

          {/* Contenu des pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: showWelcome && user ? 0.6 : 0.2, duration: 0.8 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>

      {/* Bouton d'action flottant */}
      <FloatingActionButton />

      {/* Effets visuels supplémentaires en mode immersif */}
      {isImmersiveMode && (
        <>
          {/* Aurore boréale */}
          <div className="fixed inset-0 pointer-events-none opacity-20">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/30 via-pink-500/20 to-transparent animate-pulse" />
            <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-blue-500/30 via-cyan-500/20 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Étoiles scintillantes */}
          <div className="fixed inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};