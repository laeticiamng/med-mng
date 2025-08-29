import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  BarChart3, 
  Route, 
  Lightbulb,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Palette,
  Moon,
  Sun,
  Focus,
  Play,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressAnalytics } from './ProgressAnalytics';
import { SmartHints } from './SmartHints';
import { LearningPathSuggestions } from './LearningPathSuggestions';

interface LearningSettings {
  soundEnabled: boolean;
  immersiveMode: boolean;
  darkMode: boolean;
  focusMode: boolean;
  autoProgress: boolean;
  hintLevel: 'minimal' | 'normal' | 'verbose';
  animationSpeed: 'slow' | 'normal' | 'fast';
}

interface UserProgress {
  completedSections: Set<string>;
  timeSpent: Record<string, number>;
  performanceScores: Record<string, number>;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  preferredPace: 'slow' | 'normal' | 'fast';
}

interface EnhancedLearningExperienceProps {
  itemCode: string;
  currentSection: string;
  onSectionChange: (section: string) => void;
  children: React.ReactNode;
}

export const EnhancedLearningExperience: React.FC<EnhancedLearningExperienceProps> = ({
  itemCode,
  currentSection,
  onSectionChange,
  children
}) => {
  const [settings, setSettings] = useState<LearningSettings>({
    soundEnabled: true,
    immersiveMode: false,
    darkMode: false,
    focusMode: false,
    autoProgress: false,
    hintLevel: 'normal',
    animationSpeed: 'normal'
  });

  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedSections: new Set(['tableau-a']),
    timeSpent: {
      'tableau-a': 480,
      'tableau-b': 320,
      'scene': 600,
      'music': 180
    },
    performanceScores: {
      'tableau-a': 85,
      'quiz': 78
    },
    learningStyle: 'visual',
    preferredPace: 'normal'
  });

  const [activePanel, setActivePanel] = useState<'none' | 'analytics' | 'paths' | 'settings'>('none');
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [currentSectionStartTime, setSectionStartTime] = useState(Date.now());
  const [interactionCount, setInteractionCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Suivi du temps et des interactions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeInSection = (now - currentSectionStartTime) / 1000;
      
      setUserProgress(prev => ({
        ...prev,
        timeSpent: {
          ...prev.timeSpent,
          [currentSection]: (prev.timeSpent[currentSection] || 0) + 1
        }
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSection, currentSectionStartTime]);

  // Détection des changements de section
  useEffect(() => {
    setSectionStartTime(Date.now());
  }, [currentSection]);

  // Gestion des interactions utilisateur
  const handleInteraction = () => {
    setInteractionCount(prev => prev + 1);
  };

  // Calcul de la performance actuelle
  const getCurrentPerformance = () => {
    const avgScore = Object.values(userProgress.performanceScores).reduce((a, b) => a + b, 0) / 
      Object.values(userProgress.performanceScores).length || 75;
    return Math.round(avgScore);
  };

  // Gestion des paramètres
  const updateSetting = (key: keyof LearningSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Actions spécifiques selon le paramètre
    switch (key) {
      case 'immersiveMode':
        if (value) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
        break;
      case 'darkMode':
        document.documentElement.classList.toggle('dark', value);
        break;
      case 'focusMode':
        document.body.classList.toggle('focus-mode', value);
        break;
    }
  };

  // Gestion des parcours d'apprentissage
  const handlePathSelect = (path: any) => {
    console.log('Parcours sélectionné:', path);
    // Logique pour démarrer le parcours
    if (path.sections.length > 0) {
      onSectionChange(path.sections[0].type);
    }
  };

  // Panel des paramètres
  const SettingsPanel = () => (
    <Card className="w-80">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Paramètres d'apprentissage
        </h3>
        
        <div className="space-y-4">
          {/* Audio */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="text-sm">Son</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
            >
              {settings.soundEnabled ? 'Activé' : 'Désactivé'}
            </Button>
          </div>

          {/* Mode immersif */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.immersiveMode ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
              <span className="text-sm">Mode immersif</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateSetting('immersiveMode', !settings.immersiveMode)}
            >
              {settings.immersiveMode ? 'Plein écran' : 'Normal'}
            </Button>
          </div>

          {/* Thème sombre */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="text-sm">Thème</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateSetting('darkMode', !settings.darkMode)}
            >
              {settings.darkMode ? 'Sombre' : 'Clair'}
            </Button>
          </div>

          {/* Mode focus */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Focus className="h-4 w-4" />
              <span className="text-sm">Mode focus</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateSetting('focusMode', !settings.focusMode)}
            >
              {settings.focusMode ? 'Actif' : 'Inactif'}
            </Button>
          </div>

          {/* Niveau d'aide */}
          <div>
            <label className="text-sm font-medium mb-2 block">Niveau d'aide</label>
            <div className="flex gap-1">
              {(['minimal', 'normal', 'verbose'] as const).map(level => (
                <Button
                  key={level}
                  size="sm"
                  variant={settings.hintLevel === level ? 'default' : 'outline'}
                  onClick={() => updateSetting('hintLevel', level)}
                  className="text-xs"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Vitesse d'animation */}
          <div>
            <label className="text-sm font-medium mb-2 block">Vitesse d'animation</label>
            <div className="flex gap-1">
              {(['slow', 'normal', 'fast'] as const).map(speed => (
                <Button
                  key={speed}
                  size="sm"
                  variant={settings.animationSpeed === speed ? 'default' : 'outline'}
                  onClick={() => updateSetting('animationSpeed', speed)}
                  className="text-xs"
                >
                  {speed}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`relative ${settings.focusMode ? 'focus-mode' : ''}`}>
      {/* Barre d'outils flottante */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <Card className="bg-white/95 backdrop-blur-lg shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {/* Bouton lecture/pause */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              {/* Indicateur de section */}
              <Badge variant="secondary" className="px-3">
                {currentSection}
              </Badge>

              {/* Temps de session */}
              <div className="text-xs text-gray-500 px-2">
                {Math.floor((Date.now() - sessionStartTime) / 1000 / 60)}min
              </div>

              {/* Séparateur */}
              <div className="w-px h-6 bg-gray-300" />

              {/* Boutons de panel */}
              <Button
                size="sm"
                variant={activePanel === 'analytics' ? 'default' : 'ghost'}
                onClick={() => setActivePanel(activePanel === 'analytics' ? 'none' : 'analytics')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant={activePanel === 'paths' ? 'default' : 'ghost'}
                onClick={() => setActivePanel(activePanel === 'paths' ? 'none' : 'paths')}
              >
                <Route className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant={activePanel === 'settings' ? 'default' : 'ghost'}
                onClick={() => setActivePanel(activePanel === 'settings' ? 'none' : 'settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Panels flottants */}
      <AnimatePresence>
        {activePanel === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-40 max-w-md"
          >
            <ProgressAnalytics
              itemCode={itemCode}
              currentSection={currentSection}
              completedSections={userProgress.completedSections}
            />
          </motion.div>
        )}

        {activePanel === 'paths' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-4 z-40 max-w-2xl"
          >
            <LearningPathSuggestions
              itemCode={itemCode}
              currentSection={currentSection}
              userProgress={userProgress}
              onPathSelect={handlePathSelect}
              onSectionNavigate={onSectionChange}
            />
          </motion.div>
        )}

        {activePanel === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-4 z-40"
          >
            <SettingsPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hints intelligents */}
      {settings.hintLevel !== 'minimal' && (
        <SmartHints
          currentSection={currentSection}
          timeSpentInSection={(Date.now() - currentSectionStartTime) / 1000}
          interactionCount={interactionCount}
          performanceScore={getCurrentPerformance()}
          itemCode={itemCode}
        />
      )}

      {/* Contenu principal avec wrapper d'interaction */}
      <div 
        onClick={handleInteraction}
        onKeyDown={handleInteraction}
        className="min-h-screen"
      >
        {children}
      </div>

      {/* Overlay pour mode focus */}
      <AnimatePresence>
        {settings.focusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 pointer-events-none z-30"
          />
        )}
      </AnimatePresence>
    </div>
  );
};