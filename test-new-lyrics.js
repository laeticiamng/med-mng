// Test rapide de la nouvelle structure de paroles
// Utiliser: node test-new-lyrics.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewLyricsStructure() {
  console.log('🎵 Test de la nouvelle structure de paroles...');
  console.log('📋 Structure demandée: 4 couplets + refrains avec assonances');
  console.log('🎯 Pour Rang A, Rang B, et Mix A+B\n');
  
  try {
    const startTime = Date.now();
    
    // Appeler la fonction Edge pour régénérer avec la nouvelle structure
    console.log('🚀 Lancement de la génération...');
    const { data, error } = await supabase.functions.invoke('generate-all-lyrics', {});

    if (error) {
      console.error('❌ ERREUR:', error);
      return;
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('✅ Génération terminée en', duration, 'secondes');
    console.log('📊 Résultats:', data?.stats || data);
    
    // Tester un item spécifique pour vérifier la structure
    console.log('\n🔍 Vérification de la structure pour IC-1...');
    
    const { data: testItem, error: testError } = await supabase
      .from('edn_items_complete')
      .select('item_code, title, paroles_musicales')
      .eq('item_code', 'IC-1')
      .single();

    if (testError) {
      console.error('❌ Erreur test:', testError);
      return;
    }

    if (testItem?.paroles_musicales) {
      console.log('\n📝 STRUCTURE DES PAROLES POUR IC-1:');
      console.log('━'.repeat(60));
      
      const paroles = Array.isArray(testItem.paroles_musicales) 
        ? testItem.paroles_musicales 
        : [testItem.paroles_musicales];
      
      paroles.forEach((section, index) => {
        const lines = Array.isArray(section) ? section : section.split('\n');
        console.log(`\n📖 Section ${index + 1}:`);
        lines.slice(0, 10).forEach(line => {
          if (line.trim()) {
            console.log(`   ${line.trim()}`);
          }
        });
        if (lines.length > 10) {
          console.log(`   ... (${lines.length - 10} lignes supplémentaires)`);
        }
      });
      
      // Compter les couplets et refrains
      const allText = paroles.join(' ');
      const coupletCount = (allText.match(/\[Couplet/g) || []).length;
      const refrainCount = (allText.match(/\[Refrain/g) || []).length;
      
      console.log('\n📈 STATISTIQUES:');
      console.log(`   • Couplets trouvés: ${coupletCount}`);
      console.log(`   • Refrains trouvés: ${refrainCount}`);
      console.log(`   • Structure respectée: ${coupletCount >= 4 && refrainCount >= 4 ? '✅ OUI' : '❌ NON'}`);
      
    } else {
      console.log('❌ Aucune parole trouvée pour IC-1');
    }

    // Vérifier quelques autres items
    console.log('\n🔍 Vérification rapide d\'autres items...');
    const { data: otherItems } = await supabase
      .from('edn_items_complete')
      .select('item_code, paroles_musicales')
      .not('paroles_musicales', 'is', null)
      .limit(5);

    if (otherItems) {
      console.log(`📊 ${otherItems.length} items avec paroles trouvés:`);
      otherItems.forEach(item => {
        const parolesLength = Array.isArray(item.paroles_musicales) 
          ? item.paroles_musicales.length 
          : 1;
        console.log(`   • ${item.item_code}: ${parolesLength} sections`);
      });
    }

  } catch (error) {
    console.error('❌ ERREUR CRITIQUE:', error.message);
  }
}

testNewLyricsStructure().catch(console.error);