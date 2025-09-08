/**
 * 🧹 DEBUG CLEANER INTELLIGENT - MED-MNG v3.0
 * Nettoyage automatique des logs et optimisation en production
 */

import { logger } from '@/lib/logger';

// ==========================================
// CONFIGURATION DU CLEANER
// ==========================================

interface CleanerConfig {
  enabled: boolean;
  productionOnly: boolean;
  preserveErrors: boolean;
  preserveWarnings: boolean;
  preserveDebugContexts: string[];
  statisticsEnabled: boolean;
}

interface CleanerStats {
  totalLogsProcessed: number;
  logsRemoved: number;
  logsPreserved: number;
  contexts: Record<string, number>;
  performance: {
    cleaningTime: number;
    memoryBefore: number;
    memoryAfter: number;
  };
}

// ==========================================
// CLEANER INTELLIGENT
// ==========================================

class DebugCleaner {
  private config: CleanerConfig = {
    enabled: import.meta.env.PROD,
    productionOnly: true,
    preserveErrors: true,
    preserveWarnings: true,
    preserveDebugContexts: ['security', 'performance', 'critical'],
    statisticsEnabled: import.meta.env.DEV
  };

  private stats: CleanerStats = {
    totalLogsProcessed: 0,
    logsRemoved: 0,
    logsPreserved: 0,
    contexts: {},
    performance: {
      cleaningTime: 0,
      memoryBefore: 0,
      memoryAfter: 0
    }
  };

  private originalMethods = {
    log: console.log,
    info: console.info,
    debug: console.debug,
    warn: console.warn,
    error: console.error
  };

  initialize(): void {
    if (!this.config.enabled) {
      logger.debug('app', '🧹 Debug cleaner disabled in development mode');
      return;
    }

    const startTime = performance.now();
    this.recordMemoryUsage('before');

    logger.info('app', '🧹 Initializing intelligent debug cleaner');

    // Remplacer les méthodes console
    this.replaceConsoleMethods();
    
    // Configurer le nettoyage périodique
    this.setupPeriodicCleaning();

    this.stats.performance.cleaningTime = performance.now() - startTime;
    this.recordMemoryUsage('after');

    if (this.config.statisticsEnabled) {
      this.logStatistics();
    }
  }

  private replaceConsoleMethods(): void {
    // Remplacer console.log
    console.log = (...args: unknown[]) => {
      this.stats.totalLogsProcessed++;
      
      if (this.shouldPreserveLog('log', args)) {
        this.stats.logsPreserved++;
        this.originalMethods.log(...args);
      } else {
        this.stats.logsRemoved++;
        // Log silencieux - ne fait rien
      }
    };

    // Remplacer console.info  
    console.info = (...args: unknown[]) => {
      this.stats.totalLogsProcessed++;
      
      if (this.shouldPreserveLog('info', args)) {
        this.stats.logsPreserved++;
        this.originalMethods.info(...args);
      } else {
        this.stats.logsRemoved++;
      }
    };

    // Remplacer console.debug
    console.debug = (...args: unknown[]) => {
      this.stats.totalLogsProcessed++;
      
      if (this.shouldPreserveLog('debug', args)) {
        this.stats.logsPreserved++;
        this.originalMethods.debug(...args);
      } else {
        this.stats.logsRemoved++;
      }
    };

    // Préserver warn et error selon la config
    if (!this.config.preserveWarnings) {
      console.warn = (...args: unknown[]) => {
        this.stats.totalLogsProcessed++;
        if (this.shouldPreserveLog('warn', args)) {
          this.stats.logsPreserved++;
          this.originalMethods.warn(...args);
        } else {
          this.stats.logsRemoved++;
        }
      };
    }

    if (!this.config.preserveErrors) {
      console.error = (...args: unknown[]) => {
        this.stats.totalLogsProcessed++;
        if (this.shouldPreserveLog('error', args)) {
          this.stats.logsPreserved++;
          this.originalMethods.error(...args);
        } else {
          this.stats.logsRemoved++;
        }
      };
    }
  }

