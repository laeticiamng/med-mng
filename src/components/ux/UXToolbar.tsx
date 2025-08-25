import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Undo2, 
  Redo2, 
  Keyboard, 
  Accessibility,
  Eye,
  Volume2
} from 'lucide-react';

export const UXToolbar: React.FC = () => {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-lg p-2 shadow-medium"
      role="toolbar"
      aria-label="Outils d'accessibilité et de navigation"
    >
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => console.log('Undo clicked!')}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Annuler</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => console.log('Redo clicked!')}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Refaire</p>
          </TooltipContent>
        </Tooltip>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => console.log('Keyboard clicked!')}
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Navigation clavier</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => console.log('Accessibility clicked!')}
            >
              <Accessibility className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Options d'accessibilité</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => console.log('Vision clicked!')}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Aide visuelle</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => console.log('Audio clicked!')}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Feedback audio</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};