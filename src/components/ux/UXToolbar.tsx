import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Undo2, 
  Redo2, 
  Keyboard, 
  Eye, 
  Settings, 
  HelpCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useUndoRedo } from './UndoRedoProvider';
import { toast } from '@/hooks/use-toast';

export const UXToolbar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { canUndo, canRedo, undo, redo } = useUndoRedo();

  const showShortcuts = () => {
    toast({
      title: "Raccourcis clavier",
      description: "Ctrl+Z: Annuler | Ctrl+Y: Refaire | Ctrl+H: Accueil | Ctrl+?: Aide"
    });
  };

  const showAccessibilityInfo = () => {
    toast({
      title: "Accessibilité",
      description: "Alt+A: Menu accessibilité | Tab: Navigation | Échap: Fermer"
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Card className="shadow-lg border bg-background/95 backdrop-blur-sm">
        <CardContent className="p-2">
          <div className="flex items-center gap-1">
            {/* Undo/Redo */}
            <Button
              size="sm"
              variant="ghost"
              onClick={undo}
              disabled={!canUndo}
              title="Annuler (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={redo}
              disabled={!canRedo}
              title="Refaire (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* Toggle expansion */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Réduire" : "Étendre"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>

            {/* Expanded tools */}
            {isExpanded && (
              <>
                <Separator orientation="vertical" className="h-6" />
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={showShortcuts}
                  title="Raccourcis clavier"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={showAccessibilityInfo}
                  title="Accessibilité"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toast({ title: "Paramètres", description: "Fonctionnalité à venir" })}
                  title="Paramètres"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toast({ title: "Aide", description: "Consultez la documentation pour plus d'informations" })}
                  title="Aide"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};