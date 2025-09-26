import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, Lightbulb, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type FeedbackType = 'success' | 'warning' | 'error' | 'info' | 'tip' | 'motivation';

interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  persistent?: boolean;
  priority?: number;
  category?: string;
}

interface IntelligentFeedbackContextType {
  showFeedback: (feedback: Omit<FeedbackMessage, 'id'>) => string;
  dismissFeedback: (id: string) => void;
  clearCategory: (category: string) => void;
  clearAll: () => void;
  getFeedbacks: () => FeedbackMessage[];
}

const IntelligentFeedbackContext = createContext<IntelligentFeedbackContextType | undefined>(undefined);

export const useIntelligentFeedback = () => {
  const context = useContext(IntelligentFeedbackContext);
  if (!context) {
    throw new Error('useIntelligentFeedback must be used within IntelligentFeedbackProvider');
  }
  return context;
};

export const IntelligentFeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackMessage[]>([]);

  const showFeedback = useCallback((feedback: Omit<FeedbackMessage, 'id'>) => {
    const id = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newFeedback: FeedbackMessage = {
      id,
      priority: 1,
      duration: 5000,
      ...feedback
    };

    setFeedbacks(prev => {
      // Remove duplicates by category if specified
      const filtered = feedback.category ? 
        prev.filter(f => f.category !== feedback.category) : prev;
      
      // Sort by priority (higher priority first)
      const updated = [...filtered, newFeedback].sort((a, b) => (b.priority || 0) - (a.priority || 0));
      
      // Keep max 5 feedbacks visible
      return updated.slice(0, 5);
    });

    // Auto dismiss if not persistent
    if (!feedback.persistent && feedback.duration !== 0) {
      setTimeout(() => {
        dismissFeedback(id);
      }, feedback.duration || 5000);
    }

    return id;
  }, []);

  const dismissFeedback = useCallback((id: string) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearCategory = useCallback((category: string) => {
    setFeedbacks(prev => prev.filter(f => f.category !== category));
  }, []);

  const clearAll = useCallback(() => {
    setFeedbacks([]);
  }, []);

  const getFeedbacks = useCallback(() => feedbacks, [feedbacks]);

  return (
    <IntelligentFeedbackContext.Provider value={{
      showFeedback,
      dismissFeedback,
      clearCategory,
      clearAll,
      getFeedbacks
    }}>
      {children}
      <FeedbackOverlay />
    </IntelligentFeedbackContext.Provider>
  );
};

const FeedbackOverlay: React.FC = () => {
  const { getFeedbacks } = useIntelligentFeedback();
  const feedbacks = getFeedbacks();

  if (feedbacks.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {feedbacks.map((feedback, index) => (
        <FeedbackCard 
          key={feedback.id} 
          feedback={feedback} 
          delay={index * 100}
        />
      ))}
    </div>
  );
};

const FeedbackCard: React.FC<{ feedback: FeedbackMessage; delay: number }> = ({ feedback, delay }) => {
  const { dismissFeedback } = useIntelligentFeedback();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getIcon = () => {
    switch (feedback.type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'info': return <Info className="h-5 w-5 text-info" />;
      case 'tip': return <Lightbulb className="h-5 w-5 text-accent" />;
      case 'motivation': return <Heart className="h-5 w-5 text-pink-500" />;
    }
  };

  const getThemeClasses = () => {
    switch (feedback.type) {
      case 'success': return 'border-success bg-success/5 text-foreground';
      case 'warning': return 'border-warning bg-warning/5 text-foreground';
      case 'error': return 'border-destructive bg-destructive/5 text-foreground';
      case 'info': return 'border-info bg-info/5 text-foreground';
      case 'tip': return 'border-accent bg-accent/5 text-foreground';
      case 'motivation': return 'border-pink-500 bg-pink-500/5 text-foreground';
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => dismissFeedback(feedback.id), 200);
  };

  return (
    <div className={cn(
      "bg-card border rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-out",
      getThemeClasses(),
      isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">
              {feedback.title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feedback.message}
            </p>
            {feedback.action && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={feedback.action.onClick}
              >
                {feedback.action.label}
              </Button>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Convenience hooks for specific feedback types
export const useFeedbackShortcuts = () => {
  const { showFeedback } = useIntelligentFeedback();

  return {
    showSuccess: (message: string, title = 'Succès') => 
      showFeedback({ type: 'success', title, message }),
    
    showError: (message: string, title = 'Erreur') => 
      showFeedback({ type: 'error', title, message, persistent: true }),
    
    showWarning: (message: string, title = 'Attention') => 
      showFeedback({ type: 'warning', title, message }),
    
    showInfo: (message: string, title = 'Information') => 
      showFeedback({ type: 'info', title, message }),
    
    showTip: (message: string, title = 'Astuce') => 
      showFeedback({ type: 'tip', title, message, duration: 7000 }),
    
    showMotivation: (message: string, title = 'Bravo !') => 
      showFeedback({ type: 'motivation', title, message, duration: 4000 }),
    
    showLearningFeedback: (message: string, action?: { label: string; onClick: () => void }) =>
      showFeedback({ 
        type: 'tip', 
        title: 'Apprentissage', 
        message, 
        action,
        category: 'learning',
        duration: 8000 
      })
  };
};
