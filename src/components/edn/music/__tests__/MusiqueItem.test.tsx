import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Sous-page Musique d'un item EDN. Tout est simulé : aucun appel réseau, aucune
 * génération payante. `generateMusicInLanguage` (le client de génération de
 * Create) est un espion : il ne doit être appelé QUE par le bouton de génération.
 */
vi.mock('react-router-dom', async () => vi.importActual('react-router-dom'));

const etat = vi.hoisted(() => ({
  user: { id: 'u1' } as { id: string } | null,
  acces: { aAccesPremium: true, estAdmin: false, chargement: false },
  quota: {
    can_generate: true,
    current_usage: 4,
    quota_limit: 30,
    plan_name: 'premium',
  } as {
    can_generate: boolean;
    current_usage: number;
    quota_limit: number;
    plan_name: string;
  } | null,
  generer: vi.fn(),
  chansons: [] as Array<Record<string, unknown>>,
  invoke: vi.fn(),
  generant: false,
  rappelsTemps: [] as unknown[],
}));

vi.mock('@/components/med-mng/AuthProvider', () => ({
  useAuth: () => ({ user: etat.user, loading: false }),
}));
vi.mock('@/hooks/useAccesPremium', () => ({
  useAccesPremium: () => ({
    ...etat.acces,
    connecte: Boolean(etat.user),
    peutVoirItem: () => true,
  }),
}));
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({
    musicQuota: etat.quota,
    rafraichirQuota: vi.fn(),
    loading: false,
  }),
}));
vi.mock('@/hooks/useMusicGenerationWithTranslation', () => ({
  useMusicGenerationWithTranslation: () => ({
    isGenerating: { rangA: etat.generant, rangB: false, rangAB: false },
    generateMusicInLanguage: etat.generer,
    cancelGeneration: vi.fn(),
    pollingProgress: 0,
    etape: null,
  }),
}));
vi.mock('@/hooks/useActivityTracking', () => ({
  useActivityTracking: () => ({ logActivity: vi.fn() }),
}));
vi.mock('@/hooks/useGamification', () => ({
  useGamification: () => ({ addPoints: vi.fn(), loadStats: vi.fn() }),
  POINTS_CONFIG: { itemReviewed: 5 },
}));
vi.mock('@/hooks/useRealtimeGeneration', () => ({
  useRealtimeGeneration: (options: { onGenerationComplete?: unknown }) => {
    etat.rappelsTemps.push(options.onGenerationComplete);
  },
}));
vi.mock('@/components/generator/GenerationNotificationHandler', () => ({
  useGenerationNotifications: () => ({ handleGenerationComplete: vi.fn() }),
}));
vi.mock('@/lib/bibliothequeGeneration', () => ({
  assurerChansonEnBibliotheque: vi
    .fn()
    .mockResolvedValue({ etat: 'deja', songId: 's1' }),
}));
vi.mock('@/utils/generateComprehensiveLyrics', () => ({
  generateComprehensiveLyrics: vi
    .fn()
    .mockResolvedValue(['[Couplet 1]', 'Ligne reconstruite.']),
  generateMixedLyrics: vi
    .fn()
    .mockResolvedValue(['[Couplet 1]', 'Ligne reconstruite A+B.']),
}));
vi.mock('@/hooks/useOicCompetences', () => ({
  useOicCompetences: () => ({ competences: [], loading: false }),
}));
vi.mock('@/components/global/TranslatedText', () => ({
  TranslatedText: ({ text }: { text: string }) => <>{text}</>,
}));
vi.mock('@/components/generator/GenerationProgress', () => ({
  GenerationProgress: ({
    isGenerating,
    rang,
  }: {
    isGenerating: boolean;
    rang?: string;
  }) =>
    isGenerating ? (
      <div data-testid="progression" data-rang={rang ?? ''} />
    ) : null,
}));
vi.mock('@/components/music/GeneratorMusicPlayer', () => ({
  GeneratorMusicPlayer: ({
    generatedSong,
  }: {
    generatedSong: { title: string } | null;
  }) =>
    generatedSong ? (
      <div data-testid="lecteur">{generatedSong.title}</div>
    ) : null,
}));
vi.mock('@/components/edn/SignalerErreur', () => ({
  SignalerErreur: () => null,
}));
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));

