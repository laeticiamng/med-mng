/**
 * Hooks React Query pour la gestion des méthodes de révision
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import type {
  RevisionMethodType,
  RevisionSchedule,
  RevisionScheduleInsert,
  RevisionScheduleUpdate,
  RevisionSession,
  RevisionSessionInsert,
  TodayRevisions,
  RevisionStats,
  ScheduleJMethodParams,
  MarkRevisionDoneParams,
  JMethodConfig,
  BlockMethodConfig,
  QCMFirstConfig
} from '@/types/revision-methods'
import * as revisionService from '@/services/revisionMethods.service'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const revisionKeys = {
  all: ['revision'] as const,
  method: (userId: string) => [...revisionKeys.all, 'method', userId] as const,
  todayRevisions: (userId: string) => [...revisionKeys.all, 'today', userId] as const,
  overdueRevisions: (userId: string) => [...revisionKeys.all, 'overdue', userId] as const,
  schedule: (userId: string, filters?: any) => [...revisionKeys.all, 'schedule', userId, filters] as const,
  sessions: (userId: string, limit?: number) => [...revisionKeys.all, 'sessions', userId, limit] as const,
  stats: (userId: string, method: RevisionMethodType) => [...revisionKeys.all, 'stats', userId, method] as const,
  config: (userId: string, method: RevisionMethodType) => [...revisionKeys.all, 'config', userId, method] as const,
}

// ============================================================================
// USER REVISION METHOD
// ============================================================================

/**
 * Hook pour récupérer la méthode de révision active de l'utilisateur
 */
export function useUserRevisionMethod() {
  const { user } = useAuth()

  return useQuery({
    queryKey: revisionKeys.method(user?.id || ''),
    queryFn: () => revisionService.getUserRevisionMethod(user!.id),
    enabled: !!user,
  })
}

/**
 * Hook pour changer la méthode de révision de l'utilisateur
 */
export function useUpdateRevisionMethod() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (newMethod: RevisionMethodType) =>
      revisionService.updateUserRevisionMethod(user!.id, newMethod),
    onSuccess: (_, newMethod) => {
      queryClient.invalidateQueries({ queryKey: revisionKeys.method(user!.id) })
      queryClient.invalidateQueries({ queryKey: revisionKeys.all })
      toast({
        title: 'Méthode de révision mise à jour',
        description: `Vous utilisez maintenant la méthode "${newMethod}"`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de changer la méthode de révision',
        variant: 'destructive',
      })
      console.error('Error updating revision method:', error)
    },
  })
}

// ============================================================================
// REVISION SCHEDULE
// ============================================================================

/**
 * Hook pour récupérer les révisions du jour
 */
export function useTodayRevisions() {
  const { user } = useAuth()

  return useQuery({
    queryKey: revisionKeys.todayRevisions(user?.id || ''),
    queryFn: () => revisionService.getTodayRevisions(user!.id),
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  })
}

/**
 * Hook pour récupérer les révisions en retard
 */
export function useOverdueRevisions() {
  const { user } = useAuth()

  return useQuery({
    queryKey: revisionKeys.overdueRevisions(user?.id || ''),
    queryFn: () => revisionService.getOverdueRevisions(user!.id),
    enabled: !!user,
  })
}

/**
 * Hook pour récupérer le planning de révisions
 */
export function useRevisionSchedule(filters?: {
  method?: RevisionMethodType
  status?: string
  startDate?: string
  endDate?: string
}) {
  const { user } = useAuth()

  return useQuery({
    queryKey: revisionKeys.schedule(user?.id || '', filters),
    queryFn: () => revisionService.getRevisionSchedule(user!.id, filters),
    enabled: !!user,
  })
}

/**
 * Hook pour créer une révision planifiée
 */
export function useCreateRevisionSchedule() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (revision: Omit<RevisionScheduleInsert, 'user_id'>) =>
      revisionService.createRevisionSchedule({ ...revision, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revisionKeys.all })
      toast({
        title: 'Révision planifiée',
        description: 'La révision a été ajoutée à votre planning',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de planifier la révision',
        variant: 'destructive',
      })
      console.error('Error creating revision schedule:', error)
    },
  })
}

/**
 * Hook pour mettre à jour une révision planifiée
 */
export function useUpdateRevisionSchedule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: RevisionScheduleUpdate }) =>
      revisionService.updateRevisionSchedule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revisionKeys.all })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la révision',
        variant: 'destructive',
      })
      console.error('Error updating revision schedule:', error)
    },
  })
}

/**
 * Hook pour marquer une révision comme terminée
 */
export function useMarkRevisionDone() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (params: MarkRevisionDoneParams) =>
      revisionService.markRevisionDone(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revisionKeys.all })
      toast({
        title: 'Révision terminée',
        description: 'Bravo ! Continue comme ça 🎉',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de valider la révision',
        variant: 'destructive',
      })
      console.error('Error marking revision as done:', error)
    },
  })
}

// ============================================================================
// MÉTHODE DES J 2.0
// ============================================================================

/**
 * Hook pour planifier les révisions selon la Méthode des J
 */
export function useScheduleJMethod() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (params: Omit<ScheduleJMethodParams, 'user_id'>) =>
      revisionService.scheduleJMethodRevisions({ ...params, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revisionKeys.all })
      toast({
        title: 'Révisions planifiées',
        description: '4 révisions ont été ajoutées selon la Méthode des J (J+2, J+7, J+14, J+30)',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de planifier les révisions',
        variant: 'destructive',
      })
      console.error('Error scheduling J method revisions:', error)
    },
  })
}

/**
 * Hook pour récupérer la configuration de la Méthode des J
 */
