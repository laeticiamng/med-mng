import fs from 'fs';
import path from 'path';

/**
 * Utilitaire pour gérer la création sécurisée des répertoires de logs
 */
export class LogDirectoryHelper {
  private static readonly DEFAULT_LOG_DIR = 'logs';

  /**
   * S'assure que le répertoire de logs existe et est accessible
   * @param customLogDir - Répertoire personnalisé (optionnel)
   */
  static ensureLogDirectory(customLogDir?: string): string {
    const logDir = customLogDir 
      ? path.resolve(customLogDir)
      : path.join(process.cwd(), this.DEFAULT_LOG_DIR);

    try {
      // Vérifier si le répertoire existe déjà
      if (fs.existsSync(logDir)) {
        // Vérifier que c'est bien un répertoire
        const stats = fs.statSync(logDir);
        if (!stats.isDirectory()) {
          throw new Error(`Log path exists but is not a directory: ${logDir}`);
        }
        
        // Vérifier les permissions d'écriture
        fs.accessSync(logDir, fs.constants.W_OK);
        return logDir;
      }

      // Créer le répertoire avec les permissions appropriées
      fs.mkdirSync(logDir, { 
        recursive: true,
        mode: 0o755 // rwxr-xr-x
      });

      return logDir;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to ensure log directory '${logDir}': ${errorMessage}`);
    }
  }

  /**
   * Nettoie les anciens fichiers de logs selon une stratégie de rétention
   * @param logDir - Répertoire des logs
   * @param retentionDays - Nombre de jours de rétention (défaut: 30)
   */
  static cleanupOldLogs(logDir: string, retentionDays: number = 30): number {
    try {
      if (!fs.existsSync(logDir)) {
        return 0;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const files = fs.readdirSync(logDir);
      let deletedCount = 0;

      for (const file of files) {
        // Ne traiter que les fichiers de logs
        if (!file.endsWith('.log')) continue;

        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      return deletedCount;
      
    } catch (error) {
      throw new Error(`Failed to cleanup old logs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Obtient des informations sur l'utilisation du répertoire de logs
   * @param logDir - Répertoire des logs
   */
  static getLogDirectoryInfo(logDir: string): {
    exists: boolean;
    totalSize: number;
    fileCount: number;
    files: Array<{ name: string; size: number; modified: Date }>;
  } {
    try {
      if (!fs.existsSync(logDir)) {
        return {
          exists: false,
          totalSize: 0,
          fileCount: 0,
          files: []
        };
      }

      const files = fs.readdirSync(logDir);
      const logFiles: Array<{ name: string; size: number; modified: Date }> = [];
      let totalSize = 0;

      for (const file of files) {
        if (!file.endsWith('.log')) continue;

        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        
        logFiles.push({
          name: file,
          size: stats.size,
          modified: stats.mtime
        });
        
        totalSize += stats.size;
      }

      return {
        exists: true,
        totalSize,
        fileCount: logFiles.length,
        files: logFiles.sort((a, b) => b.modified.getTime() - a.modified.getTime())
      };
      
    } catch (error) {
      throw new Error(`Failed to get log directory info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export de la fonction principale pour compatibilité
export const ensureLogDirectory = LogDirectoryHelper.ensureLogDirectory;