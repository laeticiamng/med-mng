import { supabase } from '@/integrations/supabase/client'

export async function generateAllSpecificLyrics() {
  console.log('🎵 DÉBUT: Génération des paroles spécifiques pour tous les items EDN...')
  
  try {
    // Appeler la fonction Edge qui va traiter tous les items
    const { data, error } = await supabase.functions.invoke('generate-all-lyrics', {})

    if (error) {
      console.error('❌ ERREUR lors de l\'appel de la fonction:', error)
      throw error
    }

    console.log('✅ SUCCÈS: Génération terminée:', data)
    return data
    
  } catch (error) {
    console.error('❌ ERREUR critique lors de la génération:', error)
    throw error
  }
}

export async function checkLyricsProgress() {
  console.log('📊 Vérification du progrès de génération des paroles...')
  
  try {
    const { data: stats, error } = await supabase
      .from('edn_items_complete')
      .select('item_code, title, paroles_musicales')
      .order('item_code')

    if (error) throw error

    const totalItems = stats?.length || 0
    const itemsWithLyrics = stats?.filter(item => 
      item.paroles_musicales && 
      Array.isArray(item.paroles_musicales) && 
      item.paroles_musicales.length > 0
    ).length || 0

    const progress = totalItems > 0 ? Math.round((itemsWithLyrics / totalItems) * 100) : 0

    console.log(`📈 PROGRÈS: ${itemsWithLyrics}/${totalItems} items (${progress}%)`)
    
    // Détails des premiers items sans paroles
    const itemsWithoutLyrics = stats?.filter(item => 
      !item.paroles_musicales || 
      !Array.isArray(item.paroles_musicales) || 
      item.paroles_musicales.length === 0
    ).slice(0, 5) || []

    if (itemsWithoutLyrics.length > 0) {
      console.log('🔍 Premiers items sans paroles:', itemsWithoutLyrics.map(item => item.item_code))
    }

    return {
      totalItems,
      itemsWithLyrics,
      progress,
      sampleWithoutLyrics: itemsWithoutLyrics.map(item => ({
        item_code: item.item_code,
        title: item.title
      }))
    }
    
  } catch (error) {
    console.error('❌ Erreur vérification progrès:', error)
    throw error
  }
}

export async function generateLyricsForSpecificItems(itemCodes: string[]) {
  console.log(`🎯 Génération de paroles pour ${itemCodes.length} items spécifiques:`, itemCodes)
  
  try {
    // Pour l'instant, on utilise la fonction globale
    // On pourrait créer une fonction spécialisée plus tard
    const result = await generateAllSpecificLyrics()
    return result
    
  } catch (error) {
    console.error('❌ Erreur génération items spécifiques:', error)
    throw error
  }
}