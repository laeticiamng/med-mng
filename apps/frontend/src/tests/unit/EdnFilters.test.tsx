import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EdnFilters } from '@/components/edn/EdnFilters';
import type { SortByType } from '@/types/edn';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const defaultProps = {
  searchTerm: '',
  setSearchTerm: vi.fn(),
  selectedCategory: 'all',
  setSelectedCategory: vi.fn(),
  sortBy: 'item_code' as SortByType,
  setSortBy: vi.fn(),
  viewMode: 'grid' as const,
  setViewMode: vi.fn(),
  hasActiveFilters: false,
  resetAllFilters: vi.fn(),
};

const renderEdnFilters = (props = {}) => {
  return render(
    <BrowserRouter>
      <EdnFilters {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('EdnFilters', () => {
  it('affiche la barre de recherche', () => {
    renderEdnFilters();
    expect(screen.getByPlaceholderText(/rechercher un item/i)).toBeInTheDocument();
  });

  it('appelle setSearchTerm quand l\'utilisateur tape', () => {
    const setSearchTerm = vi.fn();
    renderEdnFilters({ setSearchTerm });
    
    const input = screen.getByPlaceholderText(/rechercher un item/i);
    fireEvent.change(input, { target: { value: 'IC-1' } });
    
    expect(setSearchTerm).toHaveBeenCalledWith('IC-1');
  });

  it('affiche le bouton reset si filtres actifs', () => {
    renderEdnFilters({ hasActiveFilters: true });
    expect(screen.getByText(/réinitialiser/i)).toBeInTheDocument();
  });

  it('cache le bouton reset si pas de filtres actifs', () => {
    renderEdnFilters({ hasActiveFilters: false });
    expect(screen.queryByText(/réinitialiser/i)).not.toBeInTheDocument();
  });

  it('appelle resetAllFilters quand on clique sur le bouton reset', () => {
    const resetAllFilters = vi.fn();
    renderEdnFilters({ hasActiveFilters: true, resetAllFilters });
    
    const resetButton = screen.getByText(/réinitialiser/i);
    fireEvent.click(resetButton);
    
    expect(resetAllFilters).toHaveBeenCalled();
  });

  it('affiche le select de catégorie', () => {
    renderEdnFilters();
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('affiche le select de tri', () => {
    renderEdnFilters();
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('affiche le bouton Analytics', () => {
    renderEdnFilters();
    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
  });

  it('navigue vers /learning-dashboard quand on clique sur Analytics', () => {
    renderEdnFilters();
    
    const analyticsButton = screen.getByText(/analytics/i);
    fireEvent.click(analyticsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/learning-dashboard');
  });

  it('affiche les boutons Grid et List', () => {
    renderEdnFilters();
    const buttons = screen.getAllByRole('button');
    const gridButton = buttons.find(b => b.querySelector('[class*="grid"]'));
    const listButton = buttons.find(b => b.querySelector('[class*="list"]'));
    
    expect(gridButton).toBeInTheDocument();
    expect(listButton).toBeInTheDocument();
  });

  it('met en évidence le bouton Grid si viewMode=grid', () => {
    const { container } = renderEdnFilters({ viewMode: 'grid' });
    const buttons = container.querySelectorAll('button');
    const gridButton = Array.from(buttons).find(b => b.querySelector('[class*="grid"]'));
    
    expect(gridButton?.className).toContain('default');
  });

  it('appelle setViewMode quand on clique sur List', () => {
    const setViewMode = vi.fn();
    const { container } = renderEdnFilters({ viewMode: 'grid', setViewMode });
    
    const buttons = container.querySelectorAll('button');
    const listButton = Array.from(buttons).find(b => b.querySelector('[class*="list"]'));
    
    if (listButton) {
      fireEvent.click(listButton);
      expect(setViewMode).toHaveBeenCalledWith('list');
    }
  });
});
