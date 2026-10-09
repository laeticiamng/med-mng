import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Med MNG Create (/med-mng/create) — états de la page : offre gratuite affichée dès
 * l'arrivée, quota Premium épuisé, génération en cours, hors ligne, échec de l'API,
 * sélection incomplète. Hooks de données simulés ; aucun appel réseau.
 */

vi.mock('react-router-dom', async () => vi.importActual('react-router-dom'));

const s = vi.hoisted(() => ({
  user: { id: 'u1' } as null | { id: string },
  aAccesPremium: false,
  estAdmin: false,
  musicQuota: null as null | {
    can_generate: boolean;
    current_usage: number;
    quota_limit: number;
    plan_name: string;
  },
  preferences: null as null | {
    selectedItem: string;
    selectedRang: string;
    selectedStyle: string;
  },
  isGenerating: { rangA: false, rangB: false, rangAB: false },
  generate: vi.fn(),
  toastError: vi.fn(),
  toastInfo: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    error: s.toastError,
    info: s.toastInfo,
    success: vi.fn(),
  }),
}));
vi.mock('@/components/med-mng/AuthProvider', () => ({
  useAuth: () => ({ user: s.user }),
}));
vi.mock('@/components/TranslatedText', () => ({
  TranslatedText: ({ text }: { text: string }) => <>{text}</>,
}));
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({
    musicQuota: s.musicQuota,
    rafraichirQuota: vi.fn(),
    loading: false,
  }),
}));
vi.mock('@/hooks/useAccesPremium', () => ({
  useAccesPremium: () => ({
    aAccesPremium: s.aAccesPremium,
    estAdmin: s.estAdmin,
    peutVoirItem: () => true,
    chargement: false,
  }),
}));
vi.mock('@/hooks/useMusicGenerationWithTranslation', () => ({
  useMusicGenerationWithTranslation: () => ({
    isGenerating: s.isGenerating,
    pollingProgress: 40,
    etape: s.isGenerating.rangA ? { etape: 'en_cours', taskId: 't1' } : null,
    generateMusicInLanguage: s.generate,
    cancelGeneration: vi.fn(),
  }),
}));
vi.mock('@/hooks/useActivityTracking', () => ({
  useActivityTracking: () => ({ logActivity: vi.fn() }),
}));
vi.mock('@/hooks/useGamification', () => ({
  POINTS_CONFIG: { itemReviewed: 1 },
  useGamification: () => ({ addPoints: vi.fn(), loadStats: vi.fn() }),
}));
vi.mock('@/hooks/useGeneratorPreferences', () => ({
  useGeneratorPreferences: () => ({
    preferences: s.preferences,
    savePreferences: vi.fn(),
  }),
}));
vi.mock('@/hooks/useRealtimeGeneration', () => ({
  useRealtimeGeneration: vi.fn(),
}));
vi.mock('@/components/generator/GenerationNotificationHandler', () => ({
  useGenerationNotifications: () => ({
    handleGenerationComplete: vi.fn(),
    requestNotificationPermission: vi.fn(),
  }),
}));
vi.mock('@/hooks/useAllEdnItems', () => ({
  useAllEdnItems: () => ({
    items: [{ item_code: 'IC-1', title: 'Relation médecin-malade' }],
    loading: false,
    error: null,
  }),
}));
// Paroles factices « rédigées » (structure + ponctuation) : aucune donnée médicale.
vi.mock('@/hooks/useEdnItemLyrics', () => ({
  useEdnItemLyrics: (code: string | null) => ({
    lyrics: code
      ? {
          item_code: code,
          title: 'Relation médecin-malade',
          paroles_rang_a: [
            '[Couplet 1]',
            'Ligne une, chantée.',
            'Ligne deux, chantée.',
          ],
        }
      : null,
    loading: false,
    error: null,
    verrouille: false,
  }),
}));
vi.mock('@/hooks/useOicCompetences', () => ({
  useOicCompetences: () => ({ competences: [], loading: false, error: null }),
}));
vi.mock('@/lib/bibliothequeGeneration', () => ({
  assurerChansonEnBibliotheque: vi.fn(async () => ({ etat: 'deja' })),
}));
vi.mock('@/components/generator/GenerationHistory', () => ({
  GenerationHistory: () => null,
}));
vi.mock('@/components/generator/MobileHistoryDrawer', () => ({
  MobileHistoryDrawer: () => null,
}));
vi.mock('@/components/generator/PlaylistManager', () => ({
  PlaylistManager: () => null,
}));
vi.mock('@/components/generator/PlaylistQuickAdd', () => ({
  PlaylistQuickAdd: () => null,
}));
vi.mock('@/components/music/GeneratorMusicPlayer', () => ({
  GeneratorMusicPlayer: () => null,
}));
vi.mock('@/components/legal', () => ({ MedicalDisclaimer: () => null }));
vi.mock('@/components/generator/AdvancedParamsToggle', () => ({
  AdvancedParamsToggle: () => null,
}));

import Generator, { MESSAGE_HORS_LIGNE } from './Generator';

