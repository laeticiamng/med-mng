// Hooks Central Index - Complete Hooks Library

// Sub-modules
export * from './ai';
export * from './music';

// Mobile & UI
export * from './use-mobile';
export * from './use-toast';

// AI & Recommendations
export * from './useAIClinicalCases';
export * from './useAIExam';
export * from './useAIRecommendations';

// Accessibility
export * from './useAccessibilityAnnouncement';
export * from './useAdvancedAccessibility';

// Activity & Analytics
export * from './useActivityTracking';
export * from './useAnalytics';
export * from './useAnalyticsTracking';
export * from './useAppliedRecommendations';
export * from './useUserAnalytics';
export * from './useLearningAnalytics';
export * from './usePerformanceAnalytics';

// Audio & Music (excluding conflicting exports)
export * from './useAudioBuffering';
export * from './useAudioCache';
export * from './useAudioControls';
export * from './useAudioMetrics';
export * from './useAudioPlayer';
export * from './useAudioWithCache';
export * from './useEnhancedAudioPlayer';
// useMusicGeneration exports RangType, avoid re-exporting
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

// Cache & Performance
export * from './useCache';
export * from './useDebounce';
export * from './useQueryCache';
export * from './usePerformanceOptimization';
export * from './usePerformanceDegradationAlerts';

// Chat & Communication
export * from './useChatConversations';
export * from './useEnhancedChat';
export * from './useDirectMessages';

// Social & Community
export * from './useSharedResources';

// Clinical & Medical
export * from './useClinicalCases';
export * from './useCVSSAssessments';

// Content & EDN
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

// Errors & Monitoring
export * from './useErrorHandling';
export * from './useExtractionMonitoring';
export * from './useRealTimeMonitoring';
export * from './useSystemAlerts';
export * from './useSystemStatus';
export * from './useUnifiedAlerts';

// Exam & Quiz
export * from './useExamMode';
export * from './useFlashcards';
export * from './useTimedFlashcards';
export * from './useQuizErrorTracker';
export * from './useQuizHistory';
export * from './useQuizResults';
export * from './useQuizWithErrorTracking';

// Favorites & History
export * from './useFavoritesAndHistory';
export * from './useOfflineHistory';

// Gamification & Badges
export * from './useBadgeUnlockTrigger';
export * from './useGamification';

// Generation & Filters
export * from './useGenerationFilters';
export * from './useGenerationNotifications';
export * from './useGenerationQueue';
export * from './useGenerationStats';
export * from './useGeneratorPreferences';
export * from './useGeneratorValidation';
export * from './useRealtimeGeneration';
export * from './useRetryGeneration';
export * from './useOpenAIGeneration';

// Global & State
export * from './useGlobalState';
export * from './useTypeSafeState';
export * from './useBatchSelection';

// Keyboard & Navigation
export * from './useKeyboardNavigation';

// Localization
export * from './useGlobalTranslation';
export * from './useTranslation';

// MED MNG API
export * from './useMedMngApi';

// Network & Offline
export * from './useNetworkStatus';
export * from './useOfflineQueue';
export * from './useRetryWithBackoff';

// Notifications
export * from './useEmailNotifications';
export * from './useNotifications';
export * from './usePushNotifications';

// Onboarding
export * from './useOnboarding';

// PWA
export * from './usePWA';
export * from './usePWAMetrics';

// Quota & Subscription
export * from './useFreeTrialLimit';
export * from './useIAQuota';
export * from './useQuotaRefresh';
export * from './useQuotaSync';
export * from './useSubscription';

// Recommendations
export * from './useRecommendationAlerts';
export * from './usePersonalizedRevision';

// Roles & Preferences
export * from './useUserCompetenceProgress';
export * from './useUserPreferences';
export * from './useUserRoles';

// Search
export * from './useSearch';
export * from './useSavedFilters';

// Security
export * from './useSecureStreaming';
export * from './useSecurityIncidents';
export * from './useSecurityMonitoring';
export * from './useSecurityValidation';

// SRS & Learning
export * from './useAdaptiveSRS';
export * from './useSRS';

// Suno API
export * from './useSunoCallbackListener';
export * from './useSunoCredits';
export * from './useSunoGeneration';
export * from './useSunoPolling';

// GitHub
export * from './useGitHubAccessibilityMetrics';

// Library Realtime
export * from './useLibraryRealtime';
export * from './useListeningModes';

// Window
export * from './useWindowSize';
