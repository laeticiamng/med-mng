// 🔥 DÉCLENCHEMENT DIRECT EXTRACTION OIC
console.log('🔥 DÉCLENCHEMENT DIRECT - Tentative de lancement immédiat...');

async function directLaunch() {
  try {
    console.log('📡 Appel direct de fix-oic-truncated-content...');
    
    // Appel direct de la fonction de correction
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/fix-oic-truncated-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({})
    });
    
    console.log(`📊 Statut réponse: ${response.status}`);
    console.log(`⏰ Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ EXTRACTION DÉMARRÉE !');
      console.log('🎯 Résultat:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.error('❌ Erreur extraction:', response.status, errorText);
      
      // Tentative avec unified-extract en cas d'échec
      console.log('\n🔄 Tentative avec unified-extract...');
      const backupResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/unified-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
        },
        body: JSON.stringify({ mode: 'batch', version: 'v1.0' })
      });
      
      console.log(`📊 Statut backup: ${backupResponse.status}`);
      if (backupResponse.ok) {
        const backupData = await backupResponse.json();
        console.log('✅ UNIFIED-EXTRACT LANCÉ:', JSON.stringify(backupData, null, 2));
      } else {
        const backupError = await backupResponse.text();
        console.error('❌ Erreur unified-extract:', backupError);
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur critique:', error);
  }
}

// Lancement immédiat avec surveillance
directLaunch().then(() => {
  console.log('\n🔄 SURVEILLANCE ACTIVE...');
  
  let checks = 0;
  const maxChecks = 10; // 10 minutes max
  
  const monitor = setInterval(async () => {
    checks++;
    console.log(`⏰ Vérification ${checks}/${maxChecks} - ${new Date().toLocaleTimeString()}`);
    
    try {
      // Test simple de statut
      const testResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/rest/v1/backup_oic_competences?select=count&char_length(description)=gt.1000&extraction_status=eq.completed', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
        }
      });
      
      if (testResponse.ok) {
        const data = await testResponse.json();
        const completedCount = data.length > 0 ? data[0].count : 0;
        const rate = Math.round((completedCount / 4872) * 100 * 10) / 10;
        console.log(`📈 Progrès: ${completedCount}/4872 compétences (${rate}%)`);
        
        if (completedCount > 0) {
          console.log('🎉 EXTRACTION EN COURS - Données mises à jour !');
          if (rate >= 50) {
            console.log('🏆 EXTRACTION AVANCÉE - Plus de 50% complété !');
            clearInterval(monitor);
          }
        }
      }
      
      if (checks >= maxChecks) {
        console.log('⏰ Fin de surveillance - Vérifiez manuellement le statut');
        clearInterval(monitor);
      }
      
    } catch (e) {
      console.log('⚠️ Erreur surveillance:', e.message);
    }
  }, 60000);
  
}).catch(console.error);