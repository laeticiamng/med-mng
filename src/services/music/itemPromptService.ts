import { supabase } from '@/integrations/supabase/client';
import { toRateLimitError } from '@/utils/errors/rateLimit';

export type MusicMode = 'A' | 'B' | 'AB';

interface ItemWithCompetenceRow {
  item_id: string;
  item_code: string;
  title: string;
  slug: string | null;
  competences: Array<{
    rang?: string | null;
    idx?: number | null;
    label?: string | null;
  }> | null;
}

export interface ItemCompetenceSummary {
  rang: MusicMode;
  idx: number;
  label: string;
}

export interface ItemContext {
  itemId: string;
  itemCode: string;
  title: string;
  slug?: string | null;
  competences: ItemCompetenceSummary[];
}

export interface LyricsResult {
  lines: string[];
  source: 'openai' | 'fallback';
}

export interface StyleBrief {
  styleTag: string;
  mood: string;
  tempo: string;
  instrumentation: string[];
  prompt: string;
}

const MODE_LABEL: Record<MusicMode, string> = {
  A: 'Rang A (fondamentaux)',
  B: 'Rang B (expertise)',
  AB: 'Rang A + Rang B',
};

function normaliseMode(value: string | null): MusicMode | null {
  if (!value) return null;
  const upper = value.toUpperCase();
  if (upper === 'A' || upper === 'B') return upper;
  if (upper === 'AB' || upper === 'A+B') return 'AB';
  return null;
}

