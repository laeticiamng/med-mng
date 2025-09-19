import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';

vi.mock('@/integrations/supabase/client', () => {
  const invoke = vi.fn();
  return {
    supabase: {
      functions: { invoke },
    },
  };
});

import { supabase } from '@/integrations/supabase/client';
import {
  summariseCompetences,
  buildStyleBrief,
  generateStructuredLyrics,
  type ItemContext,
} from '@/services/music/itemPromptService';

const invokeMock = supabase.functions.invoke as unknown as Mock;

describe('itemPromptService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('summarises competences for specific modes without duplicates', () => {
    const context: ItemContext = {
      itemId: 'item-1',
      itemCode: 'IC-001',
      title: 'Item Test',
      slug: 'item-test',
      competences: [
        {
          id: 'comp-a1',
          rang: 'A',
          rubrique: 'Physiologie',
          title: 'Bases',
          description: 'Approche clinique structurée',
        },
        {
          id: 'comp-a2',
          rang: 'A',
          rubrique: 'Physiologie',
          title: 'Bases',
          description: 'Approche clinique structurée',
        },
        {
          id: 'comp-b1',
          rang: 'B',
          rubrique: 'Urgence',
          title: 'Protocoles avancés',
          description: 'Gestion des complications sévères',
        },
      ],
    };

    const summaryA = summariseCompetences(context, 'A');
    expect(summaryA).toHaveLength(1);
    expect(summaryA[0]).toContain('Physiologie');
    expect(summaryA[0]).toContain('Bases');

    const summaryAB = summariseCompetences(context, 'AB');
    expect(summaryAB).toHaveLength(2);
    expect(summaryAB[1]).toContain('Urgence');
  });

  it('builds style briefs with mode-specific defaults', () => {
    const briefB = buildStyleBrief(undefined, 'B');
    expect(briefB.styleTag).toContain('ambiance intense');
    expect(briefB.prompt).toContain('tempo énergique 120-130 BPM');
    expect(briefB.instrumentation).toContain('synthés cinématiques');

    const briefA = buildStyleBrief('jazz clinique', 'A');
    expect(briefA.styleTag.startsWith('jazz clinique')).toBe(true);
    expect(briefA.mood).toContain('positif');
    expect(briefA.instrumentation).toContain('piano chaleureux');
  });

  it('returns OpenAI lyrics when the edge function responds with lines', async () => {
    invokeMock.mockResolvedValue({ data: { lines: ['[Couplet 1]', 'Test'] }, error: null });

    const result = await generateStructuredLyrics('IC-123', 'A', ['Résumé 1']);

    expect(invokeMock).toHaveBeenCalledWith('generate-lyrics-refined', {
      body: { itemCode: 'IC-123', rang: 'A' },
    });
    expect(result.source).toBe('openai');
    expect(result.lines).toEqual(['[Couplet 1]', 'Test']);
  });

  it('falls back to deterministic lyrics when OpenAI fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    invokeMock.mockRejectedValue(new Error('network error'));

    const result = await generateStructuredLyrics('IC-456', 'B', ['Urgence critique']);

    expect(result.source).toBe('fallback');
    expect(result.lines[0]).toBe('[Couplet 1]');
    expect(result.lines.some((line) => line.toLowerCase().includes('urgence'))).toBe(true);
    warnSpy.mockRestore();
  });

  it('falls back when the edge function returns no lines', async () => {
    invokeMock.mockResolvedValue({ data: { lines: [] }, error: null });

    const result = await generateStructuredLyrics('IC-789', 'AB', ['Synthèse']);

    expect(result.source).toBe('fallback');
    expect(result.lines).toContain('[Pont]');
  });
});
