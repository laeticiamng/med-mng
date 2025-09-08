import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useAccessibility } from '@/components/ui/AccessibilityProvider';
import { 
  Palette, 
  Eye, 
  Zap, 
  Type, 
  Volume2, 
  Keyboard, 
  Monitor, 
  MousePointer,
  Headphones,
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ 
  isOpen, 
  onClose, 
  className 
}) => {
  const { 
    isHighContrast,
    isFocusVisible,
    reducedMotion,
    fontSize,
    screenReaderMode,
    keyboardNavigation,
    colorBlindMode,
    textSpacing,
    setHighContrast,
    setFocusVisible,
    setReducedMotion,
    setFontSize,
    setScreenReaderMode,
    setKeyboardNavigation,
    setColorBlindMode,
    setTextSpacing,
    announceToScreenReader
  } = useAccessibility();

  if (!isOpen) return null;

  const handleSettingChange = (setting: string, value: any) => {
    announceToScreenReader(`Paramètre ${setting} modifié`, 'polite');
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        className
      )}
      role="dialog"
      aria-labelledby="accessibility-panel-title"
      aria-modal="true"
    >
      <div className="fixed right-4 top-4 bottom-4 w-96 max-w-[calc(100vw-2rem)]">
        <Card className="h-full overflow-hidden shadow-2xl border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle 
                id="accessibility-panel-title"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Settings className="w-5 h-5 text-primary" />
                Accessibilité
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Fermer le panneau d'accessibilité"
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 overflow-y-auto h-[calc(100%-4rem)] pb-6">
            {/* Vision et Affichage */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium text-foreground">
                <Eye className="w-4 h-4 text-primary" />
                Vision et Affichage
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="high-contrast" className="text-sm font-medium cursor-pointer">
                    Contraste élevé
                  </label>
                  <Switch
                    id="high-contrast"
                    checked={isHighContrast}
                    onCheckedChange={(checked) => {
                      setHighContrast(checked);
                      handleSettingChange('contraste élevé', checked);
                    }}
                    aria-describedby="high-contrast-desc"
                  />
                </div>
                <p id="high-contrast-desc" className="text-xs text-muted-foreground">
                  Améliore la lisibilité avec des couleurs plus contrastées
                </p>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Taille de police
                  </label>
                  <Select
                    value={fontSize}
                    onValueChange={(value: 'small' | 'medium' | 'large') => {
                      setFontSize(value);
                      handleSettingChange('taille de police', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Petite</SelectItem>
                      <SelectItem value="medium">Normale</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Espacement du texte
                  </label>
                  <Select
                    value={textSpacing}
                    onValueChange={(value: 'normal' | 'wide' | 'extra-wide') => {
                      setTextSpacing(value);
                      handleSettingChange('espacement du texte', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="wide">Large</SelectItem>
                      <SelectItem value="extra-wide">Très large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Mode daltonisme
                  </label>
                  <Select
                    value={colorBlindMode}
                    onValueChange={(value: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => {
                      setColorBlindMode(value);
                      handleSettingChange('mode daltonisme', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      <SelectItem value="protanopia">Protanopie (rouge)</SelectItem>
                      <SelectItem value="deuteranopia">Deutéranopie (vert)</SelectItem>
                      <SelectItem value="tritanopia">Tritanopie (bleu)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Navigation et Interactions */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium text-foreground">
                <Keyboard className="w-4 h-4 text-primary" />
                Navigation et Interactions
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="focus-visible" className="text-sm font-medium cursor-pointer">
                    Indicateurs de focus visibles
                  </label>
                  <Switch
                    id="focus-visible"
                    checked={isFocusVisible}
                    onCheckedChange={(checked) => {
                      setFocusVisible(checked);
                      handleSettingChange('indicateurs de focus', checked);
                    }}
                    aria-describedby="focus-visible-desc"
                  />
                </div>
                <p id="focus-visible-desc" className="text-xs text-muted-foreground">
                  Améliore la navigation au clavier avec des indicateurs visuels
                </p>

                <div className="flex items-center justify-between">
                  <label htmlFor="keyboard-nav" className="text-sm font-medium cursor-pointer">
                    Navigation clavier optimisée
                  </label>
                  <Switch
                    id="keyboard-nav"
                    checked={keyboardNavigation}
                    onCheckedChange={(checked) => {
                      setKeyboardNavigation(checked);
                      handleSettingChange('navigation clavier', checked);
                    }}
                    aria-describedby="keyboard-nav-desc"
                  />
                </div>
                <p id="keyboard-nav-desc" className="text-xs text-muted-foreground">
                  Active les raccourcis clavier et la navigation séquentielle
                </p>

                <div className="flex items-center justify-between">
                  <label htmlFor="reduced-motion" className="text-sm font-medium cursor-pointer">
                    Réduire les animations
                  </label>
                  <Switch
                    id="reduced-motion"
                    checked={reducedMotion}
                    onCheckedChange={(checked) => {
                      setReducedMotion(checked);
                      handleSettingChange('animations réduites', checked);
                    }}
                    aria-describedby="reduced-motion-desc"
                  />
                </div>
                <p id="reduced-motion-desc" className="text-xs text-muted-foreground">
                  Désactive les animations pour réduire les distractions
                </p>
              </div>
            </div>

            <Separator />

            {/* Technologies d'assistance */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium text-foreground">
                <Headphones className="w-4 h-4 text-primary" />
                Technologies d'assistance
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="screen-reader" className="text-sm font-medium cursor-pointer">
                    Mode lecteur d'écran
                  </label>
                  <Switch
                    id="screen-reader"
                    checked={screenReaderMode}
                    onCheckedChange={(checked) => {
                      setScreenReaderMode(checked);
                      handleSettingChange('mode lecteur d\'écran', checked);
                    }}
                    aria-describedby="screen-reader-desc"
                  />
                </div>
                <p id="screen-reader-desc" className="text-xs text-muted-foreground">
                  Optimise l'interface pour les lecteurs d'écran
                </p>
              </div>
            </div>

            <Separator />

            {/* Actions rapides */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-medium text-foreground">
                <Zap className="w-4 h-4 text-primary" />
                Actions rapides
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Reset all settings to default
                    setHighContrast(false);
                    setFocusVisible(true);
                    setReducedMotion(false);
                    setFontSize('medium');
                    setScreenReaderMode(false);
                    setKeyboardNavigation(false);
                    setColorBlindMode('none');
                    setTextSpacing('normal');
                    announceToScreenReader('Paramètres d\'accessibilité réinitialisés', 'polite');
                  }}
                  className="text-xs"
                >
                  Réinitialiser
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Apply recommended settings
                    setHighContrast(true);
                    setFocusVisible(true);
                    setKeyboardNavigation(true);
                    setFontSize('large');
                    announceToScreenReader('Paramètres recommandés appliqués', 'polite');
                  }}
                  className="text-xs"
                >
                  Recommandés
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};