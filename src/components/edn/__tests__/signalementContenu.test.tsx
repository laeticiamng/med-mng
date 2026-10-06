import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MENTION_CONTENU_IA } from '@/config/mentionsContenu';

// --- Mocks -----------------------------------------------------------------
// Le setup global remplace useLocation par { pathname: '/test' } : ici, le vrai routeur.
vi.mock('react-router-dom', async () => vi.importActual('react-router-dom'));
const auth = vi.hoisted(() => ({
  user: null as null | { id: string },
  loading: false,
}));
vi.mock('@/components/med-mng/AuthProvider', () => ({ useAuth: () => auth }));

const envoi = vi.hoisted(() => ({ envoyerSignalement: vi.fn() }));
vi.mock('@/lib/signalementsContenu', () => envoi);

vi.mock('@/hooks/useActivityTracking', () => ({
  useActivityTracking: () => ({ logActivity: vi.fn() }),
}));
vi.mock('@/hooks/useGamification', () => ({
  useGamification: () => ({
    stats: null,
    loadStats: vi.fn(),
    addPoints: vi.fn(),
    unlockBadge: vi.fn(),
  }),
  POINTS_CONFIG: {},
}));
vi.mock('@/hooks/useOicCompetences', () => ({
  useOicCompetences: () => ({ competences: [], loading: false }),
}));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getUser: async () => ({ data: { user: null } }) } },
}));
vi.mock('@/utils/exportUtils', () => ({
  exportToPDF: vi.fn(),
  shareContent: vi.fn(),
}));
vi.mock('@/hooks/useAnalyticsTracking', () => ({
  useAnalyticsTracking: () => ({ trackMusicGeneration: vi.fn() }),
}));
vi.mock('@/hooks/useAudioWithCache', () => ({
  useAudioWithCache: () => ({ cacheAudio: vi.fn(), isCaching: false }),
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/hooks/useParolesMusicales', () => ({
  useParolesMusicales: () => ({
    selectedStyle: 'pop',
    setSelectedStyle: vi.fn(),
    musicDuration: 120,
    setMusicDuration: vi.fn(),
    isGenerating: {},
    generatedAudio: {},
    pollingTracks: {},
    generationProgress: {},
    lastError: null,
    currentLanguage: 'fr',
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    handleGenerate: vi.fn(),
    handleGenerateMix: vi.fn(),
    handlePlayAudio: vi.fn(),
    seek: vi.fn(),
    stop: vi.fn(),
    changeVolume: vi.fn(),
    parolesRegenerees: {},
    musicQuota: null,
    aAccesGeneration: false,
    chargementAcces: false,
    connecte: false,
  }),
}));
// Les sous-composants des paroles ne sont pas l'objet de ce test.
vi.mock('../music/ParolesMusicalesMainContent', () => ({
  ParolesMusicalesMainContent: () => <div>[Couplet 1]</div>,
}));
vi.mock('../music/ParolesMusicalesControls', () => ({
  ParolesMusicalesControls: () => null,
}));
vi.mock('../music/ParolesMusicalesErrorSection', () => ({
  ParolesMusicalesErrorSection: () => null,
}));
vi.mock('../music/MusicGenerationWaveform', () => ({
  MusicGenerationWaveform: () => null,
}));
vi.mock('../IllustrationCase', () => ({
  IllustrationCase: () => <div>illustration</div>,
}));

import { MentionContenuIA } from '../MentionContenuIA';

const avecRouteur = (
  ui: React.ReactElement,
  chemin = '/edn-complete/ic-161/musique'
) => render(<MemoryRouter initialEntries={[chemin]}>{ui}</MemoryRouter>);

beforeEach(() => {
  auth.user = null;
  envoi.envoyerSignalement.mockReset();
});

describe('CF-10 — mention renforcée commune', () => {
  it('texte exact de la décision', () => {
    expect(MENTION_CONTENU_IA).toBe(
      'Contenu rédigé par IA à partir des compétences officielles LiSA 2026, non relu individuellement par un médecin. La compétence officielle fait foi.'
    );
  });

  it('sur les paroles (ParolesMusicales)', async () => {
    const { ParolesMusicales } = await import('../ParolesMusicales');
    avecRouteur(
      <ParolesMusicales itemCode="IC-161" paroles_rang_a={['[Couplet 1]']} />
    );
    expect(screen.getByTestId('mention-contenu-ia')).toHaveTextContent(
      MENTION_CONTENU_IA
    );
  });

  it('sur le récit (RomanNarratif)', async () => {
    const { RomanNarratif } = await import('../RomanNarratif');
    avecRouteur(
      <RomanNarratif
        itemCode="IC-161"
        title="Item"
        romanStory={
          [{ titre: 'Chapitre un', texte: 'Texte.', competences: [] }] as never
        }
      />
    );
    expect(screen.getByTestId('mention-contenu-ia')).toHaveTextContent(
      MENTION_CONTENU_IA
    );
  });

  it('sur les planches (BdGallery)', async () => {
    const { BdGallery } = await import('../BdGallery');
    avecRouteur(
      <BdGallery
        itemCode="IC-161"
        title="Item"
        bdPanels={
          [
            {
              id: 'p1',
              title: 'Case 1',
              description: 'Une scène.',
              type: 'intro',
              competences: [],
            },
          ] as never
        }
      />
    );
    expect(screen.getAllByTestId('mention-contenu-ia')[0]).toHaveTextContent(
      MENTION_CONTENU_IA
    );
  });
});

