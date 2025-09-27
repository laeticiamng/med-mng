import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

interface UndoRedoState<T = any> {
  past: T[];
  present: T;
  future: T[];
}

interface UndoRedoAction<T = any> {
  type: 'UNDO' | 'REDO' | 'SET' | 'CLEAR';
  payload?: T;
}

interface UndoRedoContextType<T = any> {
  state: UndoRedoState<T>;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  set: (newPresent: T) => void;
  clear: (initialState: T) => void;
}

const UndoRedoContext = createContext<UndoRedoContextType | null>(null);

function undoRedoReducer<T>(state: UndoRedoState<T>, action: UndoRedoAction<T>): UndoRedoState<T> {
  const { past, present, future } = state;

  switch (action.type) {
    case 'UNDO': {
      if (past.length === 0) return state;
      
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      
      return {
        past: newPast,
        present: previous,
        future: [present, ...future]
      };
    }

    case 'REDO': {
      if (future.length === 0) return state;
      
      const next = future[0];
      const newFuture = future.slice(1);
      
      return {
        past: [...past, present],
        present: next,
        future: newFuture
      };
    }

    case 'SET': {
      if (action.payload === undefined) return state;
      
      return {
        past: [...past, present].slice(-50), // Limit history to 50 items
        present: action.payload,
        future: []
      };
    }

    case 'CLEAR': {
      return {
        past: [],
        present: action.payload as T,
        future: []
      };
    }

    default:
      return state;
  }
}

interface UndoRedoProviderProps {
  children: ReactNode;
  initialState?: any;
}

export const UndoRedoProvider: React.FC<UndoRedoProviderProps> = ({ 
  children, 
  initialState = null 
}) => {
  const [state, dispatch] = useReducer(undoRedoReducer, {
    past: [],
    present: initialState,
    future: []
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const set = useCallback((newPresent: any) => {
    dispatch({ type: 'SET', payload: newPresent });
  }, []);

  const clear = useCallback((initialState: any) => {
    dispatch({ type: 'CLEAR', payload: initialState });
  }, []);

  const contextValue: UndoRedoContextType = {
    state,
    canUndo,
    canRedo,
    undo,
    redo,
    set,
    clear
  };

  return (
    <UndoRedoContext.Provider value={contextValue}>
      {children}
    </UndoRedoContext.Provider>
  );
};

export const useUndoRedo = <T = any>(): UndoRedoContextType<T> => {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error('useUndoRedo must be used within an UndoRedoProvider');
  }
  return context as UndoRedoContextType<T>;
};