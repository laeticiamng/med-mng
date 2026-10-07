import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

/**
 * MM-A05 (audit du 07.10.2026) : la déclaration annonçait « totalement
 * conforme RGAA 4.1 (100 %) », « 106/106 », sans audit RGAA. Seul un audit
 * automatisé axe-core (WCAG 2.1 AA, 13 pages, thèmes clair et sombre) a été
 * réalisé : l'état déclaré doit être « partiellement conforme ».
 */
vi.mock('@/components/layout/PremiumPageLayout', () => ({
  PremiumPageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import DeclarationAccessibilite from '../DeclarationAccessibilite';

describe('Déclaration d’accessibilité', () => {
  it('déclare un état honnête, daté, avec la méthode réellement suivie', () => {
    const { container } = render(
      <MemoryRouter>
        <DeclarationAccessibilite />
      </MemoryRouter>,
    );
    const texte = container.textContent ?? '';

    expect(texte).toMatch(/partiellement conforme/i);
    expect(texte).not.toMatch(/totalement conforme/i);
    expect(texte).not.toMatch(/100\s?%/);
    expect(texte).not.toMatch(/106\s?\/\s?106/);
    expect(texte).toContain('7 octobre 2026');
    expect(texte).toMatch(/axe-core/);
    expect(texte).toMatch(/WCAG 2\.1/);
    expect(texte).toMatch(/clair et sombre/);
    expect(texte).toMatch(/pas d.audit RGAA manuel/i);

    // Contact et voie de recours conservés.
    expect(screen.getByRole('link', { name: /contact@emotionscare\.com/ })).toHaveAttribute(
      'href',
      'mailto:contact@emotionscare.com',
    );
    expect(texte).toMatch(/Défenseur des droits/);
  });
});
