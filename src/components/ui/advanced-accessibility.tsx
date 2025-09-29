import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Accessibility, 
  Volume2, 
  Mouse, 
  Keyboard,
  Monitor,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: number;
  focusVisibility: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  voiceControl: boolean;
}

interface AccessibilityReport {
  score: number;
  issues: Array<{
    level: 'error' | 'warning' | 'info';
    message: string;
    element?: string;
  }>;
}

export const AdvancedAccessibility: React.FC = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    fontSize: 16,
    focusVisibility: true,
    screenReader: false,
    keyboardNavigation: true,
    colorBlindness: 'none',
    voiceControl: false,
  });

  const [report, setReport] = useState<AccessibilityReport>({
    score: 0,
    issues: []
  });

  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Apply settings to document
    applyAccessibilitySettings();
  }, [settings]);

  const applyAccessibilitySettings = () => {
    const root = document.documentElement;

    // High contrast
    if (settings.highContrast) {
      root.style.setProperty('--background', '0 0% 0%');
      root.style.setProperty('--foreground', '0 0% 100%');
      root.style.setProperty('--card', '0 0% 10%');
      root.style.setProperty('--border', '0 0% 30%');
    } else {
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--card');
      root.style.removeProperty('--border');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Font size
    root.style.fontSize = `${settings.fontSize}px`;

    // Focus visibility
    if (settings.focusVisibility) {
      root.style.setProperty('--focus-ring', '2px solid hsl(var(--ring))');
    } else {
      root.style.setProperty('--focus-ring', 'none');
    }

    // Color blindness filters
    const filters = {
      none: 'none',
      protanopia: 'url(#protanopia)',
      deuteranopia: 'url(#deuteranopia)',
      tritanopia: 'url(#tritanopia)'
    };
    root.style.filter = filters[settings.colorBlindness];
  };

  const runAccessibilityAudit = async () => {
    setIsScanning(true);
    
    // Simulate accessibility audit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const issues: AccessibilityReport['issues'] = [];
    let score = 100;

    // Check for common accessibility issues
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push({
        level: 'error',
        message: `${images.length} image(s) sans attribut alt`,
        element: 'img'
      });
      score -= 20;
    }

    const buttons = document.querySelectorAll('button:not([aria-label]):not([title])');
    const buttonTexts = Array.from(buttons).filter(btn => !btn.textContent?.trim());
    if (buttonTexts.length > 0) {
      issues.push({
        level: 'warning',
        message: `${buttonTexts.length} bouton(s) sans texte accessible`,
        element: 'button'
      });
      score -= 10;
    }

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push({
        level: 'warning',
        message: 'Aucun titre trouvé dans la page',
        element: 'heading'
      });
      score -= 15;
    }

    const forms = document.querySelectorAll('input:not([aria-label]):not([id])');
    if (forms.length > 0) {
      issues.push({
        level: 'error',
        message: `${forms.length} champ(s) de formulaire sans label`,
        element: 'input'
      });
      score -= 25;
    }

    setReport({ score: Math.max(0, score), issues });
    setIsScanning(false);
  };

  const resetSettings = () => {
    setSettings({
      highContrast: false,
      reducedMotion: false,
      fontSize: 16,
      focusVisibility: true,
      screenReader: false,
      keyboardNavigation: true,
      colorBlindness: 'none',
      voiceControl: false,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* SVG Filters for Color Blindness */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia">
            <feColorMatrix values="0.567, 0.433, 0, 0, 0
                                 0.558, 0.442, 0, 0, 0
                                 0, 0.242, 0.758, 0, 0
                                 0, 0, 0, 1, 0"/>
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix values="0.625, 0.375, 0, 0, 0
                                 0.7, 0.3, 0, 0, 0
                                 0, 0.3, 0.7, 0, 0
                                 0, 0, 0, 1, 0"/>
          </filter>
          <filter id="tritanopia">
            <feColorMatrix values="0.95, 0.05, 0, 0, 0
                                 0, 0.433, 0.567, 0, 0
                                 0, 0.475, 0.525, 0, 0
                                 0, 0, 0, 1, 0"/>
          </filter>
        </defs>
      </svg>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Centre d'Accessibilité Avancé
          </CardTitle>
          <CardDescription>
            Configuration complète pour l'accessibilité et audit automatique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Accessibility Audit */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Audit d'Accessibilité</h3>
              <Button 
                onClick={runAccessibilityAudit}
                disabled={isScanning}
                className="flex items-center gap-2"
              >
                {isScanning ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                ) : (
                  <Settings className="w-4 h-4" />
                )}
                {isScanning ? 'Analyse...' : 'Analyser'}
              </Button>
            </div>

            {report.score > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Score d'accessibilité:</span>
                  <Badge variant={getScoreBadgeVariant(report.score)}>
                    {report.score}/100
                  </Badge>
                </div>

                {report.issues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Problèmes détectés:</h4>
                    {report.issues.map((issue, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-2 p-3 rounded-lg border"
                      >
                        {issue.level === 'error' ? (
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{issue.message}</p>
                          {issue.element && (
                            <p className="text-xs text-muted-foreground">
                              Élément: {issue.element}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Visual Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Paramètres Visuels
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Contraste élevé</label>
                  <p className="text-xs text-muted-foreground">
                    Active les couleurs à fort contraste
                  </p>
                </div>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, highContrast: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Réduction des animations</label>
                  <p className="text-xs text-muted-foreground">
                    Réduit les mouvements et animations
                  </p>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, reducedMotion: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Visibilité du focus</label>
                  <p className="text-xs text-muted-foreground">
                    Améliore la visibilité des éléments focalisés
                  </p>
                </div>
                <Switch
                  checked={settings.focusVisibility}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, focusVisibility: checked }))
                  }
                />
              </div>

              <div className="space-y-2 p-3 border rounded-lg">
                <label className="text-sm font-medium">Daltonisme</label>
                <Select
                  value={settings.colorBlindness}
                  onValueChange={(value: AccessibilitySettings['colorBlindness']) =>
                    setSettings(prev => ({ ...prev, colorBlindness: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    <SelectItem value="protanopia">Protanopie</SelectItem>
                    <SelectItem value="deuteranopia">Deutéranopie</SelectItem>
                    <SelectItem value="tritanopia">Tritanopie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Taille de police: {settings.fontSize}px
              </label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => 
                  setSettings(prev => ({ ...prev, fontSize: value }))
                }
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Navigation Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Navigation et Contrôles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Navigation clavier</label>
                  <p className="text-xs text-muted-foreground">
                    Optimise la navigation au clavier
                  </p>
                </div>
                <Switch
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, keyboardNavigation: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Lecteur d'écran</label>
                  <p className="text-xs text-muted-foreground">
                    Mode optimisé pour lecteurs d'écran
                  </p>
                </div>
                <Switch
                  checked={settings.screenReader}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, screenReader: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Contrôle vocal</label>
                  <p className="text-xs text-muted-foreground">
                    Active les commandes vocales
                  </p>
                </div>
                <Switch
                  checked={settings.voiceControl}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, voiceControl: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t">
            <Button variant="outline" onClick={resetSettings} className="w-full">
              Réinitialiser les paramètres
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};