// MesChansonsItem lit generated_music_tracks (RLS) : on simule la ligne, jamais le réseau.
vi.mock('@/integrations/supabase/client', () => {
  const chaine: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'not', 'order']) chaine[m] = () => chaine;
  chaine.limit = () => Promise.resolve({ data: etat.chansons, error: null });
  return {
    supabase: { from: () => chaine, functions: { invoke: etat.invoke } },
  };
});

import { MusiqueItem } from '../MusiqueItem';
import { useChansonItem } from '@/hooks/useChansonItem';
import { assurerChansonEnBibliotheque } from '@/lib/bibliothequeGeneration';
import { generateComprehensiveLyrics } from '@/utils/generateComprehensiveLyrics';
import { STYLES_MUSICAUX } from '@/config/stylesMusicaux';

const REDIGEES_A = [
  '[Couplet 1]',
  'Le médecin écoute le patient avec attention,',
  'Il note chaque détail de la consultation.',
];
const REDIGEES_B = [
  '[Couplet 1]',
  'En spécialité, il approfondit la démarche,',
  'Il argumente la décision avec rigueur.',
];
const REDIGEES_AB = [
  '[Couplet 1]',
  'Texte combiné des deux rangs ici,',
  'Il relie le socle et la spécialité.',
];

const paroles = {
  item_code: 'IC-14',
  title: 'Item de test',
  paroles_rang_a: REDIGEES_A,
  paroles_rang_b: REDIGEES_B,
  paroles_rang_ab: REDIGEES_AB,
};

const rendre = (
  props: Partial<React.ComponentProps<typeof MusiqueItem>> = {}
) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <MusiqueItem
          itemCode="IC-14"
          titre="Item de test"
          numero={14}
          paroles={paroles}
          rangAVide={false}
          rangBVide={false}
          {...props}
        />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const onglet = (nom: string) =>
  within(
    screen.getByRole('tablist', { name: /Niveau de connaissances/ })
  ).getByRole('tab', { name: nom });
const choisirStyle = () => fireEvent.click(screen.getAllByRole('radio')[0]);

beforeEach(() => {
  etat.user = { id: 'u1' };
  etat.acces = { aAccesPremium: true, estAdmin: false, chargement: false };
  etat.quota = {
    can_generate: true,
    current_usage: 4,
    quota_limit: 30,
    plan_name: 'premium',
  };
  etat.chansons = [];
  etat.generant = false;
  etat.rappelsTemps = [];
  etat.invoke.mockReset();
  etat.generer.mockReset();
  etat.generer.mockResolvedValue({
    audioUrl: 'https://x/a.mp3',
    taskId: 't1',
    titre: 'IC-14 — Rang A',
    dureeDemandee: 120,
  });
});

