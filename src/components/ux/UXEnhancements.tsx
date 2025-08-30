import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Zap, 
  Eye, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Maximize2, 
  Minimize2,
  Accessibility,
  Settings,
  Palette,
  Type,
  MousePointer,
  Keyboard
} from 'lucide-react';

interface UXEnhancementsProps {
  className?: string;
}

export const UXEnhancements: React.FC<UXEnhancementsProps> = ({ className }) => {
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();
  
  const [preferences, setPreferences] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    soundEnabled: true,
    focusVisible: true,
    compactMode: false
  });

  // Appliquer les préférences d'accessibilité
  useEffect(() => {
    const root = document.documentElement;
    
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (preferences.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    if (preferences.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
    
    // Taille de police
    const fontSize = preferences.largeText ? 'large' : 'normal';
    root.setAttribute('data-font-size', fontSize);
    
  }, [preferences]);

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      title: "Préférence mise à jour",
      description: `${key} ${preferences[key] ? 'désactivé' : 'activé'}`,
      duration: 2000
    });
  };

  const shortcuts = [
    { key: 'Alt + H', action: 'Accueil' },
    { key: 'Alt + S', action: 'Recherche' },
    { key: 'Alt + N', action: 'Navigation' },
    { key: 'Alt + ?', action: 'Aide' },
    { key: 'Esc', action: 'Fermer modal' },
    { key: 'Tab', action: 'Navigation clavier' }
  ];

  const animations = {
    container: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0.1 : 0.5,
          staggerChildren: shouldReduceMotion ? 0 : 0.1
        }
      }
    },
    item: {
      hidden: { opacity: 0, x: -20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: shouldReduceMotion ? 0.1 : 0.3 }
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animations.container}
      className={className}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-primary" />
            Améliorations UX & Accessibilité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contrôles d'accessibilité */}
          <motion.div variants={animations.item} className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Accessibilité Visuelle
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={preferences.highContrast ? "default" : "outline"}
                size="sm"
                onClick={() => togglePreference('highContrast')}
                className="justify-start"
              >
                <Palette className="h-4 w-4 mr-2" />
                Contraste élevé
              </Button>
              <Button
                variant={preferences.largeText ? "default" : "outline"}
                size="sm"
                onClick={() => togglePreference('largeText')}
                className="justify-start"
              >
                <Type className="h-4 w-4 mr-2" />
                Texte large
              </Button>
            </div>
          </motion.div>

          {/* Contrôles d'interaction */}
          <motion.div variants={animations.item} className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Interactions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={preferences.reducedMotion ? "default" : "outline"}
                size="sm"
                onClick={() => togglePreference('reducedMotion')}
                className="justify-start"
              >
                {preferences.reducedMotion ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Mouvement réduit
              </Button>
              <Button
                variant={preferences.focusVisible ? "default" : "outline"}
                size="sm"
                onClick={() => togglePreference('focusVisible')}
                className="justify-start"
              >
                <Zap className="h-4 w-4 mr-2" />
                Focus visible
              </Button>
            </div>
          </motion.div>

          {/* Audio et son */}
          <motion.div variants={animations.item} className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              {preferences.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              Audio
            </h3>
            <Button
              variant={preferences.soundEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => togglePreference('soundEnabled')}
              className="w-full justify-start"
            >
              {preferences.soundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
              Sons d'interface {preferences.soundEnabled ? 'activés' : 'désactivés'}
            </Button>
          </motion.div>

          {/* Interface */}
          <motion.div variants={animations.item} className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Interface
            </h3>
            <Button
              variant={preferences.compactMode ? "default" : "outline"}
              size="sm"
              onClick={() => togglePreference('compactMode')}
              className="w-full justify-start"
            >
              {preferences.compactMode ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
              Mode {preferences.compactMode ? 'compact' : 'standard'}
            </Button>
          </motion.div>

          {/* Raccourcis clavier */}
          <motion.div variants={animations.item} className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Raccourcis Clavier
            </h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">{shortcut.action}</span>
                  <Badge variant="outline" className="text-xs font-mono">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>

          {/* État des améliorations */}
          <motion.div variants={animations.item} className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Améliorations UX actives
              </span>
              <Badge className="bg-success/20 text-success">
                {Object.values(preferences).filter(Boolean).length} / {Object.keys(preferences).length}
              </Badge>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Hook pour les raccourcis clavier globaux
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        switch (event.key) {
          case 'h':
            event.preventDefault();
            window.location.href = '/';
            break;
          case 's':
            event.preventDefault();
            const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
            break;
          case 'n':
            event.preventDefault();
            // Focus sur la navigation
            const nav = document.querySelector('nav');
            if (nav) {
              const firstButton = nav.querySelector('button');
              if (firstButton) {
                firstButton.focus();
              }
            }
            break;
          case '?':
            event.preventDefault();
            // Ouvrir l'aide
            break;
        }
      }
      
      if (event.key === 'Escape') {
        // Fermer les modales ouvertes
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('[data-close]') as HTMLButtonElement;
          if (closeButton) {
            closeButton.click();
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};