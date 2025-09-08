import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StudySession {
  id: string;
  title: string;
  subject: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // en secondes
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  activities: StudyActivity[];
  metrics: StudyMetrics;
  goals: StudyGoal[];
}

interface StudyActivity {
  id: string;
  type: 'reading' | 'listening' | 'quiz' | 'practice' | 'review';
  name: string;
  duration: number;
  completed: boolean;
  score?: number;
  notes?: string;
  timestamp: Date;
}

interface StudyMetrics {
  focusTime: number; // temps de concentration réel
  breakTime: number; // temps de pause
  completionRate: number; // taux de completion des activités
  averageScore: number; // score moyen des quiz/évaluations
  streakDays: number; // jours consécutifs d'étude
  totalSessions: number; // nombre total de sessions
}

interface StudyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: 'minutes' | 'hours' | 'activities' | 'score';
  deadline?: Date;
  completed: boolean;
}

interface PomodoroSettings {
  workDuration: number; // 25 minutes par défaut
  shortBreakDuration: number; // 5 minutes
  longBreakDuration: number; // 15 minutes
  sessionsBeforeLongBreak: number; // 4 sessions
}

interface StudySessionState {
  currentSession: StudySession | null;
  isActive: boolean;
  isPaused: boolean;
  elapsedTime: number;
  pomodoroSettings: PomodoroSettings;
  todayStats: DailyStats;
  weeklyStats: WeeklyStats;
  recentSessions: StudySession[];
}

interface DailyStats {
  date: Date;
  totalStudyTime: number;
  sessionsCompleted: number;
  averageFocus: number;
  goalsAchieved: number;
}

interface WeeklyStats {
  weekStart: Date;
  totalStudyTime: number;
  sessionsCompleted: number;
  averageSessionDuration: number;
  mostStudiedSubject: string;
  streakDays: number;
}

