import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEcosSituations,
  getEcosSituation,
  getEcosSituationBySdId,
  getEvaluationCriteria,
  createUserSession,
  getUserSessions,
  updateSession,
  saveCriterionScore,
  getSessionScores,
  getUserEcosStats,
  EcosSituation,
  EcosEvaluationCriterion,
  EcosUserSession,
  EcosSessionScore,
} from '@/services/ecos.service';

// Query keys
const ecosKeys = {
  all: ['ecos'] as const,
  situations: () => [...ecosKeys.all, 'situations'] as const,
  situation: (id: string) => [...ecosKeys.all, 'situation', id] as const,
  situationBySdId: (sdId: number) => [...ecosKeys.all, 'situation', 'sd', sdId] as const,
  criteria: (situationId: string) => [...ecosKeys.all, 'criteria', situationId] as const,
  userSessions: (userId: string) => [...ecosKeys.all, 'sessions', userId] as const,
  sessionScores: (sessionId: string) => [...ecosKeys.all, 'scores', sessionId] as const,
  userStats: (userId: string) => [...ecosKeys.all, 'stats', userId] as const,
};

/**
 * Fetch all ECOS situations
 */
export function useFetchEcosSituations(limit = 50, offset = 0) {
  return useQuery({
    queryKey: [...ecosKeys.situations(), limit, offset],
    queryFn: () => getEcosSituations(limit, offset),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Fetch a specific ECOS situation
 */
export function useFetchEcosSituation(situationId: string) {
  return useQuery({
    queryKey: ecosKeys.situation(situationId),
    queryFn: () => getEcosSituation(situationId),
    enabled: !!situationId,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch ECOS situation by SD ID
 */
export function useFetchEcosSituationBySdId(sdId: number) {
  return useQuery({
    queryKey: ecosKeys.situationBySdId(sdId),
    queryFn: () => getEcosSituationBySdId(sdId),
    enabled: sdId > 0,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch evaluation criteria for a situation
 */
export function useFetchEvaluationCriteria(situationId: string) {
  return useQuery({
    queryKey: ecosKeys.criteria(situationId),
    queryFn: () => getEvaluationCriteria(situationId),
    enabled: !!situationId,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch user's ECOS sessions
 */
export function useFetchUserSessions(userId: string, situationId?: string) {
  return useQuery({
    queryKey: [...ecosKeys.userSessions(userId), situationId],
    queryFn: () => getUserSessions(userId, situationId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Fetch session scores
 */
export function useFetchSessionScores(sessionId: string) {
  return useQuery({
    queryKey: ecosKeys.sessionScores(sessionId),
    queryFn: () => getSessionScores(sessionId),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetch user ECOS statistics
 */
export function useFetchUserEcosStats(userId: string) {
  return useQuery({
    queryKey: ecosKeys.userStats(userId),
    queryFn: () => getUserEcosStats(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Create a new user session
 */
export function useCreateUserSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      situationId,
      maxPossibleScore,
    }: {
      userId: string;
      situationId: string;
      maxPossibleScore: number;
    }) => createUserSession(userId, situationId, maxPossibleScore),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ecosKeys.userSessions(variables.userId) });
      queryClient.invalidateQueries({ queryKey: ecosKeys.userStats(variables.userId) });
    },
  });
}

/**
 * Update session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      updates,
      userId,
    }: {
      sessionId: string;
      updates: {
        completed_at?: string;
        total_score?: number;
        time_spent_seconds?: number;
        status?: 'in_progress' | 'completed' | 'abandoned';
        evaluator_notes?: string;
        self_reflection?: string;
      };
      userId: string;
    }) => updateSession(sessionId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ecosKeys.userSessions(variables.userId) });
      queryClient.invalidateQueries({ queryKey: ecosKeys.userStats(variables.userId) });
    },
  });
}

/**
 * Save criterion score
 */
export function useSaveCriterionScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      criterionId,
      pointsEarned,
      feedback,
    }: {
      sessionId: string;
      criterionId: string;
      pointsEarned: number;
      feedback?: string;
    }) => saveCriterionScore(sessionId, criterionId, pointsEarned, feedback),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ecosKeys.sessionScores(variables.sessionId) });
    },
  });
}
