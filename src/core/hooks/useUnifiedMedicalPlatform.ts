// ==========================================
// MED-MNG UNIFIED MEDICAL PLATFORM HOOK
// Hook centralisé pour toutes les fonctionnalités
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { unifiedAPIService } from '../services/UnifiedAPIService';
import { accessibilityService } from '../services/AccessibilityService';
import { PerformanceService } from '../services/PerformanceService';
import { appConfig } from '../config/AppConfig';
import { useToast } from '@/hooks/use-toast';

interface MedicalTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  videoUrl?: string;
  duration: number;
  tags: string[];
  specialty: string;
  difficulty: string;
  metadata: {
    createdAt: string;
    model: string;
    style: string;
  };
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  specialty: string;
  difficulty: string;
  tags: string[];
}

interface StudySession {
  id: string;
  type: 'music' | 'quiz' | 'reading' | 'practice';
  startTime: Date;
  endTime?: Date;
  duration: number;
  progress: number;
  score?: number;
  metadata: Record<string, any>;
}

interface PlatformState {
  // Génération musicale
  isGeneratingMusic: boolean;
  generatedTracks: MedicalTrack[];
  musicProgress: number;
  
  // Quiz et évaluations
  currentQuiz: QuizQuestion[] | null;
  quizProgress: number;
  quizResults: { score: number; answers: Record<string, number> } | null;
  
  // Session d'étude
  currentSession: StudySession | null;
  studySessions: StudySession[];
  totalStudyTime: number;
  
  // Performance et analytics
  performanceMetrics: any;
  learningProgress: Record<string, number>;
  
  // Préférences utilisateur
  preferences: {
    preferredSpecialties: string[];
    preferredDifficulty: string;
    studyGoals: string[];
    accessibilitySettings: any;
  };
  
  // État de l'interface
  loading: boolean;
  error: string | null;
  notifications: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
}

