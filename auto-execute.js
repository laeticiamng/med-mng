const script = document.createElement('script');
script.textContent = `
console.log('🚀 LANCEMENT DU PROCESSUS COMPLET AUTOMATIQUE');
console.log('📋 Phase 1: Extraction des 367 items EDN depuis UNESS');
console.log('🔍 Phase 2: Audit complet de la plateforme');

// Fonction d'exécution automatique
async function executeCompleteProcess() {
  try {
    // Phase 1: Extraction EDN
    console.log('⏳ Démarrage extraction EDN...');
    const extractionResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-uness', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({
        action: 'start',
        credentials: {
          username: 'laeticia.moto-ngane@etud.u-picardie.fr',
          password: 'Aiciteal1!'
        }
      })
    });

    const extractionData = await extractionResponse.json();
    
    if (extractionData.success) {
      console.log('✅ EXTRACTION TERMINÉE!');
      console.log('📊 Stats:', extractionData.stats);
      
      // Phase 2: Audits
      const auditTypes = ['database', 'code', 'ui_consistency', 'performance'];
      
      for (const auditType of auditTypes) {
        console.log(\`🔍 Audit \${auditType}...\`);
        
        const auditResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/audit-system', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
          },
          body: JSON.stringify({
            auditType: auditType,
            autoFix: true
          })
        });

        const auditData = await auditResponse.json();
        console.log(\`\${auditData.success ? '✅' : '❌'} Audit \${auditType}: \${auditData.success ? 'SUCCÈS' : 'ÉCHEC'}\`);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log('🎉 PROCESSUS COMPLET TERMINÉ AVEC SUCCÈS!');
      alert('✅ Processus complet terminé! Extraction + Audits réalisés avec succès.');
      
    } else {
      console.error('❌ ÉCHEC EXTRACTION:', extractionData.error);
      alert('❌ Erreur lors de l\\'extraction: ' + extractionData.error);
    }
    
  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error);
    alert('💥 Erreur critique: ' + error.message);
  }
}

// Démarrage automatique
executeCompleteProcess();
`;

document.head.appendChild(script);
console.log('📋 Script d\\'exécution automatique injecté et démarré!');