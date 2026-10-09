import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const competences = vi.hoisted(() => ({
  A: [] as { objectif_id: string; intitule: string; description: string }[],
  B: [] as { objectif_id: string; intitule: string; description: string }[],
}));
vi.mock('@/hooks/useOicCompetences', () => ({
  useOicCompetences: (code: string, rang: 'A' | 'B') => ({
    competences: code ? competences[rang] : [],
    loading: false,
    error: null,
  }),
}));
vi.mock('react-router-dom', async () => vi.importActual('react-router-dom'));

import { MemoryRouter } from 'react-router-dom';

// cmdk fait défiler l'option active ; jsdom n'implémente pas scrollIntoView.
Element.prototype.scrollIntoView = vi.fn();
import { EdnItemSelector } from '../EdnItemSelector';
import { LyricsPreview, decouperParoles } from '../LyricsPreview';
import { RangSelector, raisonRangIndisponible } from '../RangSelector';

const ITEMS = [
  { item_code: 'IC-10', title: 'Approches transversales du corps' },
  { item_code: 'IC-1', title: 'La relation médecin-malade' },
  { item_code: 'IC-100', title: 'Céphalée inhabituelle aiguë et chronique' },
  { item_code: 'IC-2', title: 'Les valeurs professionnelles' },
  {
    item_code: 'IC-161',
    title: 'Infections urinaires de l’enfant et de l’adulte',
  },
];

const ouvrir = () => fireEvent.click(screen.getByRole('combobox'));
const options = () =>
  screen
    .getAllByRole('option')
    .map((o) => within(o).getAllByText(/IC-\d+/)[0].textContent);

describe('Create — sélecteur des items', () => {
  const rendre = (
    props: Partial<React.ComponentProps<typeof EdnItemSelector>> = {}
  ) =>
    render(
      <MemoryRouter>
        <EdnItemSelector
          selectedItem=""
          setSelectedItem={vi.fn()}
          allEdnItems={ITEMS}
          itemsLoading={false}
          itemsError={null}
          {...props}
        />
      </MemoryRouter>
    );

  it('ordre officiel numérique et tous les items (pas de limite à 100)', () => {
    rendre();
    ouvrir();
    expect(options()).toEqual(['IC-1', 'IC-2', 'IC-10', 'IC-100', 'IC-161']);
  });

  it('recherche par numéro puis choix', () => {
    const choisir = vi.fn();
    rendre({ setSelectedItem: choisir });
    ouvrir();
    fireEvent.change(screen.getByPlaceholderText(/Numéro/), {
      target: { value: '10' },
    });
    expect(options()).toEqual(['IC-10', 'IC-100']);
    fireEvent.click(screen.getAllByRole('option')[0]);
    expect(choisir).toHaveBeenCalledWith('IC-10');
  });

  it('compte gratuit : items d’essai signalés et proposés en premier', () => {
    rendre({ signalerItemsEssai: true });
    ouvrir();
    expect(options().slice(0, 2)).toEqual(['IC-1', 'IC-161']);
    expect(screen.getAllByText('Essai')).toHaveLength(2);
  });

  it('item choisi : code et titre complet dans le déclencheur', () => {
    rendre({ selectedItem: 'IC-161' });
    expect(screen.getByRole('combobox')).toHaveAccessibleName(
      /IC-161, Infections urinaires/
    );
  });
});

describe('Create — niveaux', () => {
  it('raisons exactes, jamais un « manque de contenu »', () => {
    expect(raisonRangIndisponible('B', 15, 0)).toBe(
      'Pas de rang B au programme officiel de cet item'
    );
    expect(raisonRangIndisponible('AB', 15, 0)).toMatch(
      /Identique à Essentiel/
    );
    expect(raisonRangIndisponible('A', 0, 4)).toBe(
      'Pas de rang A au programme officiel de cet item'
    );
    expect(raisonRangIndisponible('A', 3, 2)).toBeNull();
  });

  it('IC-1 (15 A, 0 B) : B et A+B désactivés avec leur raison ; le seul rang possible est présélectionné', () => {
    competences.A = Array.from({ length: 15 }, (_, i) => ({
      objectif_id: `OIC-001-${i + 1}-A`,
      intitule: 'x',
      description: '',
    }));
    competences.B = [];
    const onComptes = vi.fn();
    render(
      <RangSelector
        selectedRang=""
        setSelectedRang={vi.fn()}
        itemCode="IC-1"
        onComptes={onComptes}
      />
    );
    const [a, b, ab] = screen.getAllByRole('radio');
    expect(a).toBeEnabled();
    expect(b).toBeDisabled();
    expect(b).toHaveTextContent('Pas de rang B au programme officiel');
    expect(ab).toBeDisabled();
    expect(onComptes).toHaveBeenLastCalledWith({
      nbA: 15,
      nbB: 0,
      chargement: false,
    });
  });

  it('aucune promesse non sourcée (« 80 % des questions »)', () => {
    competences.A = [
      { objectif_id: 'OIC-001-01-A', intitule: 'x', description: '' },
    ];
    competences.B = [
      { objectif_id: 'OIC-001-01-B', intitule: 'y', description: '' },
    ];
    const { container } = render(
      <RangSelector
        selectedRang="A"
        setSelectedRang={vi.fn()}
        itemCode="IC-2"
      />
    );
    expect(container.textContent).not.toMatch(/80 ?%/);
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });
});

describe('Create — paroles et programme officiel', () => {
  const PAROLES = [
    '[Couplet 1]',
    'Ligne une',
    'Ligne deux',
    '[Refrain]',
    'Refrain un',
    '[Couplet 2]',
    'Ligne trois',
  ];

  it('découpe en parties nommées', () => {
    expect(decouperParoles(PAROLES.join('\n'))).toEqual([
      { titre: 'Couplet 1', lignes: ['Ligne une', 'Ligne deux'] },
      { titre: 'Refrain', lignes: ['Refrain un'] },
      { titre: 'Couplet 2', lignes: ['Ligne trois'] },
    ]);
  });

  it('paroles lisibles, puis la source officielle du rang choisi dans un second onglet', () => {
    competences.A = [
      {
        objectif_id: 'OIC-001-01-A',
        intitule: 'Connaître les modèles de la relation',
        description: '',
      },
    ];
    competences.B = [
      {
        objectif_id: 'OIC-001-02-B',
        intitule: 'Rang B ne doit pas apparaître',
        description: '',
      },
    ];
    render(
      <LyricsPreview
        lyrics={PAROLES}
        rang="A"
        itemCode="IC-1"
        dureeAffichee="≈ 1:30"
      />
    );
    expect(screen.getByText('Couplet 1')).toBeInTheDocument();
    expect(screen.getByText('4 lignes chantées')).toBeInTheDocument();
    // Deux premières parties visibles, la suite au clic.
    expect(screen.queryByText('Ligne trois')).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: /Lire toutes les paroles/ })
    );
    expect(screen.getByText('Ligne trois')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Programme officiel/ }));
    expect(
      screen.getByText('Connaître les modèles de la relation')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Rang B ne doit pas apparaître')
    ).not.toBeInTheDocument();
    expect(screen.getByText(/c'est ce texte qui fait foi/)).toBeInTheDocument();
  });
});
