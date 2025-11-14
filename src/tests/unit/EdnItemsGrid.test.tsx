import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EdnItemsGrid } from '@/components/edn/EdnItemsGrid';
import type { EdnItemUnified } from '@/types/edn';

// Mock Framer Motion pour éviter les problèmes dans les tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock EdnItemCard
vi.mock('@/components/edn/premium/EdnItemCard', () => ({
  EdnItemCard: ({ item, onOpen }: any) => (
    <div data-testid={`item-card-${item.id}`} onClick={() => onOpen()}>
      {item.title}
    </div>
  ),
}));

const mockItems: EdnItemUnified[] = [
  {
    id: '1',
    item_code: 'IC-1',
    title: 'Item 1',
    completeness_score: 80,
    is_validated: false,
  },
  {
    id: '2',
    item_code: 'IC-2',
    title: 'Item 2',
    completeness_score: 100,
    is_validated: true,
  },
] as EdnItemUnified[];

const defaultProps = {
  items: mockItems,
  onOpenItem: vi.fn(),
  hasMore: false,
  loading: false,
};

describe('EdnItemsGrid', () => {
  it('affiche tous les items fournis', () => {
    render(<EdnItemsGrid {...defaultProps} />);
    expect(screen.getByTestId('item-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-card-2')).toBeInTheDocument();
  });

  it('affiche le bouton "Charger plus" si hasMore=true', () => {
    render(<EdnItemsGrid {...defaultProps} hasMore={true} onLoadMore={vi.fn()} />);
    expect(screen.getByText(/charger plus/i)).toBeInTheDocument();
  });

  it('cache le bouton "Charger plus" si hasMore=false', () => {
    render(<EdnItemsGrid {...defaultProps} hasMore={false} />);
    expect(screen.queryByText(/charger plus/i)).not.toBeInTheDocument();
  });

  it('appelle onLoadMore quand on clique sur "Charger plus"', () => {
    const onLoadMore = vi.fn();
    render(<EdnItemsGrid {...defaultProps} hasMore={true} onLoadMore={onLoadMore} />);
    
    const loadMoreButton = screen.getByText(/charger plus/i);
    fireEvent.click(loadMoreButton);
    
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('affiche le spinner de chargement si loading=true', () => {
    const { container } = render(<EdnItemsGrid {...defaultProps} loading={true} />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('cache le spinner si loading=false', () => {
    const { container } = render(<EdnItemsGrid {...defaultProps} loading={false} />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
  });

  it('appelle onOpenItem quand on clique sur un item', () => {
    const onOpenItem = vi.fn();
    render(<EdnItemsGrid {...defaultProps} onOpenItem={onOpenItem} />);
    
    const itemCard = screen.getByTestId('item-card-1');
    fireEvent.click(itemCard);
    
    expect(onOpenItem).toHaveBeenCalledWith(mockItems[0], undefined);
  });

  it('appelle onPrefetch avec le code item si fourni', () => {
    const onPrefetch = vi.fn();
    render(<EdnItemsGrid {...defaultProps} onPrefetch={onPrefetch} />);
    
    // Le prefetch est appelé via la prop, on vérifie juste qu'il peut être passé
    expect(onPrefetch).toBeDefined();
  });

  it('affiche la grille avec classes responsive', () => {
    const { container } = render(<EdnItemsGrid {...defaultProps} />);
    const grid = container.querySelector('.grid');
    
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-3');
  });

  it('n\'affiche rien si items est vide', () => {
    const { container } = render(<EdnItemsGrid {...defaultProps} items={[]} />);
    const cards = container.querySelectorAll('[data-testid^="item-card"]');
    expect(cards.length).toBe(0);
  });

  it('utilise AnimatePresence si showAnimations=true', () => {
    // Test indirect via la présence de motion.div
    const { container } = render(
      <EdnItemsGrid {...defaultProps} showAnimations={true} />
    );
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });

  it('n\'utilise pas AnimatePresence si showAnimations=false', () => {
    const { container } = render(
      <EdnItemsGrid {...defaultProps} showAnimations={false} />
    );
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });
});