export const useUnifiedMedicalPlatform = () => {
  // État principal
  const [state, setState] = useState<PlatformState>({
    isGeneratingMusic: false,
    generatedTracks: [],
    musicProgress: 0,
    currentQuiz: null,
    quizProgress: 0,
    quizResults: null,
    currentSession: null,
    studySessions: [],
    totalStudyTime: 0,
    performanceMetrics: null,
    learningProgress: {},
    preferences: {
      preferredSpecialties: [],
      preferredDifficulty: 'intermédiaire',
      studyGoals: [],
      accessibilitySettings: {}
    },
    loading: false,
    error: null,
    notifications: []
  });

  const { toast } = useToast();
  const performanceService = useRef(new PerformanceService());
  const sessionStartTime = useRef<Date | null>(null);

  // ==========================================
  // INITIALISATION
  // ==========================================

  useEffect(() => {
    initializePlatform();
    return () => cleanup();
  }, []);

  const initializePlatform = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Charger les préférences utilisateur
      await loadUserPreferences();
      
      // Initialiser les services
      await initializeServices();
      
      // Charger les données de base
      await loadInitialData();
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      handleError('Erreur lors de l\'initialisation de la plateforme', error);
    }
  }, []);

  const loadUserPreferences = useCallback(async () => {
    try {
      const saved = localStorage.getItem('med-mng-preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        setState(prev => ({ ...prev, preferences }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    }
  }, []);

  const initializeServices = useCallback(async () => {
    // Test des connexions API
    const serviceStatus = unifiedAPIService.getServiceStatus();
    
    if (!serviceStatus.openai) {
      addNotification('Configuration OpenAI requise', 'info');
    }
    
    if (!serviceStatus.elevenlabs) {
      addNotification('Configuration ElevenLabs optionnelle', 'info');
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    // Charger l'historique des sessions
    await loadStudySessions();
    
    // Charger les métriques de performance
    const metrics = performanceService.current.getMetrics();
    setState(prev => ({ ...prev, performanceMetrics: metrics }));
  }, []);

  // ==========================================
  // GÉNÉRATION MUSICALE
  // ==========================================

  const generateMedicalMusic = useCallback(async (
    prompt: string,
    specialty: string,
    difficulty: string,
    style: string = 'educational'
  ) => {
    setState(prev => ({ ...prev, isGeneratingMusic: true, musicProgress: 0 }));
    
    try {
      const enhancedPrompt = `Chanson éducative médicale sur ${prompt}. 
        Spécialité: ${specialty}. 
        Niveau: ${difficulty}. 
        Style: ${style}. 
        Créez une mélodie engageante et éducative avec des paroles précises scientifiquement.`;

      // Génération via Suno
      const result = await unifiedAPIService.generateMusic({
        prompt: enhancedPrompt,
        style,
        duration: 180,
        model: 'chirp-v3-5'
      });

      if (result.success && result.data) {
        // Polling pour vérifier le statut
        const track = await pollMusicGeneration(result.data.id, specialty, difficulty);
        
        if (track) {
          setState(prev => ({
            ...prev,
            generatedTracks: [...prev.generatedTracks, track],
            isGeneratingMusic: false,
            musicProgress: 100
          }));
          
          addNotification('Chanson générée avec succès!', 'success');
          accessibilityService.announce('Nouvelle chanson médicale générée', 'polite');
        }
      } else {
        throw new Error(result.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      handleError('Erreur lors de la génération musicale', error);
      setState(prev => ({ ...prev, isGeneratingMusic: false }));
    }
  }, []);

  const pollMusicGeneration = useCallback(async (
    id: string, 
    specialty: string, 
    difficulty: string
  ): Promise<MedicalTrack | null> => {
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const status = await unifiedAPIService.getMusicStatus(id);
        
        if (status.success && status.data) {
          const progress = Math.min(95, (attempts / maxAttempts) * 100);
          setState(prev => ({ ...prev, musicProgress: progress }));

          if (status.data.status === 'completed' && status.data.audioUrl) {
            return {
              id: status.data.id,
              title: status.data.title || 'Chanson médicale',
              artist: 'MED-MNG AI',
              audioUrl: status.data.audioUrl,
              videoUrl: status.data.videoUrl,
              duration: status.data.metadata?.duration || 180,
              tags: status.data.tags || [],
              specialty,
              difficulty,
              metadata: {
                createdAt: status.data.metadata?.createdAt || new Date().toISOString(),
                model: status.data.metadata?.model || 'chirp-v3-5',
                style: 'educational'
              }
            };
          } else if (status.data.status === 'failed') {
            throw new Error('La génération a échoué');
          }
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Erreur lors du polling:', error);
        attempts++;
      }
    }

    throw new Error('Timeout lors de la génération');
  }, []);

  // ==========================================
  // QUIZ ET ÉVALUATIONS
  // ==========================================

  const generateMedicalQuiz = useCallback(async (
    topic: string,
    specialty: string,
    difficulty: string,
    questionCount: number = 10
  ) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await unifiedAPIService.generateMedicalContent(
        topic,
        difficulty as any,
        'quiz'
      );

      if (result.success && result.data) {
        // Parser le contenu généré en questions
        const questions = parseQuizContent(result.data.content, specialty, difficulty);
        
        setState(prev => ({
          ...prev,
          currentQuiz: questions.slice(0, questionCount),
          quizProgress: 0,
          quizResults: null,
          loading: false
        }));

        accessibilityService.announce(`Quiz sur ${topic} prêt`, 'polite');
      } else {
        throw new Error(result.error || 'Erreur lors de la génération du quiz');
      }
    } catch (error) {
      handleError('Erreur lors de la génération du quiz', error);
    }
  }, []);

  const parseQuizContent = useCallback((
    content: string, 
    specialty: string, 
    difficulty: string
  ): QuizQuestion[] => {
    // Parsing intelligent du contenu généré
    // Cette fonction devrait parser le JSON ou le texte structuré retourné par l'IA
    try {
      const parsed = JSON.parse(content);
      return parsed.questions?.map((q: any, index: number) => ({
        id: `q-${Date.now()}-${index}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        specialty,
        difficulty,
        tags: q.tags || []
      })) || [];
    } catch {
      // Fallback si ce n'est pas du JSON
      return [];
    }
  }, []);

  const submitQuizAnswer = useCallback((questionIndex: number, answerIndex: number) => {
    if (!state.currentQuiz) return;

    setState(prev => {
      if (!prev.quizResults) {
        return {
          ...prev,
          quizResults: { score: 0, answers: { [questionIndex]: answerIndex } }
        };
      }

      return {
        ...prev,
        quizResults: {
          ...prev.quizResults,
          answers: { ...prev.quizResults.answers, [questionIndex]: answerIndex }
        }
      };
    });
  }, [state.currentQuiz]);

  const completeQuiz = useCallback(() => {
    if (!state.currentQuiz || !state.quizResults) return;

    const correctAnswers = state.currentQuiz.filter((q, index) => 
      state.quizResults?.answers[index] === q.correctAnswer
    ).length;
    
    const score = Math.round((correctAnswers / state.currentQuiz.length) * 100);
    
    setState(prev => ({
      ...prev,
      quizResults: prev.quizResults ? { ...prev.quizResults, score } : null,
      quizProgress: 100
    }));

    // Enregistrer la session
    recordStudySession('quiz', { score, totalQuestions: state.currentQuiz.length });
    
    accessibilityService.announceAction('quiz terminé', score >= 70 ? 'success' : 'error');
    addNotification(`Quiz terminé! Score: ${score}%`, score >= 70 ? 'success' : 'info');
  }, [state.currentQuiz, state.quizResults]);

  // ==========================================
  // SESSIONS D'ÉTUDE
  // ==========================================

  const startStudySession = useCallback((type: StudySession['type']) => {
    const session: StudySession = {
      id: `session-${Date.now()}`,
      type,
      startTime: new Date(),
      duration: 0,
      progress: 0,
      metadata: {}
    };

    setState(prev => ({ ...prev, currentSession: session }));
    sessionStartTime.current = new Date();
    
    accessibilityService.announce(`Session d'étude ${type} démarrée`, 'polite');
  }, []);

  const updateStudyProgress = useCallback((progress: number, metadata?: Record<string, any>) => {
    setState(prev => {
      if (!prev.currentSession) return prev;

      return {
        ...prev,
        currentSession: {
          ...prev.currentSession,
          progress,
          duration: sessionStartTime.current ? 
            Date.now() - sessionStartTime.current.getTime() : 0,
          metadata: { ...prev.currentSession.metadata, ...metadata }
        }
      };
    });
  }, []);

  const endStudySession = useCallback((score?: number) => {
    if (!state.currentSession || !sessionStartTime.current) return;

    const endTime = new Date();
    const duration = endTime.getTime() - sessionStartTime.current.getTime();
    
    const completedSession: StudySession = {
      ...state.currentSession,
      endTime,
      duration,
      progress: 100,
      score
    };

    setState(prev => ({
      ...prev,
      currentSession: null,
      studySessions: [...prev.studySessions, completedSession],
      totalStudyTime: prev.totalStudyTime + duration
    }));

    // Sauvegarder localement
    saveStudySession(completedSession);
    
    accessibilityService.announce('Session d\'étude terminée', 'polite');
    sessionStartTime.current = null;
  }, [state.currentSession]);

  const recordStudySession = useCallback((type: StudySession['type'], metadata: Record<string, any>) => {
    if (state.currentSession) {
      endStudySession(metadata.score);
    } else {
      // Session rapide
      const session: StudySession = {
        id: `session-${Date.now()}`,
        type,
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        progress: 100,
        score: metadata.score,
        metadata
      };

      setState(prev => ({
        ...prev,
        studySessions: [...prev.studySessions, session]
      }));

      saveStudySession(session);
    }
  }, [state.currentSession, endStudySession]);

  // ==========================================
  // PERSISTANCE DES DONNÉES
  // ==========================================

  const saveStudySession = useCallback((session: StudySession) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('med-mng-sessions') || '[]');
      sessions.push(session);
      
      // Garder seulement les 100 dernières sessions
      const limitedSessions = sessions.slice(-100);
      localStorage.setItem('med-mng-sessions', JSON.stringify(limitedSessions));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la session:', error);
    }
  }, []);

  const loadStudySessions = useCallback(async () => {
    try {
      const sessions = JSON.parse(localStorage.getItem('med-mng-sessions') || '[]');
      const totalTime = sessions.reduce((sum: number, s: StudySession) => sum + s.duration, 0);
      
      setState(prev => ({
        ...prev,
        studySessions: sessions,
        totalStudyTime: totalTime
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    }
  }, []);

  // ==========================================
  // GESTION DES ERREURS ET NOTIFICATIONS
  // ==========================================

  const handleError = useCallback((message: string, error: any) => {
    console.error(message, error);
    setState(prev => ({ ...prev, error: message, loading: false }));
    toast({
      title: 'Erreur',
      description: message,
      variant: 'destructive'
    });
    accessibilityService.announce(message, 'assertive');
  }, [toast]);

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const notification = {
      id: `notif-${Date.now()}`,
      message,
      type
    };

    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, notification]
    }));

    // Auto-remove après 5 secondes
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  }, []);

  // ==========================================
  // NETTOYAGE
  // ==========================================

  const cleanup = useCallback(() => {
    performanceService.current.dispose();
  }, []);

  // ==========================================
  // RETOUR DE L'INTERFACE
  // ==========================================

  return {
    // État
    ...state,
    
    // Actions de génération musicale
    generateMedicalMusic,
    
    // Actions de quiz
    generateMedicalQuiz,
    submitQuizAnswer,
    completeQuiz,
    
    // Actions de session
    startStudySession,
    updateStudyProgress,
    endStudySession,
    
    // Actions d'accessibilité
    announceToScreenReader: accessibilityService.announce.bind(accessibilityService),
    getAccessibilityPreferences: accessibilityService.getPreferences.bind(accessibilityService),
    updateAccessibilityPreference: accessibilityService.updatePreference.bind(accessibilityService),
    
    // Actions de performance
    getPerformanceMetrics: () => performanceService.current.getMetrics(),
    
    // Utilitaires
    addNotification,
    removeNotification,
    clearError: () => setState(prev => ({ ...prev, error: null }))
  };
};

export default useUnifiedMedicalPlatform;