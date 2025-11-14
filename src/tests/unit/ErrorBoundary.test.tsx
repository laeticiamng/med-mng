import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Component qui lance une erreur pour tester
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  // Supprimer les logs d'erreur console pendant les tests
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('affiche les enfants si pas d\'erreur', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('affiche l\'UI d\'erreur si un composant enfant plante', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/erreur inattendue/i)).toBeInTheDocument();
  });

  it('affiche le message d\'erreur', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('affiche le bouton Réessayer', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/réessayer/i)).toBeInTheDocument();
  });

  it('affiche le bouton Retour à l\'accueil', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/retour à l'accueil/i)).toBeInTheDocument();
  });

  it('recharge la page quand on clique sur Réessayer', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const retryButton = screen.getByText(/réessayer/i);
    fireEvent.click(retryButton);
    
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('redirige vers / quand on clique sur Retour à l\'accueil', () => {
    const setHrefSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '/', reload: vi.fn() },
      writable: true,
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const homeButton = screen.getByText(/retour à l'accueil/i);
    fireEvent.click(homeButton);
    
    expect(window.location.href).toBe('/');
  });

  it('affiche l\'icône d\'alerte', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Vérifier que l'icône AlertTriangle est présente
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('affiche les conseils utilisateur', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/que faire/i)).toBeInTheDocument();
    expect(screen.getByText(/cliquez sur "réessayer"/i)).toBeInTheDocument();
    expect(screen.getByText(/videz le cache/i)).toBeInTheDocument();
  });

  it('utilise le fallback personnalisé si fourni', () => {
    const customFallback = <div>Custom error UI</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByText(/erreur inattendue/i)).not.toBeInTheDocument();
  });

  it('affiche une Card avec le bon style', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const card = container.querySelector('[class*="border-destructive"]');
    expect(card).toBeInTheDocument();
  });
});
