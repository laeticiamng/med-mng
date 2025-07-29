import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Grid3X3, 
  List, 
  Eye, 
  Maximize, 
  RotateCcw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import { TouchTargetWrapper } from '@/components/responsive/TouchTargetWrapper';

export type DisplayMode = 'cube' | 'ligne' | 'detail' | 'immersif';

interface MedMngModeDisplayProps {
  currentMode: DisplayMode;
  onModeChange: (mode: DisplayMode) => void;
  className?: string;
  children: React.ReactNode;
}

export const MedMngModeDisplay: React.FC<MedMngModeDisplayProps> = ({
  currentMode,
  onModeChange,
  className,
  children
}) => {
  const [previousMode, setPreviousMode] = useState<DisplayMode>('cube');

  const modes = [
    { 
      id: 'cube' as DisplayMode, 
      icon: Grid3X3, 
      label: 'Vue en cubes',
      description: 'Affichage en grille de cartes'
    },
    { 
      id: 'ligne' as DisplayMode, 
      icon: List, 
      label: 'Vue en ligne',
      description: 'Affichage en liste verticale'
    },
    { 
      id: 'detail' as DisplayMode, 
      icon: Eye, 
      label: 'Vue détaillée',
      description: 'Affichage avec informations complètes'
    },
    { 
      id: 'immersif' as DisplayMode, 
      icon: Maximize, 
      label: 'Vue immersive',
      description: 'Affichage plein écran'
    }
  ];

  const handleModeChange = (mode: DisplayMode) => {
    if (mode !== currentMode) {
      setPreviousMode(currentMode);
      onModeChange(mode);
    }
  };

  const resetToPreviousMode = () => {
    if (previousMode !== currentMode) {
      onModeChange(previousMode);
    }
  };

  return (
    <AccessibilityProvider>
      <div className={cn("w-full", className)}>
        {/* Contrôles des modes d'affichage */}
        <div className="flex flex-wrap items-center justify-between mb-6 p-4 bg-card border rounded-lg">
          <div className="flex flex-wrap gap-2">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = currentMode === mode.id;
              
              return (
                <TouchTargetWrapper key={mode.id} size="md" clickable>
                  <Button
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleModeChange(mode.id)}
                    className={cn(
                      "flex items-center gap-2 transition-all duration-200",
                      isActive && "ring-2 ring-primary/20",
                      "hover:scale-105"
                    )}
                    aria-label={`${mode.label} - ${mode.description}`}
                    aria-pressed={isActive}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </Button>
                </TouchTargetWrapper>
              );
            })}
          </div>

          {/* Bouton de retour au mode précédent */}
          {previousMode !== currentMode && (
            <TouchTargetWrapper size="md" clickable>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToPreviousMode}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                aria-label={`Retour au mode ${modes.find(m => m.id === previousMode)?.label}`}
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Retour</span>
              </Button>
            </TouchTargetWrapper>
          )}
        </div>

        {/* Contenu avec le mode d'affichage appliqué */}
        <div 
          className={cn(
            "transition-all duration-300",
            {
              // Vue cube (grille)
              "grid gap-4": currentMode === 'cube',
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4": currentMode === 'cube',
              
              // Vue ligne (liste)
              "flex flex-col gap-3": currentMode === 'ligne',
              
              // Vue détaillée
              "grid gap-6": currentMode === 'detail',
              "grid-cols-1 lg:grid-cols-2": currentMode === 'detail',
              
              // Vue immersive (plein écran)
              "fixed inset-0 z-50 bg-background overflow-auto p-4": currentMode === 'immersif',
              "grid gap-8 grid-cols-1": currentMode === 'immersif'
            }
          )}
          data-display-mode={currentMode}
          role="region"
          aria-label={`Contenu affiché en ${modes.find(m => m.id === currentMode)?.label}`}
        >
          {children}
        </div>
      </div>
    </AccessibilityProvider>
  );
};