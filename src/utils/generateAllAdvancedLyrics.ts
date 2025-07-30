import { supabase } from '@/integrations/supabase/client';
import { generateAdvancedLyrics } from './generateAdvancedLyrics';

interface GenerationResult {
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}

/**
 * Génère des paroles avancées pour tous les items EDN
 * Respecte le cahier des charges: structure complète, style Nekfeu, contenu médical dense
 */
export async function generateAllAdvancedLyrics(): Promise<GenerationResult> {
  console.log('🚀 Génération avancée des paroles médicales pour tous les items EDN...');
  
  const result: GenerationResult = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // Appeler la nouvelle edge function avec OpenAI pour générer des paroles médicales spécifiques
    const { data, error } = await supabase.functions.invoke('update-edn-unique-content', {
      body: { action: 'generate_advanced_lyrics' }
    });

    if (error) {
      console.error('❌ Erreur lors de l\'appel de la fonction:', error);
      throw error;
    }

    console.log('✅ Génération des paroles médicales avancées terminée:', data);
    
    // Retourner les résultats de la génération
    return data || {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: ['Aucun résultat retourné']
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération des paroles médicales:', error);
    result.errors.push(`Erreur générale: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return result;
  }
}

/**
 * Génère des paroles pour un item spécifique
 */
export async function generateLyricsForItem(itemCode: string): Promise<boolean> {
  console.log(`🎵 Génération paroles pour ${itemCode}`);
  
  try {
    // Récupérer l'item
    const { data: item, error: fetchError } = await supabase
      .from('edn_items_complete')
      .select('id, item_code, title')
      .eq('item_code', itemCode)
      .single();
      
    if (fetchError || !item) {
      throw new Error(`Item ${itemCode} non trouvé`);
    }
    
    // Générer les 3 versions
    const [lyricsA, lyricsB, lyricsAB] = await Promise.all([
      generateAdvancedLyrics(itemCode, 'A'),
      generateAdvancedLyrics(itemCode, 'B'),
      generateAdvancedLyrics(itemCode, 'AB')
    ]);
    
    // Sauvegarder
    const { error: updateError } = await supabase
      .from('edn_items_complete')
      .update({
        paroles_rang_a: lyricsA,
        paroles_rang_b: lyricsB, 
        paroles_rang_ab: lyricsAB,
        paroles_musicales: lyricsAB,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id);
      
    if (updateError) {
      throw new Error(`Erreur sauvegarde: ${updateError.message}`);
    }
    
    console.log(`✅ ${itemCode} - Paroles générées avec succès`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erreur ${itemCode}:`, error);
    return false;
  }
}

/**
 * Prévisualise les paroles pour un item sans les sauvegarder
 */
export async function previewLyricsForItem(itemCode: string, rang: 'A' | 'B' | 'AB' = 'AB'): Promise<string[]> {
  console.log(`👁️ Prévisualisation paroles ${itemCode} Rang ${rang}`);
  
  try {
    const lyrics = await generateAdvancedLyrics(itemCode, rang);
    console.log(`✅ Prévisualisation générée: ${lyrics.length} lignes`);
    return lyrics;
  } catch (error) {
    console.error(`❌ Erreur prévisualisation ${itemCode}:`, error);
    return [`Erreur: Impossible de générer la prévisualisation pour ${itemCode}`];
  }
}