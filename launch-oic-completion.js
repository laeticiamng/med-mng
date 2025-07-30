// 🚀 LANCEMENT COMPLETION OIC - Extraction complète v1.0
console.log('🔥 LANCEMENT COMPLETION TOTALE OIC - Toutes les 4,872 compétences...');

async function launchOICCompletion() {
  try {
    console.log('📡 Appel unified-extract en mode batch...');
    
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/unified-extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({ 
        mode: 'batch',
        version: 'v1.0'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ COMPLETION BATCH LANCÉE');
      console.log('='.repeat(80));
      console.log(`🎯 Version: ${data.version}`);
      console.log(`📊 Mode: ${data.mode}`);
      console.log(`✨ Statut: ${data.success ? 'SUCCÈS' : 'ÉCHEC'}`);
      
      if (data.result) {
        console.log('📋 Résultats de la completion:');
        console.log(`   🔧 Compétences corrigées: ${data.result.fixedCount || 0}`);
        console.log(`   ❌ Erreurs: ${data.result.errorCount || 0}`);
        console.log(`   📈 Total traité: ${data.result.totalProcessed || 0}`);
        
        if (data.result.message) {
          console.log(`   💬 Message: ${data.result.message}`);
        }
      }
      
      console.log('='.repeat(80));
      console.log('🎉 PROCESSUS DE COMPLETION EN COURS - Surveiller les logs Supabase');
      
    } else {
      console.error('❌ Erreur HTTP:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Détails:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Erreur critique lors du lancement:', error);
  }
}

// Lancement immédiat
launchOICCompletion().then(() => {
  console.log('\n🔄 PROCESSUS LANCÉ - Vérification du statut...');
  
  // Vérification périodique du statut
  const checkStatus = async () => {
    try {
      const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/unified-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
        },
        body: JSON.stringify({ 
          mode: 'report',
          version: 'v1.0'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 RAPPORT EXTRACTION - ${new Date().toLocaleTimeString()}`);
        console.log(`   📈 Total: ${data.report?.totalCompetences || 0} compétences`);
        console.log(`   ✅ Complètes: ${data.report?.completedCompetences || 0} (${data.report?.completionRate || 0}%)`);
        console.log(`   🔧 Tronquées: ${data.report?.truncatedCompetences || 0}`);
        
        if (data.report?.completionRate >= 95) {
          console.log('🎉 COMPLETION TERMINÉE AVEC SUCCÈS !');
          return;
        }
      }
      
      // Reprendre la vérification dans 30 secondes
      setTimeout(checkStatus, 30000);
      
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setTimeout(checkStatus, 30000);
    }
  };
  
  // Démarrer la surveillance après 10 secondes
  setTimeout(checkStatus, 10000);
  
}).catch(console.error);