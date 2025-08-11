import { supabase } from '@/integrations/supabase/client'

export async function generateAllLyricsAdvanced() {
  console.log('🚀 Lancement de la génération des paroles médicales spécifiques...')
  
  try {
    // Utilise la nouvelle Edge Function serveur qui met à jour A/B/AB pour tous les items
    const { data, error } = await supabase.functions.invoke('generate-lyrics-bulk', {
      body: { rang: 'ALL' }
    })

    if (error) {
      console.error('❌ Erreur lors de l\'appel de la fonction:', error)
      throw error
    }

    console.log('✅ Génération des paroles médicales spécifiques terminée:', data)
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
      .from('edn_items_complete')
      .select('item_code, title, paroles_musicales, competences_oic_rang_a, competences_oic_rang_b')
      .eq('item_code', itemCode)
      .single()
      
    if (error) {
      throw error
    }
    
    console.log(`📋 Item trouvé: ${item.title}`)
    console.log(`📝 Paroles musicales (${item.paroles_musicales?.length || 0} lignes):`, item.paroles_musicales?.slice(0, 3))
    console.log(`📝 Compétences Rang A:`, item.competences_oic_rang_a ? 'Présent' : 'Manquant')
    console.log(`📝 Compétences Rang B:`, item.competences_oic_rang_b ? 'Présent' : 'Manquant')
    
    return item
    
  } catch (error) {
    console.error('❌ Erreur test:', error)
    throw error
  }
}