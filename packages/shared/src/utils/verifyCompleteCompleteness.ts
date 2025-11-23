import { supabase } from '../lib/supabase';

/**
 * Vérification complète de la complétude des items EDN
 * Analyse détaillée item par item de toutes les compétences requises
 */

export interface ItemCompletenessDetail {
  item_code: string;
  title: string;
  specialite?: string;

  // Compétences OIC
  oic_competences_rang_a: {
    count: number;
    competences: any[];
    complete: boolean;
  };
  oic_competences_rang_b: {
    count: number;
    competences: any[];
    complete: boolean;
  };

  // Paroles
  has_paroles_rang_a: boolean;
  has_paroles_rang_b: boolean;
  has_paroles_rang_ab: boolean;
  paroles_lines_a: number;
  paroles_lines_b: number;
  paroles_lines_ab: number;

  // Quiz
  has_quiz: boolean;
  quiz_questions_count: number;

  // Bande dessinée
  has_comic: boolean;
  comic_panels_count: number;

  // Score de complétude global
  completeness_score: number;
  is_complete: boolean;
  missing_elements: string[];
}

export interface GlobalCompletenessReport {
  total_items: number;
  complete_items: number;
  incomplete_items: number;

  items_with_all_oic_a: number;
  items_with_all_oic_b: number;
  items_with_paroles_a: number;
  items_with_paroles_b: number;
  items_with_paroles_ab: number;
  items_with_quiz: number;
  items_with_comic: number;

  average_completeness: number;

  items_details: ItemCompletenessDetail[];
  incomplete_items_details: ItemCompletenessDetail[];
}

/**
 * Vérifie la complétude complète de tous les items EDN
 */
