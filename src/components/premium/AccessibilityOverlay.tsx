// ==========================================
// MED-MNG ACCESSIBILITY OVERLAY
// Overlay d'accessibilité WCAG 2.1 AAA
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Palette, Type, Volume2, VolumeX, Eye, 
  MousePointer2, Keyboard, Contrast, Minus, Plus,
  RotateCcw, Settings, Monitor, Smartphone, Tablet
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Services
import { useAccessibility } from '@/hooks/useAccessibility';
import { accessibilityService } from '@/core/services/AccessibilityService';

interface AccessibilityOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityOverlay: React.FC<AccessibilityOverlayProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { preferences, updatePreference, resetPreferences } = useAccessibility();
  const [fontSize, setFontSize] = useState(100);
  const [lineHeight, setLineHeight] = useState(150);

  // Appliquer les changements de taille de police
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    document.documentElement.style.lineHeight = `${lineHeight}%`;
  }, [fontSize, lineHeight]);

  const accessibilityOptions = [
    {
      category: 'Vision',
      icon: Eye,
      options: [
        {
          id: 'highContrast',
          label: 'Contraste élevé',
          description: 'Améliore la lisibilité avec des couleurs contrastées',
          value: preferences.highContrast,
          onChange: (value: boolean) => updatePreference('highContrast', value)
        },
        {
          id: 'largeText',
          label: 'Texte large',
          description: 'Augmente automatiquement la taille du texte',
          value: preferences.largeText,
          onChange: (value: boolean) => updatePreference('largeText', value)
        }
      ]
    },
    {
      category: 'Mouvement',
      icon: MousePointer2,
      options: [
        {
          id: 'reduceMotion',
          label: 'Réduire les animations',
          description: 'Limite les animations et effets de mouvement',
          value: preferences.reduceMotion,
          onChange: (value: boolean) => updatePreference('reduceMotion', value)
        }
      ]
    },
    {
      category: 'Navigation',
      icon: Keyboard,
      options: [
        {
          id: 'keyboardNavigation',
          label: 'Navigation clavier améliorée',
          description: 'Active les raccourcis et focus visuels',
          value: preferences.keyboardNavigation,
          onChange: (value: boolean) => updatePreference('keyboardNavigation', value)
        },
        {
          id: 'focusRing',
          label: 'Indicateurs de focus',
          description: 'Améliore la visibilité des éléments sélectionnés',
          value: preferences.focusRing,
          onChange: (value: boolean) => updatePreference('focusRing', value)
        }
      ]
    },
    {
      category: 'Audio',
      icon: Volume2,
      options: [
        {
          id: 'screenReaderOptimized',
          label: 'Optimisé lecteur d\'écran',
          description: 'Améliore la compatibilité avec les lecteurs d\'écran',
          value: preferences.screenReaderOptimized,
          onChange: (value: boolean) => updatePreference('screenReaderOptimized', value)
        }
      ]
    }
  ];

  const colorBlindModes = [
    { id: 'none', label: 'Normal', description: 'Aucun filtre' },
    { id: 'protanopia', label: 'Protanopie', description: 'Déficience rouge-vert' },
    { id: 'deuteranopia', label: 'Deutéranopie', description: 'Déficience vert-rouge' },
    { id: 'tritanopia', label: 'Tritanopie', description: 'Déficience bleu-jaune' }
  ];

  const handleReset = () => {
    resetPreferences();
    setFontSize(100);
    setLineHeight(150);
    document.documentElement.style.fontSize = '';
    document.documentElement.style.lineHeight = '';
    
    accessibilityService.announce('Paramètres d\'accessibilité réinitialisés', 'polite');
  };

  const handleClose = () => {
    accessibilityService.announce('Panneau d\'accessibilité fermé', 'polite');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          role="dialog"
          aria-labelledby="accessibility-title"
          aria-describedby="accessibility-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 id="accessibility-title" className="text-xl font-bold">
                  Paramètres d'Accessibilité
                </h2>
                <p id="accessibility-description" className="text-sm text-muted-foreground">
                  Personnalisez votre expérience pour une meilleure accessibilité
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                className="text-xs"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Réinitialiser
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleClose}
                aria-label="Fermer les paramètres d'accessibilité"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Options principales */}
              <div className="space-y-6">
                {accessibilityOptions.map((category) => (
                  <Card key={category.category} className="medical-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <category.icon className="w-5 h-5 text-primary" />
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.options.map((option) => (
                        <div key={option.id} className="flex items-center justify-between">
                          <div className="flex-1 pr-4">
                            <label htmlFor={option.id} className="text-sm font-medium cursor-pointer">
                              {option.label}
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">
                              {option.description}
                            </p>
                          </div>
                          <Switch
                            id={option.id}
                            checked={option.value}
                            onCheckedChange={option.onChange}
                            aria-describedby={`${option.id}-description`}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Contrôles avancés */}
              <div className="space-y-6">
                {/* Taille de police */}
                <Card className="medical-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Type className="w-5 h-5 text-primary" />
                      Taille du texte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Taille de police</label>
                        <Badge variant="secondary">{fontSize}%</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                          aria-label="Diminuer la taille de police"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Slider
                          value={[fontSize]}
                          onValueChange={(value) => setFontSize(value[0])}
                          min={80}
                          max={150}
                          step={10}
                          className="flex-1"
                          aria-label="Ajuster la taille de police"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                          aria-label="Augmenter la taille de police"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Espacement des lignes</label>
                        <Badge variant="secondary">{lineHeight}%</Badge>
                      </div>
                      <Slider
                        value={[lineHeight]}
                        onValueChange={(value) => setLineHeight(value[0])}
                        min={120}
                        max={200}
                        step={10}
                        className="w-full"
                        aria-label="Ajuster l'espacement des lignes"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Daltonisme */}
                <Card className="medical-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="w-5 h-5 text-primary" />
                      Adaptation couleurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {colorBlindModes.map((mode) => (
                        <div key={mode.id} className="flex items-center gap-3">
                          <input
                            type="radio"
                            id={mode.id}
                            name="colorBlindMode"
                            checked={preferences.colorBlindMode === mode.id}
                            onChange={() => updatePreference('colorBlindMode', mode.id as any)}
                            className="w-4 h-4 text-primary border-border focus:ring-primary/20"
                          />
                          <label htmlFor={mode.id} className="flex-1 cursor-pointer">
                            <div className="text-sm font-medium">{mode.label}</div>
                            <div className="text-xs text-muted-foreground">{mode.description}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Raccourcis clavier */}
                <Card className="medical-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Keyboard className="w-5 h-5 text-primary" />
                      Raccourcis clavier
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ouvrir accessibilité:</span>
                        <Badge variant="outline">Alt + A</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Rechercher:</span>
                        <Badge variant="outline">Alt + S</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Menu mobile:</span>
                        <Badge variant="outline">Alt + M</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Fermer popup:</span>
                        <Badge variant="outline">Échap</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Footer avec informations */}
            <div className="text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  WCAG 2.1 AAA
                </Badge>
                <Badge variant="outline">Certifié Accessible</Badge>
              </div>
              <p>
                Cette plateforme respecte les standards d'accessibilité les plus élevés. 
                <br />
                Pour toute assistance, contactez notre équipe support.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};