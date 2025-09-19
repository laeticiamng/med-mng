import type { CanonicalAnalyticsEventType } from '@/services/CanonicalAnalyticsTracker';

export const CANONICAL_EVENT_LABELS: Record<CanonicalAnalyticsEventType, string> & Record<string, string> = {
  generate_start: 'Génération démarrée',
  generate_success: 'Génération réussie',
  generate_fail: 'Échec génération',
  lyrics_timecode_done: 'Lyrics timecodées',
  play: 'Lecture audio',
  seek_segment: 'Recherche segment',
  qcm_start: 'QCM démarré',
  qcm_submit: 'QCM soumis',
  qcm_complete: 'QCM enregistré',
  bd_generate_start: 'BD – génération démarrée',
  bd_generate_success: 'BD – génération réussie',
  bd_generate_fail: 'BD – génération échouée',
  study_start: 'Séance 8 min démarrée',
  study_end: 'Séance 8 min terminée',
  sync_success: 'Sync EDN réussie',
  sync_fail: 'Sync EDN échouée',
};

export const CANONICAL_EVENT_COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#f97316',
  '#22c55e',
  '#ec4899',
  '#a855f7',
  '#14b8a6',
  '#facc15',
];

export function formatCanonicalEventLabel(eventType: string): string {
  return CANONICAL_EVENT_LABELS[eventType] ?? eventType;
}

export function getCanonicalEventColor(eventType: string, index: number): string {
  const normalizedIndex = index % CANONICAL_EVENT_COLORS.length;
  return CANONICAL_EVENT_COLORS[normalizedIndex];
}