  private shouldPreserveLog(level: string, args: unknown[]): boolean {
    const message = args[0]?.toString().toLowerCase() || '';

    // Toujours préserver les erreurs critiques
    if (level === 'error' && this.config.preserveErrors) {
      return true;
    }

    // Toujours préserver les warnings importants
    if (level === 'warn' && this.config.preserveWarnings) {
      return true;
    }

    // Préserver les contextes spécifiés
    for (const context of this.config.preserveDebugContexts) {
      if (message.includes(context.toLowerCase())) {
        this.updateContextStats(context);
        return true;
      }
    }

    // Préserver les logs avec des emojis critiques
    const criticalEmojis = ['🚨', '💥', '⚠️', '🔴', '❌', '🛑'];
    if (criticalEmojis.some(emoji => message.includes(emoji))) {
      this.updateContextStats('critical-emoji');
      return true;
    }

    // Préserver les logs de performance importants
    if (message.includes('performance') && (message.includes('slow') || message.includes('error'))) {
      this.updateContextStats('performance');
      return true;
    }

    return false;
  }

  private updateContextStats(context: string): void {
    this.stats.contexts[context] = (this.stats.contexts[context] || 0) + 1;
  }

  private recordMemoryUsage(phase: 'before' | 'after'): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      this.stats.performance[`memory${phase.charAt(0).toUpperCase() + phase.slice(1)}` as keyof typeof this.stats.performance] = usedMB;
    }
  }

  private setupPeriodicCleaning(): void {
    // Nettoyage périodique des références
    setInterval(() => {
      if (this.config.statisticsEnabled) {
        this.logStatistics();
      }
      this.cleanupStats();
    }, 60000); // Toutes les minutes
  }

  private cleanupStats(): void {
    // Réinitialiser les stats périodiquement pour éviter l'accumulation
    if (this.stats.totalLogsProcessed > 10000) {
      const preservation = this.stats.logsPreserved / this.stats.totalLogsProcessed;
      logger.info('app', '🧹 Debug cleaner stats reset', {
        preservationRate: `${Math.round(preservation * 100)}%`,
        totalProcessed: this.stats.totalLogsProcessed
      });
      
      this.stats = {
        ...this.stats,
        totalLogsProcessed: 0,
        logsRemoved: 0,
        logsPreserved: 0
      };
    }
  }

  private logStatistics(): void {
    const memoryImprovement = this.stats.performance.memoryBefore - this.stats.performance.memoryAfter;
    const preservationRate = this.stats.totalLogsProcessed > 0 
      ? (this.stats.logsPreserved / this.stats.totalLogsProcessed) * 100 
      : 0;

    logger.info('app', '📊 Debug cleaner statistics', {
      processed: this.stats.totalLogsProcessed,
      removed: this.stats.logsRemoved,
      preserved: this.stats.logsPreserved,
      preservationRate: `${Math.round(preservationRate)}%`,
      memoryImprovement: `${memoryImprovement}MB`,
      cleaningTime: `${Math.round(this.stats.performance.cleaningTime)}ms`,
      contexts: this.stats.contexts
    });
  }

  // Méthodes publiques pour contrôle externe
  getStatistics(): CleanerStats {
    return { ...this.stats };
  }

  updateConfig(newConfig: Partial<CleanerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('app', '🧹 Debug cleaner config updated', newConfig);
  }

  forceCleanup(): void {
    this.cleanupStats();
    logger.info('app', '🧹 Debug cleaner force cleanup completed');
  }

  // Méthode pour restaurer les méthodes originales
  restore(): void {
    console.log = this.originalMethods.log;
    console.info = this.originalMethods.info;
    console.debug = this.originalMethods.debug;
    console.warn = this.originalMethods.warn;
    console.error = this.originalMethods.error;
    
    logger.info('app', '🧹 Debug cleaner disabled - original console methods restored');
  }
}

// ==========================================
// INSTANCE GLOBALE ET EXPORT
// ==========================================

export const debugCleaner = new DebugCleaner();

// Auto-initialisation en production
if (import.meta.env.PROD) {
  debugCleaner.initialize();
}

// Helper functions pour usage externe
export const cleanDebugLogs = () => {
  debugCleaner.initialize();
};

export const getDebugStats = () => {
  return debugCleaner.getStatistics();
};

export const configureDebugCleaner = (config: Partial<CleanerConfig>) => {
  debugCleaner.updateConfig(config);
};