import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, Palette, Type, Volume2, VolumeX, 
  Contrast, Eye, MousePointer, Keyboard,
  Sun, Moon, Smartphone, Monitor, Laptop
} from 'lucide-react';
import { useAccessibility } from '@/components/ui/AccessibilityProvider';
import { useTheme } from '@/components/ui/theme-provider';

/**
 * Contrôles globaux d'accessibilité et de personnalisation
 */
export const GlobalControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const { 
    isHighContrast, 
    setHighContrast, 
    isFocusVisible, 
    setFocusVisible,
    reducedMotion,
    setReducedMotion,
    fontSize,
    setFontSize
  } = useAccessibility();
  const { theme, setTheme } = useTheme();

  const fontSizeOptions = [
    { value: 'small', label: 'Petit', icon: 'Aa' },
    { value: 'medium', label: 'Moyen', icon: 'Aa' },
    { value: 'large', label: 'Grand', icon: 'Aa' }
  ] as const;

  const themeOptions = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Monitor }
  ] as const;

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 z-40 shadow-lg"
        aria-label="Ouvrir les contrôles d'accessibilité"
      >
        <Settings className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-40 w-80">
      <Card className="medical-card shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Contrôles d'Accessibilité
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
              aria-label="Fermer les contrôles"
            >
              ×
            </Button>
          </div>

          <div className="space-y-6">
            {/* Thème */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4" />
                <span className="font-medium text-sm">Thème</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={theme === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme(option.value)}
                      className="flex flex-col gap-1 h-auto py-2"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Taille de police */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Type className="w-4 h-4" />
                <span className="font-medium text-sm">Taille de police</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {fontSizeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={fontSize === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFontSize(option.value)}
                    className="flex flex-col gap-1 h-auto py-2"
                  >
                    <span 
                      className={`font-bold ${
                        option.value === 'small' ? 'text-xs' : 
                        option.value === 'large' ? 'text-lg' : 'text-sm'
                      }`}
                    >
                      {option.icon}
                    </span>
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Options d'accessibilité */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4" />
                <span className="font-medium text-sm">Accessibilité Visuelle</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Contrast className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Contraste élevé</span>
                  </div>
                  <Button
                    variant={isHighContrast ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHighContrast(!isHighContrast)}
                  >
                    {isHighContrast ? 'ON' : 'OFF'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Contours de focus</span>
                  </div>
                  <Button
                    variant={isFocusVisible ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFocusVisible(!isFocusVisible)}
                  >
                    {isFocusVisible ? 'ON' : 'OFF'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Mouvement réduit</span>
                  </div>
                  <Button
                    variant={reducedMotion ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReducedMotion(!reducedMotion)}
                  >
                    {reducedMotion ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Audio */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="w-4 h-4" />
                <span className="font-medium text-sm">Audio</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {audioEnabled ? (
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Sons d'interface</span>
                </div>
                <Button
                  variant={audioEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>

            {/* Indicateur de statut */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Paramètres sauvegardés
                </span>
                <Badge variant="secondary" className="text-xs">
                  Auto
                </Badge>
              </div>
            </div>

            {/* Raccourcis clavier */}
            <div className="pt-2">
              <details className="group">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  Raccourcis clavier disponibles
                </summary>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Recherche rapide</span>
                    <kbd className="px-1 bg-muted rounded">⌘K</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Aide</span>
                    <kbd className="px-1 bg-muted rounded">?</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Paramètres</span>
                    <kbd className="px-1 bg-muted rounded">⌘,</kbd>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};