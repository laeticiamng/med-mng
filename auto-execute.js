const script = document.createElement('script');
script.textContent = `
console.log('🚀 LANCEMENT EXTRACTION COMPLÈTE EDN-OBJECTIFS');
console.log('📋 Extraction de 4,872 compétences OIC depuis LISA UNESS');
console.log('🎯 Authentification CAS automatique');

// Fonction d'extraction automatique des objectifs
async function executeObjectifsExtraction() {
  try {
    console.log('⏳ Démarrage extraction des objectifs EDN...');
    const extractionResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({
        action: 'start'
      })
    });

    if (!extractionResponse.ok) {
      throw new Error(\`HTTP \${extractionResponse.status}: \${extractionResponse.statusText}\`);
    }

    const extractionData = await extractionResponse.json();
    
    if (extractionData.success) {
      console.log('✅ EXTRACTION DES OBJECTIFS DÉMARRÉE!');
      console.log('📊 Session ID:', extractionData.session_id);
      console.log('🔗 Message:', extractionData.message);
      
      console.log('');
      console.log('🎯 EXTRACTION EN COURS:');
      console.log('- 4,872 compétences OIC à extraire');
      console.log('- 25 pages depuis LISA UNESS');
      console.log('- Format OIC-XXX-YY-R-ZZ');
      console.log('- Sauvegarde temps réel en base');
      
      console.log('');
      console.log('⏱️ DURÉE ESTIMÉE: 15-20 minutes');
      console.log('📈 SUIVI: /admin/extract-objectifs');
      console.log('');
      console.log('🔄 L\\'extraction continue en arrière-plan...');
      
      alert('✅ Extraction des 4,872 objectifs EDN démarrée avec succès!\\n\\n📊 Session: ' + extractionData.session_id + '\\n⏱️ Durée estimée: 15-20 minutes\\n📈 Suivez le progrès sur /admin/extract-objectifs');
      
    } else {
      console.error('❌ ÉCHEC EXTRACTION:', extractionData.error);
      alert('❌ Erreur lors de l\\'extraction: ' + extractionData.error);
    }
    
    } catch (error) {
      console.error('💥 ERREUR CRITIQUE:', error);
      alert('💥 Erreur critique: ' + error.message);
    }
  }

// Démarrage automatique immédiat
executeObjectifsExtraction();
`;

document.head.appendChild(script);
console.log('📋 Script d\\'exécution automatique injecté et démarré!');