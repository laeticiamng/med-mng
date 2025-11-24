import logger from '@/lib/logger';

/**
 * Bulk generation of Nekfeu-style medical educational lyrics
 * Generates lyrics for all EDN items or previews specific items
 */

/**
 * Result of bulk lyrics generation
 */
export interface GenerationResult {
  successful: number;
  processed: number;
  failed: number;
  errors: Array<{ itemCode: string; error: string }>;
}

/**
 * Generate advanced lyrics for all EDN items
 * @returns Promise resolving to generation statistics
 */
export async function generateAllAdvancedLyrics(): Promise<GenerationResult> {
  const result: GenerationResult = {
    successful: 0,
    processed: 0,
    failed: 0,
    errors: [],
  };

  try {
    // In production, this would call a backend API endpoint
    const response = await fetch('/api/lyrics/generate-all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        style: 'advanced',
        includeAssonances: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate all lyrics: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      successful: data.successful || 0,
      processed: data.processed || 0,
      failed: data.failed || 0,
      errors: data.errors || [],
    };
  } catch (error) {
    logger.error('Error generating all advanced lyrics:', error);

    // Simulate processing for development
    return {
      successful: 0,
      processed: 0,
      failed: 0,
      errors: [{
        itemCode: 'SYSTEM',
        error: 'Backend API not available. This feature requires server-side processing.',
      }],
    };
  }
}

/**
 * Preview lyrics for a specific item without saving
 * @param itemCode - EDN item code
 * @param rang - Rank level ('A', 'B', or 'AB' for both)
 * @returns Promise resolving to array of lyric lines
 */
export async function previewLyricsForItem(
  itemCode: string,
  rang: 'A' | 'B' | 'AB'
): Promise<string[]> {
  try {
    const response = await fetch('/api/lyrics/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemCode,
        rang,
        style: 'advanced',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to preview lyrics: ${response.statusText}`);
    }

    const data = await response.json();
    return data.lyrics || [];
  } catch (error) {
    logger.error('Error previewing lyrics:', error);

    // Fallback: Return example structure
    const rangLabel = rang === 'AB' ? 'Rangs A + B' : `Rang ${rang}`;
    return [
      `[${itemCode} - ${rangLabel} Preview]`,
      '',
      '🎵 Advanced Nekfeu-Style Medical Lyrics 🎵',
      '',
      '--- Verse 1: Clinical Presentation ---',
      '[Medical concept introduction with assonances]',
      '[Key symptoms and signs in rhythmic pattern]',
      '',
      '--- Chorus: Key Points ---',
      '[Memorable hook with essential information]',
      '[Assonances for better retention]',
      '',
      '--- Verse 2: Diagnosis & Management ---',
      '[Diagnostic criteria in lyrical form]',
      '[Treatment options with memory aids]',
      '',
      '--- Bridge: Clinical Pearls ---',
      '[Important notes and exceptions]',
      '[Nekfeu-style wordplay for memorization]',
      '',
      '--- Outro: Review ---',
      '[Summary of key concepts]',
      '[Final assonances for reinforcement]',
      '',
      '💡 This is a preview. Full generation requires backend processing.',
    ];
  }
}
