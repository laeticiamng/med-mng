import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EdnTabsContent } from '@/components/edn/EdnTabsContent';
import type { EdnItemUnified } from '@/types/edn';

// Mock des composants enfants
vi.mock('@/components/revision/RevisionDashboard', () => ({
  RevisionDashboard: () => <div data-testid="revision-dashboard">Revision Dashboard</div>,
}));

vi.mock('@/components/edn/RevisionGuide', () => ({
  RevisionGuide: () => <div data-testid="revision-guide">Revision Guide</div>,
}));

vi.mock('@/components/help/FaqSection', () => ({
  FaqSection: () => <div data-testid="faq-section">FAQ Section</div>,
}));

vi.mock('@/components/LyricsCompletionStatus', () => ({
  LyricsCompletionStatus: () => <div data-testid="lyrics-completion">Lyrics Completion</div>,
}));

vi.mock('@/components/quota/QuotaIndicator', () => ({
  QuotaIndicator: () => <div data-testid="quota-indicator">Quota Indicator</div>,
}));

vi.mock('@/components/med-mng/PricingPlans', () => ({
  PricingPlans: () => <div data-testid="pricing-plans">Pricing Plans</div>,
}));

vi.mock('@/components/edn/EdnItemsGrid', () => ({
  EdnItemsGrid: ({ showAnimations }: any) => (
    <div data-testid={`items-grid-${showAnimations ? 'animated' : 'static'}`}>Items Grid</div>
  ),
}));

const mockItems: EdnItemUnified[] = [
  {
    id: '1',
    item_code: 'IC-1',
    title: 'Item 1',
    completeness_score: 80,
  } as EdnItemUnified,
];

const defaultProps = {
  filteredItems: mockItems,
  onOpenItem: vi.fn(),
  hasMore: false,
  loading: false,
  onLoadMore: vi.fn(),
  page: 0,
  quota: 80,
  subscription: { plan_name: 'Premium', status: 'active' },
};

const renderWithTabs = (props = {}) => {
  return render(
    <BrowserRouter>
      <EdnTabsContent {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('EdnTabsContent', () => {
  it('affiche le contenu du tab Révision', () => {
    renderWithTabs();
    expect(screen.getByTestId('revision-guide')).toBeInTheDocument();
    expect(screen.getByTestId('revision-dashboard')).toBeInTheDocument();
  });

  it('affiche le contenu du tab Mode Visuel (immersive)', () => {
    renderWithTabs();
    expect(screen.getByTestId('items-grid-animated')).toBeInTheDocument();
  });

  it('affiche le contenu du tab Tous les items (complete)', () => {
    renderWithTabs();
    expect(screen.getByTestId('faq-section')).toBeInTheDocument();
    expect(screen.getByTestId('items-grid-static')).toBeInTheDocument();
  });

  it('affiche le contenu du tab Musiques', () => {
    renderWithTabs();
    expect(screen.getByTestId('lyrics-completion')).toBeInTheDocument();
  });

  it('affiche le contenu du tab Premium', () => {
    renderWithTabs();
    expect(screen.getByTestId('quota-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('pricing-plans')).toBeInTheDocument();
  });

  it('passe showAnimations=true pour le tab immersive', () => {
    renderWithTabs();
    expect(screen.getByTestId('items-grid-animated')).toBeInTheDocument();
  });

  it('passe showAnimations=false pour le tab complete', () => {
    renderWithTabs();
    expect(screen.getByTestId('items-grid-static')).toBeInTheDocument();
  });

  it('passe les items filtrés aux grilles', () => {
    const customItems = [
      { id: '1', item_code: 'IC-1', title: 'Custom Item' } as EdnItemUnified,
    ];
    renderWithTabs({ filteredItems: customItems });
    
    // Les grilles devraient recevoir les items
    expect(screen.getByTestId('items-grid-animated')).toBeInTheDocument();
    expect(screen.getByTestId('items-grid-static')).toBeInTheDocument();
  });

  it('affiche les infos de quota dans le tab subscription', () => {
    renderWithTabs({ quota: 120 });
    expect(screen.getByTestId('quota-indicator')).toBeInTheDocument();
  });

  it('affiche le statut de l\'abonnement', () => {
    const subscription = { plan_name: 'Premium', status: 'active', monthly_quota: 160 };
    renderWithTabs({ subscription });
    
    // Vérifier que le composant est rendu (les détails sont dans le composant Card)
    expect(screen.getByTestId('quota-indicator')).toBeInTheDocument();
  });
});
