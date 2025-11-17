/**
 * Generate comprehensive medical educational lyrics in Nekfeu style
 * This module generates lyrics with assonances for medical learning
 */

/**
 * Generate comprehensive lyrics for a specific rank (A or B)
 * @param itemCode - EDN item code (e.g., "IC-001")
 * @param rang - Rank level ('A' or 'B')
 * @returns Promise resolving to array of lyric lines
 */
export async function generateComprehensiveLyrics(
  itemCode: string,
  rang: 'A' | 'B'
): Promise<string[]> {
  try {
    // In production, this would call an API endpoint
    const response = await fetch('/api/lyrics/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemCode,
        rang,
        style: 'comprehensive',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate lyrics: ${response.statusText}`);
    }

    const data = await response.json();
    return data.lyrics || [];
  } catch (error) {
    console.error('Error generating comprehensive lyrics:', error);

    // Fallback: Return placeholder lyrics
    return [
      `[${itemCode} - Rang ${rang}]`,
      'Lyrics generation in progress...',
      'This feature requires backend API integration.',
      '',
      'Example structure:',
      '- Medical concept introduction',
      '- Key terms with assonances',
      '- Clinical applications',
      '- Memory aids (Nekfeu style)',
    ];
  }
}

/**
 * Generate mixed lyrics combining both ranks A and B
 * @param itemCode - EDN item code
 * @returns Promise resolving to array of lyric lines
 */
export async function generateMixedLyrics(itemCode: string): Promise<string[]> {
  try {
    // Generate both ranks
    const [rangALyrics, rangBLyrics] = await Promise.all([
      generateComprehensiveLyrics(itemCode, 'A'),
      generateComprehensiveLyrics(itemCode, 'B'),
    ]);

    // Combine and interleave the lyrics
    const mixedLyrics: string[] = [
      `[${itemCode} - Rangs A + B Mixed]`,
      '',
      '=== Rang A ===',
      ...rangALyrics,
      '',
      '=== Rang B ===',
      ...rangBLyrics,
      '',
      '=== Mixed Section ===',
      'Combined concepts for comprehensive understanding',
    ];

    return mixedLyrics;
  } catch (error) {
    console.error('Error generating mixed lyrics:', error);

    return [
      `[${itemCode} - Mixed]`,
      'Mixed lyrics generation in progress...',
      'This feature combines Rang A and Rang B content.',
    ];
  }
}
