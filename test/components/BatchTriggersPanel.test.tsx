import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { BatchTriggersPanel } from '@/components/admin/BatchTriggersPanel';
import { 
  triggerBulkLyrics, 
  triggerOicFix, 
  getTriggerStatus, 
  resetTriggerStatus,
  runAllBatchTriggers 
} from '@/utils/batchTriggers';

// Mock des dépendances
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }
}));

vi.mock('@/utils/batchTriggers', () => ({
  triggerBulkLyrics: vi.fn(),
  triggerOicFix: vi.fn(),
  getTriggerStatus: vi.fn(),
  resetTriggerStatus: vi.fn(),
  runAllBatchTriggers: vi.fn(),
}));

// Mock du localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('BatchTriggersPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock des statuts par défaut
    (getTriggerStatus as any).mockImplementation((type: string) => ({
      executed: false,
      lastExecution: undefined,
      executionKey: `${type}Key`
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Rendu initial', () => {
    it('should render the panel with correct titles', () => {
      render(<BatchTriggersPanel />);
      
      expect(screen.getByText('Gestion des Batch Triggers')).toBeInTheDocument();
      expect(screen.getByText('🎵 Génération Massive de Paroles')).toBeInTheDocument();
      expect(screen.getByText('🔧 Correction des Compétences OIC')).toBeInTheDocument();
    });

    it('should show environment selector', () => {
      render(<BatchTriggersPanel />);
      
      const environmentSelect = screen.getByDisplayValue('Développement');
      expect(environmentSelect).toBeInTheDocument();
      
      // Options disponibles
      expect(screen.getByText('Développement')).toBeInTheDocument();
      expect(screen.getByText('Staging')).toBeInTheDocument();
      expect(screen.getByText('Production')).toBeInTheDocument();
    });

    it('should display initial status as "En attente"', () => {
      render(<BatchTriggersPanel />);
      
      const pendingBadges = screen.getAllByText('En attente');
      expect(pendingBadges).toHaveLength(2); // Un pour chaque trigger
    });
  });

  describe('Gestion des statuts', () => {
    it('should show executed status when triggers have been run', () => {
      (getTriggerStatus as any).mockImplementation((type: string) => ({
        executed: true,
        lastExecution: '2024-01-15T10:30:00.000Z',
        executionKey: `${type}Key`
      }));

      render(<BatchTriggersPanel />);
      
      const executedBadges = screen.getAllByText('Exécuté');
      expect(executedBadges).toHaveLength(2);
      
      // Vérifier les dates d'exécution
      expect(screen.getAllByText('15/01/2024, 11:30:00')).toHaveLength(2);
    });

    it('should handle reset status functionality', async () => {
      render(<BatchTriggersPanel />);
      
      const resetButtons = screen.getAllByText('Reset');
      fireEvent.click(resetButtons[0]); // Reset bulk lyrics
      
      expect(resetTriggerStatus).toHaveBeenCalledWith('bulkLyrics');
      expect(toast.info).toHaveBeenCalledWith('Statut de génération de paroles réinitialisé');
    });
  });

  describe('Exécution des triggers', () => {
    it('should execute bulk lyrics trigger successfully', async () => {
      const mockResult = {
        success: true,
        data: { processed: 367 },
        timestamp: '2024-01-15T10:30:00.000Z',
        executionKey: 'bulkLyricsKey'
      };
      
      (triggerBulkLyrics as any).mockResolvedValue(mockResult);

      render(<BatchTriggersPanel />);
      
      const generateButton = screen.getByText('Générer les paroles');
      fireEvent.click(generateButton);
      
      // Vérifier le toast de démarrage
      expect(toast.info).toHaveBeenCalledWith('Démarrage Génération de paroles...', {
        description: 'Cette opération peut prendre plusieurs minutes'
      });
      
      await waitFor(() => {
        expect(triggerBulkLyrics).toHaveBeenCalledWith({ environment: 'development' });
        expect(toast.success).toHaveBeenCalledWith('Génération de paroles terminée avec succès !', {
          description: 'Exécutée à 15/01/2024, 11:30:00'
        });
      });
    });

    it('should handle trigger execution errors', async () => {
      const mockResult = {
        success: false,
        error: 'Erreur de réseau',
        timestamp: '2024-01-15T10:30:00.000Z',
        executionKey: 'oicFixKey'
      };
      
      (triggerOicFix as any).mockResolvedValue(mockResult);

      render(<BatchTriggersPanel />);
      
      const correctButton = screen.getByText('Corriger les OIC');
      fireEvent.click(correctButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur lors de Correction OIC', {
          description: 'Erreur de réseau'
        });
      });
    });

    it('should execute with force option', async () => {
      const mockResult = {
        success: true,
        data: {},
        timestamp: '2024-01-15T10:30:00.000Z',
        executionKey: 'bulkLyricsKey'
      };
      
      (triggerBulkLyrics as any).mockResolvedValue(mockResult);

      render(<BatchTriggersPanel />);
      
      const forceButton = screen.getAllByText('Forcer l\'exécution')[0];
      fireEvent.click(forceButton);
      
      await waitFor(() => {
        expect(triggerBulkLyrics).toHaveBeenCalledWith({ 
          environment: 'development', 
          forceExecution: true 
        });
      });
    });
  });

  describe('Exécution de tous les triggers', () => {
    it('should execute all triggers successfully', async () => {
      const mockResults = {
        bulkLyrics: {
          success: true,
          data: {},
          timestamp: '2024-01-15T10:30:00.000Z',
          executionKey: 'bulkLyricsKey'
        },
        oicFix: {
          success: true,
          data: {},
          timestamp: '2024-01-15T10:31:00.000Z',
          executionKey: 'oicFixKey'
        }
      };
      
      (runAllBatchTriggers as any).mockResolvedValue(mockResults);

      render(<BatchTriggersPanel />);
      
      const executeAllButton = screen.getByText('Exécuter tous les triggers');
      fireEvent.click(executeAllButton);
      
      expect(toast.info).toHaveBeenCalledWith('Démarrage de tous les batch triggers...', {
        description: 'Cette opération peut prendre 15-20 minutes'
      });
      
      await waitFor(() => {
        expect(runAllBatchTriggers).toHaveBeenCalledWith({
          environment: 'development',
          forceExecution: true
        });
        expect(toast.success).toHaveBeenCalledWith('Tous les batch triggers terminés avec succès !');
      });
    });

    it('should handle partial success in all triggers execution', async () => {
      const mockResults = {
        bulkLyrics: {
          success: true,
          data: {},
          timestamp: '2024-01-15T10:30:00.000Z',
          executionKey: 'bulkLyricsKey'
        },
        oicFix: {
          success: false,
          error: 'Erreur de traitement',
          timestamp: '2024-01-15T10:31:00.000Z',
          executionKey: 'oicFixKey'
        }
      };
      
      (runAllBatchTriggers as any).mockResolvedValue(mockResults);

      render(<BatchTriggersPanel />);
      
      const executeAllButton = screen.getByText('Exécuter tous les triggers');
      fireEvent.click(executeAllButton);
      
      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalledWith('1/2 triggers réussis', {
          description: 'Consultez les détails ci-dessous'
        });
      });
    });
  });

  describe('Gestion de l\'environnement', () => {
    it('should change environment and use it in trigger calls', async () => {
      const mockResult = {
        success: true,
        data: {},
        timestamp: '2024-01-15T10:30:00.000Z',
        executionKey: 'bulkLyricsKey'
      };
      
      (triggerBulkLyrics as any).mockResolvedValue(mockResult);

      render(<BatchTriggersPanel />);
      
      // Changer l'environnement
      const environmentSelect = screen.getByDisplayValue('Développement');
      fireEvent.change(environmentSelect, { target: { value: 'production' } });
      
      // Exécuter un trigger
      const generateButton = screen.getByText('Générer les paroles');
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(triggerBulkLyrics).toHaveBeenCalledWith({ environment: 'production' });
      });
    });
  });

  describe('États de chargement', () => {
    it('should show loading states during execution', async () => {
      // Mock d'une promesse qui ne se résout pas immédiatement
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      (triggerBulkLyrics as any).mockReturnValue(mockPromise);

      render(<BatchTriggersPanel />);
      
      const generateButton = screen.getByText('Générer les paroles');
      fireEvent.click(generateButton);
      
      // Vérifier l'état de chargement
      expect(screen.getByText('Génération...')).toBeInTheDocument();
      
      // Les autres boutons devraient être désactivés
      const forceButtons = screen.getAllByText('Forcer l\'exécution');
      forceButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
      
      // Résoudre la promesse
      resolvePromise!({
        success: true,
        data: {},
        timestamp: new Date().toISOString(),
        executionKey: 'test'
      });
    });
  });

  describe('Affichage des résultats', () => {
    it('should display success badge for successful results', async () => {
      const mockResult = {
        success: true,
        data: { processed: 367 },
        timestamp: '2024-01-15T10:30:00.000Z',
        executionKey: 'bulkLyricsKey'
      };
      
      (triggerBulkLyrics as any).mockResolvedValue(mockResult);

      render(<BatchTriggersPanel />);
      
      const generateButton = screen.getByText('Générer les paroles');
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Succès')).toBeInTheDocument();
      });
    });

    it('should display error badge and message for failed results', async () => {
      const mockResult = {
        success: false,
        error: 'Erreur de connexion à la base de données',
        timestamp: '2024-01-15T10:30:00.000Z',
        executionKey: 'oicFixKey'
      };
      
      (triggerOicFix as any).mockResolvedValue(mockResult);

      render(<BatchTriggersPanel />);
      
      const correctButton = screen.getByText('Corriger les OIC');
      fireEvent.click(correctButton);
      
      await waitFor(() => {
        expect(screen.getByText('Échec')).toBeInTheDocument();
        expect(screen.getByText('Erreur de connexion à la base de données')).toBeInTheDocument();
      });
    });
  });
});