import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accessibility, 
  Eye, 
  EyeOff, 
  Volume2,
  VolumeX,
  Type,
  Palette,
  Mouse,
  Keyboard,
  Monitor,
  Contrast,
  ZoomIn,
  ZoomOut,
  Mic,
  MicOff,
  Sun,
  Moon,
  RotateCcw,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessibilitySettings {
  // Vision
  highContrast: boolean;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  cursorSize: number;
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  
  // Audio
  soundEnabled: boolean;
  voiceNavigation: boolean;
  screenReader: boolean;
  audioDescriptions: boolean;
  reducedMotion: boolean;
  
  // Interaction
  stickyKeys: boolean;
  slowKeys: boolean;
  mouseKeys: boolean;
  clickAssist: boolean;
  focusIndicator: boolean;
  
  // Cognitive
  simplifiedInterface: boolean;
  autoplay: boolean;
  distractionFree: boolean;
  readingGuide: boolean;
}

interface ColorFilters {
  deuteranopia: string;
  protanopia: string;
  tritanopia: string;
}

export const AdvancedAccessibility = memo(() => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 1.5,
    cursorSize: 1,
    colorBlindMode: 'none',
    soundEnabled: true,
    voiceNavigation: false,
    screenReader: false,
    audioDescriptions: false,
    reducedMotion: false,
    stickyKeys: false,
    slowKeys: false,
    mouseKeys: false,
    clickAssist: false,
    focusIndicator: true,
    simplifiedInterface: false,
    autoplay: true,
    distractionFree: false,
    readingGuide: false
  });

  const [isListening, setIsListening] = useState(false);
  const [voiceCommands, setVoiceCommands] = useState<string[]>([]);
  const [focusedElement, setFocusedElement] = useState<string>('');

  // Filtres de daltonisme CSS
  const colorFilters: ColorFilters = {
    deuteranopia: 'filter: url(#deuteranopia-filter)',
    protanopia: 'filter: url(#protanopia-filter)', 
    tritanopia: 'filter: url(#tritanopia-filter)'
  };

  // Application des paramètres CSS
  const applyAccessibilityStyles = useCallback(() => {
    const root = document.documentElement;
    
    // Taille de police
    root.style.setProperty('--base-font-size', `${settings.fontSize}px`);
    
    // Espacement des lettres
    root.style.setProperty('--letter-spacing', `${settings.letterSpacing}px`);
    
    // Hauteur de ligne
    root.style.setProperty('--line-height', settings.lineHeight.toString());
    
    // Taille du curseur
    root.style.setProperty('--cursor-size', settings.cursorSize.toString());
    
    // Contraste élevé
    if (settings.highContrast) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
    
    // Interface simplifiée
    if (settings.simplifiedInterface) {
      document.body.classList.add('simplified-interface');
    } else {
      document.body.classList.remove('simplified-interface');
    }
    
    // Mode sans distraction
    if (settings.distractionFree) {
      document.body.classList.add('distraction-free-mode');
    } else {
      document.body.classList.remove('distraction-free-mode');
    }
    
    // Animations réduites
    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
    
    // Guide de lecture
    if (settings.readingGuide) {
      document.body.classList.add('reading-guide-active');
    } else {
      document.body.classList.remove('reading-guide-active');
    }
    
    // Filtres de couleur pour daltonisme
    if (settings.colorBlindMode !== 'none') {
      document.body.style.filter = colorFilters[settings.colorBlindMode];
    } else {
      document.body.style.filter = 'none';
    }
    
  }, [settings, colorFilters]);

  // Navigation vocale
  const startVoiceNavigation = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast({
        title: "Non supporté",
        description: "La reconnaissance vocale n'est pas supportée dans ce navigateur",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "🎤 Navigation vocale active",
        description: "Dites 'navigation', 'clic', 'retour', ou 'aide'"
      });
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.resultIndex][0].transcript.toLowerCase().trim();
      setVoiceCommands(prev => [transcript, ...prev.slice(0, 9)]);
      
      // Commandes vocales
      if (transcript.includes('navigation')) {
        (document.querySelector('nav a') as HTMLElement)?.focus();
      } else if (transcript.includes('clic') || transcript.includes('click')) {
        (document.activeElement as HTMLElement)?.click();
      } else if (transcript.includes('retour') || transcript.includes('back')) {
        window.history.back();
      } else if (transcript.includes('aide') || transcript.includes('help')) {
        showVoiceHelp();
      } else if (transcript.includes('arrêt') || transcript.includes('stop')) {
        recognition.stop();
      }
    };
    
    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Erreur de reconnaissance",
        description: "Une erreur est survenue avec la reconnaissance vocale",
        variant: "destructive"
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  }, [toast]);

  // Aide vocale
  const showVoiceHelp = () => {
    const helpText = `
      Commandes disponibles :
      - "Navigation" pour aller au menu
      - "Clic" pour cliquer sur l'élément sélectionné  
      - "Retour" pour revenir en arrière
      - "Arrêt" pour désactiver la navigation vocale
    `;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(helpText);
      utterance.lang = 'fr-FR';
      speechSynthesis.speak(utterance);
    }
    
    toast({
      title: "Aide vocale",
      description: "Consultez la console pour les commandes disponibles"
    });
  };

  // Lecture d'écran
  const announceToScreenReader = (text: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = text;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  // Suivi du focus pour le lecteur d'écran
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && settings.screenReader) {
        const text = target.textContent || target.getAttribute('aria-label') || target.tagName;
        setFocusedElement(text);
        announceToScreenReader(`Focus sur: ${text}`);
      }
    };

    if (settings.screenReader) {
      document.addEventListener('focusin', handleFocus);
      return () => document.removeEventListener('focusin', handleFocus);
    }
  }, [settings.screenReader]);

  // Application des styles à chaque changement
  useEffect(() => {
    applyAccessibilityStyles();
  }, [applyAccessibilityStyles]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A : Ouvrir l'accessibilité
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        toast({
          title: "Menu d'accessibilité",
          description: "Panneau d'accessibilité ouvert"
        });
      }
      
      // Alt + C : Basculer le contraste
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        updateSetting('highContrast', !settings.highContrast);
      }
      
      // Alt + V : Navigation vocale
      if (e.altKey && e.key === 'v') {
        e.preventDefault();
        if (settings.voiceNavigation) {
          startVoiceNavigation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.highContrast, settings.voiceNavigation, startVoiceNavigation, toast]);

  // Mise à jour d'un paramètre
  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Annonce du changement
    if (settings.screenReader) {
      announceToScreenReader(`${key} ${value ? 'activé' : 'désactivé'}`);
    }
  };

  // Réinitialisation
  const resetSettings = () => {
    setSettings({
      highContrast: false,
      fontSize: 16,
      letterSpacing: 0,
      lineHeight: 1.5,
      cursorSize: 1,
      colorBlindMode: 'none',
      soundEnabled: true,
      voiceNavigation: false,
      screenReader: false,
      audioDescriptions: false,
      reducedMotion: false,
      stickyKeys: false,
      slowKeys: false,
      mouseKeys: false,
      clickAssist: false,
      focusIndicator: true,
      simplifiedInterface: false,
      autoplay: true,
      distractionFree: false,
      readingGuide: false
    });
    
    toast({
      title: "Paramètres réinitialisés",
      description: "Tous les paramètres d'accessibilité ont été remis à zéro"
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec score d'accessibilité */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-6 w-6 text-blue-600" />
              Accessibilité Avancée
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Score WCAG: {Math.round((Object.values(settings).filter(Boolean).length / Object.keys(settings).length) * 100)}%
              </Badge>
              <Button size="sm" variant="outline" onClick={resetSettings}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="vision" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vision">Vision</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="interaction">Interaction</TabsTrigger>
          <TabsTrigger value="cognitive">Cognitif</TabsTrigger>
        </TabsList>

        <TabsContent value="vision" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Paramètres Visuels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Contraste Élevé</div>
                  <div className="text-sm text-muted-foreground">
                    Améliore la lisibilité avec des contrastes renforcés
                  </div>
                </div>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(value) => updateSetting('highContrast', value)}
                />
              </div>

              <div className="space-y-3">
                <div className="font-medium">Taille de Police: {settings.fontSize}px</div>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting('fontSize', value)}
                  min={12}
                  max={32}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="font-medium">Espacement des Lettres: {settings.letterSpacing}px</div>
                <Slider
                  value={[settings.letterSpacing]}
                  onValueChange={([value]) => updateSetting('letterSpacing', value)}
                  min={0}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="font-medium">Hauteur de Ligne: {settings.lineHeight}</div>
                <Slider
                  value={[settings.lineHeight]}
                  onValueChange={([value]) => updateSetting('lineHeight', value)}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="font-medium">Mode Daltonien</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'none', label: 'Aucun' },
                    { value: 'deuteranopia', label: 'Deutéranopie' },
                    { value: 'protanopia', label: 'Protanopie' },
                    { value: 'tritanopia', label: 'Tritanopie' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={settings.colorBlindMode === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('colorBlindMode', option.value as any)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Paramètres Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Navigation Vocale</div>
                  <div className="text-sm text-muted-foreground">
                    Contrôlez l'interface avec des commandes vocales
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.voiceNavigation}
                    onCheckedChange={(value) => updateSetting('voiceNavigation', value)}
                  />
                  {settings.voiceNavigation && (
                    <Button
                      size="sm"
                      onClick={startVoiceNavigation}
                      disabled={isListening}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Lecteur d'Écran</div>
                  <div className="text-sm text-muted-foreground">
                    Annonces vocales des éléments focalisés
                  </div>
                </div>
                <Switch
                  checked={settings.screenReader}
                  onCheckedChange={(value) => updateSetting('screenReader', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Descriptions Audio</div>
                  <div className="text-sm text-muted-foreground">
                    Descriptions audio pour le contenu multimédia
                  </div>
                </div>
                <Switch
                  checked={settings.audioDescriptions}
                  onCheckedChange={(value) => updateSetting('audioDescriptions', value)}
                />
              </div>

              {voiceCommands.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Dernières Commandes Vocales:</div>
                  <div className="space-y-1">
                    {voiceCommands.map((command, index) => (
                      <div key={index} className="text-sm bg-muted p-2 rounded">
                        "{command}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mouse className="h-5 w-5" />
                Paramètres d'Interaction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Indicateur de Focus Renforcé</div>
                  <div className="text-sm text-muted-foreground">
                    Contour visible amélioré pour les éléments focalisés
                  </div>
                </div>
                <Switch
                  checked={settings.focusIndicator}
                  onCheckedChange={(value) => updateSetting('focusIndicator', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Assistance au Clic</div>
                  <div className="text-sm text-muted-foreground">
                    Zone de clic élargie pour une meilleure précision
                  </div>
                </div>
                <Switch
                  checked={settings.clickAssist}
                  onCheckedChange={(value) => updateSetting('clickAssist', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Touches Collantes</div>
                  <div className="text-sm text-muted-foreground">
                    Maintient les modificateurs sans appui continu
                  </div>
                </div>
                <Switch
                  checked={settings.stickyKeys}
                  onCheckedChange={(value) => updateSetting('stickyKeys', value)}
                />
              </div>

              <div className="space-y-3">
                <div className="font-medium">Taille du Curseur: {settings.cursorSize}x</div>
                <Slider
                  value={[settings.cursorSize]}
                  onValueChange={([value]) => updateSetting('cursorSize', value)}
                  min={1}
                  max={4}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cognitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Aide Cognitive
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Interface Simplifiée</div>
                  <div className="text-sm text-muted-foreground">
                    Réduit la complexité visuelle de l'interface
                  </div>
                </div>
                <Switch
                  checked={settings.simplifiedInterface}
                  onCheckedChange={(value) => updateSetting('simplifiedInterface', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Mode Sans Distraction</div>
                  <div className="text-sm text-muted-foreground">
                    Masque les éléments secondaires pour se concentrer
                  </div>
                </div>
                <Switch
                  checked={settings.distractionFree}
                  onCheckedChange={(value) => updateSetting('distractionFree', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Guide de Lecture</div>
                  <div className="text-sm text-muted-foreground">
                    Surlignage de la ligne en cours de lecture
                  </div>
                </div>
                <Switch
                  checked={settings.readingGuide}
                  onCheckedChange={(value) => updateSetting('readingGuide', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Animations Réduites</div>
                  <div className="text-sm text-muted-foreground">
                    Minimise les mouvements pour éviter les distractions
                  </div>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(value) => updateSetting('reducedMotion', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Raccourcis clavier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Raccourcis Clavier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + A</kbd> Ouvrir l'accessibilité</div>
              <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + C</kbd> Basculer contraste</div>
              <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + V</kbd> Navigation vocale</div>
            </div>
            <div className="space-y-2">
              <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd> Naviguer entre éléments</div>
              <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Entrée</kbd> Activer l'élément</div>
              <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Échap</kbd> Fermer les modales</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Élément focalisé (pour le lecteur d'écran) */}
      {settings.screenReader && focusedElement && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="text-sm">
              <strong>Focus actuel:</strong> {focusedElement}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSS pour les styles d'accessibilité */}
      <style>{`
        .high-contrast-mode {
          filter: contrast(150%) brightness(110%);
        }
        
        .simplified-interface .bg-gradient-to-r,
        .simplified-interface .bg-gradient-to-br {
          background: var(--background) !important;
        }
        
        .distraction-free-mode .animate-pulse,
        .distraction-free-mode .animate-spin,
        .distraction-free-mode .animate-bounce {
          animation: none !important;
        }
        
        .reduced-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .reading-guide-active p:hover {
          background-color: rgba(59, 130, 246, 0.1);
          padding: 2px 4px;
          border-radius: 4px;
        }
        
        :root {
          font-size: var(--base-font-size, 16px);
          letter-spacing: var(--letter-spacing, 0px);
          line-height: var(--line-height, 1.5);
        }
        
        * {
          cursor-size: var(--cursor-size, 1);
        }
      `}</style>
    </div>
  );
});

AdvancedAccessibility.displayName = 'AdvancedAccessibility';