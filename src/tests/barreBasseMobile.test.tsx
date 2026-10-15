import { act, cleanup, render, screen } from '@testing-library/react';
import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MobileBottomNav } from '@/components/med-mng/MobileBottomNav';
import { PersistentMiniPlayer } from '@/components/player/PersistentMiniPlayer';
import {
  BAS_MINI_LECTEUR,
  MARGE_BASSE_APP,
  VAR_BARRE_MOBILE,
  VAR_MINI_LECTEUR,
} from '@/hooks/usePublierHauteur';

/**
 * Barre de navigation mobile basse (15.10.2026) :
 *  - de vrais liens avec `aria-current` (et non des onglets `role="tab"` qui naviguent) ;
 *  - présente sur /edn-complete et les fiches d'item ;
 *  - ne recouvre ni le mini-lecteur (posé au-dessus d'elle) ni le contenu (marge basse).
 */

const piste = {
  url: 'https://exemple.test/a.mp3',
  title: 'IC-66 · HTA — Rang A',
  rang: 'A' as const,
};
const audio = {
  currentTrack: piste as typeof piste | null,
  isPlaying: false,
  currentTime: 0,
  duration: 120,
  volume: 1,
  pause: vi.fn(),
  resume: vi.fn(),
  stop: vi.fn(),
  seek: vi.fn(),
  changeVolume: vi.fn(),
  audioElement: null,
};

// setup.ts remplace useLocation par un faux (« /test ») : ici, le vrai routeur, pour tester l'état actif.
vi.mock(
  'react-router-dom',
  async () => await vi.importActual('react-router-dom')
);
vi.mock('@/contexts/GlobalAudioContext', () => ({
  useGlobalAudio: () => audio,
}));
vi.mock('@/hooks/useGamification', () => ({
  useGamification: () => ({
    stats: { currentStreak: 3, level: 2, totalPoints: 150 },
  }),
}));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: { user: { id: 'u1' } } } }),
    },
  },
}));
vi.mock('@/components/TranslatedText', () => ({
  TranslatedText: ({ text }: { text: string }) => <>{text}</>,
}));

const racine = document.documentElement;
const variable = (nom: string) => racine.style.getPropertyValue(nom);

/** Hauteurs simulées (jsdom ne fait aucune mise en page) : barre 89 px, mini-lecteur 65 px. */
let hauteurs: { nav: number; lecteur: number };
let observateurs: Array<() => void>;

beforeEach(() => {
  hauteurs = { nav: 89, lecteur: 65 };
  observateurs = [];
  audio.currentTrack = piste;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      const h =
        this.tagName === 'NAV'
          ? hauteurs.nav
          : this.style.bottom
            ? hauteurs.lecteur
            : 0;
      return {
        height: h,
        width: 390,
        top: 0,
        left: 0,
        right: 390,
        bottom: h,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    }
  );
  globalThis.ResizeObserver = class {
    constructor(rappel: () => void) {
      observateurs.push(rappel);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  racine.style.removeProperty(VAR_BARRE_MOBILE);
  racine.style.removeProperty(VAR_MINI_LECTEUR);
});

const rendreBarre = async (chemin: string) => {
  const rendu = render(
    <MemoryRouter initialEntries={[chemin]}>
      <MobileBottomNav />
    </MemoryRouter>
  );
  // getSession() résout après le premier rendu : la barre de série apparaît.
  await act(async () => {});
  return rendu;
};

describe('barre mobile basse : des liens, pas des onglets', () => {
  it('quatre liens vers les pages cœur, sans role tablist/tab ni aria-selected', async () => {
    const { container } = await rendreBarre('/edn-complete');
    const nav = screen.getByRole('navigation', {
      name: 'Navigation principale mobile',
    });
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
    expect(container.querySelector('[aria-selected]')).toBeNull();
    expect(container.querySelector('button[role]')).toBeNull();

    const liens = Array.from(nav.querySelectorAll('a'));
    expect(liens.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Accueil', '/'],
      ['Items', '/edn-complete'],
      ['Tarifs', '/med-mng/pricing'],
      ['Profil', '/med-mng/profile'],
    ]);
    // Le nom accessible est le texte visible (WCAG 2.5.3), sans « Navigation vers … » redondant.
    expect(screen.getByRole('link', { name: 'Items' })).toBeTruthy();
  });

  it('aria-current="page" sur la page courante, un seul lien à la fois', async () => {
    await rendreBarre('/edn-complete');
    const courants = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current'));
    expect(
      courants.map((a) => [a.textContent, a.getAttribute('aria-current')])
    ).toEqual([['Items', 'page']]);
  });

  it('accueil : seule la page exacte est courante (pas tous les chemins qui commencent par « / »)', async () => {
    await rendreBarre('/');
    const courants = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current'));
    expect(
      courants.map((a) => [a.textContent, a.getAttribute('aria-current')])
    ).toEqual([['Accueil', 'page']]);
  });

  it('fiche d\'item : « Items » est la section courante (aria-current="true"), jamais la page', async () => {
    await rendreBarre('/edn-complete/ic-66/musique');
    const courants = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current'));
    expect(
      courants.map((a) => [a.textContent, a.getAttribute('aria-current')])
    ).toEqual([['Items', 'true']]);
  });

  it('profil', async () => {
    await rendreBarre('/med-mng/profile');
    expect(
      screen.getByRole('link', { name: 'Profil' }).getAttribute('aria-current')
    ).toBe('page');
    expect(
      screen.getByRole('link', { name: 'Items' }).getAttribute('aria-current')
    ).toBeNull();
  });

  it('conserve la barre de série (jours de suite, niveau, XP) pour un compte connecté', async () => {
    await rendreBarre('/edn-complete');
    expect(screen.getByText('Niv. 2')).toBeTruthy();
    expect(screen.getByText('150 XP')).toBeTruthy();
  });
});

