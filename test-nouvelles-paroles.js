#!/usr/bin/env node

/**
 * Test des nouvelles paroles médicales spécifiques
 * Génère les paroles pour quelques items test
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNouvellesParoles() {
  console.log('🧪 Test des nouvelles paroles spécifiques...');
  
  try {
    // Appeler la fonction pour quelques items seulement
    console.log('🚀 Appel de la fonction generate-all-lyrics...');
    
    const { data, error } = await supabase.functions.invoke('generate-all-lyrics');
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log('✅ Résultat:', data);
    
    // Vérifier les résultats sur IC-1
    console.log('\n🔍 Vérification des nouvelles paroles pour IC-1...');
    
    const { data: item, error: itemError } = await supabase
      .from('edn_items_complete')
      .select('item_code, paroles_rang_a, paroles_rang_b, paroles_rang_ab, paroles_musicales')
      .eq('item_code', 'IC-1')
      .single();
      
    if (itemError) {
      console.error('❌ Erreur récupération IC-1:', itemError);
      return;
    }
    
    console.log('\n📝 IC-1 Nouvelles paroles:');
    console.log('Rang A:', item.paroles_rang_a?.slice(0, 4) || 'Aucune');
    console.log('Rang B:', item.paroles_rang_b?.slice(0, 4) || 'Aucune'); 
    console.log('Rang AB:', item.paroles_rang_ab?.slice(0, 4) || 'Aucune');
    console.log('Anciennes (musicales):', item.paroles_musicales?.slice(0, 2) || 'Aucune');
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

testNouvellesParoles();