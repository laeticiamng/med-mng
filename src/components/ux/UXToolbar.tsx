import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Undo2, 
  Redo2, 
  Keyboard, 
  Accessibility,
  Eye,
  Volume2
} from 'lucide-react';
import { useUndoRedo } from './UndoRedoProvider';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useScreenReader, useHighContrast, useReducedMotion } from './AccessibilityEnhancements';

export const UXToolbar: React.FC = () => {
  const { canUndo, canRedo, undo, redo } = useUndoRedo();
  const { showShortcutsHelp } = useKeyboardShortcuts();
  const { announce } = useScreenReader();
  const isHighContrast = useHighContrast();
  const prefersReducedMotion = useReducedMotion();

  const toggleAccessibilityMode = () => {
    document.body.classList.toggle('accessibility-mode');
    announce('Mode accessibilité activé');
  };

  const toggleHighContrast = () => {
    document.body.classList.toggle('high-contrast');
    announce('Mode contraste élevé activé');
  };

  const announcePageInfo = () => {
    const pageTitle = document.title;
    const mainContent = document.querySelector('#main-content');
    const headingsCount = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
    
    announce(`Page ${pageTitle}. ${headingsCount} titres trouvés.`, 'assertive');
  };

  return (
    <TooltipProvider>
      <div 
        className="fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg"
        role="toolbar"
        aria-label="Outils d'accessibilité et de navigation"
      >
        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                aria-label="Annuler la dernière action (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Annuler (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                aria-label="Rétablir la dernière action (Ctrl+Y)"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rétablir (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          {/* Accessibility Tools */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={showShortcutsHelp}
                aria-label="Afficher les raccourcis clavier (Ctrl+/)"
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Raccourcis clavier (Ctrl+/)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAccessibilityMode}
                aria-label="Activer le mode accessibilité"
              >
                <Accessibility className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mode accessibilité</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleHighContrast}
                aria-label="Activer le mode contraste élevé"
                className={isHighContrast ? 'bg-accent' : ''}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Contraste élevé</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={announcePageInfo}
                aria-label="Annoncer les informations de la page"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Informations de la page</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          {prefersReducedMotion && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              Mouvement réduit
            </span>
          )}
          {isHighContrast && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Contraste élevé
            </span>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};