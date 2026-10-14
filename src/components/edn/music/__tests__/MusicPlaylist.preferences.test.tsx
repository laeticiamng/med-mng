import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

/**
 * Défaut D5 (QA du 14.10.2026) : la page « Écouter les chansons » lisait
 * `user_music_preferences?select=favorites,history,shuffle_enabled,repeat_mode,volume`
 * (HTTP 400). Cette table appartient à EmotionsCare ; Med MNG n'y touche plus et garde
 * les préférences du lecteur en local, par utilisateur.
 */

const tablesInterrogees: string[] = [];
const utilisateur: { current: { id: string } | null } = { current: { id: 'user-a' } };

const PISTES = [
  { id: 't1', title: 'IC-150 — Rang A', audio_url: 'https://x/a.mp3', duration: 120, metadata: { itemCode: 'IC-150' }, created_at: '2026-10-04T14:00:00Z' },
  { id: 't2', title: 'IC-66 — Rang B', audio_url: 'https://x/b.mp3', duration: 95, metadata: { itemCode: 'IC-66' }, created_at: '2026-10-03T14:00:00Z' },
];

vi.mock('@/integrations/supabase/client', () => {
  const requete = (table: string) => {
    tablesInterrogees.push(table);
    const resultat = { data: table === 'generated_music_tracks' ? PISTES : null, error: null };
    const chaine: Record<string, unknown> = {
      then: (ok: (v: typeof resultat) => unknown) => Promise.resolve(resultat).then(ok),
    };
    for (const m of ['select', 'eq', 'not', 'order', 'single', 'upsert', 'update', 'insert']) {
      chaine[m] = () => chaine;
    }
    return chaine;
  };
  return { supabase: { from: (table: string) => requete(table) } };
});
vi.mock('@/components/med-mng/AuthProvider', () => ({ useAuth: () => ({ user: utilisateur.current }) }));
vi.mock('@/contexts/GlobalAudioContext', () => ({
  useGlobalAudio: () => ({
    play: vi.fn(), pause: vi.fn(), resume: vi.fn(), isPlaying: false, currentTrack: null,
  }),
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { MusicPlaylist } from '@/components/edn/music/MusicPlaylist';
import {
  cleStockageLecteur,
  ecrirePreferencesLecteur,
  lirePreferencesLecteur,
} from '@/components/edn/music/utils/preferencesLecteur';

/**
 * src/tests/setup.ts remplace localStorage par des vi.fn() inertes : on les branche ici sur
 * une mémoire réelle, ce qui permet de vérifier ce qui est écrit, par utilisateur.
 */
const memoire = new Map<string, string>();
const brancherStockage = () => {
  memoire.clear();
  vi.mocked(window.localStorage.getItem).mockImplementation((k: string) => memoire.get(k) ?? null);
  vi.mocked(window.localStorage.setItem).mockImplementation((k: string, v: string) => { memoire.set(k, String(v)); });
  vi.mocked(window.localStorage.removeItem).mockImplementation((k: string) => { memoire.delete(k); });
  vi.mocked(window.localStorage.clear).mockImplementation(() => memoire.clear());
};

const lireStocke = (userId: string | null) => {
  const brut = window.localStorage.getItem(cleStockageLecteur(userId));
  return brut ? JSON.parse(brut) : null;
};

describe('MusicPlaylist — aucune lecture ni écriture de user_music_preferences', () => {
  beforeEach(() => {
    tablesInterrogees.length = 0;
    utilisateur.current = { id: 'user-a' };
    brancherStockage();
  });
  afterEach(() => vi.clearAllMocks());

  it('connecté : ouvrir la page puis utiliser lecture, aléatoire et répétition ne touche jamais la table', async () => {
    render(<MusicPlaylist />);
    await waitFor(() => expect(screen.getByText('Playlist Mnémotechnique')).toBeInTheDocument());

    fireEvent.click(screen.getByText('IC-150')); // lecture : affiche le lecteur et alimente l'historique
    fireEvent.click(screen.getByTitle('Mode aléatoire'));
    fireEvent.click(screen.getByTitle(/Répéter/));

    expect(tablesInterrogees).toContain('generated_music_tracks');
    expect(tablesInterrogees).not.toContain('user_music_preferences');
    expect(tablesInterrogees.every((t) => t === 'generated_music_tracks')).toBe(true);
  });

  it('conserve historique, aléatoire et répétition dans localStorage, par utilisateur', async () => {
    render(<MusicPlaylist />);
    await waitFor(() => expect(screen.getByText('Playlist Mnémotechnique')).toBeInTheDocument());

    fireEvent.click(screen.getByText('IC-150'));
    fireEvent.click(screen.getByTitle('Mode aléatoire'));
    fireEvent.click(screen.getByTitle(/Répéter/));

    const stocke = lireStocke('user-a');
    expect(stocke).toMatchObject({ shuffle_enabled: true, repeat_mode: 'one', volume: 1 });
    expect(stocke.history).toContain('IC-150');
    expect(lireStocke('user-b')).toBeNull();
    expect(lireStocke(null)).toBeNull();
  });

  it('relit les préférences de l’utilisateur connecté, sans celles d’un autre', async () => {
    ecrirePreferencesLecteur('user-a', {
      favorites: ['IC-66'], history: ['IC-150'], shuffle_enabled: false, repeat_mode: 'all', volume: 0.4,
    });
    ecrirePreferencesLecteur('user-b', {
      favorites: ['IC-150'], history: [], shuffle_enabled: true, repeat_mode: 'none', volume: 1,
    });
    render(<MusicPlaylist />);
    await waitFor(() => expect(screen.getByText('Favoris (1)')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Favoris (1)'));
    expect(screen.getByText('IC-66')).toBeInTheDocument();
    expect(screen.queryByText('IC-150')).not.toBeInTheDocument();
    expect(tablesInterrogees).not.toContain('user_music_preferences');
  });

  it('session restaurée après le montage (anonyme puis compte) : les préférences du compte ne sont pas écrasées', async () => {
    ecrirePreferencesLecteur('user-a', {
      favorites: ['IC-66'], history: ['IC-150'], shuffle_enabled: true, repeat_mode: 'all', volume: 0.4,
    });
    utilisateur.current = null;
    const { rerender } = render(<MusicPlaylist />);
    await waitFor(() => expect(screen.getByText('Playlist Mnémotechnique')).toBeInTheDocument());
    expect(screen.getByText('Favoris (0)')).toBeInTheDocument();

    // La session est restaurée : l'identifiant passe de null à user-a.
    utilisateur.current = { id: 'user-a' };
    rerender(<MusicPlaylist />);
    await waitFor(() => expect(screen.getByText('Favoris (1)')).toBeInTheDocument());

    // Rien n'a été écrit par l'état anonyme, ni sous la clé du compte ni sous la sienne.
    expect(lireStocke('user-a')).toEqual({
      favorites: ['IC-66'], history: ['IC-150'], shuffle_enabled: true, repeat_mode: 'all', volume: 0.4,
    });
    expect(lireStocke(null)).toBeNull();

    // L'interaction suivante enregistre les valeurs du compte, pas celles de l'anonyme.
    fireEvent.click(screen.getByText('IC-66'));
    fireEvent.click(screen.getByTitle(/Répéter/));
    const stocke = lireStocke('user-a');
    expect(stocke.favorites).toEqual(['IC-66']);
    expect(stocke.shuffle_enabled).toBe(true);
    expect(stocke.repeat_mode).toBe('none'); // all -> none
    expect(stocke.history[0]).toBe('IC-66');
    expect(lireStocke(null)).toBeNull();
    expect(tablesInterrogees).not.toContain('user_music_preferences');
  });

  it('changement de compte : les préférences de l’un ne sont jamais écrites sous la clé de l’autre', async () => {
    ecrirePreferencesLecteur('user-a', {
      favorites: ['IC-66'], history: [], shuffle_enabled: true, repeat_mode: 'none', volume: 1,
    });
    ecrirePreferencesLecteur('user-b', {
      favorites: ['IC-150'], history: [], shuffle_enabled: false, repeat_mode: 'one', volume: 1,
    });
    const { rerender } = render(<MusicPlaylist />);
    await waitFor(() => expect(screen.getByText('Favoris (1)')).toBeInTheDocument());

    utilisateur.current = { id: 'user-b' };
    rerender(<MusicPlaylist />);
    fireEvent.click(await screen.findByText('Favoris (1)'));
    await waitFor(() => expect(screen.getByText('IC-150')).toBeInTheDocument());
    expect(screen.queryByText('IC-66')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('IC-150')); // écrit sous la clé de user-b uniquement
    expect(lireStocke('user-b')?.repeat_mode).toBe('one');
    expect(lireStocke('user-b')?.shuffle_enabled).toBe(false);
    expect(lireStocke('user-a')?.favorites).toEqual(['IC-66']);
    expect(lireStocke('user-b')?.favorites).toEqual(['IC-150']);
  });

  it('hors connexion : même comportement local, sans table', async () => {
    utilisateur.current = null;
    render(<MusicPlaylist />);
    await waitFor(() => expect(screen.getByText('Playlist Mnémotechnique')).toBeInTheDocument());
    fireEvent.click(screen.getByText('IC-66'));
    expect(lireStocke(null)?.history).toContain('IC-66');
    expect(tablesInterrogees).not.toContain('user_music_preferences');
  });

  it('localStorage indisponible : la page s’affiche et ne lève rien', async () => {
    vi.mocked(window.localStorage.getItem).mockImplementation(() => { throw new Error('bloqué'); });
    vi.mocked(window.localStorage.setItem).mockImplementation(() => { throw new Error('plein'); });
    render(<MusicPlaylist />);
    await waitFor(() => expect(screen.getByText('Playlist Mnémotechnique')).toBeInTheDocument());
    expect(() => fireEvent.click(screen.getByText('IC-150'))).not.toThrow();
    expect(() => fireEvent.click(screen.getByTitle('Mode aléatoire'))).not.toThrow();
    expect(tablesInterrogees).not.toContain('user_music_preferences');
  });
});

describe('préférences du lecteur — lecture défensive', () => {
  beforeEach(brancherStockage);

  it('valeurs par défaut sans donnée, avec JSON corrompu ou valeurs invalides', () => {
    expect(lirePreferencesLecteur('u')).toEqual({
      favorites: [], history: [], shuffle_enabled: false, repeat_mode: 'none', volume: 1,
    });
    window.localStorage.setItem(cleStockageLecteur('u'), '{pas du json');
    expect(lirePreferencesLecteur('u').repeat_mode).toBe('none');
    window.localStorage.setItem(
      cleStockageLecteur('u'),
      JSON.stringify({ favorites: ['IC-1', 3], repeat_mode: 'tout', volume: 7, shuffle_enabled: 'oui' }),
    );
    expect(lirePreferencesLecteur('u')).toEqual({
      favorites: ['IC-1'], history: [], shuffle_enabled: false, repeat_mode: 'none', volume: 1,
    });
  });

  it('reprend les anciennes clés locales hors connexion uniquement', () => {
    window.localStorage.setItem('music-favorites', JSON.stringify(['IC-66']));
    expect(lirePreferencesLecteur(null).favorites).toEqual(['IC-66']);
    expect(lirePreferencesLecteur('u').favorites).toEqual([]);
  });
});

describe('Med MNG n’accède à user_music_preferences nulle part (table d’EmotionsCare)', () => {
  const racineSrc = resolve(__dirname, '../../../..');
  const fichiers = (dossier: string): string[] =>
    readdirSync(dossier).flatMap((nom) => {
      const chemin = join(dossier, nom);
      if (statSync(chemin).isDirectory()) return fichiers(chemin);
      return /\.(ts|tsx)$/.test(nom) ? [chemin] : [];
    });

  it('aucun appel .from(\'user_music_preferences\') dans src/ ni dans les fonctions Supabase (hors types générés)', () => {
    const concernes = [...fichiers(racineSrc), ...fichiers(resolve(racineSrc, '../supabase/functions'))]
      .filter((f) => !f.endsWith('integrations/supabase/types.ts') && !f.includes('__tests__'))
      .filter((f) => /from\(\s*['"`]user_music_preferences/.test(readFileSync(f, 'utf8')));
    expect(concernes).toEqual([]);
  });
});
