// Script simple pour lancer la génération des paroles
// Utiliser: node generate-lyrics-now.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateAllLyrics() {
  console.log('🎵 DÉBUT: Génération des paroles pour tous les items EDN...');
  
  try {
    const startTime = Date.now();
    
    // Appeler la fonction Edge
    const { data, error } = await supabase.functions.invoke('generate-all-lyrics', {});

    if (error) {
      console.error('❌ ERREUR:', error);
      return;
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('✅ SUCCÈS! Génération terminée en', duration, 'secondes');
    console.log('📊 Statistiques:', data?.stats || data);
    
    // Vérifier le résultat
    if (data?.stats) {
      console.log(`\n📈 RÉSULTATS:`);
      console.log(`   • Items traités: ${data.stats.processed}`);
      console.log(`   • Succès: ${data.stats.success}`);
      console.log(`   • Erreurs: ${data.stats.errors}`);
      console.log(`   • Total en base: ${data.stats.total}`);
    }

  } catch (error) {
    console.error('❌ ERREUR CRITIQUE:', error.message);
  }
}

async function checkProgress() {
  console.log('📊 Vérification du progrès...');
  
  try {
    const { data: items, error } = await supabase
      .from('edn_items_complete')
      .select('item_code, paroles_musicales')
      .order('item_code');

    if (error) throw error;

    const total = items.length;
    const withLyrics = items.filter(item => 
      item.paroles_musicales && 
      Array.isArray(item.paroles_musicales) && 
      item.paroles_musicales.length > 0
    ).length;

    const progress = Math.round((withLyrics / total) * 100);

    console.log(`📈 PROGRÈS: ${withLyrics}/${total} items (${progress}%)`);
    
    return { total, withLyrics, progress };
    
  } catch (error) {
    console.error('❌ Erreur vérification:', error);
  }
}

// Menu principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';

  switch (command) {
    case 'generate':
      await generateAllLyrics();
      break;
    case 'check':
      await checkProgress();
      break;
    case 'both':
      await checkProgress();
      await generateAllLyrics();
      await checkProgress();
      break;
    default:
      console.log(`
🎵 Générateur de paroles EDN

Utilisation:
  node generate-lyrics-now.js [command]

Commandes:
  generate  - Génère toutes les paroles (défaut)
  check     - Vérifie le progrès actuel
  both      - Vérifie + génère + vérifie
      `);
  }
}

main().catch(console.error);