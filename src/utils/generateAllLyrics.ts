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

export async function generateAllLyrics(options?: LyricsGenerationOptions): Promise<LyricsGenerationResult> {
  console.log('Lancement de la génération des paroles pour tous les items EDN...')

  try {
    const { _data, error } = await supabase.functions.invoke('update-edn-unique-content', {
      body: {
        action: 'generate_lyrics',
        options: options || {}
      }
    })

    if (error) {
      console.error('Erreur lors de l\'appel de la fonction:', error)
      throw error
    }

    console.log('Génération des paroles terminée:', _data)
    return _data as LyricsGenerationResult

  } catch (error) {
    console.error('Erreur lors de la génération:', error)
    throw error
  }
}

export async function generateLyricsForItem(itemCode: string, options?: Omit<LyricsGenerationOptions, 'itemCodes'>): Promise<LyricsGenerationResult> {
  console.log(`Génération des paroles pour l'item ${itemCode}...`)

  try {
    const { _data, error } = await supabase.functions.invoke('update-edn-unique-content', {
      body: {
        action: 'generate_lyrics',
        options: {
          ...options,
          itemCodes: [itemCode]
        }
      }
    })

    if (error) {
      console.error(`Erreur lors de la génération pour ${itemCode}:`, error)
      throw error
    }

    return _data as LyricsGenerationResult
  } catch (error) {
    console.error(`Erreur lors de la génération pour ${itemCode}:`, error)
    throw error
  }
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
    const { _data, _error } = await supabase
      .from('edn_items_immersive')
      .select('item_code, paroles_musicales')

    if (_error) throw _error

    const items = _data || []
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
    return {
      total: 0,
      withLyrics: 0,
      withoutLyrics: 0,
      pendingGeneration: 0
    }
  }
}

export async function batchGenerateLyrics(
  itemCodes: string[],
  batchSize: number = 5,
  onProgress?: (progress: { completed: number; total: number; current: string }) => void
): Promise<LyricsGenerationResult> {
  const results: LyricsGenerationResult = {
    success: true,
    generated: 0,
    failed: 0,
    skipped: 0,
    details: []
  }

  for (let i = 0; i < itemCodes.length; i += batchSize) {
    const batch = itemCodes.slice(i, i + batchSize)

    try {
      const batchResult = await generateAllLyrics({ itemCodes: batch })

      results.generated += batchResult.generated
      results.failed += batchResult.failed
      results.skipped += batchResult.skipped
      results.details.push(...batchResult.details)

      if (onProgress) {
        onProgress({
          completed: Math.min(i + batchSize, itemCodes.length),
          total: itemCodes.length,
          current: batch[batch.length - 1]
        })
      }
    } catch (error) {
      results.failed += batch.length
      results.success = false
      batch.forEach(code => {
        results.details.push({
          itemCode: code,
          status: 'failed',
          error: (error as Error).message
        })
      })
    }

    // Pause entre les batches
    if (i + batchSize < itemCodes.length) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  return results
}