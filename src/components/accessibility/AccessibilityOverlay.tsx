import React, { useState, useEffect } from 'react';
import { 
  Accessibility, 
  Eye, 
  EyeOff, 
  Type, 
  MousePointer, 
  Volume2,
  VolumeX,
  Settings,
  X,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AccessibilitySettings {
  highContrast: boolean;
  largeCursor: boolean;
  textSize: number;
  reducedMotion: boolean;
  screenReader: boolean;
  focusHighlight: boolean;
  soundEnabled: boolean;
  volume: number;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeCursor: false,
  textSize: 100,
  reducedMotion: false,
  screenReader: false,
  focusHighlight: true,
  soundEnabled: true,
  volume: 50
};

export const AccessibilityOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large cursor
    if (settings.largeCursor) {
      root.classList.add('large-cursor');
    } else {
      root.classList.remove('large-cursor');
    }

    // Text size
    root.style.setProperty('--accessibility-font-scale', `${settings.textSize / 100}`);

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Focus highlight
    if (settings.focusHighlight) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
  };

  const announceToScreenReader = (message: string) => {
    if (settings.screenReader) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  };

  return (
    <>
      {/* Floating Accessibility Button */}
      <Button
        onClick={() => {
          setIsOpen(!isOpen);
          announceToScreenReader(isOpen ? 'Panneau d\'accessibilité fermé' : 'Panneau d\'accessibilité ouvert');
        }}
        className={cn(
          "fixed bottom-4 right-4 z-50 rounded-full w-14 h-14 shadow-lg",
          "hover:scale-110 transition-transform duration-200",
          isOpen && "bg-primary/90"
        )}
        aria-label="Ouvrir les options d'accessibilité"
        title="Options d'accessibilité"
      >
        <Accessibility className="h-6 w-6" />
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Accessibility className="h-5 w-5" />
                  Options d'Accessibilité
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Visual Settings */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Paramètres visuels
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Contraste élevé</label>
                      <p className="text-sm text-muted-foreground">
                        Améliore la lisibilité avec des couleurs contrastées
                      </p>
                    </div>
                    <Switch
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => {
                        updateSetting('highContrast', checked);
                        announceToScreenReader(checked ? 'Contraste élevé activé' : 'Contraste élevé désactivé');
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-medium flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Taille du texte
                      </label>
                      <Badge variant="outline">
                        {settings.textSize}%
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.textSize]}
                      onValueChange={([value]) => updateSetting('textSize', value)}
                      min={75}
                      max={150}
                      step={5}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>75%</span>
                      <span>150%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium flex items-center gap-2">
                        <MousePointer className="h-4 w-4" />
                        Curseur large
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Augmente la taille du curseur de la souris
                      </p>
                    </div>
                    <Switch
                      checked={settings.largeCursor}
                      onCheckedChange={(checked) => updateSetting('largeCursor', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Motion Settings */}
              <div>
                <h3 className="font-semibold mb-4">Paramètres de mouvement</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Mouvement réduit</label>
                      <p className="text-sm text-muted-foreground">
                        Désactive les animations et transitions
                      </p>
                    </div>
                    <Switch
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Focus amélioré</label>
                      <p className="text-sm text-muted-foreground">
                        Contours plus visibles lors de la navigation clavier
                      </p>
                    </div>
                    <Switch
                      checked={settings.focusHighlight}
                      onCheckedChange={(checked) => updateSetting('focusHighlight', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Audio Settings */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  {settings.soundEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                  Paramètres audio
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Son activé</label>
                      <p className="text-sm text-muted-foreground">
                        Active les retours sonores de l'interface
                      </p>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                    />
                  </div>

                  {settings.soundEnabled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-medium">Volume</label>
                        <Badge variant="outline">
                          {settings.volume}%
                        </Badge>
                      </div>
                      <Slider
                        value={[settings.volume]}
                        onValueChange={([value]) => updateSetting('volume', value)}
                        min={0}
                        max={100}
                        step={5}
                        className="cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Screen Reader */}
              <div>
                <h3 className="font-semibold mb-4">Lecteur d'écran</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Annonces vocales</label>
                    <p className="text-sm text-muted-foreground">
                      Active les annonces pour les lecteurs d'écran
                    </p>
                  </div>
                  <Switch
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => updateSetting('screenReader', checked)}
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={resetSettings}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Réinitialiser les paramètres
                </Button>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Raccourcis clavier</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><kbd className="px-1 py-0.5 bg-background rounded text-xs">Alt + A</kbd> Accessibilité</div>
                  <div><kbd className="px-1 py-0.5 bg-background rounded text-xs">Alt + H</kbd> Contraste</div>
                  <div><kbd className="px-1 py-0.5 bg-background rounded text-xs">Alt + +</kbd> Agrandir texte</div>
                  <div><kbd className="px-1 py-0.5 bg-background rounded text-xs">Alt + -</kbd> Réduire texte</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Screen Reader Only Content */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" />
    </>
  );
};

export default AccessibilityOverlay;