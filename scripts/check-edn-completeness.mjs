#!/usr/bin/env node

/**
 * Script de vérification de la complétude des items EDN
 * Vérifie: Rang A, Rang B, Paroles, Quiz, Suno, Comics
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

// Charger les variables d'environnement
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('=====================================================');
console.log('VERIFICATION COMPLETE DES ITEMS EDN');
console.log('=====================================================\n');

async function checkCompleteness() {
  try {
    // 1. STATISTIQUES GLOBALES
    console.log('1. STATISTIQUES GLOBALES');
    console.log('-----------------------------------------------------');

    const { data: items, error } = await supabase
      .from('edn_items_complete')
      .select('*');

    if (error) {
      console.error('Erreur lors de la récupération des items:', error);
      return;
    }

    const totalItems = items.length;
    const withRangA = items.filter(i => i.competences_oic_rang_a && i.competences_oic_rang_a.length > 0).length;
    const withRangB = items.filter(i => i.competences_oic_rang_b && i.competences_oic_rang_b.length > 0).length;
    const withBoth = items.filter(i =>
      i.competences_oic_rang_a && i.competences_oic_rang_a.length > 0 &&
      i.competences_oic_rang_b && i.competences_oic_rang_b.length > 0
    ).length;
    const withParoles = items.filter(i => i.paroles_musicales && i.paroles_musicales.length > 0).length;
    const withQuiz = items.filter(i => i.quiz_questions && Object.keys(i.quiz_questions).length > 0).length;
    const withTableauA = items.filter(i => i.tableau_rang_a && Object.keys(i.tableau_rang_a).length > 0).length;
    const withTableauB = items.filter(i => i.tableau_rang_b && Object.keys(i.tableau_rang_b).length > 0).length;

    console.log(`Items EDN totaux: ${totalItems}`);
    console.log(`Items avec Rang A complet: ${withRangA} (${Math.round(withRangA/totalItems*100)}%)`);
    console.log(`Items avec Rang B complet: ${withRangB} (${Math.round(withRangB/totalItems*100)}%)`);
    console.log(`Items avec Rangs A ET B: ${withBoth} (${Math.round(withBoth/totalItems*100)}%)`);
    console.log(`Items avec paroles musicales: ${withParoles} (${Math.round(withParoles/totalItems*100)}%)`);
    console.log(`Items avec quiz: ${withQuiz} (${Math.round(withQuiz/totalItems*100)}%)`);
    console.log(`Items avec tableau Rang A: ${withTableauA} (${Math.round(withTableauA/totalItems*100)}%)`);
    console.log(`Items avec tableau Rang B: ${withTableauB} (${Math.round(withTableauB/totalItems*100)}%)`);

    // 2. ITEMS 100% COMPLETS
    console.log('\n2. ITEMS 100% COMPLETS');
    console.log('-----------------------------------------------------');

    const completeItems = items.filter(i =>
      i.competences_oic_rang_a && i.competences_oic_rang_a.length > 0 &&
      i.competences_oic_rang_b && i.competences_oic_rang_b.length > 0 &&
      i.paroles_musicales && i.paroles_musicales.length > 0 &&
      i.quiz_questions && Object.keys(i.quiz_questions).length > 0
    );

    console.log(`Items 100% complets: ${completeItems.length} / ${totalItems} (${Math.round(completeItems.length/totalItems*100)}%)`);
    console.log('\nExemples d\'items complets:');
    completeItems.slice(0, 5).forEach(item => {
      console.log(`  - ${item.item_code}: ${item.title}`);
      console.log(`    Rang A: ${item.competences_oic_rang_a?.length || 0} compétences`);
      console.log(`    Rang B: ${item.competences_oic_rang_b?.length || 0} compétences`);
      console.log(`    Paroles: ${item.paroles_musicales?.length || 0} lignes`);
      console.log(`    Quiz: ${item.quiz_questions?.questions?.length || 0} questions`);
    });

    // 3. ITEMS INCOMPLETS
    console.log('\n3. ITEMS INCOMPLETS - ANALYSE');
    console.log('-----------------------------------------------------');

    const withoutRangA = items.filter(i => !i.competences_oic_rang_a || i.competences_oic_rang_a.length === 0);
    const withoutRangB = items.filter(i => !i.competences_oic_rang_b || i.competences_oic_rang_b.length === 0);
    const withoutParoles = items.filter(i => !i.paroles_musicales || i.paroles_musicales.length === 0);
    const withoutQuiz = items.filter(i => !i.quiz_questions || Object.keys(i.quiz_questions).length === 0);

    console.log(`\nItems SANS Rang A: ${withoutRangA.length}`);
    if (withoutRangA.length > 0) {
      console.log('Exemples:');
      withoutRangA.slice(0, 5).forEach(i => console.log(`  - ${i.item_code}: ${i.title}`));
    }

    console.log(`\nItems SANS Rang B: ${withoutRangB.length}`);
    if (withoutRangB.length > 0) {
      console.log('Exemples:');
      withoutRangB.slice(0, 5).forEach(i => console.log(`  - ${i.item_code}: ${i.title}`));
    }

    console.log(`\nItems SANS Paroles: ${withoutParoles.length}`);
    if (withoutParoles.length > 0) {
      console.log('Exemples:');
      withoutParoles.slice(0, 5).forEach(i => console.log(`  - ${i.item_code}: ${i.title}`));
    }

    console.log(`\nItems SANS Quiz: ${withoutQuiz.length}`);
    if (withoutQuiz.length > 0) {
      console.log('Exemples:');
      withoutQuiz.slice(0, 5).forEach(i => console.log(`  - ${i.item_code}: ${i.title}`));
    }

    // 4. VERIFICATION SUNO
    console.log('\n4. VERIFICATION INTEGRATION SUNO');
    console.log('-----------------------------------------------------');

    const { data: songs, error: songsError } = await supabase
      .from('med_mng_songs')
      .select('*');

    if (!songsError && songs) {
      console.log(`Total chansons Suno: ${songs.length}`);
      console.log(`Chansons avec lyrics: ${songs.filter(s => s.lyrics && Object.keys(s.lyrics).length > 0).length}`);
      console.log(`Chansons avec audio_id: ${songs.filter(s => s.suno_audio_id).length}`);

      // Vérifier lien avec EDN items
      const songsWithItemCode = songs.filter(s => s.item_code);
      console.log(`\n⚠️  PROBLEME CRITIQUE: Chansons liées aux items EDN: ${songsWithItemCode.length} / ${songs.length}`);
      console.log('    La table med_mng_songs ne contient pas de colonne item_code!');
    }

    // 5. VERIFICATION COMIC PANELS
    console.log('\n5. VERIFICATION BANDES DESSINEES');
    console.log('-----------------------------------------------------');

    const { data: comics, error: comicsError } = await supabase
      .from('comic_panels')
      .select('*');

    if (!comicsError && comics) {
      console.log(`Total panneaux BD: ${comics.length}`);
      console.log(`Panneaux statiques: ${comics.filter(c => c.is_static).length}`);
      console.log(`Items uniques avec BD: ${new Set(comics.map(c => c.item_id)).size}`);
    }

    // 6. PROBLEMES CRITIQUES
    console.log('\n6. PROBLEMES CRITIQUES IDENTIFIES');
    console.log('=====================================================');

    console.log('\n❌ PROBLEME 1: Paroles non séparées par Rang');
    console.log('Les paroles musicales sont dans un seul array paroles_musicales[]');
    console.log('Il faudrait 3 arrays séparés:');
    console.log('  - paroles_rang_a[]');
    console.log('  - paroles_rang_b[]');
    console.log('  - paroles_rang_ab[]');

    console.log('\n❌ PROBLEME 2: Pas de lien Item EDN <-> Suno');
    console.log('La table med_mng_songs ne contient pas item_code');
    console.log('Impossible de savoir quelle chanson correspond à quel item/rang');

    console.log('\n❌ PROBLEME 3: Lien Comic Panels incertain');
    console.log('Table comic_panels référence item_id au lieu de item_code');
    console.log('Besoin de vérifier la correspondance');

    // 7. RESUME ET RECOMMENDATIONS
    console.log('\n7. RESUME ET TAUX DE COMPLETUDE');
    console.log('=====================================================');

    const completenessScore = Math.round(
      (withBoth * 0.3 + withParoles * 0.2 + withQuiz * 0.2 + withTableauA * 0.15 + withTableauB * 0.15) / totalItems * 100
    );

    console.log(`\nTaux de complétude global: ${completenessScore}%`);
    console.log(`Items manquants pour 100%:`);
    console.log(`  - ${totalItems - withBoth} items sans Rang A+B complets`);
    console.log(`  - ${totalItems - withParoles} items sans paroles`);
    console.log(`  - ${totalItems - withQuiz} items sans quiz`);
    console.log(`  - Besoin de ${totalItems * 3} chansons Suno (une par rang: A, B, AB)`);
    console.log(`  - Besoin de ${totalItems} bandes dessinées fixes minimum`);

    console.log('\n⚠️  ACTIONS URGENTES REQUISES:');
    console.log('1. Exécuter la migration schema: 20251116220000_add_complete_edn_features.sql');
    console.log('2. Générer paroles séparées pour chaque rang');
    console.log('3. Lier les chansons Suno existantes aux items EDN');
    console.log('4. Générer le contenu manquant (quiz, paroles, BD)');

    console.log('\n=====================================================');
    console.log('FIN DU RAPPORT DE VERIFICATION');
    console.log('=====================================================\n');

  } catch (err) {
    console.error('Erreur:', err);
  }
}

checkCompleteness();
