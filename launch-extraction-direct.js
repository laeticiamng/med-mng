// 🚀 LANCEMENT EXTRACTION OIC DIRECTE
console.log('🔥 LANCEMENT EXTRACTION DIRECTE DES 4,872 COMPÉTENCES OIC...');

async function launchDirectExtraction() {
  try {
    console.log('📡 Appel Edge Function extraction directe...');
    
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/oic-extraction-direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({})
    });
    
    console.log(`📊 Statut HTTP: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ EXTRACTION TERMINÉE !');
      console.log('='.repeat(60));
      console.log(`🎯 Succès: ${data.success}`);
      console.log(`💬 Message: ${data.message}`);
      
      if (data.stats) {
        console.log('\n📊 STATISTIQUES:');
        console.log(`   🔍 Trouvées: ${data.stats.totalFound} compétences`);
        console.log(`   ✅ Traitées: ${data.stats.totalProcessed} compétences`);
        console.log(`   💾 Insérées: ${data.stats.totalInserted} compétences`);
        console.log(`   ❌ Erreurs: ${data.stats.totalErrors}`);
        console.log(`   ⏱️ Durée: ${data.stats.duration}s`);
        
        const rate = Math.round((data.stats.totalInserted / 4872) * 100 * 10) / 10;
        console.log(`   📈 Taux completion: ${rate}%`);
      }
      
      console.log('='.repeat(60));
      
      if (data.stats?.totalInserted > 0) {
        console.log('🎉 COMPÉTENCES EXTRAITES AVEC SUCCÈS !');
        console.log('🔄 Vérification dans la base de données...');
        
        // Vérification du résultat
        setTimeout(async () => {
          try {
            const checkResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/rest/v1/backup_oic_competences?select=count&extraction_status=eq.completed', {
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
              }
            });
            
            if (checkResponse.ok) {
              const checkData = await checkResponse.json();
              const completedCount = checkData.length > 0 ? checkData[0].count : 0;
              console.log(`\n📈 VÉRIFICATION: ${completedCount} compétences complètes en base`);
              
              if (completedCount > 100) {
                console.log('🎯 EXTRACTION RÉUSSIE - Données visibles dans l\'interface !');
              }
            }
          } catch (e) {
            console.log('⚠️ Erreur vérification:', e.message);
          }
        }, 3000);
        
      } else {
        console.log('⚠️ Aucune compétence extraite - vérifier les logs');
      }
      
    } else {
      console.error('❌ Erreur HTTP:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Détails:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Erreur critique:', error);
  }
}

// Lancement immédiat
console.log('🚀 DÉMARRAGE IMMÉDIAT...');
launchDirectExtraction().catch(console.error);