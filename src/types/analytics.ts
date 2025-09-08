/**
 * 🎯 TYPES ANALYTICS & MONITORING - MED-MNG v3.0
 * Types pour l'analyse et le monitoring
 */

import type { ID, Timestamp, JSONObject } from './core';

// ==========================================
// TYPES ANALYTICS & MONITORING
// ==========================================

export interface AnalyticsEvent {
  id: ID;
  event_name: string;
  user_id?: ID;
  properties: JSONObject;
  timestamp: Timestamp;
  session_id?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'mb' | 'count' | 'percent';
  timestamp: Timestamp;
  context?: JSONObject;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  components: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    last_check: Timestamp;
    message?: string;
  }>;
  last_updated: Timestamp;
}