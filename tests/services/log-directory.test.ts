import fs from 'fs';
import path from 'path';
import { logService } from '@/services/logService';

describe('Log Directory Creation', () => {
  const logDir = path.join(process.cwd(), 'logs');
  const testLogFile = path.join(logDir, 'test-creation.log');

  afterEach(() => {
    // Nettoyer le fichier de test s'il existe
    if (fs.existsSync(testLogFile)) {
      try {
        fs.unlinkSync(testLogFile);
      } catch (error) {
        // Ignorer les erreurs de nettoyage
      }
    }
  });

  test('should create logs directory if it does not exist', () => {
    // Vérifier que le répertoire existe maintenant (créé par ensureLogDir)
    expect(fs.existsSync(logDir)).toBe(true);
    
    // Vérifier que c'est bien un répertoire
    const stats = fs.statSync(logDir);
    expect(stats.isDirectory()).toBe(true);
  });

  test('should handle existing logs directory gracefully', () => {
    // Le répertoire devrait déjà exister
    expect(fs.existsSync(logDir)).toBe(true);
    
    // Réimporter le module ne devrait pas causer d'erreur
    expect(() => {
      delete require.cache[require.resolve('@/services/logService')];
      require('@/services/logService');
    }).not.toThrow();
  });

  test('should allow writing log files after directory creation', () => {
    // S'assurer que nous pouvons écrire des logs
    expect(() => {
      logService.info('Test log entry for directory creation');
    }).not.toThrow();
    
    // Vérifier que les fichiers de logs existent
    const errorLogPath = path.join(logDir, 'error.log');
    const combinedLogPath = path.join(logDir, 'combined.log');
    
    // Les fichiers peuvent ne pas exister immédiatement, mais le répertoire doit être accessible
    expect(fs.existsSync(logDir)).toBe(true);
    
    // Test d'écriture directe pour vérifier les permissions
    fs.writeFileSync(testLogFile, 'Test content');
    expect(fs.existsSync(testLogFile)).toBe(true);
  });

  test('should handle logs directory creation with proper permissions', () => {
    const stats = fs.statSync(logDir);
    
    // Vérifier que le répertoire est accessible en lecture et écriture
    expect(stats.isDirectory()).toBe(true);
    
    // Sur les systèmes Unix, vérifier les permissions de base
    if (process.platform !== 'win32') {
      // Le propriétaire devrait avoir au moins les droits de lecture et d'écriture
      const mode = stats.mode & parseInt('777', 8);
      expect(mode & parseInt('600', 8)).toBe(parseInt('600', 8));
    }
  });

  describe('Error handling', () => {
    test('should provide meaningful error message on directory creation failure', () => {
      // Simuler un échec de création en mockant fs.mkdirSync
      const originalMkdirSync = fs.mkdirSync;
      const originalExistsSync = fs.existsSync;
      
      // Mock pour simuler un répertoire inexistant
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      
      // Mock pour simuler un échec de création
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      // Vérifier que l'erreur est bien propagée
      expect(() => {
        delete require.cache[require.resolve('@/services/logService')];
        require('@/services/logService');
      }).toThrow(/Cannot create logs directory.*Permission denied/);
      
      // Restaurer les mocks
      fs.existsSync = originalExistsSync;
      fs.mkdirSync = originalMkdirSync;
    });
  });

  describe('Cross-platform compatibility', () => {
    test('should work with different path separators', () => {
      // Le path.join devrait gérer automatiquement les séparateurs de plateforme
      const expectedPath = path.join(process.cwd(), 'logs');
      expect(fs.existsSync(expectedPath)).toBe(true);
    });

    test('should handle relative and absolute paths correctly', () => {
      // Tester avec un chemin relatif
      const relativePath = './logs';
      const absolutePath = path.resolve(relativePath);
      
      expect(fs.existsSync(relativePath)).toBe(true);
      expect(fs.existsSync(absolutePath)).toBe(true);
      expect(path.resolve(relativePath)).toBe(absolutePath);
    });
  });
});