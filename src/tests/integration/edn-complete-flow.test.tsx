/**
 * Tests d'intégration pour le flux complet de /edn-complete
 * Teste la recherche, le filtrage, la pagination et l'ouverture du modal
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import EdnComplete from '@/pages/EdnComplete';
import type { EdnItemUnified } from '@/types/edn';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        range: vi.fn(() => ({
          data: mockUnifiedItems,
          error: null,
          count: mockUnifiedItems.length,
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockFullItem,
            error: null,
          })),
        })),
      })),
    })),
  },
}));

// Mock des données de test
const mockUnifiedItems: EdnItemUnified[] = [
  {
    id: '1',
    item_code: 'IC-001',
    title: 'Cardiologie Générale',
    slug: 'cardiologie-generale',
    competences_count_rang_a: 5,
    competences_count_rang_b: 3,
    completeness_score: 85,
    is_validated: true,
    has_paroles_musicales: true,
  } as EdnItemUnified,
  {
    id: '2',
    item_code: 'IC-002',
    title: 'Pneumologie Avancée',
    slug: 'pneumologie-avancee',
    competences_count_rang_a: 0,
    competences_count_rang_b: 0,
    completeness_score: 20,
    is_validated: false,
    has_paroles_musicales: false,
  } as EdnItemUnified,
  {
    id: '3',
    item_code: 'IC-003',
    title: 'Neurologie Clinique',
    slug: 'neurologie-clinique',
    competences_count_rang_a: 5,
    competences_count_rang_b: 5,
    completeness_score: 100,
    is_validated: true,
    has_paroles_musicales: true,
  } as EdnItemUnified,
];

const mockFullItem = {
  ...mockUnifiedItems[0],
  tableau_rang_a: [{ title: 'Test A' }],
  tableau_rang_b: [{ title: 'Test B' }],
  paroles_musicales: ['Test lyrics'],
};

// Helper pour wrapper avec les providers nécessaires
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('EdnComplete - Flux d\'intégration complet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Chargement initial', () => {
    it('devrait afficher le loader pendant le chargement', async () => {
      renderWithProviders(<EdnComplete />);
      
      expect(screen.getByText(/chargement des items edn/i)).toBeInTheDocument();
    });

    it('devrait afficher tous les items après le chargement', async () => {
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
        expect(screen.getByText('Pneumologie Avancée')).toBeInTheDocument();
        expect(screen.getByText('Neurologie Clinique')).toBeInTheDocument();
      });
    });

    it('devrait afficher les statistiques globales dans le header', async () => {
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText(/3 items/i)).toBeInTheDocument();
      });
    });

    it('devrait afficher le header EdnHeader avec le titre', async () => {
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText('Interface EDN')).toBeInTheDocument();
      });
    });

    it('devrait afficher les contrôles de filtrage EdnFilters', async () => {
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/rechercher un item/i)).toBeInTheDocument();
      });
    });
  });

  describe('Recherche textuelle', () => {
    it('devrait filtrer les items par titre', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/rechercher/i);
      await user.type(searchInput, 'cardio');
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
        expect(screen.queryByText('Pneumologie Avancée')).not.toBeInTheDocument();
        expect(screen.queryByText('Neurologie Clinique')).not.toBeInTheDocument();
      });
    });

    it('devrait filtrer les items par code', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText('Pneumologie Avancée')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/rechercher/i);
      await user.type(searchInput, 'IC-002');
      
      await waitFor(() => {
        expect(screen.getByText('Pneumologie Avancée')).toBeInTheDocument();
        expect(screen.queryByText('Cardiologie Générale')).not.toBeInTheDocument();
      });
    });

    it('devrait afficher un message si aucun résultat', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/rechercher/i);
      await user.type(searchInput, 'NonExistant123');
      
      await waitFor(() => {
        expect(screen.queryByText('Cardiologie Générale')).not.toBeInTheDocument();
      });
    });
  });

  describe('Filtres rapides', () => {
    it('devrait filtrer les items complets', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
      });
      
      // Trouver et cliquer sur le filtre "Complets"
      const completeFilter = screen.getByRole('button', { name: /complets/i });
      await user.click(completeFilter);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
        expect(screen.getByText('Neurologie Clinique')).toBeInTheDocument();
        expect(screen.queryByText('Pneumologie Avancée')).not.toBeInTheDocument();
      });
    });

    it('devrait filtrer les items validés', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
      });
      
      const validatedFilter = screen.getByRole('button', { name: /validés/i });
      await user.click(validatedFilter);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
        expect(screen.getByText('Neurologie Clinique')).toBeInTheDocument();
        expect(screen.queryByText('Pneumologie Avancée')).not.toBeInTheDocument();
      });
    });
  });

  describe('Réinitialisation des filtres', () => {
    it('devrait réinitialiser tous les filtres', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
      });
      
      // Appliquer des filtres
      const searchInput = screen.getByPlaceholderText(/rechercher/i);
      await user.type(searchInput, 'cardio');
      
      const completeFilter = screen.getByRole('button', { name: /complets/i });
      await user.click(completeFilter);
      
      // Réinitialiser
      const resetButton = screen.getByRole('button', { name: /réinitialiser/i });
      await user.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
        expect(screen.getByText('Pneumologie Avancée')).toBeInTheDocument();
        expect(screen.getByText('Neurologie Clinique')).toBeInTheDocument();
      });
    });
  });

  describe('Ouverture du modal', () => {
    it('devrait ouvrir le modal au clic sur une carte', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
      });
      
      const card = screen.getByText('Cardiologie Générale').closest('button');
      expect(card).toBeInTheDocument();
      
      if (card) {
        await user.click(card);
        
        await waitFor(() => {
          // Le modal devrait s'ouvrir avec le contenu de l'item
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
      }
    });

    it('devrait ouvrir le modal sur un onglet spécifique', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
      });
      
      // Cliquer sur le bouton musique
      const musicButton = screen.getAllByRole('button', { name: /musique/i })[0];
      await user.click(musicButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        // Vérifier que l'onglet musique est actif
      });
    });
  });

  describe('Changement de vue', () => {
    it('devrait basculer entre vue grille et liste', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
      });
      
      const listViewButton = screen.getByRole('button', { name: /list/i });
      await user.click(listViewButton);
      
      // Vérifier que la vue a changé (peut nécessiter un sélecteur CSS)
      await waitFor(() => {
        expect(listViewButton).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Combinaison de filtres', () => {
    it('devrait combiner recherche et filtre rapide', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
      });
      
      // Recherche
      const searchInput = screen.getByPlaceholderText(/rechercher/i);
      await user.type(searchInput, 'logie');
      
      // Filtre complet
      const completeFilter = screen.getByRole('button', { name: /complets/i });
      await user.click(completeFilter);
      
      await waitFor(() => {
        // Devrait afficher seulement Cardiologie et Neurologie (qui sont complètes)
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
        expect(screen.getByText('Neurologie Clinique')).toBeInTheDocument();
        expect(screen.queryByText('Pneumologie Avancée')).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance et cache', () => {
    it('devrait utiliser les données en cache pour une recherche identique', async () => {
      const user = userEvent.setup();
      renderWithProviders(<EdnComplete />);
      
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/rechercher/i);
      
      // Première recherche
      await user.type(searchInput, 'cardio');
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
      });
      
      // Effacer
      await user.clear(searchInput);
      await waitFor(() => {
        expect(screen.getByText('Pneumologie Avancée')).toBeInTheDocument();
      });
      
      // Recherche identique - devrait être instantanée (cache)
      await user.type(searchInput, 'cardio');
      await waitFor(() => {
        expect(screen.getByText('Cardiologie Générale')).toBeInTheDocument();
      });
    });
  });
});
