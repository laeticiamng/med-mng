/**
 * Nettoyeur final des console.log pour la production
 * Remplace tous les console.* par des logs structurés
 */

import { logger } from '@/lib/logger';

export class FinalConsoleCleaner {
  private static readonly CONSOLE_PATTERNS = [
    /console\.log\s*\([^)]*\)\s*;?/g,
    /console\.warn\s*\([^)]*\)\s*;?/g,
    /console\.error\s*\([^)]*\)\s*;?/g,
    /console\.info\s*\([^)]*\)\s*;?/g,
    /console\.debug\s*\([^)]*\)\s*;?/g,
    /console\.trace\s*\([^)]*\)\s*;?/g,
  ];

  private static readonly DEBUG_PATTERNS = [
    /\/\*\s*DEBUG:.*?\*\//gs,
    /\/\*\s*TEMP:.*?\*\//gs,
    /\/\*\s*TODO:.*?\*\//gs,
    /\/\*\s*FIXME:.*?\*\//gs,
    /\/\*\s*HACK:.*?\*\//gs,
    /\/\/\s*DEBUG:.*$/gm,
    /\/\/\s*TEMP:.*$/gm,
    /\/\/\s*TODO:.*$/gm,
    /\/\/\s*FIXME:.*$/gm,
    /\/\/\s*HACK:.*$/gm,
  ];

  /**
   * Nettoie le code des console.log et commentaires de debug
   */
  public static cleanCode(code: string): string {
    let cleanedCode = code;

    // Supprimer les console.*
    this.CONSOLE_PATTERNS.forEach(pattern => {
      cleanedCode = cleanedCode.replace(pattern, '');
    });

    // Supprimer les commentaires de debug
    this.DEBUG_PATTERNS.forEach(pattern => {
      cleanedCode = cleanedCode.replace(pattern, '');
    });

    // Nettoyer les lignes vides multiples
    cleanedCode = cleanedCode.replace(/\n\s*\n\s*\n/g, '\n\n');

    return cleanedCode;
  }

  /**
   * Remplace les console.error par du logging structuré
   */
  public static replaceConsoleError(code: string): string {
    return code.replace(
      /console\.error\s*\(\s*['"`]([^'"`]+)['"`]\s*,?\s*([^)]*)\)\s*;?/g,
      (match, message, params) => {
        if (params.trim()) {
          return `logger.error('${message}', { context: ${params.trim()} });`;
        } else {
          return `logger.error('${message}');`;
        }
      }
    );
  }

  /**
   * Remplace les console.log par du logging structuré
   */
  public static replaceConsoleLog(code: string): string {
    return code.replace(
      /console\.log\s*\(\s*['"`]([^'"`]+)['"`]\s*,?\s*([^)]*)\)\s*;?/g,
      (match, message, params) => {
        if (params.trim()) {
          return `logger.debug('${message}', { data: ${params.trim()} });`;
        } else {
          return `logger.debug('${message}');`;
        }
      }
    );
  }

  /**
   * Analyse et compte les console.* dans le code
   */
  public static analyzeConsoleUsage(code: string): {
    total: number;
    byType: Record<string, number>;
    locations: Array<{ line: number; type: string; content: string }>;
  } {
    const lines = code.split('\n');
    const locations: Array<{ line: number; type: string; content: string }> = [];
    const byType: Record<string, number> = {
      log: 0,
      error: 0,
      warn: 0,
      info: 0,
      debug: 0,
      trace: 0
    };

    lines.forEach((line, index) => {
      const consoleMatch = line.match(/console\.(\w+)/);
      if (consoleMatch) {
        const type = consoleMatch[1];
        if (byType.hasOwnProperty(type)) {
          byType[type]++;
          locations.push({
            line: index + 1,
            type,
            content: line.trim()
          });
        }
      }
    });

    const total = Object.values(byType).reduce((sum, count) => sum + count, 0);

    return { total, byType, locations };
  }

  /**
   * Génère un rapport de nettoyage
   */
  public static generateCleaningReport(
    originalCode: string,
    cleanedCode: string
  ): {
    originalStats: ReturnType<typeof FinalConsoleCleaner.analyzeConsoleUsage>;
    cleanedStats: ReturnType<typeof FinalConsoleCleaner.analyzeConsoleUsage>;
    reductionPercentage: number;
    linesRemoved: number;
  } {
    const originalStats = this.analyzeConsoleUsage(originalCode);
    const cleanedStats = this.analyzeConsoleUsage(cleanedCode);
    
    const reductionPercentage = originalStats.total > 0 
      ? Math.round(((originalStats.total - cleanedStats.total) / originalStats.total) * 100)
      : 0;

    const linesRemoved = originalCode.split('\n').length - cleanedCode.split('\n').length;

    return {
      originalStats,
      cleanedStats,
      reductionPercentage,
      linesRemoved
    };
  }

  /**
   * Nettoie tous les patterns de debug en une seule passe
   */
  public static performCompleteCleanup(code: string): {
    cleanedCode: string;
    report: ReturnType<typeof FinalConsoleCleaner.generateCleaningReport>;
  } {
    let cleanedCode = code;
    
    // Remplacer les console.error par du logging avant suppression
    cleanedCode = this.replaceConsoleError(cleanedCode);
    
    // Nettoyer complètement
    cleanedCode = this.cleanCode(cleanedCode);
    
    // Générer le rapport
    const report = this.generateCleaningReport(code, cleanedCode);
    
    return { cleanedCode, report };
  }
}

// Instance globale pour l'utilisation
export const finalConsoleCleaner = new FinalConsoleCleaner();