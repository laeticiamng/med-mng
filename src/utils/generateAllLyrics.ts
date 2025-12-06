import { supabase } from '@/integrations/supabase/client'

export async function generateAllLyrics() {
  console.log('🚀 Lancement de la génération des paroles pour tous les items EDN...')
  
  try {
    const { data, error } = await supabase.functions.invoke('update-edn-unique-content', {
      body: { action: 'generate_lyrics' }
    })

    if (error) {
      console.error('❌ Erreur lors de l\'appel de la fonction:', error)
      throw error
    }

    console.log('✅ Génération des paroles terminée:', data)
    return data
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error)
    throw error
  }
}