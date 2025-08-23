import React, { createContext, useContext, useCallback, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UndoRedoAction {
  id: string;
  description: string;
  undo: () => void | Promise<void>;
  redo: () => void | Promise<void>;
  timestamp: number;
}

interface UndoRedoContextType {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  addAction: (action: Omit<UndoRedoAction, 'id' | 'timestamp'>) => void;
  clear: () => void;
}

const UndoRedoContext = createContext<UndoRedoContextType | null>(null);

export const UndoRedoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [undoStack, setUndoStack] = useState<UndoRedoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoRedoAction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addAction = useCallback((action: Omit<UndoRedoAction, 'id' | 'timestamp'>) => {
    const newAction: UndoRedoAction = {
      ...action,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };

    setUndoStack(prev => [...prev, newAction].slice(-50)); // Limite à 50 actions
    setRedoStack([]); // Clear redo stack when new action is added
  }, []);

  const undo = useCallback(async () => {
    if (undoStack.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const action = undoStack[undoStack.length - 1];

    try {
      await action.undo();
      setUndoStack(prev => prev.slice(0, -1));
      setRedoStack(prev => [...prev, action]);
      
      toast({
        title: "Action annulée",
        description: action.description,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            className="gap-1"
          >
            <Redo2 className="h-3 w-3" />
            Rétablir
          </Button>
        )
      });
    } catch (error) {
      toast({
        title: "Erreur lors de l'annulation",
        description: "Impossible d'annuler cette action",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [undoStack, isProcessing]);

  const redo = useCallback(async () => {
    if (redoStack.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const action = redoStack[redoStack.length - 1];

    try {
      await action.redo();
      setRedoStack(prev => prev.slice(0, -1));
      setUndoStack(prev => [...prev, action]);
      
      toast({
        title: "Action rétablie",
        description: action.description
      });
    } catch (error) {
      toast({
        title: "Erreur lors du rétablissement",
        description: "Impossible de rétablir cette action",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [redoStack, isProcessing]);

  const clear = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const value: UndoRedoContextType = {
    canUndo: undoStack.length > 0 && !isProcessing,
    canRedo: redoStack.length > 0 && !isProcessing,
    undo,
    redo,
    addAction,
    clear
  };

  return (
    <UndoRedoContext.Provider value={value}>
      {children}
    </UndoRedoContext.Provider>
  );
};

export const useUndoRedo = () => {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error('useUndoRedo must be used within UndoRedoProvider');
  }
  return context;
};