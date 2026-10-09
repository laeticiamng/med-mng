import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import path from 'node:path';

vi.mock('@/components/ui/AccessibilityProvider', () => ({
  useAccessibility: () => ({
    fontSize: 'medium',
    setFontSize: vi.fn(),
    isHighContrast: false,
    setHighContrast: vi.fn(),
    reducedMotion: false,
    setReducedMotion: vi.fn(),
    isFocusVisible: false,
    setFocusVisible: vi.fn(),
  }),
}));

import { AccessibilityCenter } from './AccessibilityCenter';
import { CookieBanner } from '@/components/common/CookieBanner';
import { EVENEMENT_ACCESSIBILITE } from '@/components/onboarding/HelpButton';

/**
 * Constat du 09.10.2026 : tant que le visiteur n'avait pas choisi, le bandeau cookies (z-[100])
 * recouvrait le bas du panneau d'accessibilité (z-50), et ce panneau « aria-modal » laissait
 * le focus clavier sortir vers la page et le bandeau, sans le rendre à la fermeture.
 */
beforeEach(() => {
  vi.mocked(window.localStorage.getItem).mockReturnValue(null);
});

const afficher = () =>
  render(
    <MemoryRouter>
      <CookieBanner />
      <AccessibilityCenter />
    </MemoryRouter>,
  );

describe('Panneau d’accessibilité et bandeau cookies', () => {
  it('le panneau est une fenêtre modale nommée : focus dedans, bandeau masqué et inerte, focus rendu à la fermeture', async () => {
    afficher();
    const bandeau = screen.getByRole('region', { name: 'Bandeau cookies' });
    expect(bandeau.closest('[data-aria-hidden]')).toBeNull();

    const declencheur = screen.getByRole('button', { name: "Ouvrir le centre d'accessibilité" });
    declencheur.focus();
    fireEvent.click(declencheur);

    const panneau = await screen.findByRole('dialog', { name: 'Accessibilité' });
    await waitFor(() => expect(panneau.contains(document.activeElement)).toBe(true));
    // Le reste de la page (dont le bandeau) est marqué par Radix : caché aux lecteurs d'écran,
    // et masqué visuellement par la règle de src/index.css.
    expect(bandeau.closest('[data-aria-hidden]')).not.toBeNull();
    expect(bandeau.closest('[aria-hidden="true"]')).not.toBeNull();

    fireEvent.keyDown(panneau, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Accessibilité' })).toBeNull());
    expect(bandeau.closest('[data-aria-hidden]')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(declencheur));
  });

  /** Ouvre le panneau depuis l'entrée d'un menu qui disparaît avec lui, puis le ferme. */
  const ouvrirDepuisMenuPuisFermer = async (retour: string) => {
    const entreeMenu = document.createElement('button');
    document.body.appendChild(entreeMenu);
    entreeMenu.focus();
    window.dispatchEvent(new CustomEvent(EVENEMENT_ACCESSIBILITE, { detail: { retour } }));
    entreeMenu.remove(); // le menu se ferme
    const panneau = await screen.findByRole('dialog', { name: 'Accessibilité' });
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    await waitFor(() => expect(panneau.isConnected).toBe(false));
  };

  it('ouvert depuis le menu mobile (entrée disparue), le focus revient au bouton du menu', async () => {
    render(
      <MemoryRouter>
        <button type="button" data-retour-focus-accessibilite="menu">Ouvrir le menu</button>
        <button type="button" data-retour-focus-accessibilite="aide" style={{ display: 'none' }}>Aide</button>
        <CookieBanner />
        <AccessibilityCenter />
      </MemoryRouter>,
    );
    await ouvrirDepuisMenuPuisFermer('menu');
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Ouvrir le menu' })));
  });

  it('revue Codex #237 : ouvert depuis le menu Aide sur ordinateur (bouton mobile masqué), le focus revient à « Aide »', async () => {
    render(
      <MemoryRouter>
        <button type="button" data-retour-focus-accessibilite="menu" style={{ display: 'none' }}>Ouvrir le menu</button>
        <button type="button" data-retour-focus-accessibilite="aide">Aide</button>
        <CookieBanner />
        <AccessibilityCenter />
      </MemoryRouter>,
    );
    await ouvrirDepuisMenuPuisFermer('aide');
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Aide' })));
  });

  it('bouton de retour masqué : le focus revient au contenu principal, jamais perdu', async () => {
    render(
      <MemoryRouter>
        <div style={{ display: 'none' }}>
          <button type="button" data-retour-focus-accessibilite="menu">Ouvrir le menu</button>
        </div>
        <main id="main-content" tabIndex={-1}>contenu</main>
        <AccessibilityCenter />
      </MemoryRouter>,
    );
    await ouvrirDepuisMenuPuisFermer('menu');
    await waitFor(() => expect(document.activeElement).toBe(document.getElementById('main-content')));
  });

  it('la feuille de style masque le bandeau sous une fenêtre modale', () => {
    const css = readFileSync(path.resolve(__dirname, '../../index.css'), 'utf8');
    // Radix marque le bandeau lui-même (une région aria-live voisine garde #root) ou un ancêtre.
    expect(css).toMatch(/\[data-aria-hidden\]\[data-bandeau-cookies\],\s*\[data-aria-hidden\]\s+\[data-bandeau-cookies\]\s*\{\s*visibility:\s*hidden;/);
  });
});
