import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleBrouillonNote,
  ecrireBrouillonNote,
  effacerBrouillonNote,
  lireBrouillonNote,
  noteAAfficher,
} from './brouillonNote';

describe('brouillon local d’une note personnelle', () => {
  // src/tests/setup.ts remplace localStorage par des vi.fn() sans mémoire : on y branche un
  // magasin en mémoire pour ces tests.
  const magasin = new Map<string, string>();
  beforeEach(() => {
    magasin.clear();
    vi.mocked(window.localStorage.getItem).mockImplementation((k: string) => (magasin.has(k) ? magasin.get(k)! : null));
    vi.mocked(window.localStorage.setItem).mockImplementation((k: string, v: string) => {
      magasin.set(k, String(v));
    });
    vi.mocked(window.localStorage.removeItem).mockImplementation((k: string) => {
      magasin.delete(k);
    });
  });

  it('garde la saisie par compte et par item jusqu’à son effacement', () => {
    ecrireBrouillonNote('u1', 'IC-1', 'Note tapée hors ligne');
    expect(lireBrouillonNote('u1', 'IC-1')).toBe('Note tapée hors ligne');
    // Un autre compte ou un autre item ne voit pas ce brouillon.
    expect(lireBrouillonNote('u2', 'IC-1')).toBeNull();
    expect(lireBrouillonNote('u1', 'IC-2')).toBeNull();
    expect(cleBrouillonNote('u1', 'IC-1')).toBe('medmng_note_brouillon:u1:IC-1');
    effacerBrouillonNote('u1', 'IC-1');
    expect(lireBrouillonNote('u1', 'IC-1')).toBeNull();
  });

  it('au chargement, préfère le brouillon non envoyé à la note du serveur', () => {
    expect(noteAAfficher('ancienne', 'nouvelle saisie')).toEqual({ texte: 'nouvelle saisie', enAttente: true });
    // Note vidée hors ligne : le brouillon vide l'emporte aussi.
    expect(noteAAfficher('ancienne', '')).toEqual({ texte: '', enAttente: true });
    expect(noteAAfficher('identique', 'identique')).toEqual({ texte: 'identique', enAttente: false });
    expect(noteAAfficher('serveur', null)).toEqual({ texte: 'serveur', enAttente: false });
  });

  it('ne lève jamais d’erreur si le stockage est indisponible', () => {
    vi.mocked(window.localStorage.setItem).mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    vi.mocked(window.localStorage.getItem).mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.mocked(window.localStorage.removeItem).mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => ecrireBrouillonNote('u1', 'IC-1', 'x')).not.toThrow();
    expect(lireBrouillonNote('u1', 'IC-1')).toBeNull();
    expect(() => effacerBrouillonNote('u1', 'IC-1')).not.toThrow();
  });
});
