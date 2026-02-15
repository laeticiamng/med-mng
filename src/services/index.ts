// Services Central Index
export type {
  IncidentType,
  AlertSeverity,
  AlertStatus,
  AlertChannel,
  Incident,
  Alert,
  AlertRule,
  AlertStats,
} from './alertService';
export {
  notifyIncident,
  acknowledgeAlert,
  resolveAlert,
  getAlerts,
  getAlertStats,
  addAlertNote,
  escalateAlert,
  getLocalAlertHistory,
  clearDeduplicationCache,
  cleanupOldAlerts,
  createIncident,
} from './alertService';

export type {
  EcosSituation,
  EcosPagination,
  EcosSearchResult,
  EcosAnalytics,
  EcosSearchCriteria,
} from './ecosService';
export { ecosService } from './ecosService';

export type {
  TableauRang,
  ItemCompleteness,
  CompletenessAuditResult,
} from './ednTableauxService';
export { ednTableauxService } from './ednTableauxService';

export type {
  ServiceHealth,
  SystemHealth,
  HealthMetrics,
  HealthCheckResult,
  HealthServiceStatus,
} from './healthService';
export {
  getHealthMessage,
  getSystemHealth,
  quickHealthCheck,
  checkServiceHealth,
  recordHealthCheck,
  getHealthHistory,
  clearHealthHistory,
} from './healthService';

export type {
  LogLevel,
  LogCategory,
  LogEntry,
  LogFilter,
  LogStats,
} from './logService';
export {
  stopFlushTimer,
  log,
  debug,
  info,
  warn,
  error,
  critical,
  logOperation,
  getLogs,
  getLogStats,
  deleteOldLogs,
  exportLogs,
  exportLogsCSV,
  auditLog,
  performanceLog,
  cleanup,
} from './logService';

export {
  fetchItemsWithMeta,
  fetchItemDetail,
  upsertItemProgress,
  toggleFavoriteItem,
  fetchProgressOverview,
} from './medMngItemsService';

// monitoringService has conflicting SystemHealth export with healthService
export { monitoringService } from './monitoringService';
export type { PerformanceMetrics } from './monitoringService';

export type {
  MusicGenerationRequest,
  GeneratedSong,
  GenerationStats,
  Playlist,
  PlaylistSong,
} from './musicService';
export { musicService } from './musicService';

export type {
  ContentMetadata,
  PedagogicalContent,
  ContentAnalytics,
  GenerationResult,
} from './pedagogicalContentService';
export { pedagogicalContentService } from './pedagogicalContentService';

export type {
  PerformanceMetric,
  PerformanceBudget,
  SLAMetric,
  PerformanceAlert,
  PerformanceAnalytics,
} from './performanceAnalyticsService';
export { performanceAnalyticsService } from './performanceAnalyticsService';

export type {
  QcmQuestion,
  QcmSession,
  QcmResponse,
  ErrorSong,
  UserQuota,
} from './qcmService';
export { qcmService } from './qcmService';

export { rateLimitService, RATE_LIMITS, useRateLimit } from './rateLimitService';