interface StudySessionContextType extends StudySessionState {
  startSession: (title: string, subject: string, goals?: StudyGoal[]) => Promise<StudySession>;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => Promise<StudySession | null>;
  cancelSession: () => void;
  addActivity: (activity: Omit<StudyActivity, 'id' | 'timestamp'>) => void;
  updateActivity: (id: string, updates: Partial<StudyActivity>) => void;
  setGoals: (goals: StudyGoal[]) => void;
  updateGoal: (id: string, progress: number) => void;
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void;
  loadTodayStats: () => Promise<void>;
  loadWeeklyStats: () => Promise<void>;
  loadRecentSessions: () => Promise<void>;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

const defaultPomodoroSettings: PomodoroSettings = {
  workDuration: 25 * 60, // 25 minutes en secondes
  shortBreakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  sessionsBeforeLongBreak: 4
};

const initialState: StudySessionState = {
  currentSession: null,
  isActive: false,
  isPaused: false,
  elapsedTime: 0,
  pomodoroSettings: defaultPomodoroSettings,
  todayStats: {
    date: new Date(),
    totalStudyTime: 0,
    sessionsCompleted: 0,
    averageFocus: 0,
    goalsAchieved: 0
  },
  weeklyStats: {
    weekStart: new Date(),
    totalStudyTime: 0,
    sessionsCompleted: 0,
    averageSessionDuration: 0,
    mostStudiedSubject: '',
    streakDays: 0
  },
  recentSessions: []
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

  // Démarrer une session d'étude
  const startSession = useCallback(async (
    title: string, 
    subject: string, 
    goals?: StudyGoal[]
  ): Promise<StudySession> => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      title,
      subject,
      startTime: new Date(),
      duration: 0,
      status: 'active',
      activities: [],
      metrics: {
        focusTime: 0,
        breakTime: 0,
        completionRate: 0,
        averageScore: 0,
        streakDays: 0,
        totalSessions: 0
      },
      goals: goals || []
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

  // Mettre en pause la session
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

  // Reprendre la session
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

  // Terminer la session
  const endSession = useCallback(async (): Promise<StudySession | null> => {
    if (!state.currentSession) return null;

    const endTime = new Date();
    const finalDuration = state.elapsedTime;

    const completedSession: StudySession = {
      ...state.currentSession,
      endTime,
      duration: finalDuration,
      status: 'completed',
      metrics: {
        ...state.currentSession.metrics,
        focusTime: finalDuration,
        completionRate: state.currentSession.activities.length > 0 
          ? (state.currentSession.activities.filter(a => a.completed).length / state.currentSession.activities.length) * 100 
          : 0
      }
    };

    // Sauvegarder en base de données
    try {
      const { error } = await supabase
        .from('med_mng_study_sessions')
        .insert({
          title: completedSession.title,
          subject: completedSession.subject,
          duration: completedSession.duration,
          activities: completedSession.activities,
          metrics: completedSession.metrics,
          goals: completedSession.goals
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la session:', error);
    }

    setState(prev => ({
      ...prev,
      currentSession: null,
      isActive: false,
      isPaused: false,
      elapsedTime: 0,
      recentSessions: [completedSession, ...prev.recentSessions.slice(0, 9)]
    }));

    toast({
      title: "✅ Session terminée !",
      description: `Bravo ! Vous avez étudié pendant ${Math.floor(finalDuration / 60)} minutes.`
    });

    return completedSession;
  }, [state.currentSession, state.elapsedTime, toast]);

  // Annuler la session
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

  // Ajouter une activité
  const addActivity = useCallback((activity: Omit<StudyActivity, 'id' | 'timestamp'>) => {
    if (!state.currentSession) return;

    const newActivity: StudyActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      currentSession: prev.currentSession ? {
        ...prev.currentSession,
        activities: [...prev.currentSession.activities, newActivity]
      } : null
    }));
  }, [state.currentSession]);

  // Mettre à jour une activité
  const updateActivity = useCallback((id: string, updates: Partial<StudyActivity>) => {
    if (!state.currentSession) return;

    setState(prev => ({
      ...prev,
      currentSession: prev.currentSession ? {
        ...prev.currentSession,
        activities: prev.currentSession.activities.map(activity =>
          activity.id === id ? { ...activity, ...updates } : activity
        )
      } : null
    }));
  }, [state.currentSession]);

  // Définir les objectifs
  const setGoals = useCallback((goals: StudyGoal[]) => {
    if (!state.currentSession) return;

    setState(prev => ({
      ...prev,
      currentSession: prev.currentSession ? {
        ...prev.currentSession,
        goals
      } : null
    }));
  }, [state.currentSession]);

  // Mettre à jour un objectif
  const updateGoal = useCallback((id: string, progress: number) => {
    if (!state.currentSession) return;

    setState(prev => ({
      ...prev,
      currentSession: prev.currentSession ? {
        ...prev.currentSession,
        goals: prev.currentSession.goals.map(goal =>
          goal.id === id ? { 
            ...goal, 
            current: progress,
            completed: progress >= goal.target
          } : goal
        )
      } : null
    }));
  }, [state.currentSession]);

  // Mettre à jour les paramètres Pomodoro
  const updatePomodoroSettings = useCallback((settings: Partial<PomodoroSettings>) => {
    setState(prev => ({
      ...prev,
      pomodoroSettings: { ...prev.pomodoroSettings, ...settings }
    }));
  }, []);

  // Charger les statistiques du jour
  const loadTodayStats = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('med_mng_study_sessions')
        .select('*')
        .gte('created_at', today.toISOString())
        .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const todayStats: DailyStats = {
        date: today,
        totalStudyTime: data?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0,
        sessionsCompleted: data?.length || 0,
        averageFocus: data?.length ? 
          data.reduce((sum, session) => sum + (session.metrics?.focusTime || 0), 0) / data.length : 0,
        goalsAchieved: 0 // À calculer selon vos besoins
      };

      setState(prev => ({ ...prev, todayStats }));
    } catch (error) {
      console.error('Erreur lors du chargement des stats du jour:', error);
    }
  }, []);

  // Charger les statistiques de la semaine
  const loadWeeklyStats = useCallback(async () => {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('med_mng_study_sessions')
        .select('*')
        .gte('created_at', weekStart.toISOString());

      if (error) throw error;

      const weeklyStats: WeeklyStats = {
        weekStart,
        totalStudyTime: data?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0,
        sessionsCompleted: data?.length || 0,
        averageSessionDuration: data?.length ? 
          data.reduce((sum, session) => sum + (session.duration || 0), 0) / data.length : 0,
        mostStudiedSubject: '', // À calculer
        streakDays: 0 // À calculer
      };

      setState(prev => ({ ...prev, weeklyStats }));
    } catch (error) {
      console.error('Erreur lors du chargement des stats hebdomadaires:', error);
    }
  }, []);

  // Charger les sessions récentes
  const loadRecentSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('med_mng_study_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const recentSessions: StudySession[] = data?.map(session => ({
        id: session.id,
        title: session.title,
        subject: session.subject,
        startTime: new Date(session.created_at),
        endTime: session.ended_at ? new Date(session.ended_at) : undefined,
        duration: session.duration || 0,
        status: 'completed',
        activities: session.activities || [],
        metrics: session.metrics || initialState.currentSession?.metrics || {
          focusTime: 0,
          breakTime: 0,
          completionRate: 0,
          averageScore: 0,
          streakDays: 0,
          totalSessions: 0
        },
        goals: session.goals || []
      })) || [];

      setState(prev => ({ ...prev, recentSessions }));
    } catch (error) {
      console.error('Erreur lors du chargement des sessions récentes:', error);
    }
  }, []);

  const contextValue: StudySessionContextType = {
    ...state,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    cancelSession,
    addActivity,
    updateActivity,
    setGoals,
    updateGoal,
    updatePomodoroSettings,
    loadTodayStats,
    loadWeeklyStats,
    loadRecentSessions
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