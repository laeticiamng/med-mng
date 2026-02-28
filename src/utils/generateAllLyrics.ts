import { supabase } from '@/integrations/supabase/client'

export interface LyricsGenerationResult {
  success: boolean
  generated: number
  failed: number
  skipped: number
  details: Array<{
    itemCode: string
    status: 'generated' | 'failed' | 'skipped'
    error?: string
  }>
}

export interface LyricsGenerationOptions {
  itemCodes?: string[]
  forceRegenerate?: boolean
  style?: 'pop' | 'jazz' | 'classical' | 'rock' | 'rap'
  language?: 'fr' | 'en'
  maxConcurrent?: number
}

/**
 * DÉSACTIVÉ — L'Edge Function update-edn-unique-content a été supprimée.
 * TODO: Migrer vers le routeur consolidé ai-content si nécessaire.
 */
export async function generateAllLyrics(_options?: LyricsGenerationOptions): Promise<LyricsGenerationResult> {
  console.warn('⚠️ generateAllLyrics est désactivé : update-edn-unique-content a été supprimée.')
  return { success: false, generated: 0, failed: 0, skipped: 0, details: [] }
}

export async function generateLyricsForItem(_itemCode: string, _options?: Omit<LyricsGenerationOptions, 'itemCodes'>): Promise<LyricsGenerationResult> {
  console.warn('⚠️ generateLyricsForItem est désactivé : update-edn-unique-content a été supprimée.')
  return { success: false, generated: 0, failed: 0, skipped: 0, details: [] }
}

export async function regenerateLyrics(itemCode: string): Promise<LyricsGenerationResult> {
  return generateLyricsForItem(itemCode, { forceRegenerate: true })
}

export async function getLyricsGenerationStatus(): Promise<{
  total: number
  withLyrics: number
  withoutLyrics: number
  pendingGeneration: number
}> {
  try {
    const { data, error } = await supabase
      .from('edn_items_immersive')
      .select('item_code, paroles_musicales')

    if (error) throw error

    const items = data || []
    const withLyrics = items.filter((i: any) => Boolean(i.paroles_musicales)).length
    const withoutLyrics = items.filter((i: any) => !i.paroles_musicales).length

    return {
      total: items.length,
      withLyrics,
      withoutLyrics,
      pendingGeneration: withoutLyrics
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error)
    return { total: 0, withLyrics: 0, withoutLyrics: 0, pendingGeneration: 0 }
  }
}

export async function batchGenerateLyrics(
  _itemCodes: string[],
  _batchSize: number = 5,
  _onProgress?: (progress: { completed: number; total: number; current: string }) => void
): Promise<LyricsGenerationResult> {
  console.warn('⚠️ batchGenerateLyrics est désactivé : update-edn-unique-content a été supprimée.')
  return { success: false, generated: 0, failed: 0, skipped: 0, details: [] }
}
