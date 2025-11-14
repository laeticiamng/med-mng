import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EdnHeader } from '@/components/edn/EdnHeader';

// Mock des composants enfants
vi.mock('@/components/quota/QuotaIndicator', () => ({
  QuotaIndicator: ({ compact }: { compact?: boolean }) => (
    <div data-testid="quota-indicator">{compact ? 'compact' : 'full'}</div>
  ),
}));

vi.mock('@/components/notifications/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell">🔔</div>,
}));

const renderEdnHeader = (props: { totalItems: number; completeItems: number }) => {
  return render(
    <BrowserRouter>
      <EdnHeader {...props} />
    </BrowserRouter>
  );
};

describe('EdnHeader', () => {
  it('affiche le titre "Interface EDN"', () => {
    renderEdnHeader({ totalItems: 367, completeItems: 150 });
    expect(screen.getByText('Interface EDN')).toBeInTheDocument();
  });

  it('affiche le nombre total d\'items', () => {
    renderEdnHeader({ totalItems: 367, completeItems: 150 });
    expect(screen.getByText(/367 items/i)).toBeInTheDocument();
  });

  it('affiche le nombre d\'items complets si > 0', () => {
    renderEdnHeader({ totalItems: 367, completeItems: 150 });
    expect(screen.getByText(/150 complets/i)).toBeInTheDocument();
  });

  it('affiche "disponibles" au lieu de "complets" si completeItems = 0', () => {
    renderEdnHeader({ totalItems: 367, completeItems: 0 });
    expect(screen.getByText(/367 items disponibles/i)).toBeInTheDocument();
    expect(screen.queryByText(/complets/i)).not.toBeInTheDocument();
  });

  it('affiche la cloche de notifications', () => {
    renderEdnHeader({ totalItems: 367, completeItems: 150 });
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });

  it('affiche l\'indicateur de quota en mode compact', () => {
    renderEdnHeader({ totalItems: 367, completeItems: 150 });
    const quotaIndicator = screen.getByTestId('quota-indicator');
    expect(quotaIndicator).toBeInTheDocument();
    expect(quotaIndicator).toHaveTextContent('compact');
  });

  it('affiche tous les tabs de navigation', () => {
    renderEdnHeader({ totalItems: 367, completeItems: 150 });
    expect(screen.getByRole('tab', { name: /mon suivi/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tous les items/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /mode visuel/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /musiques/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /premium/i })).toBeInTheDocument();
  });

  it('affiche l\'icône du logo', () => {
    const { container } = renderEdnHeader({ totalItems: 367, completeItems: 150 });
    const logoContainer = container.querySelector('.bg-primary.rounded-lg');
    expect(logoContainer).toBeInTheDocument();
  });
});