export function useJMethodConfig() {
  const { user } = useAuth()

  return useQuery({
    queryKey: revisionKeys.config(user?.id || '', 'J_METHOD'),
    queryFn: () => revisionService.getJMethodConfig(user!.id),
    enabled: !!user,
  })
}

/**
 * Hook pour mettre à jour la configuration de la Méthode des J
 */
export function useUpdateJMethodConfig() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (config: Partial<JMethodConfig>) =>
      revisionService.updateJMethodConfig(user!.id, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revisionKeys.config(user!.id, 'J_METHOD') })
      toast({
        title: 'Configuration mise à jour',
        description: 'Les paramètres de la Méthode des J ont été sauvegardés',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la configuration',
        variant: 'destructive',
      })
      console.error('Error updating J method config:', error)
    },
  })
}

// ============================================================================
// MÉTHODE BLOCS PROFONDS
// ============================================================================

/**
 * Hook pour générer un planning Blocs Profonds
 */
export function useGenerateBlockMethodSchedule() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ itemIds, config }: { itemIds: string[]; config: BlockMethodConfig }) =>
      revisionService.generateBlockMethodSchedule(user!.id, itemIds, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revisionKeys.all })
      toast({
        title: 'Planning généré',
        description: 'Votre planning Blocs Profonds est prêt !',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le planning',
        variant: 'destructive',
      })
      console.error('Error generating block method schedule:', error)
    },
  })
}

/**
 * Hook pour récupérer la configuration de la Méthode Blocs Profonds
 */
export function useBlockMethodConfig() {
  const { user } = useAuth()

  return useQuery({
    queryKey: revisionKeys.config(user?.id || '', 'BLOCK_METHOD'),
    queryFn: () => revisionService.getBlockMethodConfig(user!.id),
    enabled: !!user,
  })
}

/**
 * Hook pour mettre à jour la configuration de la Méthode Blocs Profonds
 */
export function useUpdateBlockMethodConfig() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (config: Partial<BlockMethodConfig>) =>
      revisionService.updateBlockMethodConfig(user!.id, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revisionKeys.config(user!.id, 'BLOCK_METHOD') })
      toast({
        title: 'Configuration mise à jour',
        description: 'Les paramètres de la Méthode Blocs Profonds ont été sauvegardés',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la configuration',
        variant: 'destructive',
      })
      console.error('Error updating block method config:', error)
    },
  })
}

// ============================================================================
// MÉTHODE QCM FIRST
// ============================================================================

/**
 * Hook pour analyser un QCM et planifier les révisions
 */
export function useAnalyzeQCMAndSchedule() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      qcmResults,
      config
    }: {
      qcmResults: Array<{
        item_id: string
        item_type: string
        item_title: string
        correct: boolean
        difficulty: number
      }>
      config: QCMFirstConfig
    }) => revisionService.analyzeQCMAndScheduleReviews(user!.id, qcmResults, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revisionKeys.all })
      toast({
        title: 'Fiches à revoir planifiées',
        description: 'Les fiches sur lesquelles tu as eu des difficultés ont été ajoutées à ton planning',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'analyser les résultats du QCM',
        variant: 'destructive',
      })
      console.error('Error analyzing QCM:', error)
    },
  })
}

/**
 * Hook pour récupérer la configuration de la Méthode QCM First
 */
export function useQCMFirstConfig() {
  const { user } = useAuth()

  return useQuery({
    queryKey: revisionKeys.config(user?.id || '', 'QCM_FIRST'),
    queryFn: () => revisionService.getQCMFirstConfig(user!.id),
    enabled: !!user,
  })
}

/**
 * Hook pour mettre à jour la configuration de la Méthode QCM First
 */
export function useUpdateQCMFirstConfig() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (config: Partial<QCMFirstConfig>) =>
      revisionService.updateQCMFirstConfig(user!.id, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revisionKeys.config(user!.id, 'QCM_FIRST') })
      toast({
        title: 'Configuration mise à jour',
        description: 'Les paramètres de la Méthode QCM First ont été sauvegardés',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la configuration',
        variant: 'destructive',
      })
      console.error('Error updating QCM first config:', error)
    },
  })
}

// ============================================================================
// REVISION SESSIONS
// ============================================================================

/**
 * Hook pour créer une session de révision
 */
export function useCreateRevisionSession() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (session: Omit<RevisionSessionInsert, 'user_id'>) =>
      revisionService.createRevisionSession({ ...session, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revisionKeys.sessions(user!.id) })
      toast({
        title: 'Session enregistrée',
        description: 'Tes progrès ont été sauvegardés',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la session',
        variant: 'destructive',
      })
      console.error('Error creating revision session:', error)
    },
  })
}

/**
 * Hook pour récupérer l'historique des sessions
 */
export function useRevisionSessions(limit = 10) {
  const { user } = useAuth()

  return useQuery({
    queryKey: revisionKeys.sessions(user?.id || '', limit),
    queryFn: () => revisionService.getRevisionSessions(user!.id, limit),
    enabled: !!user,
  })
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Hook pour récupérer les statistiques d'une méthode
 */
export function useRevisionStats(method: RevisionMethodType) {
  const { user } = useAuth()

  return useQuery({
    queryKey: revisionKeys.stats(user?.id || '', method),
    queryFn: () => revisionService.getRevisionStatsByMethod(user!.id, method),
    enabled: !!user,
  })
}

/**
 * Hook pour récupérer les métriques de performance
 */
export function useMethodPerformanceMetrics(
  method: RevisionMethodType,
  periodStart?: string,
  periodEnd?: string
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [...revisionKeys.stats(user?.id || '', method), periodStart, periodEnd],
    queryFn: () => revisionService.getMethodPerformanceMetrics(user!.id, method, periodStart, periodEnd),
    enabled: !!user,
  })
}
