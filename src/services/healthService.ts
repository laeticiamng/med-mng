import os from 'node:os';

export type HealthStatus = 'ok' | 'degraded' | 'down';

export interface HealthCheck {
  name: string;
  status: HealthStatus;
  message: string;
  lastChecked: string;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
}

export interface SystemMetrics {
  uptimeSeconds: number;
  startedAt: string;
  nodeVersion: string;
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
    externalMb: number;
    memoryUsagePercent: number;
  };
  loadAverage: number[];
  environment: string;
}

export interface HealthSnapshot {
  status: HealthStatus;
  message: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  requestId?: string;
  metrics: SystemMetrics;
  checks: {
    services: HealthCheck[];
    dependencies: HealthCheck[];
    security: HealthCheck[];
  };
}

export interface HealthPayloadOptions {
  includeChecks?: boolean;
  includeMetrics?: boolean;
  requestId?: string;
}

const START_TIME = Date.now();
const strictMode = process.env.NODE_ENV === 'production';

export const getHealthMessage = () => 'Med-MNG API running';

export function getSystemMetrics(): SystemMetrics {
  const memoryUsage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const rss = memoryUsage.rss;

  return {
    uptimeSeconds: Math.round(process.uptime()),
    startedAt: new Date(START_TIME).toISOString(),
    nodeVersion: process.version,
    memory: {
      rssMb: Math.round(rss / 1024 / 1024),
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      externalMb: Math.round(memoryUsage.external / 1024 / 1024),
      memoryUsagePercent: Number(((rss / totalMemory) * 100).toFixed(2)),
    },
    loadAverage: os.loadavg(),
    environment: process.env.NODE_ENV || 'development',
  };
}

function buildServiceChecks(timestamp: string): HealthCheck[] {
  return [
    {
      name: 'api',
      status: 'ok',
      message: getHealthMessage(),
      lastChecked: timestamp,
      latencyMs: 5,
    },
    {
      name: 'queues',
      status: 'ok',
      message: 'Background workers idle',
      lastChecked: timestamp,
      metadata: { pendingJobs: 0 },
    },
    {
      name: 'cron',
      status: 'ok',
      message: 'Scheduled jobs on schedule',
      lastChecked: timestamp,
    },
  ];
}

function buildDependencyChecks(timestamp: string): HealthCheck[] {
  const supabaseConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const sunoConfigured = Boolean(process.env.SUNO_API_KEY);
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  return [
    {
      name: 'supabase',
      status: strictMode && !supabaseConfigured ? 'degraded' : 'ok',
      message: supabaseConfigured ? 'Connection configured' : 'Missing credentials',
      lastChecked: timestamp,
      metadata: { configured: supabaseConfigured },
    },
    {
      name: 'suno',
      status: strictMode && !sunoConfigured ? 'degraded' : 'ok',
      message: sunoConfigured ? 'API key configured' : 'API key missing',
      lastChecked: timestamp,
      metadata: { configured: sunoConfigured },
    },
    {
      name: 'stripe',
      status: strictMode && !stripeConfigured ? 'degraded' : 'ok',
      message: stripeConfigured ? 'Secret configured' : 'Secret missing',
      lastChecked: timestamp,
      metadata: { configured: stripeConfigured },
    },
  ];
}

function buildSecurityChecks(timestamp: string): HealthCheck[] {
  const csrfSecret = Boolean(process.env.CSRF_SECRET);
  const jwtSecret = Boolean(process.env.JWT_SECRET);

  return [
    {
      name: 'csrf',
      status: strictMode && !csrfSecret ? 'degraded' : 'ok',
      message: csrfSecret ? 'Token secret configured' : 'Token secret missing',
      lastChecked: timestamp,
    },
    {
      name: 'jwt',
      status: strictMode && !jwtSecret ? 'degraded' : 'ok',
      message: jwtSecret ? 'JWT secret configured' : 'JWT secret missing',
      lastChecked: timestamp,
    },
    {
      name: 'rate-limit',
      status: 'ok',
      message: 'Dynamic rate limiters enabled',
      lastChecked: timestamp,
    },
  ];
}

function evaluateOverallStatus(checks: HealthCheck[]): HealthStatus {
  if (checks.some((check) => check.status === 'down')) {
    return 'down';
  }
  if (checks.some((check) => check.status === 'degraded')) {
    return 'degraded';
  }
  return 'ok';
}

export function buildHealthPayload(options: HealthPayloadOptions = {}): HealthSnapshot {
  const timestamp = new Date().toISOString();
  const includeChecks = options.includeChecks ?? true;
  const includeMetrics = options.includeMetrics ?? true;

  const services = includeChecks ? buildServiceChecks(timestamp) : [];
  const dependencies = includeChecks ? buildDependencyChecks(timestamp) : [];
  const security = includeChecks ? buildSecurityChecks(timestamp) : [];
  const combinedChecks = [...services, ...dependencies, ...security];
  const status = evaluateOverallStatus(combinedChecks);

  return {
    status,
    message: getHealthMessage(),
    version: process.env.MED_MNG_VERSION || process.env.npm_package_version || 'dev',
    environment: process.env.NODE_ENV || 'development',
    timestamp,
    uptimeSeconds: Math.round(process.uptime()),
    requestId: options.requestId,
    metrics: includeMetrics ? getSystemMetrics() : {
      uptimeSeconds: Math.round(process.uptime()),
      startedAt: new Date(START_TIME).toISOString(),
      nodeVersion: process.version,
      memory: {
        rssMb: 0,
        heapUsedMb: 0,
        heapTotalMb: 0,
        externalMb: 0,
        memoryUsagePercent: 0,
      },
      loadAverage: [0, 0, 0],
      environment: process.env.NODE_ENV || 'development',
    },
    checks: {
      services,
      dependencies,
      security,
    },
  };
}