describe('CF-10 — « Signaler une erreur »', () => {
  it('visiteur : lien « se connecter pour signaler », qui ramène à la page', () => {
    avecRouteur(<MentionContenuIA itemCode="IC-161" typeContenu="paroles" />);
    const lien = screen.getByRole('link', {
      name: /Se connecter pour signaler une erreur/,
    });
    expect(lien).toHaveAttribute(
      'href',
      `/med-mng/login?next=${encodeURIComponent('/edn-complete/ic-161/musique')}`
    );
    expect(
      screen.queryByRole('button', { name: 'Signaler une erreur' })
    ).toBeNull();
  });

  it('compte connecté : formulaire accessible, envoi simulé, confirmation honnête', async () => {
    auth.user = { id: 'u1' };
    envoi.envoyerSignalement.mockResolvedValue({ ok: true });
    avecRouteur(
      <MentionContenuIA
        itemCode="IC-150"
        typeContenu="recit"
        reference="Chapitre 3 — L'ordonnance"
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Signaler une erreur' })
    );
    const dialogue = await screen.findByRole('dialog', {
      name: 'Signaler une erreur',
    });
    expect(dialogue).toHaveTextContent(
      "IC-150 · récit · Chapitre 3 — L'ordonnance"
    );

    const champ = screen.getByLabelText('Votre message');
    const bouton = screen.getByRole('button', {
      name: 'Envoyer le signalement',
    });
    fireEvent.change(champ, { target: { value: 'abc' } });
    expect(bouton).toBeDisabled();

    fireEvent.change(champ, {
      target: { value: '  La dose de 80-90 mg/kg/j diffère de la HAS 2025.  ' },
    });
    expect(bouton).toBeEnabled();
    fireEvent.click(bouton);

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Merci, votre signalement sera examiné.'
    );
    expect(envoi.envoyerSignalement).toHaveBeenCalledTimes(1);
    expect(envoi.envoyerSignalement).toHaveBeenCalledWith({
      itemCode: 'IC-150',
      typeContenu: 'recit',
      reference: "Chapitre 3 — L'ordonnance",
      message: '  La dose de 80-90 mg/kg/j diffère de la HAS 2025.  ',
    });
  });

  it('limite serveur atteinte : message clair, rien n’est annoncé comme envoyé', async () => {
    auth.user = { id: 'u1' };
    envoi.envoyerSignalement.mockResolvedValue({ ok: false, raison: 'limite' });
    avecRouteur(<MentionContenuIA itemCode="IC-161" typeContenu="paroles" />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Signaler une erreur' })
    );
    fireEvent.change(await screen.findByLabelText('Votre message'), {
      target: { value: 'Rime fausse au couplet 2.' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Envoyer le signalement' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'limite de 20 signalements par jour'
    );
    expect(screen.queryByRole('status')).toBeNull();
  });
});

describe('CF-10 — envoyerSignalement (client Supabase)', () => {
  it('insère seulement les 4 colonnes autorisées et reconnaît la limite serveur', async () => {
    const { envoyerSignalement } = await vi.importActual<
      typeof import('@/lib/signalementsContenu')
    >('@/lib/signalementsContenu');
    const { supabase } = await import('@/integrations/supabase/client');
    const insert = vi
      .fn()
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({
        error: {
          message: 'Limite de 20 signalements par 24 heures atteinte',
          hint: 'mm_signalements_limite',
        },
      })
      .mockResolvedValueOnce({ error: { message: 'boom' } });
    const from = vi.fn(() => ({ insert }));
    (supabase as unknown as { from: typeof from }).from = from;

    await expect(
      envoyerSignalement({
        itemCode: 'IC-161',
        typeContenu: 'paroles',
        reference: '  ',
        message: '  Erreur ici.  ',
      })
    ).resolves.toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith('mm_signalements_contenu');
    expect(insert).toHaveBeenCalledWith({
      item_code: 'IC-161',
      type_contenu: 'paroles',
      reference: null,
      message: 'Erreur ici.',
    });
    await expect(
      envoyerSignalement({
        itemCode: 'IC-1',
        typeContenu: 'recit',
        message: 'Erreur ici.',
      })
    ).resolves.toEqual({
      ok: false,
      raison: 'limite',
    });
    await expect(
      envoyerSignalement({
        itemCode: 'IC-1',
        typeContenu: 'recit',
        message: 'Erreur ici.',
      })
    ).resolves.toEqual({
      ok: false,
      raison: 'erreur',
    });
  });
});
