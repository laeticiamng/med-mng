import { supabase } from '../lib/supabase';

/**
 * Script de complétion automatique des compétences OIC manquantes
 *
 * Ce script complète les compétences OIC pour tous les items EDN afin de
 * permettre la génération de paroles de qualité.
 */

interface OICCompletionResult {
  total_items: number;
  items_processed: number;
  items_enriched_from_uness: number;
  items_generated_minimal: number;
  items_failed: number;
  errors: Array<{ item_code: string; error: string }>;
}

/**
 * Complète automatiquement toutes les compétences OIC manquantes
 */
export async function completeAllOICCompetencies(): Promise<OICCompletionResult> {
  console.log('🚀 COMPLÉTION AUTOMATIQUE DES COMPÉTENCES OIC');
  console.log('═══════════════════════════════════════════════════\n');

  const result: OICCompletionResult = {
    total_items: 0,
    items_processed: 0,
    items_enriched_from_uness: 0,
    items_generated_minimal: 0,
    items_failed: 0,
    errors: []
  };

  try {
    // 1. Récupérer tous les items EDN
    console.log('📋 Récupération des items EDN...');
    const { data: items, error: itemsError } = await supabase
      .from('edn_items_complete')
      .select('*')
      .order('item_code');

    if (itemsError) throw itemsError;
    if (!items || items.length === 0) {
      throw new Error('Aucun item EDN trouvé');
    }

    result.total_items = items.length;
    console.log(`✅ ${items.length} items EDN trouvés\n`);

    // 2. Récupérer les compétences OIC existantes
    console.log('📚 Récupération des compétences OIC existantes...');
    const { data: existingOIC, error: oicError } = await supabase
      .from('oic_competences')
      .select('item_parent, rang');

    if (oicError) console.warn('⚠️ Erreur récupération OIC:', oicError);

    // Grouper par item et rang
    const existingByItem = new Map<string, { hasA: boolean, hasB: boolean }>();
    if (existingOIC) {
      existingOIC.forEach(comp => {
        const itemNum = comp.item_parent;
        if (!existingByItem.has(itemNum)) {
          existingByItem.set(itemNum, { hasA: false, hasB: false });
        }
        const status = existingByItem.get(itemNum)!;
        if (comp.rang === 'A') status.hasA = true;
        if (comp.rang === 'B') status.hasB = true;
      });
    }

    console.log(`✅ Compétences OIC existantes analysées\n`);

    // 3. Traiter chaque item
    console.log('🔄 Traitement des items...\n');

    for (const item of items) {
      const itemNum = item.item_code.replace('IC-', '').padStart(3, '0');
      const existing = existingByItem.get(itemNum) || { hasA: false, hasB: false };

      console.log(`\n${item.item_code} - ${item.title}`);

      let needsA = !existing.hasA;
      let needsB = !existing.hasB;

      if (!needsA && !needsB) {
        console.log('  ✅ Compétences OIC déjà complètes');
        continue;
      }

      result.items_processed++;

      // Essayer d'enrichir depuis UNESS
      console.log('  🔍 Tentative enrichissement depuis UNESS...');

      try {
        const enrichResult = await enrichFromUNESS(item.item_code, itemNum, needsA, needsB);

        if (enrichResult.success) {
          console.log(`  ✅ Enrichi depuis UNESS (${enrichResult.count} compétences)`);
          result.items_enriched_from_uness++;
          continue;
        }
      } catch (error) {
        console.log('  ⚠️ Enrichissement UNESS échoué, génération minimale...');
      }

      // Si UNESS échoue, générer des compétences minimales
      console.log('  🔨 Génération de compétences minimales...');

      try {
        await generateMinimalOIC(item, itemNum, needsA, needsB);
        console.log('  ✅ Compétences minimales générées');
        result.items_generated_minimal++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error(`  ❌ Échec génération minimale: ${errorMsg}`);
        result.items_failed++;
        result.errors.push({
          item_code: item.item_code,
          error: errorMsg
        });
      }
    }

    // 4. Résumé
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🎉 COMPLÉTION TERMINÉE');
    console.log('═══════════════════════════════════════════════════\n');

    console.log(`Total items: ${result.total_items}`);
    console.log(`Items traités: ${result.items_processed}`);
    console.log(`Enrichis depuis UNESS: ${result.items_enriched_from_uness}`);
    console.log(`Compétences minimales générées: ${result.items_generated_minimal}`);
    console.log(`Échecs: ${result.items_failed}`);

    if (result.errors.length > 0) {
      console.log(`\n❌ ERREURS (${result.errors.length}):`);
      result.errors.forEach(err => {
        console.log(`  - ${err.item_code}: ${err.error}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════\n');

    return result;

  } catch (error) {
    console.error('❌ Erreur critique:', error);
    throw error;
  }
}

/**
 * Essaie d'enrichir depuis UNESS via la fonction SQL existante
 */
async function enrichFromUNESS(
  itemCode: string,
  itemNum: string,
  needsA: boolean,
  needsB: boolean
): Promise<{ success: boolean; count: number }> {

  try {
    // Appeler la fonction SQL d'enrichissement UNESS si elle existe
    const { data, error } = await supabase.rpc('enrich_edn_item_with_oic', {
      p_item_code: itemCode
    });

    if (error) throw error;

    // Vérifier si des compétences ont été ajoutées
    const { data: newOIC, error: checkError } = await supabase
      .from('oic_competences')
      .select('rang')
      .eq('item_parent', itemNum);

    if (checkError) throw checkError;

    if (newOIC && newOIC.length > 0) {
      const hasA = newOIC.some(c => c.rang === 'A');
      const hasB = newOIC.some(c => c.rang === 'B');

      if ((needsA && hasA) || (needsB && hasB)) {
        return { success: true, count: newOIC.length };
      }
    }

    return { success: false, count: 0 };

  } catch (error) {
    return { success: false, count: 0 };
  }
}

/**
 * Génère des compétences OIC minimales pour permettre la génération de paroles
 */
async function generateMinimalOIC(
  item: any,
  itemNum: string,
  needsA: boolean,
  needsB: boolean
): Promise<void> {

  const competencesToInsert: any[] = [];

  // Générer compétences Rang A minimales
  if (needsA) {
    competencesToInsert.push(
      {
        objectif_id: `OBJ-${itemNum}-A-001`,
        intitule: `Connaître les bases de ${item.title}`,
        description: `Connaître les définitions et concepts fondamentaux concernant ${item.title}. Identifier les signes cliniques principaux et établir le diagnostic différentiel.`,
        rang: 'A',
        rubrique: 'Connaissances',
        item_parent: itemNum,
        ordre: 1,
        source: 'generated_minimal'
      },
      {
        objectif_id: `OBJ-${itemNum}-A-002`,
        intitule: `Diagnostiquer ${item.title}`,
        description: `Savoir poser le diagnostic de ${item.title} à partir de l'anamnèse et de l'examen clinique. Identifier les examens complémentaires nécessaires.`,
        rang: 'A',
        rubrique: 'Diagnostic',
        item_parent: itemNum,
        ordre: 2,
        source: 'generated_minimal'
      },
      {
        objectif_id: `OBJ-${itemNum}-A-003`,
        intitule: `Prise en charge de ${item.title}`,
        description: `Connaître les principes thérapeutiques de ${item.title}. Prescrire le traitement adapté et assurer le suivi initial.`,
        rang: 'A',
        rubrique: 'Prise en charge',
        item_parent: itemNum,
        ordre: 3,
        source: 'generated_minimal'
      }
    );
  }

  // Générer compétences Rang B minimales
  if (needsB) {
    competencesToInsert.push(
      {
        objectif_id: `OBJ-${itemNum}-B-001`,
        intitule: `Expertise avancée de ${item.title}`,
        description: `Maîtriser les formes complexes et atypiques de ${item.title}. Analyser les cas difficiles et les situations de comorbidités.`,
        rang: 'B',
        rubrique: 'Expertise',
        item_parent: itemNum,
        ordre: 1,
        source: 'generated_minimal'
      },
      {
        objectif_id: `OBJ-${itemNum}-B-002`,
        intitule: `Diagnostic différentiel approfondi`,
        description: `Maîtriser le diagnostic différentiel complexe de ${item.title}. Interpréter les examens complémentaires spécialisés.`,
        rang: 'B',
        rubrique: 'Diagnostic avancé',
        item_parent: itemNum,
        ordre: 2,
        source: 'generated_minimal'
      },
      {
        objectif_id: `OBJ-${itemNum}-B-003`,
        intitule: `Prise en charge complexe`,
        description: `Gérer les situations thérapeutiques complexes de ${item.title}. Adapter le traitement aux cas particuliers et gérer les complications.`,
        rang: 'B',
        rubrique: 'Thérapeutique avancée',
        item_parent: itemNum,
        ordre: 3,
        source: 'generated_minimal'
      }
    );
  }

  // Insérer dans la base de données
  if (competencesToInsert.length > 0) {
    const { error } = await supabase
      .from('oic_competences')
      .insert(competencesToInsert);

    if (error) throw error;
  }
}

/**
 * Complète les compétences pour un item spécifique
 */
export async function completeOICForItem(itemCode: string): Promise<boolean> {
  console.log(`🔧 Complétion OIC pour ${itemCode}...`);

  try {
    const itemNum = itemCode.replace('IC-', '').padStart(3, '0');

    // Récupérer l'item
    const { data: item, error: itemError } = await supabase
      .from('edn_items_complete')
      .select('*')
      .eq('item_code', itemCode)
      .single();

    if (itemError || !item) throw new Error(`Item ${itemCode} non trouvé`);

    // Vérifier les compétences existantes
    const { data: existing, error: oicError } = await supabase
      .from('oic_competences')
      .select('rang')
      .eq('item_parent', itemNum);

    if (oicError) throw oicError;

    const hasA = existing?.some(c => c.rang === 'A') || false;
    const hasB = existing?.some(c => c.rang === 'B') || false;

    if (hasA && hasB) {
      console.log(`✅ ${itemCode} - Compétences OIC déjà complètes`);
      return true;
    }

    // Essayer UNESS
    const enrichResult = await enrichFromUNESS(itemCode, itemNum, !hasA, !hasB);

    if (enrichResult.success) {
      console.log(`✅ ${itemCode} - Enrichi depuis UNESS`);
      return true;
    }

    // Génération minimale
    await generateMinimalOIC(item, itemNum, !hasA, !hasB);
    console.log(`✅ ${itemCode} - Compétences minimales générées`);

    return true;

  } catch (error) {
    console.error(`❌ ${itemCode} - Erreur:`, error);
    return false;
  }
}

/**
 * Vérifie les items sans compétences OIC
 */
export async function getItemsWithoutOIC(): Promise<{
  withoutA: string[];
  withoutB: string[];
  withoutBoth: string[];
}> {

  const { data: items } = await supabase
    .from('edn_items_complete')
    .select('item_code')
    .order('item_code');

  const { data: oic } = await supabase
    .from('oic_competences')
    .select('item_parent, rang');

  const oicByItem = new Map<string, { hasA: boolean, hasB: boolean }>();

  if (oic) {
    oic.forEach(comp => {
      if (!oicByItem.has(comp.item_parent)) {
        oicByItem.set(comp.item_parent, { hasA: false, hasB: false });
      }
      const status = oicByItem.get(comp.item_parent)!;
      if (comp.rang === 'A') status.hasA = true;
      if (comp.rang === 'B') status.hasB = true;
    });
  }

  const withoutA: string[] = [];
  const withoutB: string[] = [];
  const withoutBoth: string[] = [];

  items?.forEach(item => {
    const itemNum = item.item_code.replace('IC-', '').padStart(3, '0');
    const status = oicByItem.get(itemNum) || { hasA: false, hasB: false };

    if (!status.hasA && !status.hasB) {
      withoutBoth.push(item.item_code);
    } else if (!status.hasA) {
      withoutA.push(item.item_code);
    } else if (!status.hasB) {
      withoutB.push(item.item_code);
    }
  });

  return { withoutA, withoutB, withoutBoth };
}
