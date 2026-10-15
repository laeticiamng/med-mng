import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../EdnItemSeo', () => ({ EdnItemSeo: () => null }));
vi.mock('@/components/edn/TableauRangA', () => ({ TableauRangA: () => <div>tableau A</div> }));
vi.mock('@/components/edn/TableauRangB', () => ({ TableauRangB: () => <div>tableau B</div> }));

import EdnItemRangA from '../EdnItemRangA';
import EdnItemRangB from '../EdnItemRangB';
import { ContexteFicheItemEdn, type ValeurFicheItemEdn } from '../EdnItemContext';

afterEach(() => vi.unstubAllEnvs());

const valeur = (surcharge: Partial<ValeurFicheItemEdn> = {}) =>
  ({
    item: { item_code: 'IC-160', title: 'Tétanos' },
    contenu: {},
    contenuVerrouille: false,
    chargementContenu: false,
    slugUrl: 'ic-160',
    ...surcharge,
  }) as unknown as ValeurFicheItemEdn;

const rendre = async (Page: React.ComponentType, v: ValeurFicheItemEdn) => {
  await act(async () => {
    render(
      <MemoryRouter>
        <ContexteFicheItemEdn.Provider value={v}>
          <Page />
        </ContexteFicheItemEdn.Provider>
      </MemoryRouter>
    );
  });
};

describe('Fiches rang A / rang B : lien vers le quiz selon les droits', () => {
  it.each([
    ['rang A', EdnItemRangA],
    ['rang B', EdnItemRangB],
  ])('%s — accès ouvert (item d’essai ou Premium) et pilote : lien vers le quiz', async (_nom, Page) => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'true');
    await rendre(Page, valeur());
    expect(await screen.findByRole('link', { name: /Mémoriser avec le quiz/ })).toHaveAttribute('href', '/edn-complete/ic-160/quiz');
  });

  it.each([
    ['rang A', EdnItemRangA],
    ['rang B', EdnItemRangB],
  ])('%s — contenu verrouillé (gratuit hors essai) : aucun lien vers un encart Premium', async (_nom, Page) => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'true');
    await rendre(Page, valeur({ contenuVerrouille: true }));
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('chargement des droits en cours : pas de lien non plus', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'true');
    await rendre(EdnItemRangA, valeur({ chargementContenu: true }));
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('sans drapeau : les fiches sont inchangées', async () => {
    vi.stubEnv('VITE_QUIZ_MEMORISATION_PILOTE', 'false');
    await rendre(EdnItemRangA, valeur());
    expect(screen.getByText('tableau A')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