export async function verifyCompleteEDNCompleteness(): Promise<GlobalCompletenessReport> {
  console.log('🔍 VÉRIFICATION COMPLÈTE DE LA COMPLÉTUDE EDN');
  console.log('═══════════════════════════════════════════════════\n');

  const report: GlobalCompletenessReport = {
    total_items: 0,
    complete_items: 0,
    incomplete_items: 0,
    items_with_all_oic_a: 0,
    items_with_all_oic_b: 0,
    items_with_paroles_a: 0,
    items_with_paroles_b: 0,
    items_with_paroles_ab: 0,
    items_with_quiz: 0,
    items_with_comic: 0,
    average_completeness: 0,
    items_details: [],
    incomplete_items_details: []
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

    report.total_items = items.length;
    console.log(`✅ ${items.length} items EDN trouvés\n`);

    // 2. Récupérer toutes les compétences OIC en une seule requête
    console.log('📚 Récupération des compétences OIC...');
    const { data: allOicCompetences, error: oicError } = await supabase
      .from('oic_competences')
      .select('*')
      .order('item_parent, rang, ordre');

    if (oicError) console.warn('⚠️ Erreur récupération OIC:', oicError);

    // Grouper les compétences par item et rang
    const oicByItem = new Map<string, { A: any[], B: any[] }>();
    if (allOicCompetences) {
      allOicCompetences.forEach(comp => {
        const itemNum = comp.item_parent;
        if (!oicByItem.has(itemNum)) {
          oicByItem.set(itemNum, { A: [], B: [] });
        }
        const group = oicByItem.get(itemNum)!;
        if (comp.rang === 'A') {
          group.A.push(comp);
        } else if (comp.rang === 'B') {
          group.B.push(comp);
        }
      });
    }

    console.log(`✅ ${allOicCompetences?.length || 0} compétences OIC récupérées\n`);

    // 3. Récupérer tous les comics en une seule requête
    console.log('🎨 Récupération des bandes dessinées...');
    const { data: allComics, error: comicsError } = await supabase
      .from('comic_panels')
      .select('item_code, id');

    if (comicsError) console.warn('⚠️ Erreur récupération comics:', comicsError);

    const comicsByItem = new Map<string, number>();
    if (allComics) {
      allComics.forEach(comic => {
        comicsByItem.set(comic.item_code, (comicsByItem.get(comic.item_code) || 0) + 1);
      });
    }

    console.log(`✅ ${allComics?.length || 0} panneaux de BD récupérés\n`);

    // 4. Analyser chaque item
    console.log('🔍 Analyse détaillée de chaque item...\n');

    let totalCompleteness = 0;

    for (const item of items) {
      const itemNum = item.item_code.replace('IC-', '').padStart(3, '0');
      const oicData = oicByItem.get(itemNum) || { A: [], B: [] };

      // Analyser les compétences OIC
      const oicCompetencesA = oicData.A;
      const oicCompetencesB = oicData.B;

      // Déterminer si les compétences sont complètes
      // Un item complet devrait avoir au moins quelques compétences pour chaque rang
      const hasOicA = oicCompetencesA.length > 0;
      const hasOicB = oicCompetencesB.length > 0;

      // Analyser les paroles
      const hasParolesA = item.paroles_rang_a && Array.isArray(item.paroles_rang_a) && item.paroles_rang_a.length > 0;
      const hasParolesB = item.paroles_rang_b && Array.isArray(item.paroles_rang_b) && item.paroles_rang_b.length > 0;
      const hasParolesAB = item.paroles_rang_ab && Array.isArray(item.paroles_rang_ab) && item.paroles_rang_ab.length > 0;

      const parolesLinesA = hasParolesA ? item.paroles_rang_a.length : 0;
      const parolesLinesB = hasParolesB ? item.paroles_rang_b.length : 0;
      const parolesLinesAB = hasParolesAB ? item.paroles_rang_ab.length : 0;

      // Analyser le quiz
      const hasQuiz = item.quiz_data && typeof item.quiz_data === 'object' && Object.keys(item.quiz_data).length > 0;
      const quizQuestionsCount = hasQuiz && item.quiz_data.questions ? item.quiz_data.questions.length : 0;

      // Analyser les comics
      const comicPanelsCount = comicsByItem.get(item.item_code) || 0;
      const hasComic = comicPanelsCount > 0;

      // Calculer le score de complétude (sur 100)
      let score = 0;
      const weights = {
        oic_a: 20,      // 20% pour compétences Rang A
        oic_b: 20,      // 20% pour compétences Rang B
        paroles_a: 15,  // 15% pour paroles Rang A
        paroles_b: 15,  // 15% pour paroles Rang B
        paroles_ab: 15, // 15% pour paroles Rang AB
        quiz: 10,       // 10% pour quiz
        comic: 5        // 5% pour BD (optionnel)
      };

      if (hasOicA) score += weights.oic_a;
      if (hasOicB) score += weights.oic_b;
      if (hasParolesA) score += weights.paroles_a;
      if (hasParolesB) score += weights.paroles_b;
      if (hasParolesAB) score += weights.paroles_ab;
      if (hasQuiz) score += weights.quiz;
      if (hasComic) score += weights.comic;

      totalCompleteness += score;

      // Déterminer les éléments manquants
      const missing: string[] = [];
      if (!hasOicA) missing.push('Compétences OIC Rang A');
      if (!hasOicB) missing.push('Compétences OIC Rang B');
      if (!hasParolesA) missing.push('Paroles Rang A');
      if (!hasParolesB) missing.push('Paroles Rang B');
      if (!hasParolesAB) missing.push('Paroles Rang AB');
      if (!hasQuiz) missing.push('Quiz');
      if (!hasComic) missing.push('Bande dessinée');

      const isComplete = score >= 85; // Considéré complet à 85% (sans BD obligatoire)

      const itemDetail: ItemCompletenessDetail = {
        item_code: item.item_code,
        title: item.title,
        specialite: item.specialite,

        oic_competences_rang_a: {
          count: oicCompetencesA.length,
          competences: oicCompetencesA,
          complete: hasOicA
        },
        oic_competences_rang_b: {
          count: oicCompetencesB.length,
          competences: oicCompetencesB,
          complete: hasOicB
        },

        has_paroles_rang_a: hasParolesA,
        has_paroles_rang_b: hasParolesB,
        has_paroles_rang_ab: hasParolesAB,
        paroles_lines_a: parolesLinesA,
        paroles_lines_b: parolesLinesB,
        paroles_lines_ab: parolesLinesAB,

        has_quiz: hasQuiz,
        quiz_questions_count: quizQuestionsCount,

        has_comic: hasComic,
        comic_panels_count: comicPanelsCount,

        completeness_score: score,
        is_complete: isComplete,
        missing_elements: missing
      };

      report.items_details.push(itemDetail);

      if (!isComplete) {
        report.incomplete_items_details.push(itemDetail);
      } else {
        report.complete_items++;
      }

      // Compter les items avec chaque élément
      if (hasOicA) report.items_with_all_oic_a++;
      if (hasOicB) report.items_with_all_oic_b++;
      if (hasParolesA) report.items_with_paroles_a++;
      if (hasParolesB) report.items_with_paroles_b++;
      if (hasParolesAB) report.items_with_paroles_ab++;
      if (hasQuiz) report.items_with_quiz++;
      if (hasComic) report.items_with_comic++;

      // Log progressif
      if (items.indexOf(item) % 50 === 0) {
        console.log(`   Analysé ${items.indexOf(item) + 1}/${items.length} items...`);
      }
    }

    report.incomplete_items = report.total_items - report.complete_items;
    report.average_completeness = totalCompleteness / report.total_items;

    console.log('\n✅ Analyse terminée\n');

    // Afficher le résumé
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 RÉSUMÉ GLOBAL DE COMPLÉTUDE');
    console.log('═══════════════════════════════════════════════════\n');

    console.log(`Total items: ${report.total_items}`);
    console.log(`Items complets (≥85%): ${report.complete_items} (${((report.complete_items / report.total_items) * 100).toFixed(1)}%)`);
    console.log(`Items incomplets: ${report.incomplete_items} (${((report.incomplete_items / report.total_items) * 100).toFixed(1)}%)`);
    console.log(`Score moyen: ${report.average_completeness.toFixed(1)}%\n`);

    console.log('Détail par élément:');
    console.log(`  Compétences OIC Rang A: ${report.items_with_all_oic_a}/${report.total_items} (${((report.items_with_all_oic_a / report.total_items) * 100).toFixed(1)}%)`);
    console.log(`  Compétences OIC Rang B: ${report.items_with_all_oic_b}/${report.total_items} (${((report.items_with_all_oic_b / report.total_items) * 100).toFixed(1)}%)`);
    console.log(`  Paroles Rang A: ${report.items_with_paroles_a}/${report.total_items} (${((report.items_with_paroles_a / report.total_items) * 100).toFixed(1)}%)`);
    console.log(`  Paroles Rang B: ${report.items_with_paroles_b}/${report.total_items} (${((report.items_with_paroles_b / report.total_items) * 100).toFixed(1)}%)`);
    console.log(`  Paroles Rang AB: ${report.items_with_paroles_ab}/${report.total_items} (${((report.items_with_paroles_ab / report.total_items) * 100).toFixed(1)}%)`);
    console.log(`  Quiz: ${report.items_with_quiz}/${report.total_items} (${((report.items_with_quiz / report.total_items) * 100).toFixed(1)}%)`);
    console.log(`  Bandes dessinées: ${report.items_with_comic}/${report.total_items} (${((report.items_with_comic / report.total_items) * 100).toFixed(1)}%)`);

    console.log('\n═══════════════════════════════════════════════════\n');

    // Afficher les items incomplets
    if (report.incomplete_items_details.length > 0) {
      console.log(`❌ ITEMS INCOMPLETS (${report.incomplete_items_details.length}):\n`);

      report.incomplete_items_details.slice(0, 20).forEach(item => {
        console.log(`${item.item_code} - ${item.title} (${item.completeness_score}%)`);
        console.log(`   Manque: ${item.missing_elements.join(', ')}`);
        console.log(`   OIC A: ${item.oic_competences_rang_a.count} compétences`);
        console.log(`   OIC B: ${item.oic_competences_rang_b.count} compétences`);
        console.log('');
      });

      if (report.incomplete_items_details.length > 20) {
        console.log(`... et ${report.incomplete_items_details.length - 20} autres items incomplets\n`);
      }
    }

    return report;

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    throw error;
  }
}

