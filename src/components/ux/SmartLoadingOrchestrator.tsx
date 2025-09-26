import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingState {
  id: string;
  label: string;
  progress?: number;
  status: 'loading' | 'success' | 'error' | 'pending';
  timestamp: number;
}

interface SmartLoadingContextType {
  startLoading: (id: string, label: string) => void;
  updateProgress: (id: string, progress: number) => void;
  setSuccess: (id: string, message?: string) => void;
  setError: (id: string, error?: string) => void;
  finishLoading: (id: string) => void;
  getLoadingState: (id: string) => LoadingState | undefined;
  getAllLoadingStates: () => LoadingState[];
  isAnyLoading: () => boolean;
}

const SmartLoadingContext = createContext<SmartLoadingContextType | undefined>(undefined);

export const useSmartLoading = () => {
  const context = useContext(SmartLoadingContext);
  if (!context) {
    throw new Error('useSmartLoading must be used within SmartLoadingProvider');
  }
  return context;
};

export const SmartLoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map());

  const startLoading = useCallback((id: string, label: string) => {
    setLoadingStates(prev => new Map(prev.set(id, {
      id,
      label,
      status: 'loading',
      timestamp: Date.now()
    })));
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setLoadingStates(prev => {
      const current = prev.get(id);
      if (!current) return prev;
      return new Map(prev.set(id, { ...current, progress: Math.min(100, Math.max(0, progress)) }));
    });
  }, []);

  const setSuccess = useCallback((id: string, message?: string) => {
    setLoadingStates(prev => {
      const current = prev.get(id);
      if (!current) return prev;
      return new Map(prev.set(id, { 
        ...current, 
        status: 'success',
        label: message || current.label
      }));
    });
    // Auto cleanup after success
    setTimeout(() => finishLoading(id), 2000);
  }, []);

  const setError = useCallback((id: string, error?: string) => {
    setLoadingStates(prev => {
      const current = prev.get(id);
      if (!current) return prev;
      return new Map(prev.set(id, { 
        ...current, 
        status: 'error',
        label: error || current.label
      }));
    });
  }, []);

  const finishLoading = useCallback((id: string) => {
    setLoadingStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const getLoadingState = useCallback((id: string) => {
    return loadingStates.get(id);
  }, [loadingStates]);

  const getAllLoadingStates = useCallback(() => {
    return Array.from(loadingStates.values());
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Array.from(loadingStates.values()).some(state => state.status === 'loading');
  }, [loadingStates]);

  // Auto cleanup old states
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setLoadingStates(prev => {
        const filtered = new Map();
        prev.forEach((state, id) => {
          if (now - state.timestamp < 30000) { // Keep for 30 seconds max
            filtered.set(id, state);
          }
        });
        return filtered;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SmartLoadingContext.Provider value={{
      startLoading,
      updateProgress,
      setSuccess,
      setError,
      finishLoading,
      getLoadingState,
      getAllLoadingStates,
      isAnyLoading
    }}>
      {children}
      <SmartLoadingOverlay />
    </SmartLoadingContext.Provider>
  );
};

const SmartLoadingOverlay: React.FC = () => {
  const { getAllLoadingStates } = useSmartLoading();
  const loadingStates = getAllLoadingStates();
  
  if (loadingStates.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {loadingStates.map((state) => (
        <LoadingStateCard key={state.id} state={state} />
      ))}
    </div>
  );
};

const LoadingStateCard: React.FC<{ state: LoadingState }> = ({ state }) => {
  const getIcon = () => {
    switch (state.status) {
      case 'loading': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'loading': return 'border-primary bg-primary/5';
      case 'success': return 'border-success bg-success/5';
      case 'error': return 'border-destructive bg-destructive/5';
      case 'pending': return 'border-muted bg-muted/5';
    }
  };

  return (
    <div className={cn(
      "bg-card border rounded-lg p-3 shadow-lg backdrop-blur-sm animate-slide-in-right",
      getStatusColor()
    )}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {state.label}
          </p>
          {state.progress !== undefined && (
            <div className="mt-1">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{state.progress}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};