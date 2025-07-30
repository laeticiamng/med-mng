#!/usr/bin/env node

/**
 * 🎯 LANCEMENT COMPLETION EDN-OIC
 * 
 * Script pour enrichir intelligemment les items EDN 
 * avec les compétences OIC - seulement ce qui manque
 * 
 * Fonction testée et validée: complete-edn-with-oic
 */

console.log('🚀 Lancement completion EDN avec compétences OIC...');
console.log('');

const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

async function launchCompletion() {
  try {
    console.log('📡 Appel de la fonction complete-edn-with-oic...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/complete-edn-with-oic`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ COMPLETION RÉUSSIE !');
      console.log('==============================');
      console.log(`📊 Items traités: ${result.statistics.items_processed}`);
      console.log(`🎯 Items enrichis: ${result.statistics.items_completed}`);
      console.log(`❌ Erreurs: ${result.statistics.items_with_errors}`);
      console.log(`📈 Taux de succès: ${result.statistics.completion_rate}`);
      console.log('');
      console.log('💾 Fonction sauvegardée pour référence future:', result.function_saved);
      
      if (result.details && result.details.length > 0) {
        console.log('');
        console.log('📋 Détails des enrichissements:');
        result.details.slice(0, 10).forEach(detail => {
          console.log(`   ${detail.item_code}: Rang A (${detail.rang_a_before}→${detail.rang_a_after}) | Rang B (${detail.rang_b_before}→${detail.rang_b_after}) | Total (${detail.total_before}→${detail.total_after})`);
        });
        
        if (result.details.length > 10) {
          console.log(`   ... et ${result.details.length - 10} autres items enrichis`);
        }
      }
      
    } else {
      console.error('❌ ÉCHEC:', result.error || result.message);
    }

  } catch (error) {
    console.error('💥 Erreur lors du lancement:', error.message);
  }
}

// Lancement immédiat
launchCompletion();