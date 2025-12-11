import { supabase } from '@/integrations/supabase/client';

// Types pour le health check
export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: string;
  details?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: ServiceHealth[];
  metrics: HealthMetrics;
}

export interface HealthMetrics {
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface HealthCheckResult {
  success: boolean;
  data?: SystemHealth;
  error?: string;
}

// Configuration
const HEALTH_CHECK_TIMEOUT = 5000;
const startTime = Date.now();

// Message de santé simple (rétrocompatibilité)
export const getHealthMessage = () => 'Med-MNG API running';

// Vérification de la connexion Supabase
async function checkSupabaseHealth(): Promise<ServiceHealth> {
  const start = performance.now();
  try {
    const { error } = await supabase.from('edn_items').select('count').limit(1).single();
    const responseTime = performance.now() - start;

    return {
      name: 'Supabase Database',
      status: error ? 'degraded' : 'healthy',
      responseTime: Math.round(responseTime),
      lastCheck: new Date().toISOString(),
      details: error ? error.message : 'Connection successful'
    };
  } catch (err) {
    return {
      name: 'Supabase Database',
      status: 'unhealthy',
      responseTime: performance.now() - start,
      lastCheck: new Date().toISOString(),
      details: err instanceof Error ? err.message : 'Connection failed'
    };
  }
}

// Vérification de l'authentification Supabase
async function checkAuthHealth(): Promise<ServiceHealth> {
  const start = performance.now();
  try {
    const { error } = await supabase.auth.getSession();
    const responseTime = performance.now() - start;

    return {
      name: 'Supabase Auth',
      status: error ? 'degraded' : 'healthy',
      responseTime: Math.round(responseTime),
      lastCheck: new Date().toISOString(),
      details: error ? error.message : 'Auth service operational'
    };
  } catch (err) {
    return {
      name: 'Supabase Auth',
      status: 'unhealthy',
      responseTime: performance.now() - start,
      lastCheck: new Date().toISOString(),
      details: err instanceof Error ? err.message : 'Auth service unavailable'
    };
  }
}

// Vérification du stockage Supabase
async function checkStorageHealth(): Promise<ServiceHealth> {
  const start = performance.now();
  try {
    const { error } = await supabase.storage.listBuckets();
    const responseTime = performance.now() - start;

    return {
      name: 'Supabase Storage',
      status: error ? 'degraded' : 'healthy',
      responseTime: Math.round(responseTime),
      lastCheck: new Date().toISOString(),
      details: error ? error.message : 'Storage service operational'
    };
  } catch (err) {
    return {
      name: 'Supabase Storage',
      status: 'unhealthy',
      responseTime: performance.now() - start,
      lastCheck: new Date().toISOString(),
      details: err instanceof Error ? err.message : 'Storage service unavailable'
    };
  }
}

// Vérification des Edge Functions
async function checkEdgeFunctionsHealth(): Promise<ServiceHealth> {
  const start = performance.now();
  try {
    const { error } = await supabase.functions.invoke('health-check', {
      body: { ping: true }
    });
    const responseTime = performance.now() - start;

    // Si la fonction n'existe pas, c'est normal - on retourne degraded
    if (error?.message?.includes('not found') || error?.message?.includes('404')) {
      return {
        name: 'Edge Functions',
        status: 'degraded',
        responseTime: Math.round(responseTime),
        lastCheck: new Date().toISOString(),
        details: 'Health check function not deployed'
      };
    }

    return {
      name: 'Edge Functions',
      status: error ? 'degraded' : 'healthy',
      responseTime: Math.round(responseTime),
      lastCheck: new Date().toISOString(),
      details: error ? error.message : 'Edge functions operational'
    };
  } catch (err) {
    return {
      name: 'Edge Functions',
      status: 'degraded',
      responseTime: performance.now() - start,
      lastCheck: new Date().toISOString(),
      details: 'Edge functions check skipped'
    };
  }
}

// Vérification de la mémoire (côté client)
function getMemoryMetrics(): { memoryUsage: number; cpuUsage: number } {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const memory = (performance as any).memory;
    if (memory) {
      return {
        memoryUsage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
        cpuUsage: 0 // Non disponible côté client
      };
    }
  }
  return { memoryUsage: 0, cpuUsage: 0 };
}

// Health check complet du système
export async function getSystemHealth(): Promise<HealthCheckResult> {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Health check timeout')), HEALTH_CHECK_TIMEOUT)
    );

    const healthChecks = Promise.all([
      checkSupabaseHealth(),
      checkAuthHealth(),
      checkStorageHealth(),
      checkEdgeFunctionsHealth()
    ]);

    const services = await Promise.race([healthChecks, timeout]);

    // Calcul du statut global
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    }

    // Métriques
    const { memoryUsage, cpuUsage } = getMemoryMetrics();
    const averageResponseTime = services.reduce((sum, s) => sum + s.responseTime, 0) / services.length;

    const systemHealth: SystemHealth = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      uptime: Math.round((Date.now() - startTime) / 1000),
      services,
      metrics: {
        totalRequests: 0, // À implémenter avec analytics
        errorRate: unhealthyCount / services.length * 100,
        averageResponseTime: Math.round(averageResponseTime),
        activeConnections: services.filter(s => s.status === 'healthy').length,
        memoryUsage,
        cpuUsage
      }
    };

    return { success: true, data: systemHealth };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Health check failed'
    };
  }
}

// Vérification rapide (ping)
export async function quickHealthCheck(): Promise<boolean> {
  try {
    const { error } = await supabase.from('edn_items').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// Vérification d'un service spécifique
export async function checkServiceHealth(serviceName: string): Promise<ServiceHealth | null> {
  switch (serviceName.toLowerCase()) {
    case 'database':
    case 'supabase':
      return checkSupabaseHealth();
    case 'auth':
    case 'authentication':
      return checkAuthHealth();
    case 'storage':
      return checkStorageHealth();
    case 'functions':
    case 'edge':
      return checkEdgeFunctionsHealth();
    default:
      return null;
  }
}

// Historique des health checks (pour dashboard)
let healthHistory: SystemHealth[] = [];
const MAX_HISTORY = 100;

export function recordHealthCheck(health: SystemHealth): void {
  healthHistory.unshift(health);
  if (healthHistory.length > MAX_HISTORY) {
    healthHistory = healthHistory.slice(0, MAX_HISTORY);
  }
}

export function getHealthHistory(): SystemHealth[] {
  return [...healthHistory];
}

export function clearHealthHistory(): void {
  healthHistory = [];
}

// Export des types pour utilisation externe
export type { ServiceHealth as HealthServiceStatus };
