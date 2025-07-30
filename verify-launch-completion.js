// 🚀 VÉRIFICATION STATUT + LANCEMENT FORCÉ
console.log('🔍 VÉRIFICATION STATUT COMPLETION OIC...');

async function verifyAndLaunch() {
  try {
    // 1. Vérifier le statut actuel
    console.log('📊 Vérification statut actuel...');
    const statusResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/unified-extract', {
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
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('📈 STATUT ACTUEL:');
      console.log(`   📊 Total: ${statusData.report?.totalCompetences || 0} compétences`);
      console.log(`   ✅ Complètes: ${statusData.report?.completedCompetences || 0}`);
      console.log(`   🔧 Tronquées: ${statusData.report?.truncatedCompetences || 0}`);
      console.log(`   📈 Taux: ${statusData.report?.completionRate || 0}%`);
      
      if (statusData.report?.completionRate < 5) {
        console.log('\n🚀 LANCEMENT BATCH EXTRACTION...');
        
        // 2. Lancer le processus batch
        const batchResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/unified-extract', {
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
        
        console.log(`📡 Statut lancement batch: ${batchResponse.status}`);
        
        if (batchResponse.ok) {
          const batchData = await batchResponse.json();
          console.log('✅ BATCH LANCÉ AVEC SUCCÈS !');
          console.log('🎯 Résultat:', JSON.stringify(batchData, null, 2));
        } else {
          const errorText = await batchResponse.text();
          console.error('❌ Erreur lancement batch:', errorText);
        }
      } else {
        console.log('✅ EXTRACTION DÉJÀ EN COURS OU TERMINÉE');
      }
    } else {
      console.error('❌ Erreur vérification statut:', statusResponse.status);
    }
    
    // 3. Test simple de l'authentification UNESS
    console.log('\n🔐 Test authentification UNESS...');
    const testResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/unified-extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({ 
        mode: 'single',
        version: 'v1.0'
      })
    });
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('🎯 Test authentification:', testData.success ? 'SUCCÈS' : 'ÉCHEC');
      if (testData.sample) {
        console.log(`📋 Échantillon récupéré: ${testData.sample.length} compétences`);
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur lors de la vérification:', error);
  }
}

// Exécution immédiate
verifyAndLaunch().then(() => {
  console.log('\n🔄 SURVEILLANCE DÉMARRÉE - Vérification toutes les 60 secondes...');
  
  // Surveillance continue
  const monitor = setInterval(async () => {
    try {
      const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/unified-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
        },
        body: JSON.stringify({ mode: 'report', version: 'v1.0' })
      });
      
      if (response.ok) {
        const data = await response.json();
        const rate = data.report?.completionRate || 0;
        console.log(`⏰ ${new Date().toLocaleTimeString()} - Taux completion: ${rate}%`);
        
        if (rate >= 95) {
          console.log('🎉 COMPLETION TERMINÉE AVEC SUCCÈS !');
          clearInterval(monitor);
        }
      }
    } catch (e) {
      console.log('⚠️ Erreur surveillance:', e.message);
    }
  }, 60000);
  
}).catch(console.error);