export async function loadItemContext(options: {
  itemId?: string;
  itemCode: string;
}): Promise<ItemContext> {
  const query = supabase
    .from('item_with_competences')
    .select(['item_id', 'item_code', 'title', 'slug', 'competences'].join(','))
    .eq('item_code', options.itemCode)
    .limit(1);

  if (options.itemId) {
    query.eq('item_id', options.itemId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Chargement de l'item impossible: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error(`Aucun item trouvé pour ${options.itemId ?? options.itemCode}`);
  }

  const [first] = data as ItemWithCompetenceRow[];
  const rawCompetences = Array.isArray(first.competences) ? first.competences : [];
  const competences = rawCompetences
    .map((competence, index) => {
      const label = typeof competence?.label === 'string' ? competence.label.trim() : '';
      if (!label) {
        return null;
      }
      const rang = normaliseMode(competence?.rang ?? null) ?? 'A';
      const idx = competence?.idx ?? index + 1;
      return {
        rang,
        idx,
        label,
      } satisfies ItemCompetenceSummary;
    })
    .filter((entry): entry is ItemCompetenceSummary => entry !== null);

  return {
    itemId: first.item_id,
    itemCode: first.item_code,
    title: first.title,
    slug: first.slug,
    competences,
  } satisfies ItemContext;
}

export function summariseCompetences(context: ItemContext, mode: MusicMode): string[] {
  const targetedModes = mode === 'AB' ? (['A', 'B'] as MusicMode[]) : [mode];
  const uniqueEntries = new Map<string, string>();

  context.competences.forEach((competence) => {
    if (!targetedModes.includes(competence.rang)) {
      return;
    }
    const summary = competence.label.replace(/\s+/g, ' ').trim();
    if (summary) {
      uniqueEntries.set(`${competence.rang}-${summary.toLowerCase()}`, summary);
    }
  });

  return Array.from(uniqueEntries.values()).slice(0, 24);
}

export function buildStyleBrief(styleInput: string | undefined, mode: MusicMode): StyleBrief {
  const baseStyle = styleInput?.trim();
  const normalizedStyle = baseStyle && baseStyle.length > 0 ? baseStyle : 'éducatif moderne';

  const mood =
    mode === 'A'
      ? 'ton positif, rassurant, accent sur la clarté'
      : mode === 'B'
        ? 'ambiance intense, clinique, déterminée'
        : 'progression immersive, mélange fondamental + expertise';

  const tempo =
    mode === 'A'
      ? 'tempo modéré 96-104 BPM'
      : mode === 'B'
        ? 'tempo énergique 120-130 BPM'
        : 'tempo dynamique 108-118 BPM';

  const instrumentation =
    mode === 'A'
      ? ['piano chaleureux', 'guitares légères', 'percussions subtiles']
      : mode === 'B'
        ? ['synthés cinématiques', 'cordes tendues', 'percussions marquées']
        : ['piano', 'pads aériens', 'percussions hybrides', 'basses modernes'];

  const styleTag = `${normalizedStyle}, ${mood}, ${tempo}, ${instrumentation.join(', ')}`;
  const prompt = `Style ${normalizedStyle}. ${mood}. ${tempo}. Instruments clés: ${instrumentation.join(
    ', ',
  )}. Mixage clair pour karaoké.`;

  return {
    styleTag,
    mood,
    tempo,
    instrumentation,
    prompt,
  } satisfies StyleBrief;
}

function buildFallbackLyrics(itemCode: string, summary: string[], mode: MusicMode): string[] {
  const focus = MODE_LABEL[mode];
  const core = summary.slice(0, 9);
  const chorusHook = `Refrain: ${itemCode} en mémoire, ${focus.toLowerCase()} alignés`;

  const verseChunks = [core.slice(0, 3), core.slice(3, 6), core.slice(6, 9)].filter((chunk) => chunk.length > 0);

  const lines: string[] = [];
  verseChunks.forEach((chunk, index) => {
    lines.push(`[Couplet ${index + 1}]`);
    chunk.forEach((line) => {
      lines.push(line);
    });
    lines.push(chorusHook);
  });

  lines.push('[Pont]');
  lines.push(`Pont clinique: relier la pratique aux repères ${focus.toLowerCase()}`);
  lines.push(chorusHook.replace('Refrain', 'Refrain final'));

  return lines;
}

export async function generateStructuredLyrics(itemCode: string, mode: MusicMode, summary: string[]): Promise<LyricsResult> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-lyrics-refined', {
      body: { itemCode, rang: mode },
    });

    if (error) {
      throw error;
    }

    const candidate = Array.isArray((data as { lines?: string[] } | null)?.lines)
      ? ((data as { lines?: string[] }).lines as string[])
      : [];

    if (candidate.length > 0) {
      return { lines: candidate, source: 'openai' } satisfies LyricsResult;
    }
  } catch (openAiError) {
    const rateLimitError = toRateLimitError(openAiError, 'Limite de génération des paroles atteinte.', 'music');
    if (rateLimitError) {
      throw rateLimitError;
    }

    console.warn('[itemPromptService] OpenAI lyrics generation fallback', openAiError);
  }

  return { lines: buildFallbackLyrics(itemCode, summary, mode), source: 'fallback' } satisfies LyricsResult;
}

export function createSunoPrompt(
  context: ItemContext,
  mode: MusicMode,
  summary: string[],
  brief: StyleBrief,
  lyrics: string[],
): string {
  const header = `Chanson éducative en français pour l'item ${context.itemCode} – ${MODE_LABEL[mode]}.`;
  const competenceBlock = summary.length
    ? `Compétences clés à intégrer de manière narrative:\n- ${summary.join('\n- ')}`
    : 'Intégrer les messages clés de l’item en restant précis et clinique.';
  const structure =
    'Structure obligatoire : [Couplet 1] / [Refrain] / [Couplet 2] / [Refrain] / [Couplet 3] / [Pont] / [Refrain final].';
  const lyricsPreview = lyrics.slice(0, 16).join('\n');

  return [
    header,
    competenceBlock,
    structure,
    `Instructions style : ${brief.prompt}`,
    'Exemple de lignes à respecter :',
    lyricsPreview,
  ]
    .filter(Boolean)
    .join('\n\n');
}

