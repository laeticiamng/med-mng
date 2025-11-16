import { supabase } from '@/integrations/supabase/client';
import { generateAdvancedLyrics } from './generateAdvancedLyrics';

/**
 * Script principal de génération complète des paroles EDN
 *
 * Ce script génère les paroles pour TOUS les 367 items EDN
 * dans les 3 rangs (A, B, AB) = 1,101 générations totales
 */

interface GenerationProgress {
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  currentItem: string | null;
  currentRang: string | null;
  errors: Array<{ item: string; rang: string; error: string }>;
  startTime: Date;
  estimatedTimeRemaining: number | null;
}

let progressCallback: ((progress: GenerationProgress) => void) | null = null;

export function setProgressCallback(callback: (progress: GenerationProgress) => void) {
  progressCallback = callback;
}

export async function runCompleteGeneration(
  options: {
    batchSize?: number;
    pauseBetweenBatches?: number;
    startFromItem?: string;
    onProgress?: (progress: GenerationProgress) => void;
  } = {}
): Promise<GenerationProgress> {
  const {
    batchSize = 10,
    pauseBetweenBatches = 1000,
    startFromItem = null,
    onProgress
  } = options;

  if (onProgress) {
    progressCallback = onProgress;
  }

  console.log('🚀 DÉMARRAGE GÉNÉRATION COMPLÈTE DES PAROLES EDN');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Configuration:`);
  console.log(`- Batch size: ${batchSize} items`);
  console.log(`- Pause entre batches: ${pauseBetweenBatches}ms`);
  if (startFromItem) {
    console.log(`- Démarrage depuis: ${startFromItem}`);
  }
  console.log('═══════════════════════════════════════════════════\n');

  const progress: GenerationProgress = {
    totalItems: 0,
    processedItems: 0,
    successfulItems: 0,
    failedItems: 0,
    currentItem: null,
    currentRang: null,
    errors: [],
    startTime: new Date(),
    estimatedTimeRemaining: null
  };

  try {
    // 1. Vérifier que la migration est appliquée
    console.log('🔍 Vérification de la migration...');
    const migrationCheck = await checkMigrationApplied();

    if (!migrationCheck.applied) {
      throw new Error(
        '❌ MIGRATION NON APPLIQUÉE!\n\n' +
        'La migration 20251116220000 doit être appliquée avant la génération.\n' +
        'Accédez à /edn-test > Migration Base de Données pour l\'appliquer.\n\n' +
        `Colonnes manquantes: ${migrationCheck.missingColumns.join(', ')}`
      );
    }

    console.log('✅ Migration appliquée - Colonnes disponibles:\n');
    console.log('   - paroles_rang_a ✓');
    console.log('   - paroles_rang_b ✓');
    console.log('   - paroles_rang_ab ✓\n');

    // 2. Récupérer tous les items EDN
    console.log('📋 Récupération de la liste des items EDN...');

    let query = supabase
      .from('edn_items_complete')
      .select('id, item_code, title, specialite')
      .order('item_code');

    if (startFromItem) {
      query = query.gte('item_code', startFromItem);
    }

    const { data: items, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Erreur récupération items: ${fetchError.message}`);
    }

    if (!items || items.length === 0) {
      throw new Error('Aucun item EDN trouvé dans edn_items_complete');
    }

    progress.totalItems = items.length;
    console.log(`✅ ${items.length} items EDN récupérés\n`);

    // 3. Créer les batches
    const batches: typeof items[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    console.log(`📦 ${batches.length} batches à traiter\n`);
    console.log('═══════════════════════════════════════════════════');
    console.log('🎵 DÉBUT DE LA GÉNÉRATION');
    console.log('═══════════════════════════════════════════════════\n');

    // 4. Traiter chaque batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchNumber = batchIndex + 1;

      console.log(`\n┌─────────────────────────────────────────────────┐`);
      console.log(`│ BATCH ${batchNumber}/${batches.length} (${batch.length} items)`.padEnd(50) + '│');
      console.log(`└─────────────────────────────────────────────────┘\n`);

      // Traiter les items du batch en parallèle
      const batchPromises = batch.map(async (item) => {
        try {
          progress.currentItem = item.item_code;

          console.log(`\n🎵 ${item.item_code} - ${item.title}`);
          console.log(`   Spécialité: ${item.specialite || 'Non spécifiée'}`);

          // Générer les 3 versions: A, B, AB
          const results = await Promise.allSettled([
            generateLyricsForRang(item, 'A', progress),
            generateLyricsForRang(item, 'B', progress),
            generateLyricsForRang(item, 'AB', progress)
          ]);

          // Vérifier les résultats
          const allSuccess = results.every(r => r.status === 'fulfilled');

          if (allSuccess) {
            // Sauvegarder dans la base de données
            const lyricsA = (results[0] as PromiseFulfilledResult<string[]>).value;
            const lyricsB = (results[1] as PromiseFulfilledResult<string[]>).value;
            const lyricsAB = (results[2] as PromiseFulfilledResult<string[]>).value;

            const { error: updateError } = await supabase
              .from('edn_items_complete')
              .update({
                paroles_rang_a: lyricsA,
                paroles_rang_b: lyricsB,
                paroles_rang_ab: lyricsAB,
                paroles_musicales: lyricsAB, // Version complète par défaut
                updated_at: new Date().toISOString()
              })
              .eq('id', item.id);

            if (updateError) {
              throw new Error(`Erreur sauvegarde: ${updateError.message}`);
            }

            progress.successfulItems++;
            console.log(`   ✅ ${item.item_code} - Paroles générées et sauvegardées`);
            console.log(`      Rang A: ${lyricsA.length} lignes`);
            console.log(`      Rang B: ${lyricsB.length} lignes`);
            console.log(`      Rang AB: ${lyricsAB.length} lignes`);
          } else {
            // Au moins une génération a échoué
            progress.failedItems++;
            results.forEach((result, index) => {
              if (result.status === 'rejected') {
                const rang = ['A', 'B', 'AB'][index];
                progress.errors.push({
                  item: item.item_code,
                  rang: rang,
                  error: result.reason?.message || 'Erreur inconnue'
                });
              }
            });
            console.log(`   ❌ ${item.item_code} - Échec de génération`);
          }

        } catch (error) {
          progress.failedItems++;
          const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
          progress.errors.push({
            item: item.item_code,
            rang: 'ALL',
            error: errorMsg
          });
          console.error(`   ❌ ${item.item_code} - Erreur:`, errorMsg);
        } finally {
          progress.processedItems++;

          // Calculer le temps restant
          const elapsed = Date.now() - progress.startTime.getTime();
          const avgTimePerItem = elapsed / progress.processedItems;
          const remainingItems = progress.totalItems - progress.processedItems;
          progress.estimatedTimeRemaining = avgTimePerItem * remainingItems;

          // Callback de progression
          if (progressCallback) {
            progressCallback({ ...progress });
          }
        }
      });

      // Attendre que le batch soit terminé
      await Promise.all(batchPromises);

      // Afficher les statistiques du batch
      console.log(`\n┌─────────────────────────────────────────────────┐`);
      console.log(`│ FIN BATCH ${batchNumber}/${batches.length}`.padEnd(50) + '│');
      console.log(`├─────────────────────────────────────────────────┤`);
      console.log(`│ Items traités: ${progress.processedItems}/${progress.totalItems}`.padEnd(50) + '│');
      console.log(`│ Succès: ${progress.successfulItems}`.padEnd(50) + '│');
      console.log(`│ Échecs: ${progress.failedItems}`.padEnd(50) + '│');
      if (progress.estimatedTimeRemaining) {
        const minutes = Math.ceil(progress.estimatedTimeRemaining / 60000);
        console.log(`│ Temps restant estimé: ~${minutes} min`.padEnd(50) + '│');
      }
      console.log(`└─────────────────────────────────────────────────┘\n`);

      // Pause entre les batches (sauf pour le dernier)
      if (batchIndex < batches.length - 1) {
        console.log(`⏸️  Pause ${pauseBetweenBatches}ms...\n`);
        await new Promise(resolve => setTimeout(resolve, pauseBetweenBatches));
      }
    }

    // 5. Résumé final
    const elapsed = Date.now() - progress.startTime.getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    console.log('\n═══════════════════════════════════════════════════');
    console.log('🎉 GÉNÉRATION TERMINÉE');
    console.log('═══════════════════════════════════════════════════');
    console.log(`\n📊 STATISTIQUES FINALES:`);
    console.log(`   Total items: ${progress.totalItems}`);
    console.log(`   Traités: ${progress.processedItems}`);
    console.log(`   Succès: ${progress.successfulItems}`);
    console.log(`   Échecs: ${progress.failedItems}`);
    console.log(`   Taux de succès: ${((progress.successfulItems / progress.totalItems) * 100).toFixed(1)}%`);
    console.log(`   Durée totale: ${minutes}min ${seconds}s`);

    if (progress.errors.length > 0) {
      console.log(`\n❌ ERREURS (${progress.errors.length}):`);
      progress.errors.slice(0, 10).forEach(err => {
        console.log(`   - ${err.item} (Rang ${err.rang}): ${err.error}`);
      });
      if (progress.errors.length > 10) {
        console.log(`   ... et ${progress.errors.length - 10} autres erreurs`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════\n');

    return progress;

  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error);
    throw error;
  }
}

