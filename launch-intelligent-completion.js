// 🧠 COMPLÉTION INTELLIGENTE DES COMPÉTENCES OIC
console.log('🧠 Lancement de la complétion intelligente...');
console.log('📊 Objectif: Compléter toutes les compétences OIC incomplètes');

async function launchIntelligentCompletion() {
  try {
    console.log('🔍 Analyse des compétences incomplètes...');
    
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/complete-oic-competences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({})
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ COMPLÉTION TERMINÉE AVEC SUCCÈS !');
      console.log(`📊 Statistiques:`);
      console.log(`   ✅ Complétées: ${result.completed || 0}`);
      console.log(`   ❌ Erreurs: ${result.errors || 0}`);
      console.log(`   📈 Total traité: ${result.total || 0}`);
      console.log(`   💯 Taux de réussite: ${result.completion_rate || 0}%`);
      
      // Vérification automatique après 3 secondes
      setTimeout(async () => {
        console.log('\n🔍 Vérification post-complétion...');
        try {
          const verifyResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/rest/v1/backup_oic_competences?select=count&or=(description.is.null,description.eq.)', {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
            }
          });
          
          const verifyData = await verifyResponse.json();
          const remainingIncomplete = verifyData?.[0]?.count || 0;
          
          console.log(`📊 Compétences encore incomplètes: ${remainingIncomplete}`);
          if (remainingIncomplete === 0) {
            console.log('🎉 TOUTES LES COMPÉTENCES SONT MAINTENANT COMPLÈTES !');
          } else {
            console.log(`⚠️ ${remainingIncomplete} compétences nécessitent encore une complétion`);
          }
        } catch (error) {
          console.log('❌ Erreur lors de la vérification:', error.message);
        }
      }, 3000);
      
    } else {
      console.error('❌ Erreur lors de la complétion:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Erreur critique:', error);
  }
}

// Lancement immédiat
launchIntelligentCompletion();