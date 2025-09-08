/**
 * 🧹 DEBUG CLEANER - MED-MNG v3.0
 * Système intelligent de nettoyage des logs debug
 */

import { logger } from '@/lib/logger';

type ConsoleMethod = 'log' | 'error' | 'warn' | 'info' | 'debug';

interface DebugConfig {
  enabled: boolean;
  methods: ConsoleMethod[];
  contexts: string[];
  productionMode: boolean;
}

class DebugCleaner {
  private originalConsole: Record<ConsoleMethod, (...args: any[]) => void> = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  };

  private config: DebugConfig = {
    enabled: import.meta.env.DEV,
    methods: ['log', 'error', 'warn', 'info', 'debug'],
    contexts: [],
    productionMode: import.meta.env.PROD,
  };

  private debugStats = {
    totalCalls: 0,
    blockedCalls: 0,
    allowedCalls: 0,
  };

  constructor() {
    this.initializeCleanConsole();
  }

  private initializeCleanConsole(): void {
    // En production, remplacer complètement les console.*
    if (this.config.productionMode) {
      this.replaceConsoleMethods();
    } else {
      this.enhanceConsoleMethods();
    }

    // Logger les statistiques périodiquement en dev
    if (import.meta.env.DEV) {
      setInterval(() => this.logDebugStats(), 30000);
    }
  }

  private replaceConsoleMethods(): void {
    // En production, on redirige tout vers le logger structuré
    console.log = (...args) => this.handleProductionLog('info', args);
    console.error = (...args) => this.handleProductionLog('error', args);
    console.warn = (...args) => this.handleProductionLog('warn', args);
    console.info = (...args) => this.handleProductionLog('info', args);
    console.debug = () => {}; // Complètement silencieux en prod

    this.debugStats.blockedCalls = 0; // Reset car on gère différemment
  }

  private enhanceConsoleMethods(): void {
    // En développement, on filtre et améliore
    this.config.methods.forEach(method => {
      console[method] = (...args) => this.handleDevLog(method, args);
    });
  }

  private handleProductionLog(level: 'info' | 'error' | 'warn', args: any[]): void {
    // En production, utiliser le logger structuré uniquement pour les erreurs importantes
    if (level === 'error' || (level === 'warn' && this.isImportantWarning(args))) {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      logger[level]('api', message, { originalArgs: args });
    }
  }

  private handleDevLog(method: ConsoleMethod, args: any[]): void {
    this.debugStats.totalCalls++;

    // Filtrer les logs trop verbeux ou non pertinents
    if (this.shouldBlockLog(args)) {
      this.debugStats.blockedCalls++;
      return;
    }

    // Améliorer l'affichage avec des couleurs et du contexte
    const enhancedArgs = this.enhanceLogArgs(method, args);
    this.originalConsole[method](...enhancedArgs);
    this.debugStats.allowedCalls++;
  }

  private shouldBlockLog(args: any[]): boolean {
    const logText = args.join(' ').toLowerCase();
    
    // Bloquer les logs répétitifs ou non utiles
    const blockedPatterns = [
      /^\[vite\]/,                    // Logs Vite trop verbeux
      /chunk.+imported from/,         // Logs d'import de chunks
      /hot updated/,                  // HMR logs
      /updating dependencies/,        // Package updates
      /^\s*$/, 			              // Logs vides
      /\[dev\] hot reload/,          // Hot reload notifications
      /websocket connection/,         // WebSocket spam
    ];

    return blockedPatterns.some(pattern => pattern.test(logText));
  }

  private enhanceLogArgs(method: ConsoleMethod, args: any[]): any[] {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      log: '\x1b[37m',    // Blanc
      error: '\x1b[31m',  // Rouge
      warn: '\x1b[33m',   // Jaune
      info: '\x1b[34m',   // Bleu
      debug: '\x1b[90m',  // Gris
    };
    const reset = '\x1b[0m';
    
    const prefix = `${colors[method]}[${timestamp}] [${method.toUpperCase()}]${reset}`;
    
    // Ajouter du contexte aux objets
    const enhancedArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        // Ajouter des métadonnées utiles aux objets
        return {
          ...arg,
          __debug_context: {
            timestamp,
            method,
            url: window?.location?.pathname || 'unknown'
          }
        };
      }
      return arg;
    });

    return [prefix, ...enhancedArgs];
  }

  private isImportantWarning(args: any[]): boolean {
    const warningText = args.join(' ').toLowerCase();
    
    // Warnings importants à garder même en production
    const importantPatterns = [
      /security/,
      /auth/,
      /api.+(error|fail)/,
      /database/,
      /deprecated/,
      /performance/,
    ];

    return importantPatterns.some(pattern => pattern.test(warningText));
  }

  private logDebugStats(): void {
    if (this.debugStats.totalCalls > 0) {
      const blockRate = Math.round((this.debugStats.blockedCalls / this.debugStats.totalCalls) * 100);
      
      logger.debug('performance', 'Debug statistics', {
        total: this.debugStats.totalCalls,
        blocked: this.debugStats.blockedCalls,
        allowed: this.debugStats.allowedCalls,
        blockRate: `${blockRate}%`,
        performance: {
          memory: this.getMemoryUsage(),
          calls_per_second: Math.round(this.debugStats.totalCalls / 30)
        }
      });

      // Reset stats
      this.debugStats = { totalCalls: 0, blockedCalls: 0, allowedCalls: 0 };
    }
  }

  private getMemoryUsage(): any {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
      };
    }
    return null;
  }

  // API publique pour configuration dynamique
  public configure(newConfig: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Réinitialiser si nécessaire
    if (newConfig.productionMode !== undefined) {
      this.initializeCleanConsole();
    }
  }

  public getStats() {
    return { ...this.debugStats };
  }

  public restoreOriginalConsole(): void {
    Object.entries(this.originalConsole).forEach(([method, fn]) => {
      (console as any)[method] = fn;
    });
  }
}

// Instance singleton
export const debugCleaner = new DebugCleaner();

// Export pour configuration
export const configureDebugCleaner = (config: Partial<DebugConfig>) => {
  debugCleaner.configure(config);
};

// Utilitaire pour nettoyer un composant spécifique
export const cleanComponentLogs = (componentName: string) => {
  return {
    log: (...args: any[]) => logger.debug('ui', `${componentName}: ${args.join(' ')}`),
    error: (...args: any[]) => logger.error('ui', `${componentName}: ${args.join(' ')}`),
    warn: (...args: any[]) => logger.warn('ui', `${componentName}: ${args.join(' ')}`),
  };
};

// Auto-initialisation
if (typeof window !== 'undefined') {
  logger.info('performance', '🧹 Debug Cleaner initialized', {
    mode: import.meta.env.PROD ? 'production' : 'development',
    config: debugCleaner.getStats()
  });
}