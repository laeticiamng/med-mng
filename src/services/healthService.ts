export interface BuildInfo {
  hash: string;
  timestamp: string;
  version: string;
  environment: string;
}

export interface HealthStatus {
  status: 'healthy';
  message: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  timestamp: string;
  build: BuildInfo;
}

const BUILD_INFO: BuildInfo = {
  hash:
    process.env.BUILD_SHA ||
    process.env.BUILD_HASH ||
    process.env.GITHUB_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.SUPABASE_REF ||
    'local-dev',
  timestamp:
    process.env.BUILD_TIMESTAMP ||
    process.env.DEPLOYED_AT ||
    new Date().toISOString(),
  version: process.env.APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
};

const HEALTH_MESSAGE = 'Med-MNG API running';

export const getBuildInfo = (): BuildInfo => ({ ...BUILD_INFO });

export const getHealthStatus = (): HealthStatus => ({
  status: 'healthy',
  message: HEALTH_MESSAGE,
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  timestamp: new Date().toISOString(),
  build: getBuildInfo(),
});

export const getHealthMessage = () => HEALTH_MESSAGE;
