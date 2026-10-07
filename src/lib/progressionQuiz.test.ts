import { describe, expect, it, vi } from 'vitest';
import { doitAvancerCarte, enregistrerProgressionQuiz, qualiteDepuisPourcentage, type ClientProgression } from './progressionQuiz';

const maintenant = new Date('2026-10-07T10:00:00Z');

const client = (carte: { next_review_date: string } | null) => {
  const inserts: Array<{ table: string; valeurs: Record<string, unknown> }> = [];
  const c: ClientProgression = {
    from: (table: string) => ({
      insert: (valeurs: Record<string, unknown>) => {
        inserts.push({ table, valeurs });
        return Promise.resolve({ error: null });
      },
      select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: carte, error: null }) }) }) }),
    }),
  };
  return { c, inserts };
};

describe('progressionQuiz', () => {
  it('convertit le score en qualité SM-2 (échec sous 60 %)', () => {
    expect(qualiteDepuisPourcentage(0)).toBe(0);
    expect(qualiteDepuisPourcentage(30)).toBe(1);
    expect(qualiteDepuisPourcentage(50)).toBe(2);
    expect(qualiteDepuisPourcentage(60)).toBe(3);
    expect(qualiteDepuisPourcentage(90)).toBe(4);
    expect(qualiteDepuisPourcentage(100)).toBe(5);
  });

  it('ne fait pas avancer une carte non due sur une réussite (pas de maîtrise par répétition immédiate)', () => {
    const future = { next_review_date: '2026-10-10T00:00:00Z' };
    expect(doitAvancerCarte(null, 5, maintenant)).toBe(true);
    expect(doitAvancerCarte(future, 5, maintenant)).toBe(false);
    expect(doitAvancerCarte(future, 1, maintenant)).toBe(true);
    expect(doitAvancerCarte({ next_review_date: '2026-10-06T00:00:00Z' }, 5, maintenant)).toBe(true);
  });

  it('écrit l’historique puis la carte SRS avec le code normalisé', async () => {
    const { c, inserts } = client(null);
    const recordReview = vi.fn().mockResolvedValue({ success: true });
    const r = await enregistrerProgressionQuiz(c, recordReview, { userId: 'u', itemCode: 'IC-012', pourcentage: 70, maintenant });
    expect(inserts).toEqual([{ table: 'revision_history', valeurs: { user_id: 'u', item_code: 'IC-12', score: 70, session_date: '2026-10-07' } }]);
    expect(recordReview).toHaveBeenCalledWith('u', 'IC-12', 3);
    expect(r).toEqual({ historique: true, carte: true });
  });

  it('carte non due + réussite : historique seul', async () => {
    const { c, inserts } = client({ next_review_date: '2026-10-20T00:00:00Z' });
    const recordReview = vi.fn();
    const r = await enregistrerProgressionQuiz(c, recordReview, { userId: 'u', itemCode: 'IC-12', pourcentage: 100, maintenant });
    expect(inserts).toHaveLength(1);
    expect(recordReview).not.toHaveBeenCalled();
    expect(r.carte).toBeNull();
  });
});
