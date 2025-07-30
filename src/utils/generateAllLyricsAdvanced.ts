import { supabase } from '@/integrations/supabase/client'

export async function generateAllLyricsAdvanced() {
  console.log('🚀 Lancement de la génération des paroles médicales avancées...')
  
  try {
    const { data, error } = await supabase.functions.invoke('update-edn-unique-content', {
      body: { action: 'generate_advanced_lyrics' }
    })

    if (error) {
      console.error('❌ Erreur lors de l\'appel de la fonction:', error)
      throw error
    }

    console.log('✅ Génération des paroles médicales avancées terminée:', data)
    return data
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error)
    throw error
  }
}

/**
 * Teste la génération pour un seul item (pour validation)
 */
export async function testLyricsGeneration(itemCode: string = 'IC-1') {
  console.log(`🧪 Test de génération pour ${itemCode}...`)
  
  try {
    // Récupérer l'item
    const { data: item, error } = await supabase
      .from('edn_items_immersive')
      .select('item_code, title, paroles_rang_a, paroles_rang_b, paroles_rang_ab')
      .eq('item_code', itemCode)
      .single()
      
    if (error) {
      throw error
    }
    
    console.log(`📋 Item trouvé: ${item.title}`)
    console.log(`📝 Paroles Rang A (${item.paroles_rang_a?.length || 0} lignes):`, item.paroles_rang_a?.slice(0, 3))
    console.log(`📝 Paroles Rang B (${item.paroles_rang_b?.length || 0} lignes):`, item.paroles_rang_b?.slice(0, 3))
    console.log(`📝 Paroles Rang AB (${item.paroles_rang_ab?.length || 0} lignes):`, item.paroles_rang_ab?.slice(0, 3))
    
    return item
    
  } catch (error) {
    console.error('❌ Erreur test:', error)
    throw error
  }
}