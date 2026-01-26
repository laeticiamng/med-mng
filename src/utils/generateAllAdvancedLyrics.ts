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
  console.log('🚀 Génération avancée des paroles pour tous les items EDN...');
  
  const result: GenerationResult = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // 1. Récupérer tous les items EDN
    const { data: items, error } = await supabase
      .from('edn_items_immersive')
      .select('id, item_code, title')
      .order('item_code');

    if (error) {
      throw new Error(`Erreur récupération items: ${error.message}`);
    }
    
    if (!items || items.length === 0) {
      throw new Error('Aucun item EDN trouvé');
    }
    
    console.log(`📋 ${items.length} items EDN à traiter`);
    
    // 2. Traitement par batch pour éviter la surcharge
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    // 3. Traiter chaque batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`🔄 Traitement batch ${batchIndex + 1}/${batches.length} (${batch.length} items)`);
      
      // Traiter les items du batch en parallèle
      const batchPromises = batch.map(async (item) => {
        try {
          result.processed++;
          
          // Générer les 3 versions: A, B, AB
          const [lyricsA, lyricsB, lyricsAB] = await Promise.all([
            generateAdvancedLyrics(item.item_code, 'A'),
            generateAdvancedLyrics(item.item_code, 'B'), 
            generateAdvancedLyrics(item.item_code, 'AB')
          ]);
          
          // Mettre à jour l'item avec les nouvelles paroles
          const { error: updateError } = await supabase
            .from('edn_items_immersive')
            .update({
              paroles_rang_a: lyricsA,
              paroles_rang_b: lyricsB,
              paroles_rang_ab: lyricsAB,
              paroles_musicales: lyricsAB, // Version complète par défaut
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);

          if (updateError) {
            throw new Error(`Erreur mise à jour ${item.item_code}: ${updateError.message}`);
          }
          
          result.successful++;
          console.log(`✅ ${item.item_code} - Paroles générées et sauvées`);
          
        } catch (error) {
          result.failed++;
          const errorMsg = `❌ ${item.item_code}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      });
      
      // Attendre que le batch soit terminé
      await Promise.all(batchPromises);
      
      // Pause entre les batches pour éviter la surcharge
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('🎉 Génération terminée:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
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
      .from('edn_items_immersive')
      .select('id, item_code, title')
      .eq('item_code', itemCode)
      .maybeSingle();

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
      .from('edn_items_immersive')
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