// ============================================
// HOOKS - Central Index (Organized by Domain)
// ============================================
// 150+ hooks organisés par catégorie thématique
// Pour imports ciblés: import { useX } from '@/hooks/learning'

// ────────────────────────────────────────────
// 📦 SUB-MODULES (imports groupés disponibles)
// ────────────────────────────────────────────
// import * from '@/hooks/learning'  → EDN, flashcards, SRS
// import * from '@/hooks/audio'     → Audio, music, playlists
// import * from '@/hooks/gamification' → Badges, challenges
// import * from '@/hooks/analytics' → Stats, monitoring
// import * from '@/hooks/auth'      → Auth, security
// import * from '@/hooks/ui'        → Accessibilité, responsive
// import * from '@/hooks/social'    → Communauté, chat
// import * from '@/hooks/data'      → Cache, offline

export * from './ai';
export * from './music';

// ────────────────────────────────────────────
// 🖥️ MOBILE & UI
// ────────────────────────────────────────────
export * from './use-mobile';
export * from './use-toast';

// ────────────────────────────────────────────
// 🤖 AI & RECOMMENDATIONS
// ────────────────────────────────────────────
export * from './useAIClinicalCases';
export * from './useAIExam';
export * from './useAIRecommendations';

// ────────────────────────────────────────────
// ♿ ACCESSIBILITY
// ────────────────────────────────────────────
export * from './useAccessibilityAnnouncement';
export * from './useAdvancedAccessibility';

// ────────────────────────────────────────────
// 📊 ACTIVITY & ANALYTICS
// ────────────────────────────────────────────
export * from './useActivityTracking';
export * from './useAnalytics';
export * from './useAnalyticsTracking';
export * from './useAppliedRecommendations';
export * from './useUserAnalytics';
export * from './useLearningAnalytics';
export * from './usePerformanceAnalytics';

// ────────────────────────────────────────────
// 🎵 AUDIO & MUSIC
// ────────────────────────────────────────────
export * from './useAudioBuffering';
export * from './useAudioCache';
export * from './useAudioControls';
export * from './useAudioMetrics';
export * from './useAudioPlayer';
export * from './useAudioWithCache';
export * from './useEnhancedAudioPlayer';
export { useMusicGeneration, type RangType } from './useMusicGeneration';
export * from './useMusicGenerationState';
export * from './useMusicGenerationStatus';
export * from './useMusicGenerationWithTranslation';
export * from './useMusicLibrary';
export * from './useMusicMetrics';
export * from './usePlayer';
export * from './usePlaylistPlayer';
export * from './usePlaylists';
export * from './useSongGeneration';
export * from './useSpotifyAI';
export * from './useSupabaseMusicTracks';
export * from './useSynchronizedLyrics';

// ────────────────────────────────────────────
// ⚡ CACHE & PERFORMANCE
// ────────────────────────────────────────────
export * from './useCache';
export * from './useDebounce';
export * from './useQueryCache';
export * from './usePerformanceOptimization';
export * from './usePerformanceDegradationAlerts';

// ────────────────────────────────────────────
// 💬 CHAT & COMMUNICATION
// ────────────────────────────────────────────
export * from './useChatConversations';
export * from './useEnhancedChat';
export * from './useDirectMessages';
export * from './useSharedResources';

// ────────────────────────────────────────────
// 🏥 CLINICAL & MEDICAL
// ────────────────────────────────────────────
export * from './useClinicalCases';
export * from './useCVSSAssessments';

// ────────────────────────────────────────────
// 📚 CONTENT & EDN
// ────────────────────────────────────────────
export * from './useAllEdnItems';
export * from './useAuditItems';
export * from './useComprehensiveAudit';
export * from './useContentCompletenessChecker';
export * from './useContentGeneration';
export * from './useContentMaster';
export * from './useEcosLyrics';
export * from './useEcosTimer';
export * from './useEdnFavorites';
export * from './useEdnItem';
export * from './useEdnItemLyrics';
export * from './useEdnItemV2';
export * from './useEdnItemV2Process';
export * from './useEdnItems';
export * from './useEdnItemsComplete';
export * from './useEdnItemsOptimized';
export * from './useEdnNotes';
export * from './useEffectivenessScores';
export * from './useItemCompletenessChecker';
export * from './useItemTitle';
export * from './useItemsCompleteness';
export * from './useOicCompetences';
export * from './useOptimizedTableau';
export * from './useParolesMusicales';
export * from './useTableauNavigation';

// ────────────────────────────────────────────
// 🚨 ERRORS & MONITORING
// ────────────────────────────────────────────
export * from './useErrorHandling';
export * from './useExtractionMonitoring';
export * from './useRealTimeMonitoring';
export * from './useSystemAlerts';
export * from './useSystemStatus';
export * from './useUnifiedAlerts';

