import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Accessibility, Eye, EyeOff, Volume2, VolumeX, 
  Type, Contrast, MousePointer, Keyboard, Settings,
  Minus, Plus, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  focusVisible: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindFriendly: boolean;
  largePointer: boolean;
  audioDescriptions: boolean;
}

export const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    highContrast: false,
    reducedMotion: false,
    focusVisible: false,
    screenReader: false,
    keyboardNavigation: false,
    colorBlindFriendly: false,
    largePointer: false,
    audioDescriptions: false
  });

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Sauvegarder et appliquer les paramètres
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applyAccessibilitySettings(settings);
  }, [settings]);

  const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
    const html = document.documentElement;
    
    // Font size
    html.setAttribute('data-font-size', 
      settings.fontSize <= 85 ? 'small' :
      settings.fontSize >= 115 ? 'large' : 'medium'
    );
    
    // High contrast
    html.classList.toggle('high-contrast', settings.highContrast);
    
    // Reduced motion
    html.classList.toggle('reduced-motion', settings.reducedMotion);
    
    // Focus visible
    html.classList.toggle('focus-visible', settings.focusVisible);
    
    // Large pointer
    if (settings.largePointer) {
      html.style.cursor = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggNEw4IDI0TDE2IDE2TDI0IDI0TDI4IDIwTDIwIDEyTDI4IDEyTDI4IDhMOCA0WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTEwIDZMMTAgMjBMMTYgMTRMMjIgMjBMMjQgMThMMTggMTJMMjQgMTJMMjQgMTBMMTAgNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=), auto';
    } else {
      html.style.cursor = '';
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 100,
      highContrast: false,
      reducedMotion: false,
      focusVisible: false,
      screenReader: false,
      keyboardNavigation: false,
      colorBlindFriendly: false,
      largePointer: false,
      audioDescriptions: false
    };
    setSettings(defaultSettings);
  };

  const getActiveCount = () => {
    return Object.entries(settings).filter(([key, value]) => 
      key !== 'fontSize' && value === true
    ).length;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full medical-btn-primary shadow-lg relative"
        aria-label="Ouvrir les options d'accessibilité"
      >
        <Accessibility className="w-6 h-6" />
        {getActiveCount() > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {getActiveCount()}
          </Badge>
        )}
      </Button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="absolute bottom-16 right-0 w-80"
          >
            <Card className="medical-card-premium">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Accessibility className="w-5 h-5 text-primary" />
                      Accessibilité
                    </CardTitle>
                    <CardDescription>
                      Personnalisez votre expérience d'utilisation
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetSettings}
                    className="p-2"
                    title="Réinitialiser"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Taille de police */}
                <div>
                  <Label className="medical-label flex items-center gap-2 mb-3">
                    <Type className="w-4 h-4" />
                    Taille de police: {settings.fontSize}%
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSetting('fontSize', Math.max(75, settings.fontSize - 10))}
                      disabled={settings.fontSize <= 75}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={([value]) => updateSetting('fontSize', value)}
                      min={75}
                      max={150}
                      step={5}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSetting('fontSize', Math.min(150, settings.fontSize + 10))}
                      disabled={settings.fontSize >= 150}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Options visuelles */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Options visuelles
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="high-contrast" className="text-sm">
                        Contraste élevé
                      </Label>
                      <Switch
                        id="high-contrast"
                        checked={settings.highContrast}
                        onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reduced-motion" className="text-sm">
                        Réduire les animations
                      </Label>
                      <Switch
                        id="reduced-motion"
                        checked={settings.reducedMotion}
                        onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="focus-visible" className="text-sm">
                        Focus visible renforcé
                      </Label>
                      <Switch
                        id="focus-visible"
                        checked={settings.focusVisible}
                        onCheckedChange={(checked) => updateSetting('focusVisible', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="large-pointer" className="text-sm">
                        Curseur aggrandi
                      </Label>
                      <Switch
                        id="large-pointer"
                        checked={settings.largePointer}
                        onCheckedChange={(checked) => updateSetting('largePointer', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Options d'interaction */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    <Keyboard className="w-4 h-4" />
                    Interaction
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="keyboard-nav" className="text-sm">
                        Navigation clavier
                      </Label>
                      <Switch
                        id="keyboard-nav"
                        checked={settings.keyboardNavigation}
                        onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="screen-reader" className="text-sm">
                        Lecteur d'écran
                      </Label>
                      <Switch
                        id="screen-reader"
                        checked={settings.screenReader}
                        onCheckedChange={(checked) => updateSetting('screenReader', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Raccourcis clavier */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <h5 className="text-xs font-medium mb-2">Raccourcis clavier</h5>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Alt + A: Ouvrir l'accessibilité</div>
                    <div>Alt + H: Aller à l'accueil</div>
                    <div>Alt + M: Menu principal</div>
                    <div>Esc: Fermer les modales</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};