const TOUT_CHOISI = {
  selectedItem: 'IC-1',
  selectedRang: 'A',
  selectedStyle: 'pop',
};
const rendre = () =>
  render(
    <MemoryRouter initialEntries={['/med-mng/create']}>
      <Generator />
    </MemoryRouter>
  );

describe('Med MNG Create — états de la page', () => {
  beforeEach(() => {
    s.user = { id: 'u1' };
    s.aAccesPremium = false;
    s.estAdmin = false;
    s.musicQuota = null;
    s.preferences = null;
    s.isGenerating = { rangA: false, rangB: false, rangAB: false };
    s.generate.mockReset();
    s.toastError.mockReset();
  });
  afterEach(() => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  it('compte gratuit : l’offre est affichée dès l’arrivée (0 génération, Premium 30/mois), lien vers la bibliothèque', () => {
    rendre();
    expect(screen.getByText('Votre offre : Gratuit')).toBeInTheDocument();
    expect(
      screen.getByText(/Génération audio : 0 avec l'offre gratuite/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/30 chansons par mois avec Med MNG Premium/)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mes chansons/ })).toHaveAttribute(
      'href',
      '/med-mng/music-library'
    );
  });

  it('sélection incomplète : pas de bouton « Générer la chanson »', () => {
    s.aAccesPremium = true;
    s.musicQuota = {
      can_generate: true,
      current_usage: 0,
      quota_limit: 30,
      plan_name: 'Med MNG Premium',
    };
    rendre();
    expect(
      screen.queryByRole('button', { name: /Générer la chanson/ })
    ).toBeNull();
  });

  it('compte gratuit, tout choisi : encart Premium à la place du bouton de génération', () => {
    s.preferences = TOUT_CHOISI;
    rendre();
    expect(
      screen.queryByRole('button', { name: /Générer la chanson/ })
    ).toBeNull();
    expect(
      screen.getByText(/La génération audio est incluse dans Med MNG Premium/)
    ).toBeInTheDocument();
  });

  it('Premium, quota épuisé : compteur « Épuisé » et bouton désactivé', () => {
    s.aAccesPremium = true;
    s.musicQuota = {
      can_generate: false,
      current_usage: 30,
      quota_limit: 30,
      plan_name: 'Med MNG Premium',
    };
    s.preferences = TOUT_CHOISI;
    rendre();
    expect(screen.getByText('30/30')).toBeInTheDocument();
    expect(screen.getByText('Épuisé')).toBeInTheDocument();
    expect(
      screen.getByText(/Le compteur repart le 1er du mois prochain/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Générer la chanson/ })
    ).toBeDisabled();
  });

  it('Premium, génération en cours : bouton « Génération en cours… » désactivé et suivi affiché', () => {
    s.aAccesPremium = true;
    s.musicQuota = {
      can_generate: true,
      current_usage: 3,
      quota_limit: 30,
      plan_name: 'Med MNG Premium',
    };
    s.preferences = TOUT_CHOISI;
    s.isGenerating = { rangA: true, rangB: false, rangAB: false };
    rendre();
    expect(
      screen.getByRole('button', { name: /Génération en cours/ })
    ).toBeDisabled();
    expect(
      screen.getAllByText(/Votre chanson est en cours de création/).length
    ).toBeGreaterThan(0);
  });

  it('Premium, hors ligne : message dédié, aucune demande envoyée (rien de décompté)', () => {
    s.aAccesPremium = true;
    s.musicQuota = {
      can_generate: true,
      current_usage: 3,
      quota_limit: 30,
      plan_name: 'Med MNG Premium',
    };
    s.preferences = TOUT_CHOISI;
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    rendre();
    fireEvent.click(screen.getByRole('button', { name: /Générer la chanson/ }));
    expect(s.toastError).toHaveBeenCalledWith(MESSAGE_HORS_LIGNE);
    expect(s.generate).not.toHaveBeenCalled();
  });

  it('Premium, en ligne : envoie les paroles du rang choisi ; un échec de l’API ne casse pas la page', async () => {
    s.aAccesPremium = true;
    s.musicQuota = {
      can_generate: true,
      current_usage: 3,
      quota_limit: 30,
      plan_name: 'Med MNG Premium',
    };
    s.preferences = TOUT_CHOISI;
    s.generate.mockRejectedValueOnce(
      new Error('Service momentanément indisponible, réessayez plus tard.')
    );
    rendre();
    fireEvent.click(screen.getByRole('button', { name: /Générer la chanson/ }));
    await vi.waitFor(() => expect(s.generate).toHaveBeenCalledTimes(1));
    const [rang, paroles, style, options] = s.generate.mock.calls[0];
    expect(rang).toBe('A');
    expect(paroles).toEqual([
      '[Couplet 1]',
      'Ligne une, chantée.',
      'Ligne deux, chantée.',
    ]);
    expect(style).toBe('pop');
    expect(options).toMatchObject({ itemCode: 'IC-1' });
    // Le message d'erreur est affiché par le hook (useSunoMusicGeneration) ; la page reste utilisable.
    expect(
      await screen.findByRole('button', { name: /Générer la chanson/ })
    ).toBeEnabled();
  });
});