async function generateLyricsForRang(
  item: { id: string; item_code: string; title: string },
  rang: 'A' | 'B' | 'AB',
  progress: GenerationProgress
): Promise<string[]> {
  progress.currentRang = rang;

  console.log(`   Génération Rang ${rang}...`);
  const lyrics = await generateAdvancedLyrics(item.item_code, rang);

  if (!lyrics || lyrics.length === 0) {
    throw new Error(`Paroles vides pour Rang ${rang}`);
  }

  return lyrics;
}

async function checkMigrationApplied(): Promise<{
  applied: boolean;
  missingColumns: string[];
}> {
  try {
    const { data, error } = await supabase
      .from('edn_items_complete')
      .select('paroles_rang_a, paroles_rang_b, paroles_rang_ab')
      .limit(1);

    if (error) {
      // Analyser l'erreur pour déterminer quelles colonnes manquent
      const errorMsg = error.message.toLowerCase();
      const missingColumns: string[] = [];

      if (errorMsg.includes('paroles_rang_a')) missingColumns.push('paroles_rang_a');
      if (errorMsg.includes('paroles_rang_b')) missingColumns.push('paroles_rang_b');
      if (errorMsg.includes('paroles_rang_ab')) missingColumns.push('paroles_rang_ab');

      return {
        applied: false,
        missingColumns: missingColumns.length > 0 ? missingColumns : ['colonnes paroles_rang_*']
      };
    }

    return {
      applied: true,
      missingColumns: []
    };

  } catch (error) {
    return {
      applied: false,
      missingColumns: ['Unknown - vérification échouée']
    };
  }
}

/**
 * Fonction rapide pour générer les paroles d'un seul item
 */
export async function generateSingleItem(itemCode: string): Promise<void> {
  console.log(`🎵 Génération pour ${itemCode}...`);

  const { data: item, error: fetchError } = await supabase
    .from('edn_items_complete')
    .select('id, item_code, title')
    .eq('item_code', itemCode)
    .single();

  if (fetchError || !item) {
    throw new Error(`Item ${itemCode} non trouvé`);
  }

  const [lyricsA, lyricsB, lyricsAB] = await Promise.all([
    generateAdvancedLyrics(itemCode, 'A'),
    generateAdvancedLyrics(itemCode, 'B'),
    generateAdvancedLyrics(itemCode, 'AB')
  ]);

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
}

/**
 * Fonction pour reprendre la génération à partir d'un item spécifique
 */
export async function resumeGeneration(fromItemCode: string): Promise<GenerationProgress> {
  console.log(`🔄 Reprise de la génération depuis ${fromItemCode}...`);
  return runCompleteGeneration({ startFromItem: fromItemCode });
}
