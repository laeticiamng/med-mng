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
  
  // 1) Essai: fonction Edge backend (plus rapide et fiable)
  try {
    const { data, error } = await supabase.functions.invoke('generate-lyrics-bulk', {
      body: { rang: 'ALL' }
    });
    if (error) throw error;
    if (data) return data as GenerationResult;
    throw new Error('Réponse vide de generate-lyrics-bulk');
  } catch (err) {
    console.warn('⚠️ generate-lyrics-bulk indisponible, fallback client', err);
  }

  // 2) Fallback: boucle côté client item par item
  try {
    const { data: items, error } = await supabase
      .from('edn_items_complete')
      .select('item_code')
      .order('item_code');

    if (error || !items) {
      throw new Error(`Impossible de récupérer les items: ${error?.message || 'inconnu'}`);
    }

    for (const it of items) {
      result.processed += 1;
      try {
        const ok = await generateLyricsForItem(it.item_code);
        if (ok) result.successful += 1; else {
          result.failed += 1;
          result.errors.push(`Échec génération pour ${it.item_code}`);
        }
      } catch (e) {
        result.failed += 1;
        result.errors.push(`Erreur ${it.item_code}: ${e instanceof Error ? e.message : 'inconnue'}`);
      }
    }

    console.log('✅ Génération terminée pour tous les items (fallback):', result);
    return result;
    
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