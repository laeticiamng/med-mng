/**
 * ⚡ Hook Unifié MED-MNG Premium
 * Centralise toute la logique de la plateforme médicale
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { unifiedAPIService, MusicGenerationRequest, MusicGenerationResponse } from '../services/UnifiedAPIService';
import { logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';

export interface MedicalContent {
  id: string;
  itemCode: string;
  title: string;
  specialty: string;
  difficulty: 'A' | 'B' | 'A+B';
  content: {
    tableau: any;
    paroles: string[];
    quiz: any;
    scene: any;
  };
  music?: {
    rang_a?: MusicGenerationResponse;
    rang_b?: MusicGenerationResponse;
    combined?: MusicGenerationResponse;
  };
  progress: {
    studied: boolean;
    mastery: number;
    lastAccessed: Date;
    timeSpent: number;
  };
}

export interface LearningSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  itemsStudied: string[];
  musicListened: string[];
  quizResults: { itemId: string; score: number; timeSpent: number }[];
  totalTimeSpent: number;
  averageScore: number;
}

export interface UserAnalytics {
  totalStudyTime: number;
  itemsCompleted: number;
  averageScore: number;
  streakDays: number;
  favoriteSpecialties: string[];
  weakAreas: string[];
  learningVelocity: number;
  musicEngagement: {
    totalListeningTime: number;
    favoriteStyles: string[];
    completionRate: number;
  };
}

export const useUnifiedMedicalPlatform = () => {
  // États centralisés
  const [medicalContent, setMedicalContent] = useState<MedicalContent[]>([]);
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeGenerations, setActiveGenerations] = useState<Map<string, MusicGenerationResponse>>(new Map());

  const { toast } = useToast();

  // 📚 Chargement du contenu médical
  const loadMedicalContent = useCallback(async (filters?: {
    specialty?: string;
    difficulty?: string;
    search?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simuler le chargement depuis Supabase
      // En production, ceci ferait appel à l'API Supabase
      const mockContent: MedicalContent[] = Array.from({ length: 367 }, (_, i) => ({
        id: `item-${i + 1}`,
        itemCode: `IC-${String(i + 1).padStart(3, '0')}`,
        title: `Item médical ${i + 1}`,
        specialty: ['Cardiologie', 'Neurologie', 'Psychiatrie', 'Pédiatrie'][i % 4],
        difficulty: (i < 100 ? 'A' : i < 250 ? 'B' : 'A+B') as 'A' | 'B' | 'A+B',
        content: {
          tableau: {},
          paroles: [`Paroles pour l'item ${i + 1}`],
          quiz: {},
          scene: {}
        },
        progress: {
          studied: Math.random() > 0.7,
          mastery: Math.floor(Math.random() * 100),
          lastAccessed: new Date(),
          timeSpent: Math.floor(Math.random() * 3600)
        }
      }));

      // Appliquer les filtres
      let filteredContent = mockContent;
      
      if (filters?.specialty) {
        filteredContent = filteredContent.filter(item => 
          item.specialty.toLowerCase().includes(filters.specialty!.toLowerCase())
        );
      }
      
      if (filters?.difficulty) {
        filteredContent = filteredContent.filter(item => 
          item.difficulty === filters.difficulty
        );
      }
      
      if (filters?.search) {
        filteredContent = filteredContent.filter(item => 
          item.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
          item.itemCode.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }

      setMedicalContent(filteredContent);
      logger.info('Medical content loaded', 'useUnifiedMedicalPlatform', {
        total: filteredContent.length,
        filters
      });

    } catch (error) {
      logger.error('Failed to load medical content', 'useUnifiedMedicalPlatform', error);
      setError('Erreur lors du chargement du contenu médical');
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger le contenu médical',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // 🎵 Génération musicale
  const generateMusic = useCallback(async (
    itemId: string, 
    difficulty: 'A' | 'B' | 'A+B',
    customPrompt?: string
  ) => {
    try {
      const item = medicalContent.find(i => i.id === itemId);
      if (!item) throw new Error('Item non trouvé');

      const prompt = customPrompt || `Créez une chanson éducative sur ${item.title} pour étudiants en médecine, spécialité ${item.specialty}, niveau ${difficulty}. Style mélodique et mémorable avec paroles scientifiquement précises.`;

      const request: MusicGenerationRequest = {
        prompt,
        style: 'educational-medical',
        duration: 120,
        model: 'chirp-v3'
      };

      logger.info('Starting music generation', 'useUnifiedMedicalPlatform', {
        itemId,
        difficulty,
        prompt: prompt.substring(0, 100) + '...'
      });

      const response = await unifiedAPIService.generateMusic(request);
      
      // Mettre à jour l'état local
      setActiveGenerations(prev => new Map(prev).set(response.id, response));

      // Mettre à jour le contenu médical
      setMedicalContent(prev => prev.map(content => 
        content.id === itemId 
          ? {
              ...content,
              music: {
                ...content.music,
                [`rang_${difficulty.toLowerCase()}`]: response
              }
            }
          : content
      ));

      toast({
        title: 'Génération musicale initiée',
        description: `Création en cours pour ${item.title} - Rang ${difficulty}`,
        duration: 5000
      });

      // Démarrer le polling pour suivre le progrès
      pollMusicGeneration(response.id);

      return response.id;

    } catch (error) {
      logger.error('Music generation failed', 'useUnifiedMedicalPlatform', error);
      toast({
        title: 'Erreur de génération',
        description: 'Impossible de générer la musique',
        variant: 'destructive'
      });
      throw error;
    }
  }, [medicalContent, toast]);

  // 📊 Polling pour le suivi des générations
  const pollMusicGeneration = useCallback(async (generationId: string) => {
    const poll = async () => {
      try {
        const status = await unifiedAPIService.getMusicGenerationStatus(generationId);
        
        setActiveGenerations(prev => new Map(prev).set(generationId, status));

        if (status.status === 'completed') {
          toast({
            title: 'Musique générée avec succès !',
            description: 'Votre contenu musical est prêt à écouter',
            duration: 5000
          });
          
          logger.info('Music generation completed', 'useUnifiedMedicalPlatform', {
            generationId,
            audioUrl: status.audio_url
          });
          
          return; // Arrêter le polling
        }

        if (status.status === 'failed') {
          toast({
            title: 'Génération échouée',
            description: status.error || 'Erreur inconnue',
            variant: 'destructive'
          });
          return; // Arrêter le polling
        }

        // Continuer le polling si en cours
        if (status.status === 'generating' || status.status === 'queued') {
          setTimeout(poll, 3000); // Poll toutes les 3 secondes
        }

      } catch (error) {
        logger.error('Failed to poll music generation status', 'useUnifiedMedicalPlatform', error);
      }
    };

    poll();
  }, [toast]);

  // 📖 Démarrage d'une session d'étude
  const startLearningSession = useCallback(() => {
    const session: LearningSession = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      itemsStudied: [],
      musicListened: [],
      quizResults: [],
      totalTimeSpent: 0,
      averageScore: 0
    };

    setCurrentSession(session);
    logger.info('Learning session started', 'useUnifiedMedicalPlatform', { sessionId: session.id });

    return session.id;
  }, []);

  // 🏁 Fin d'une session d'étude
  const endLearningSession = useCallback(() => {
    if (!currentSession) return null;

    const endedSession: LearningSession = {
      ...currentSession,
      endTime: new Date(),
      totalTimeSpent: Date.now() - currentSession.startTime.getTime(),
      averageScore: currentSession.quizResults.length > 0 
        ? currentSession.quizResults.reduce((sum, result) => sum + result.score, 0) / currentSession.quizResults.length
        : 0
    };

    setCurrentSession(null);
    logger.info('Learning session ended', 'useUnifiedMedicalPlatform', {
      sessionId: endedSession.id,
      duration: endedSession.totalTimeSpent,
      itemsStudied: endedSession.itemsStudied.length
    });

    return endedSession;
  }, [currentSession]);

  // 📈 Chargement des analytics utilisateur
  const loadUserAnalytics = useCallback(async () => {
    try {
      // En production, récupérer les vraies données depuis Supabase
      const mockAnalytics: UserAnalytics = {
        totalStudyTime: 145 * 60 * 1000, // 145 minutes
        itemsCompleted: 47,
        averageScore: 87.5,
        streakDays: 12,
        favoriteSpecialties: ['Cardiologie', 'Neurologie'],
        weakAreas: ['Psychiatrie', 'Gynécologie'],
        learningVelocity: 1.8,
        musicEngagement: {
          totalListeningTime: 89 * 60 * 1000, // 89 minutes
          favoriteStyles: ['educational-medical', 'classical'],
          completionRate: 0.76
        }
      };

      setUserAnalytics(mockAnalytics);
      logger.info('User analytics loaded', 'useUnifiedMedicalPlatform', mockAnalytics);

    } catch (error) {
      logger.error('Failed to load user analytics', 'useUnifiedMedicalPlatform', error);
    }
  }, []);

  // 🎯 Calculs dérivés optimisés
  const derivedData = useMemo(() => {
    const studiedItems = medicalContent.filter(item => item.progress.studied);
    const totalMastery = medicalContent.reduce((sum, item) => sum + item.progress.mastery, 0);
    const averageMastery = medicalContent.length > 0 ? totalMastery / medicalContent.length : 0;

    const specialtyProgress = medicalContent.reduce((acc, item) => {
      if (!acc[item.specialty]) {
        acc[item.specialty] = { total: 0, studied: 0, mastery: 0 };
      }
      acc[item.specialty].total++;
      if (item.progress.studied) {
        acc[item.specialty].studied++;
      }
      acc[item.specialty].mastery += item.progress.mastery;
      return acc;
    }, {} as Record<string, { total: number; studied: number; mastery: number }>);

    return {
      studiedItems,
      studiedPercentage: medicalContent.length > 0 ? (studiedItems.length / medicalContent.length) * 100 : 0,
      averageMastery,
      specialtyProgress,
      activeGenerationsCount: activeGenerations.size
    };
  }, [medicalContent, activeGenerations]);

  // 🚀 Initialisation
  useEffect(() => {
    loadMedicalContent();
    loadUserAnalytics();
  }, [loadMedicalContent, loadUserAnalytics]);

  return {
    // États
    medicalContent,
    currentSession,
    userAnalytics,
    isLoading,
    error,
    activeGenerations,
    
    // Données dérivées
    ...derivedData,
    
    // Actions
    loadMedicalContent,
    generateMusic,
    startLearningSession,
    endLearningSession,
    loadUserAnalytics,
    
    // Utilitaires
    getItemById: (id: string) => medicalContent.find(item => item.id === id),
    getItemsBySpecialty: (specialty: string) => medicalContent.filter(item => item.specialty === specialty),
    getGenerationStatus: (id: string) => activeGenerations.get(id)
  };
};