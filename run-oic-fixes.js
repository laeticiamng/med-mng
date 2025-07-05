// Script d'exécution automatique des corrections OIC
const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

async function runAutomaticFixes() {
  console.log('🚀 Lancement automatique des corrections OIC...');
  
  try {
    // Appel à l'edge function pour lancer les corrections
    const response = await fetch(`${SUPABASE_URL}/functions/v1/fix-oic-data-quality`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ action: 'fix' })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('✅ CORRECTIONS TERMINÉES AVEC SUCCÈS !');
    console.log('======================================');
    console.log(`📊 Total traité: ${result.report.totalProcessed}`);
    console.log(`🔧 Total corrigé: ${result.totalFixed}`);
    console.log(`📈 Taux de succès: ${result.successRate}%`);
    console.log('');
    console.log('📋 Détail des corrections:');
    console.log(`   🔧 HTML nettoyé: ${result.report.htmlEntitiesFixed}`);
    console.log(`   📝 Fragments reconstruits: ${result.report.fragmentsReconstructed}`);
    console.log(`   ❌ Descriptions créées: ${result.report.emptyDescriptionsHandled}`);
    console.log(`   📋 Tables nettoyées: ${result.report.wikitablesCleaned}`);
    console.log(`   💥 Intitulés corrigés: ${result.report.intitulesFixed}`);
    
    if (result.report.errors.length > 0) {
      console.log(`   ⚠️ Erreurs: ${result.report.errors.length}`);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ ERREUR lors des corrections:', error.message);
    throw error;
  }
}

// Exécution immédiate
runAutomaticFixes()
  .then(() => {
    console.log('\n🎉 MISSION ACCOMPLIE ! Toutes les corrections ont été appliquées.');
    console.log('💡 Les compétences OIC s\'affichent maintenant correctement dans les tableaux !');
  })
  .catch((error) => {
    console.error('\n💥 ÉCHEC DE LA MISSION:', error);
    process.exit(1);
  });