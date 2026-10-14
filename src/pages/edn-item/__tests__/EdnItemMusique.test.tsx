import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../EdnItemSeo', () => ({ EdnItemSeo: () => null }));

// Le composant de la page est testé à part : ici, on vérifie ce que la route lui transmet.
const recu = vi.hoisted(() => ({
  props: null as Record<string, unknown> | null,
}));
vi.mock('@/components/edn/music/MusiqueItem', () => ({
  MusiqueItem: (props: Record<string, unknown>) => {
    recu.props = props;
    return <div data-testid="musique-item">{String(props.itemCode)}</div>;
  },
}));

import EdnItemMusique from '../EdnItemMusique';
import {
  ContexteFicheItemEdn,
  type ValeurFicheItemEdn,
} from '../EdnItemContext';
import { toucheReserveeALaCible } from '@/lib/touchesPage';

const valeur = (
  surcharge: Partial<ValeurFicheItemEdn> = {}
): ValeurFicheItemEdn =>
  ({
    item: {
      item_code: 'IC-14',
      title: 'Titre de l’item',
      paroles_musicales: ['legacy A'],
    },
    contenu: {
      paroles_musicales: ['legacy A'],
      paroles_rang_a: ['A1'],
      paroles_rang_b: ['B1'],
      paroles_rang_ab: ['AB1'],
    },
    competencesRangA: [],
    competencesRangB: [],
    chargementRangA: false,
    chargementRangB: false,
    rangAVide: false,
    rangBVide: false,
    contenuVerrouille: false,
    chargementContenu: false,
    numeroItem: 14,
    slugUrl: 'ic-14',
    slugCanonique: 'ic-14',
    ...surcharge,
  }) as unknown as ValeurFicheItemEdn;

const rendre = (v: ValeurFicheItemEdn) =>
  render(
    <ContexteFicheItemEdn.Provider value={v}>
      <EdnItemMusique />
    </ContexteFicheItemEdn.Provider>
  );

describe('Sous-page Musique : l’item courant est présélectionné', () => {
  it('IC-14 → Musique : code, titre, numéro et paroles de l’item transmis sans choix préalable', () => {
    rendre(valeur());
    expect(screen.getByTestId('musique-item')).toHaveTextContent('IC-14');
    expect(recu.props).toMatchObject({
      itemCode: 'IC-14',
      titre: 'Titre de l’item',
      numero: 14,
      rangAVide: false,
      rangBVide: false,
    });
    expect(recu.props?.paroles).toMatchObject({
      item_code: 'IC-14',
      paroles_rang_a: ['A1'],
      paroles_rang_b: ['B1'],
      paroles_rang_ab: ['AB1'],
    });
  });

  it('item sans compétence de rang A (IC-30, IC-142) : aucune parole de « rang A » n’est transmise', () => {
    rendre(valeur({ rangAVide: true }));
    expect(recu.props?.rangAVide).toBe(true);
    expect(recu.props?.paroles).toMatchObject({
      paroles_rang_a: [],
      paroles_musicales: [],
      paroles_rang_b: ['B1'],
    });
  });
});

describe('Touches de la page de l’item : celles des composants internes sont respectées', () => {
  afterEach(() => document.body.replaceChildren());
  const evenement = (cible: Element, defaultPrevented = false) =>
    ({ target: cible, defaultPrevented }) as Pick<
      KeyboardEvent,
      'target' | 'defaultPrevented'
    >;

  it('flèches dans les onglets de rang, un groupe radio ou une fenêtre : pas de changement de sous-page', () => {
    document.body.innerHTML = `
      <div role="tablist"><button id="t" role="tab"></button></div>
      <div role="radiogroup"><button id="r" role="radio"></button></div>
      <div role="dialog"><div id="d" tabindex="0"></div></div>
      <input id="i" /><p id="p"></p>`;
    for (const id of ['t', 'r', 'd', 'i']) {
      expect(
        toucheReserveeALaCible(evenement(document.getElementById(id)!))
      ).toBe(true);
    }
    expect(
      toucheReserveeALaCible(evenement(document.getElementById('p')!))
    ).toBe(false);
    expect(
      toucheReserveeALaCible(evenement(document.getElementById('p')!, true))
    ).toBe(true);
  });
});