/**
 * Exporte le rapport de complétude en CSV
 */
export function exportCompletenessReportToCSV(report: GlobalCompletenessReport): string {
  const headers = [
    'Item Code',
    'Title',
    'Specialite',
    'OIC A Count',
    'OIC B Count',
    'Has Paroles A',
    'Has Paroles B',
    'Has Paroles AB',
    'Has Quiz',
    'Quiz Questions',
    'Has Comic',
    'Comic Panels',
    'Completeness %',
    'Is Complete',
    'Missing Elements'
  ];

  const rows = report.items_details.map(item => [
    item.item_code,
    `"${item.title}"`,
    `"${item.specialite || ''}"`,
    item.oic_competences_rang_a.count,
    item.oic_competences_rang_b.count,
    item.has_paroles_rang_a ? 'Oui' : 'Non',
    item.has_paroles_rang_b ? 'Oui' : 'Non',
    item.has_paroles_rang_ab ? 'Oui' : 'Non',
    item.has_quiz ? 'Oui' : 'Non',
    item.quiz_questions_count,
    item.has_comic ? 'Oui' : 'Non',
    item.comic_panels_count,
    item.completeness_score,
    item.is_complete ? 'Oui' : 'Non',
    `"${item.missing_elements.join(', ')}"`
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csv;
}

/**
 * Obtient la liste des items sans compétences OIC Rang A
 */
export function getItemsWithoutOICA(report: GlobalCompletenessReport): ItemCompletenessDetail[] {
  return report.items_details.filter(item => !item.oic_competences_rang_a.complete);
}

/**
 * Obtient la liste des items sans compétences OIC Rang B
 */
export function getItemsWithoutOICB(report: GlobalCompletenessReport): ItemCompletenessDetail[] {
  return report.items_details.filter(item => !item.oic_competences_rang_b.complete);
}

/**
 * Obtient la liste des items sans paroles
 */
export function getItemsWithoutParoles(report: GlobalCompletenessReport): ItemCompletenessDetail[] {
  return report.items_details.filter(item =>
    !item.has_paroles_rang_a || !item.has_paroles_rang_b || !item.has_paroles_rang_ab
  );
}

/**
 * Obtient la liste des items sans quiz
 */
export function getItemsWithoutQuiz(report: GlobalCompletenessReport): ItemCompletenessDetail[] {
  return report.items_details.filter(item => !item.has_quiz);
}
