import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Undo2, Redo2, Keyboard, Accessibility, Eye, Volume2 } from 'lucide-react';
import { useUndoRedo } from './UndoRedoProvider';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useScreenReader, useHighContrast, useReducedMotion } from './AccessibilityEnhancements';
export const UXToolbar: React.FC = () => {
  const {
    canUndo,
    canRedo,
    undo,
    redo
  } = useUndoRedo();
  const {
    showShortcutsHelp
  } = useKeyboardShortcuts();
  const {
    announce
  } = useScreenReader();
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
      <div className="flex items-center gap-2 p-2 bg-background/80 backdrop-blur-sm border rounded-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Annuler</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refaire</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={showShortcutsHelp}
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Raccourcis clavier</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAccessibilityMode}
            >
              <Accessibility className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mode accessibilité</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleHighContrast}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Contraste élevé</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={announcePageInfo}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Annoncer la page</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};