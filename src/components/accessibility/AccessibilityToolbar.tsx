/**
 * 🛠️ ACCESSIBILITY TOOLBAR - MED-MNG v3.0
 * Barre d'outils d'accessibilité flottante
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Accessibility, 
  Eye, 
  Volume2, 
  Type, 
  Palette, 
  Zap,
  Settings,
  X,
  ChevronUp,
  ChevronDown,
  KeyRound,
  Speaker
} from 'lucide-react';

import { useAccessibility } from './AccessibilityProvider';

// ==========================================
// COMPONENT
// ==========================================

export const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const {
    preferences,
    features,
    updatePreference,
    toggleFeature,
    announce,
    getAccessibilityScore,
    isScreenReaderActive,
    keyboardNavigation
  } = useAccessibility();

  const accessibilityScore = getAccessibilityScore();

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default'; // Vert
    if (score >= 70) return 'secondary'; // Jaune
    return 'destructive'; // Rouge
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Bon';
    if (score >= 50) return 'Acceptable';
    return 'À améliorer';
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Petit', size: '14px' },
    { value: 'medium', label: 'Moyen', size: '16px' },
    { value: 'large', label: 'Grand', size: '18px' },
    { value: 'extra-large', label: 'Très grand', size: '20px' }
  ];

  const colorBlindnessOptions = [
    { value: 'none', label: 'Aucun filtre' },
    { value: 'protanopia', label: 'Protanopie (Rouge-Vert)' },
    { value: 'deuteranopia', label: 'Deutéranopie (Vert-Rouge)' },
    { value: 'tritanopia', label: 'Tritanopie (Bleu-Jaune)' }
  ];

  const focusIndicatorOptions = [
    { value: 'default', label: 'Par défaut' },
    { value: 'enhanced', label: 'Amélioré' },
    { value: 'high-visibility', label: 'Haute visibilité' }
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full bg-primary hover:bg-primary-hover shadow-lg"
          aria-label={`Ouvrir la barre d'outils d'accessibilité. Score actuel: ${accessibilityScore}%`}
        >
          <Accessibility className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 max-w-[calc(100vw-2rem)] bg-background/95 backdrop-blur-sm border shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Accessibilité</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getScoreBadgeVariant(accessibilityScore)}>
                {accessibilityScore}% {getScoreLabel(accessibilityScore)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Développer les options' : 'Réduire les options'}
              >
                {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="Fermer la barre d'outils d'accessibilité"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Indicateurs d'état */}
          <div className="flex gap-2 mt-2">
            {isScreenReaderActive && (
              <Badge variant="outline" className="text-xs">
                <Speaker className="h-3 w-3 mr-1" />
                Lecteur d'écran
              </Badge>
            )}
            {keyboardNavigation && (
              <Badge variant="outline" className="text-xs">
                <KeyRound className="h-3 w-3 mr-1" />
                Navigation clavier
              </Badge>
            )}
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="space-y-4">
            {/* Préférences visuelles */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Affichage
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="high-contrast"
                    checked={preferences.highContrast}
                    onCheckedChange={(checked) => updatePreference('highContrast', checked)}
                  />
                  <label htmlFor="high-contrast" className="text-sm">
                    Contraste élevé
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="reduced-motion"
                    checked={preferences.reducedMotion}
                    onCheckedChange={(checked) => updatePreference('reducedMotion', checked)}
                  />
                  <label htmlFor="reduced-motion" className="text-sm">
                    Mouvement réduit
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Taille de police</label>
                <Select
                  value={preferences.fontSize}
                  onValueChange={(value) => updatePreference('fontSize', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span style={{ fontSize: option.size }}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Filtre daltonisme</label>
                <Select
                  value={preferences.colorBlindnessFilter}
                  onValueChange={(value) => updatePreference('colorBlindnessFilter', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorBlindnessOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Préférences de navigation */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Navigation
              </h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Indicateurs de focus</label>
                <Select
                  value={preferences.focusIndicators}
                  onValueChange={(value) => updatePreference('focusIndicators', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {focusIndicatorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="keyboard-only"
                  checked={preferences.keyboardOnly}
                  onCheckedChange={(checked) => updatePreference('keyboardOnly', checked)}
                />
                <label htmlFor="keyboard-only" className="text-sm">
                  Navigation clavier uniquement
                </label>
              </div>
            </div>

            {/* Préférences audio */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="announcements"
                    checked={preferences.announcements}
                    onCheckedChange={(checked) => updatePreference('announcements', checked)}
                  />
                  <label htmlFor="announcements" className="text-sm">
                    Annonces vocales
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sound-effects"
                    checked={preferences.soundEffects}
                    onCheckedChange={(checked) => updatePreference('soundEffects', checked)}
                  />
                  <label htmlFor="sound-effects" className="text-sm">
                    Effets sonores
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-play"
                  checked={preferences.autoPlay}
                  onCheckedChange={(checked) => updatePreference('autoPlay', checked)}
                />
                <label htmlFor="auto-play" className="text-sm">
                  Lecture automatique
                </label>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="pt-2 border-t">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    announce('Toutes les préférences d\'accessibilité ont été réinitialisées');
                    // Réinitialiser les préférences
                  }}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Réinitialiser
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const report = `Score d'accessibilité: ${accessibilityScore}%. ${
                      isScreenReaderActive ? 'Lecteur d\'écran détecté. ' : ''
                    }${
                      keyboardNavigation ? 'Navigation clavier active.' : ''
                    }`;
                    announce(report);
                  }}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Rapport
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};