describe('barre mobile et mini-lecteur : pas de recouvrement', () => {
  it('la barre publie sa hauteur mesurée, la met à jour, puis la retire au démontage', async () => {
    const { unmount } = await rendreBarre('/edn-complete');
    expect(variable(VAR_BARRE_MOBILE)).toBe('89px');

    // La barre de série disparaît (déconnexion) : la hauteur suit.
    hauteurs.nav = 64;
    act(() => observateurs.forEach((rappel) => rappel()));
    expect(variable(VAR_BARRE_MOBILE)).toBe('64px');

    unmount();
    expect(variable(VAR_BARRE_MOBILE)).toBe('');
  });

  it('masquée (à partir de md : display none), elle publie 0', async () => {
    hauteurs.nav = 0;
    await rendreBarre('/edn-complete');
    expect(variable(VAR_BARRE_MOBILE)).toBe('0px');
  });

  it('le mini-lecteur se pose au-dessus de la barre et publie sa propre hauteur', async () => {
    const { container } = render(<PersistentMiniPlayer />);
    const lecteur = container.firstElementChild as HTMLElement;
    expect(lecteur.getAttribute('style')).toContain(
      `bottom: ${BAS_MINI_LECTEUR}`
    );
    expect(lecteur.className).toContain('fixed');
    expect(lecteur.className).not.toMatch(/(^|\s)bottom-0(\s|$)/);
    expect(lecteur.className).toContain('z-[60]');
    expect(variable(VAR_MINI_LECTEUR)).toBe('65px');
  });

  it("sans piste, le mini-lecteur n'affiche rien et ne réserve aucune place", () => {
    audio.currentTrack = null;
    const { container } = render(<PersistentMiniPlayer />);
    expect(container.firstElementChild).toBeNull();
    expect(variable(VAR_MINI_LECTEUR)).toBe('');
  });

  it("la variable lue par le mini-lecteur est celle que publie la barre ; la marge de l'app additionne les deux", () => {
    expect(BAS_MINI_LECTEUR).toBe(`var(${VAR_BARRE_MOBILE}, 0px)`);
    expect(MARGE_BASSE_APP).toBe(
      `calc(var(${VAR_BARRE_MOBILE}, 0px) + var(${VAR_MINI_LECTEUR}, 0px))`
    );
    expect(VAR_BARRE_MOBILE).not.toBe(VAR_MINI_LECTEUR);
  });
});

describe("câblage dans l'application", () => {
  const lire = (relatif: string) =>
    fs.readFileSync(path.resolve(process.cwd(), relatif), 'utf-8');
  const app = lire('src/App.tsx');

  it("/edn-complete et les fiches d'item sont sous la route de mise en page qui monte la barre", () => {
    const couche = app.indexOf('<Route element={<AvecBarreMobile />}>');
    const liste = app.indexOf('path={ROUTE_PATHS.ednComplete}');
    const fiche = app.indexOf('path={ROUTE_PATHS.ednCompleteDetail}');
    const suite = app.indexOf('path={ROUTE_PATHS.ednLegacy}');
    expect(couche).toBeGreaterThan(-1);
    expect(couche).toBeLessThan(liste);
    expect(liste).toBeLessThan(fiche);
    expect(fiche).toBeLessThan(suite);
    // La route de mise en page est refermée avant les redirections EDN (elles n'ont pas de barre) :
    // deux </Route> dans le bloc, celle de la fiche d'item puis celle de la mise en page.
    expect(app.slice(couche, suite).match(/<\/Route>/g)).toHaveLength(2);
    expect(app).toMatch(
      /const AvecBarreMobile = \(\) => \(\s*<>\s*<Outlet \/>\s*<MobileBottomNav \/>\s*<\/>\s*\);/
    );
  });

  it("la racine de l'application réserve la marge basse (barre + mini-lecteur)", () => {
    expect(app).toMatch(
      /<div id="app-root"[^>]*style=\{\{ paddingBottom: MARGE_BASSE_APP \}\}/
    );
  });

  it('MedMngLayout garde la barre mais ne double plus la marge basse', () => {
    const mise = lire('src/components/med-mng/MedMngLayout.tsx');
    expect(mise).toContain('<MobileBottomNav />');
    expect(mise).not.toMatch(/pb-20/);
  });

  it('plus de role tablist/tab dans la barre', () => {
    const barre = lire('src/components/med-mng/MobileBottomNav.tsx');
    expect(barre).not.toMatch(/role="(tablist|tab)"|aria-selected/);
  });
});
