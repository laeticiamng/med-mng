import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/components/ui/AccessibilityProvider', () => ({
  useAccessibility: () => ({
    fontSize: 'medium',
    setFontSize: vi.fn(),
    highContrast: false,
    toggleHighContrast: vi.fn(),
    reducedMotion: false,
    toggleReducedMotion: vi.fn(),
    focusVisible: false,
    toggleFocusVisible: vi.fn(),
  }),
}));

import { AccessibilityCenter } from './AccessibilityCenter';

/**
 * Constat du 09.10.2026 : à 390 px, le bouton flottant « œil » (bottom-40 right-5) recouvrait
 * le texte et les actions de l'accueil, des tarifs et des fiches. Il n'est plus affiché sous
 * 768 px (accès par le menu mobile) et tient compte de la zone sûre au-delà.
 */
describe('AccessibilityCenter : bouton flottant', () => {
  it('masqué sur mobile, visible dès la tablette, au-dessus de la zone sûre', () => {
    render(<AccessibilityCenter />);
    const bouton = screen.getByRole('button', {
      name: "Ouvrir le centre d'accessibilité",
    });
    const classes = bouton.className.split(/\s+/);
    expect(classes).toContain('hidden');
    expect(classes).toContain('md:inline-flex');
    expect(bouton.className).toContain('env(safe-area-inset-bottom)');
  });
});