describe('Musique d’un item — item présélectionné et structure', () => {
  it('affiche le numéro, le titre de l’item et trois onglets exclusifs', () => {
    rendre();
    expect(
      screen.getByRole('heading', { name: /Chanson de l'item IC-14/ })
    ).toBeInTheDocument();
    expect(screen.getByText('Item de test')).toBeInTheDocument();
    const rangs = screen.getByRole('tablist', {
      name: /Niveau de connaissances/,
    });
    expect(
      within(rangs)
        .getAllByRole('tab')
        .map((t) => t.textContent)
    ).toEqual(['Rang A', 'Rang B', 'Rang A+B']);
    expect(onglet('Rang A')).toHaveAttribute('aria-selected', 'true');
    expect(onglet('Rang B')).toHaveAttribute('aria-selected', 'false');
    expect(onglet('Rang A+B')).toHaveAttribute('aria-selected', 'false');
  });

  it('un item sans rang A (IC-30) : onglet A désactivé, le rang B est présélectionné', () => {
    rendre({ rangAVide: true, paroles: { ...paroles, paroles_rang_a: [] } });
    expect(onglet('Rang A')).toBeDisabled();
    expect(onglet('Rang A+B')).toBeDisabled();
    expect(onglet('Rang B')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Rang B de l'item|En spécialité/)).toBeTruthy();
  });
});

describe('Musique d’un item — un seul rang visible à la fois', () => {
  it('seules les paroles du rang choisi sont dans la page, jamais les trois versions', () => {
    rendre();
    expect(
      screen.getByText('Le médecin écoute le patient avec attention,')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('En spécialité, il approfondit la démarche,')
    ).toBeNull();
    expect(
      screen.queryByText('Il relie le socle et la spécialité.')
    ).toBeNull();

    fireEvent.mouseDown(onglet('Rang B'), { button: 0 });
    fireEvent.click(onglet('Rang B'));
    expect(
      screen.getByText('En spécialité, il approfondit la démarche,')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Le médecin écoute le patient avec attention,')
    ).toBeNull();
    expect(
      screen.queryByText('Il relie le socle et la spécialité.')
    ).toBeNull();

    fireEvent.mouseDown(onglet('Rang A+B'), { button: 0 });
    fireEvent.click(onglet('Rang A+B'));
    expect(
      screen.getByText('Il relie le socle et la spécialité.')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('En spécialité, il approfondit la démarche,')
    ).toBeNull();
    expect(
      screen.queryByText('Le médecin écoute le patient avec attention,')
    ).toBeNull();
  });

  it('changer de rang n’appelle jamais la génération (aucun appel payant)', () => {
    const reseau = vi.spyOn(globalThis, 'fetch');
    rendre();
    choisirStyle();
    reseau.mockClear();
    for (const nom of ['Rang B', 'Rang A+B', 'Rang A', 'Rang B']) {
      fireEvent.mouseDown(onglet(nom), { button: 0 });
      fireEvent.click(onglet(nom));
    }
    expect(etat.generer).not.toHaveBeenCalled();
    expect(etat.invoke).not.toHaveBeenCalled();
    expect(reseau).not.toHaveBeenCalled();
    reseau.mockRestore();
  });

  it('seul le bouton de génération appelle le client, avec le rang et le style choisis', async () => {
    rendre();
    fireEvent.mouseDown(onglet('Rang B'), { button: 0 });
    fireEvent.click(onglet('Rang B'));
    choisirStyle();
    fireEvent.click(
      screen.getByRole('button', { name: 'Générer la chanson du rang B' })
    );
    await waitFor(() => expect(etat.generer).toHaveBeenCalledTimes(1));
    const [rang, lignes, style, options] = etat.generer.mock.calls[0];
    expect(rang).toBe('B');
    expect(lignes).toEqual(REDIGEES_B);
    expect(style).toBeTruthy();
    expect(options).toMatchObject({
      itemCode: 'IC-14',
      itemTitle: 'Item de test',
    });
    await waitFor(() =>
      expect(screen.getByTestId('lecteur')).toHaveTextContent('IC-14 — Rang A')
    );
  });

  it('sans style choisi, le bouton de génération reste inactif', () => {
    rendre();
    expect(
      screen.getByRole('button', { name: 'Générer la chanson du rang A' })
    ).toBeDisabled();
    expect(etat.generer).not.toHaveBeenCalled();
  });

  it('paroles non rédigées (mots-clés) : elles sont reconstruites au lancement, pas affichées comme paroles', async () => {
    rendre({
      paroles: { ...paroles, paroles_rang_a: ['mot clé un', 'mot clé deux'] },
    });
    expect(screen.getByTestId('paroles-a-rediger')).toBeInTheDocument();
    choisirStyle();
    fireEvent.click(
      screen.getByRole('button', { name: 'Générer la chanson du rang A' })
    );
    await waitFor(() => expect(etat.generer).toHaveBeenCalledTimes(1));
    expect(etat.generer.mock.calls[0][1]).toEqual([
      '[Couplet 1]',
      'Ligne reconstruite.',
    ]);
  });
});

describe('Musique d’un item — droits Premium', () => {
  it('compte non Premium : invitation à la place des réglages, aucun bouton de génération actif', () => {
    etat.acces = { aAccesPremium: false, estAdmin: false, chargement: false };
    rendre();
    expect(
      screen.getByText(/La génération audio est incluse dans Med MNG Premium/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: "Voir l'offre" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Générer la chanson/ })
    ).toBeNull();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    // Les paroles restent lisibles.
    expect(
      screen.getByText('Le médecin écoute le patient avec attention,')
    ).toBeInTheDocument();
    expect(etat.generer).not.toHaveBeenCalled();
  });

  it('visiteur non connecté : l’invitation propose aussi la connexion', () => {
    etat.user = null;
    etat.acces = { aAccesPremium: false, estAdmin: false, chargement: false };
    rendre();
    expect(
      screen.getByRole('link', { name: 'Se connecter' })
    ).toBeInTheDocument();
  });

  it('Premium : quota du mois affiché ; quota épuisé : bouton inactif', () => {
    etat.quota = {
      can_generate: false,
      current_usage: 30,
      quota_limit: 30,
      plan_name: 'premium',
    };
    rendre();
    expect(
      screen.getByText(/Générations audio ce mois-ci : 30 \/ 30/)
    ).toBeInTheDocument();
    choisirStyle();
    expect(
      screen.getByRole('button', { name: 'Générer la chanson du rang A' })
    ).toBeDisabled();
  });
});

describe('Musique d’un item — chansons déjà générées', () => {
  it('liste les chansons existantes de l’item', async () => {
    etat.chansons = [
      {
        id: 'c1',
        title: 'IC-14 — Rang A',
        audio_url: 'https://stockage.exemple/c1.mp3',
        duration: 125,
        created_at: '2026-10-04T14:56:15Z',
        metadata: { style: 'lofi' },
      },
    ];
    rendre();
    const liste = await screen.findByText('Mes chansons de cet item');
    const carte = liste.closest('div[class*="rounded"]') as HTMLElement;
    expect(
      within(carte.parentElement as HTMLElement).getByText(/IC-14 — Rang A/)
    ).toBeInTheDocument();
  });

  it('aucune chanson : pas de bloc vide', async () => {
    rendre();
    await waitFor(() =>
      expect(screen.queryByText('Mes chansons de cet item')).toBeNull()
    );
  });
});

describe('Musique d’un item — suivi de la génération', () => {
  it('le callback realtime garde la même identité à chaque rendu (le canal n’est pas recréé en boucle)', () => {
    rendre();
    fireEvent.mouseDown(onglet('Rang B'), { button: 0 });
    fireEvent.click(onglet('Rang B'));
    fireEvent.mouseDown(onglet('Rang A+B'), { button: 0 });
    fireEvent.click(onglet('Rang A+B'));
    expect(etat.rappelsTemps.length).toBeGreaterThan(2);
    expect(new Set(etat.rappelsTemps).size).toBe(1);
  });

  it('changer d’onglet pendant une génération : la progression garde le rang réellement lancé', async () => {
    etat.generer.mockReturnValue(new Promise(() => {}));
    rendre();
    choisirStyle();
    fireEvent.click(
      screen.getByRole('button', { name: 'Générer la chanson du rang A' })
    );
    await waitFor(() => expect(etat.generer).toHaveBeenCalledTimes(1));
    expect(etat.generer.mock.calls[0][0]).toBe('A');
    // La génération du rang A est en cours : l'utilisatrice regarde le rang B.
    etat.generant = true;
    fireEvent.mouseDown(onglet('Rang B'), { button: 0 });
    fireEvent.click(onglet('Rang B'));
    expect(onglet('Rang B')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('progression')).toHaveAttribute('data-rang', 'A');
    expect(etat.generer).toHaveBeenCalledTimes(1);
  });
});

describe('Musique d’un item — pas de double génération payante', () => {
  const MOTS_CLES = ['mot clé un', 'mot clé deux'];

  it('paroles à rédiger : pendant la rédaction, ni bouton ni second rang ne lancent une deuxième génération', async () => {
    let finir: (lignes: string[]) => void = () => {};
    vi.mocked(generateComprehensiveLyrics).mockImplementation(
      () => new Promise<string[]>((resolve) => (finir = resolve))
    );
    rendre({
      paroles: {
        ...paroles,
        paroles_rang_a: MOTS_CLES,
        paroles_rang_b: MOTS_CLES,
      },
    });
    choisirStyle();
    fireEvent.click(
      screen.getByRole('button', { name: 'Générer la chanson du rang A' })
    );
    // La rédaction est en cours : rien n'est encore envoyé, mais tout est verrouillé.
    const bouton = screen.getByRole('button', {
      name: /Générer la chanson du rang A/,
    });
    expect(bouton).toBeDisabled();
    fireEvent.mouseDown(onglet('Rang B'), { button: 0 });
    fireEvent.click(onglet('Rang B'));
    const boutonB = screen.getByRole('button', {
      name: /Générer la chanson du rang A/,
    });
    fireEvent.click(boutonB);
    expect(boutonB).toBeDisabled();
    expect(etat.generer).not.toHaveBeenCalled();
    await act(async () => finir(['[Couplet 1]', 'Ligne rédigée.']));
    await waitFor(() => expect(etat.generer).toHaveBeenCalledTimes(1));
    expect(etat.generer.mock.calls[0][0]).toBe('A');
  });

  it('deux lancements rapprochés sur deux rangs : un seul appel à generateMusicInLanguage', async () => {
    const resolveurs: Array<(lignes: string[]) => void> = [];
    vi.mocked(generateComprehensiveLyrics).mockImplementation(
      () => new Promise<string[]>((resolve) => resolveurs.push(resolve))
    );
    const client = new QueryClient();
    const { result } = renderHook(
      () =>
        useChansonItem('IC-14', {
          ...paroles,
          paroles_rang_a: MOTS_CLES,
          paroles_rang_b: MOTS_CLES,
        }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={client}>
            <MemoryRouter>{children}</MemoryRouter>
          </QueryClientProvider>
        ),
      }
    );
    await act(async () => {
      void result.current.generer('A', 'lofi');
      void result.current.generer('B', 'lofi');
    });
    expect(result.current.enCours).toBe(true);
    expect(resolveurs).toHaveLength(1);
    await act(async () =>
      resolveurs.forEach((r) => r(['[Couplet 1]', 'Ligne rédigée.']))
    );
    await waitFor(() => expect(etat.generer).toHaveBeenCalledTimes(1));
    expect(etat.generer.mock.calls[0][0]).toBe('A');
    // Le verrou est levé à la fin : on peut relancer.
    await waitFor(() => expect(result.current.enCours).toBe(false));
  });

  it('le résumé garde le style lancé quand on en choisit un autre pendant la génération', async () => {
    etat.generer.mockReturnValue(new Promise(() => {}));
    rendre();
    const [premier, second] = STYLES_MUSICAUX;
    fireEvent.click(screen.getAllByRole('radio')[0]);
    fireEvent.click(
      screen.getByRole('button', { name: 'Générer la chanson du rang A' })
    );
    await waitFor(() => expect(etat.generer).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getAllByRole('radio')[1]);
    const resume = screen.getByText(/Rang A ·/, { selector: 'p' });
    expect(resume).toHaveTextContent(`Rang A · ${premier.libelle}`);
    expect(resume).not.toHaveTextContent(second.libelle);
    expect(etat.generer.mock.calls[0][2]).toBe(premier.slug);
  });
});

describe('Musique d’un item — post-traitement après la génération', () => {
  it('bibliothèque qui ne répond jamais : le bouton est ré-actif et la progression est retirée', async () => {
    vi.mocked(assurerChansonEnBibliotheque).mockReturnValueOnce(
      new Promise(() => {})
    );
    rendre();
    choisirStyle();
    fireEvent.click(
      screen.getByRole('button', { name: 'Générer la chanson du rang A' })
    );
    await waitFor(() => expect(etat.generer).toHaveBeenCalledTimes(1));
    // La chanson est prête : le lecteur est affiché, sans attendre le post-traitement.
    await waitFor(() =>
      expect(screen.getByTestId('lecteur')).toBeInTheDocument()
    );
    expect(screen.queryByTestId('progression')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Générer la chanson du rang A' })
    ).toBeEnabled();
  });

  it('bibliothèque en erreur : pas de rejet non traité, bouton ré-actif', async () => {
    vi.mocked(assurerChansonEnBibliotheque).mockRejectedValueOnce(
      new Error('réseau')
    );
    const rejets: unknown[] = [];
    const surRejet = (e: unknown) => rejets.push(e);
    process.on('unhandledRejection', surRejet);
    rendre();
    choisirStyle();
    fireEvent.click(
      screen.getByRole('button', { name: 'Générer la chanson du rang A' })
    );
    await waitFor(() =>
      expect(screen.getByTestId('lecteur')).toBeInTheDocument()
    );
    await new Promise((r) => setTimeout(r, 20));
    process.off('unhandledRejection', surRejet);
    expect(rejets).toEqual([]);
    expect(
      screen.getByRole('button', { name: 'Générer la chanson du rang A' })
    ).toBeEnabled();
  });
});
