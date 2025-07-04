// Lancement autonome de l'extraction OIC
console.log('🚀 LANCEMENT AUTONOME - Extraction des 4,872 compétences OIC');

async function runExtraction() {
  try {
    // 1. Lancer l'extraction
    console.log('⚡ Démarrage de l\'extraction...');
    const startResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({ action: 'start' })
    });

    const startData = await startResponse.json();
    console.log('📊 Réponse démarrage:', startData);

    if (!startData.success) {
      console.error('❌ Échec démarrage:', startData.error);
      return;
    }

    const sessionId = startData.session_id;
    console.log(`✅ Extraction démarrée - Session: ${sessionId}`);

    // 2. Surveillance du progrès
    const checkInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
          },
          body: JSON.stringify({ action: 'status', session_id: sessionId })
        });

        const statusData = await statusResponse.json();
        console.log(`📈 Progrès: ${statusData.items_extracted || 0}/4872 - Status: ${statusData.status}`);

        if (statusData.status === 'termine' || statusData.status === 'erreur') {
          clearInterval(checkInterval);
          
          if (statusData.status === 'termine') {
            console.log(`🎉 EXTRACTION TERMINÉE ! ${statusData.items_extracted} compétences extraites`);
            
            // Générer le rapport final
            setTimeout(async () => {
              const reportResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
                },
                body: JSON.stringify({ action: 'rapport' })
              });
              
              const reportData = await reportResponse.json();
              console.log('📋 RAPPORT FINAL:', reportData);
            }, 2000);
            
          } else {
            console.error('💥 EXTRACTION ÉCHOUÉE:', statusData.error_message);
          }
        }
      } catch (error) {
        console.error('❌ Erreur vérification statut:', error);
      }
    }, 15000); // Vérifier toutes les 15 secondes

    // Timeout de sécurité (30 minutes)
    setTimeout(() => {
      clearInterval(checkInterval);
      console.log('⏰ Timeout - Arrêt de la surveillance');
    }, 30 * 60 * 1000);

  } catch (error) {
    console.error('💥 Erreur critique:', error);
  }
}

// Lancer l'extraction
runExtraction();