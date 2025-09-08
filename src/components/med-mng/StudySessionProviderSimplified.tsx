import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface StudySession {
  id: string;
  title: string;
  subject: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}

interface StudySessionState {
  currentSession: StudySession | null;
  isActive: boolean;
  isPaused: boolean;
  elapsedTime: number;
}

interface StudySessionContextType extends StudySessionState {
  startSession: (title: string, subject: string) => Promise<StudySession>;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => Promise<StudySession | null>;
  cancelSession: () => void;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

const initialState: StudySessionState = {
  currentSession: null,
  isActive: false,
  isPaused: false,
  elapsedTime: 0
};

export const StudySessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StudySessionState>(initialState);
  const { toast } = useToast();

  // Timer pour suivre le temps écoulé
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state.isActive && !state.isPaused && state.currentSession) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1
        }));
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isActive, state.isPaused]);

  const startSession = useCallback(async (title: string, subject: string): Promise<StudySession> => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      title,
      subject,
      startTime: new Date(),
      duration: 0,
      status: 'active'
    };

    setState(prev => ({
      ...prev,
      currentSession: newSession,
      isActive: true,
      isPaused: false,
      elapsedTime: 0
    }));

    toast({
      title: "📚 Session d'étude démarrée",
      description: `Bonne étude de ${subject} !`
    });

    return newSession;
  }, [toast]);

  const pauseSession = useCallback(() => {
    if (!state.currentSession || !state.isActive) return;

    setState(prev => ({
      ...prev,
      isPaused: true,
      currentSession: prev.currentSession ? {
        ...prev.currentSession,
        status: 'paused'
      } : null
    }));

    toast({
      title: "⏸️ Session en pause",
      description: "Prenez une pause bien méritée !"
    });
  }, [state.currentSession, state.isActive, toast]);

  const resumeSession = useCallback(() => {
    if (!state.currentSession || !state.isPaused) return;

    setState(prev => ({
      ...prev,
      isPaused: false,
      currentSession: prev.currentSession ? {
        ...prev.currentSession,
        status: 'active'
      } : null
    }));

    toast({
      title: "▶️ Session reprise",
      description: "C'est reparti !"
    });
  }, [state.currentSession, state.isPaused, toast]);

  const endSession = useCallback(async (): Promise<StudySession | null> => {
    if (!state.currentSession) return null;

    const endTime = new Date();
    const finalDuration = state.elapsedTime;

    const completedSession: StudySession = {
      ...state.currentSession,
      endTime,
      duration: finalDuration,
      status: 'completed'
    };

    setState(prev => ({
      ...prev,
      currentSession: null,
      isActive: false,
      isPaused: false,
      elapsedTime: 0
    }));

    toast({
      title: "✅ Session terminée !",
      description: `Bravo ! Vous avez étudié pendant ${Math.floor(finalDuration / 60)} minutes.`
    });

    return completedSession;
  }, [state.currentSession, state.elapsedTime, toast]);

  const cancelSession = useCallback(() => {
    if (!state.currentSession) return;

    setState(prev => ({
      ...prev,
      currentSession: null,
      isActive: false,
      isPaused: false,
      elapsedTime: 0
    }));

    toast({
      title: "❌ Session annulée",
      description: "Votre session d'étude a été annulée."
    });
  }, [state.currentSession, toast]);

  const contextValue: StudySessionContextType = {
    ...state,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    cancelSession
  };

  return (
    <StudySessionContext.Provider value={contextValue}>
      {children}
    </StudySessionContext.Provider>
  );
};

export const useStudySession = (): StudySessionContextType => {
  const context = useContext(StudySessionContext);
  if (!context) {
    throw new Error('useStudySession must be used within a StudySessionProvider');
  }
  return context;
};

export default StudySessionProvider;