// ────────────────────────────────────────────
// 📝 EXAM & QUIZ
// ────────────────────────────────────────────
export * from './useExamMode';
export * from './useFlashcards';
export * from './useTimedFlashcards';
export * from './useQuizErrorTracker';
export * from './useQuizHistory';
export * from './useQuizResults';
export * from './useQuizWithErrorTracking';

// ────────────────────────────────────────────
// ⭐ FAVORITES & HISTORY
// ────────────────────────────────────────────
export * from './useFavoritesAndHistory';
export * from './useOfflineHistory';

// ────────────────────────────────────────────
// 🎯 GAMIFICATION & BADGES
// ────────────────────────────────────────────
export * from './useBadgeUnlockTrigger';
export * from './useGamification';
export * from './useLeaderboard';
export * from './useDailyChallenges';
export * from './useUserGoals';
export * from './useMoodTracker';
export * from './usePomodoroSessions';
export * from './useWeeklyChallenges';

// ────────────────────────────────────────────
// 🎨 GENERATION & FILTERS
// ────────────────────────────────────────────
export * from './useGenerationFilters';
export * from './useGenerationNotifications';
export * from './useGenerationQueue';
export * from './useGenerationStats';
export * from './useGeneratorPreferences';
export * from './useGeneratorValidation';
export * from './useRealtimeGeneration';
export * from './useRetryGeneration';
export * from './useOpenAIGeneration';

// ────────────────────────────────────────────
// 🌐 GLOBAL & STATE
// ────────────────────────────────────────────
export * from './useGlobalState';
export * from './useTypeSafeState';
export * from './useBatchSelection';
export * from './useKeyboardNavigation';
export * from './useGlobalTranslation';
export * from './useTranslation';

// ────────────────────────────────────────────
// 🔌 API & NETWORK
// ────────────────────────────────────────────
export * from './useMedMngApi';
export * from './useNetworkStatus';
export * from './useOfflineQueue';
export * from './useOfflineSync';
export * from './useRetryWithBackoff';
export * from './useRateLimiting';

// ────────────────────────────────────────────
// 🔔 NOTIFICATIONS
// ────────────────────────────────────────────
export * from './useEmailNotifications';
export * from './useNotifications';
export * from './usePushNotifications';

// ────────────────────────────────────────────
// 🚀 ONBOARDING & PWA
// ────────────────────────────────────────────
export * from './useOnboarding';
export * from './usePWA';
export * from './usePWAMetrics';

// ────────────────────────────────────────────
// 💳 QUOTA & SUBSCRIPTION
// ────────────────────────────────────────────
export * from './useFreeTrialLimit';
export * from './useIAQuota';
export * from './useQuotaRefresh';
export * from './useQuotaSync';
export * from './useSubscription';

// ────────────────────────────────────────────
// 🎓 SRS & LEARNING
// ────────────────────────────────────────────
export * from './useAdaptiveSRS';
export * from './useSRS';
export * from './usePersonalizedRevision';
export * from './useBKTKnowledge';
export * from './useECNPrediction';

// ────────────────────────────────────────────
// 🔍 SEARCH & FILTERS
// ────────────────────────────────────────────
export * from './useSearch';
export * from './useSavedFilters';
export * from './useRecommendationAlerts';

// ────────────────────────────────────────────
// 🔒 SECURITY
// ────────────────────────────────────────────
export * from './useSecureStreaming';
export * from './useSecurityIncidents';
export * from './useSecurityMonitoring';
export * from './useSecurityValidation';

// ────────────────────────────────────────────
// 🎵 SUNO API
// ────────────────────────────────────────────
export * from './useSunoCallbackListener';
export * from './useSunoCredits';
export * from './useSunoGeneration';
export * from './useSunoPolling';

// ────────────────────────────────────────────
// 👤 USER & PREFERENCES
// ────────────────────────────────────────────
export * from './useUserCompetenceProgress';
export * from './useUserPreferences';
export * from './useUserRoles';
export * from './useFavorites';

// ────────────────────────────────────────────
// 📊 MISC
// ────────────────────────────────────────────
export * from './useGitHubAccessibilityMetrics';
export * from './useLibraryRealtime';
export * from './useListeningModes';
export * from './useWindowSize';
export * from './useKaraokeSession';
// Note: useCommunityEvents, useCommunityPosts, useForumThreads, 
// useMentorshipMatching, useCollaborativeStudy, useStudySessions
// have conflicting exports - import directly from specific files if needed
export { useCommunityEvents } from './useCommunityEvents';
export { useCommunityPosts } from './useCommunityPosts';
export { useForumThreads } from './useForumThreads';
export { useMentorshipMatching } from './useMentorshipMatching';
export { useCollaborativeStudy } from './useCollaborativeStudy';
export { useStudySessions } from './useStudySessions';
export { useStudyGroups } from './useStudyGroups';
export { useAnkiImport } from './useAnkiImport';
export { useCalendarSync } from './useCalendarSync';
export { useDiagnosticLogs } from './useDiagnosticLogs';
