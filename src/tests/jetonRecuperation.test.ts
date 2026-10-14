import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  capturerJetonRecuperation,
  jetonPourLaPage,
  prendreJetonRecuperation,
  reinitialiserJetonRecuperation,
} from '../lib/jetonRecuperation';

const emplacement = (pathname: string, search = '', hash = '') => ({ pathname, search, hash });

describe('jetonRecuperation', () => {
  const historique = { state: { idx: 1 }, replaceState: vi.fn() };

  beforeEach(() => {
    reinitialiserJetonRecuperation();
    historique.replaceState.mockReset();
  });

  it('lit token_hash et type dans le fragment, retire le fragment de l’adresse', () => {
    capturerJetonRecuperation(emplacement('/med-mng/reset-password', '', '#token_hash=abc-_123&type=recovery'), historique);
    expect(historique.replaceState).toHaveBeenCalledWith({ idx: 1 }, '', '/med-mng/reset-password');
    expect(prendreJetonRecuperation()).toEqual({ tokenHash: 'abc-_123', type: 'recovery' });
  });

  it('« une seule fois » : le deuxième appel rend null', () => {
    capturerJetonRecuperation(emplacement('/x', '', '#token_hash=abc&type=recovery'), historique);
    expect(prendreJetonRecuperation()).not.toBeNull();
    expect(prendreJetonRecuperation()).toBeNull();
  });

  it('conserve le reste de l’adresse (autres paramètres de query et de fragment)', () => {
    capturerJetonRecuperation(emplacement('/p', '?a=1', '#token_hash=abc&type=recovery&autre=2'), historique);
    expect(historique.replaceState).toHaveBeenCalledWith({ idx: 1 }, '', '/p?a=1#autre=2');
    reinitialiserJetonRecuperation();
    capturerJetonRecuperation(emplacement('/p', '?token_hash=abc&type=recovery&a=1', '#ancre'), historique);
    expect(historique.replaceState).toHaveBeenLastCalledWith({ idx: 1 }, '', '/p?a=1#ancre');
    expect(prendreJetonRecuperation()).toEqual({ tokenHash: 'abc', type: 'recovery' });
  });

  it('sans jeton : rien à faire, adresse intacte (le parcours #access_token de supabase-js n’est pas touché)', () => {
    capturerJetonRecuperation(emplacement('/p', '?a=1', '#access_token=zzz&type=recovery'), historique);
    expect(historique.replaceState).not.toHaveBeenCalled();
    expect(prendreJetonRecuperation()).toBeNull();
  });

  it('type absent : gardé tel quel (null), la page refuse le lien', () => {
    capturerJetonRecuperation(emplacement('/p', '', '#token_hash=abc'), historique);
    expect(prendreJetonRecuperation()).toEqual({ tokenHash: 'abc', type: null });
  });

  it('jetonPourLaPage : pris une fois puis gardé en mémoire (rendus multiples, « Réessayer »)', () => {
    capturerJetonRecuperation(emplacement('/p', '', '#token_hash=abc&type=recovery'), historique);
    expect(jetonPourLaPage()).toEqual({ tokenHash: 'abc', type: 'recovery' });
    expect(jetonPourLaPage()).toEqual({ tokenHash: 'abc', type: 'recovery' });
    expect(prendreJetonRecuperation()).toBeNull();
  });

  it('replaceState qui échoue : le jeton reste en mémoire', () => {
    historique.replaceState.mockImplementation(() => {
      throw new Error('refusé');
    });
    capturerJetonRecuperation(emplacement('/p', '', '#token_hash=abc&type=recovery'), historique);
    expect(prendreJetonRecuperation()).toEqual({ tokenHash: 'abc', type: 'recovery' });
  });
});
