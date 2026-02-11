import { describe, it, expect } from 'vitest';

// Unit tests for QROC keyword matching logic (extracted from QROCInput component)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchKeywords(answer: string, expectedKeywords: string[]): { matched: string[]; missed: string[]; score: number } {
  const normalizedAnswer = normalizeText(answer);
  const matched: string[] = [];
  const missed: string[] = [];

  for (const keyword of expectedKeywords) {
    const normalizedKeyword = normalizeText(keyword);
    const keywordWords = normalizedKeyword.split(' ');
    const isMatch = keywordWords.some(word =>
      word.length > 3 ? normalizedAnswer.includes(word) : normalizedAnswer.split(' ').includes(word)
    );

    if (isMatch) {
      matched.push(keyword);
    } else {
      missed.push(keyword);
    }
  }

  const score = expectedKeywords.length > 0
    ? Math.round((matched.length / expectedKeywords.length) * 100)
    : 0;

  return { matched, missed, score };
}

describe('QROC Keyword Matching', () => {
  it('should normalize accented French text', () => {
    expect(normalizeText('Hémorragie')).toBe('hemorragie');
    expect(normalizeText('Méningo-encéphalite')).toBe('meningo encephalite');
    expect(normalizeText('L\'ECG 12 dérivations')).toBe('l ecg 12 derivations');
  });

  it('should match keywords in student answer', () => {
    const result = matchKeywords(
      'Il faut réaliser un ECG 12 dérivations dans les 10 minutes et doser la troponine',
      ['ECG', 'troponine', 'aspirine', 'héparine']
    );

    expect(result.matched).toContain('ECG');
    expect(result.matched).toContain('troponine');
    expect(result.missed).toContain('aspirine');
    expect(result.missed).toContain('héparine');
    expect(result.score).toBe(50);
  });

  it('should handle empty answer', () => {
    const result = matchKeywords('', ['ECG', 'troponine']);
    expect(result.matched).toHaveLength(0);
    expect(result.missed).toHaveLength(2);
    expect(result.score).toBe(0);
  });

  it('should handle empty keywords', () => {
    const result = matchKeywords('Réponse quelconque', []);
    expect(result.score).toBe(0);
  });

  it('should handle accent-insensitive matching', () => {
    const result = matchKeywords(
      'hémorragie meningée',
      ['hémorragie', 'méningée']
    );
    expect(result.matched).toHaveLength(2);
    expect(result.score).toBe(100);
  });

  it('should handle multi-word keywords', () => {
    const result = matchKeywords(
      'Le patient présente une fibrillation auriculaire',
      ['fibrillation auriculaire', 'anticoagulation']
    );
    expect(result.matched).toContain('fibrillation auriculaire');
    expect(result.missed).toContain('anticoagulation');
    expect(result.score).toBe(50);
  });

  it('should score perfect answer', () => {
    const result = matchKeywords(
      'Stase veineuse, lésion endothéliale et hypercoagulabilité constituent la triade de Virchow',
      ['stase veineuse', 'lésion endothéliale', 'hypercoagulabilité']
    );
    expect(result.score).toBe(100);
  });
});
