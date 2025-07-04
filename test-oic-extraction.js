// Test et lancement de l'extraction OIC
// Utilise les credentials fournis pour extraire les 4,872 compétences

async function testOICExtraction() {
  const baseUrl = 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`
  };

  console.log('🧪 ÉTAPE 1: Test d\'insertion des données...');
  
  // 1. Test d'insertion
  try {
    const testResponse = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'insert_test_data' })
    });
    
    const testResult = await testResponse.json();
    console.log('✅ Test d\'insertion:', testResult);
    
    if (!testResult.success) {
      console.error('❌ Test d\'insertion échoué:', testResult);
      return;
    }
  } catch (error) {
    console.error('❌ Erreur test insertion:', error);
    return;
  }

  console.log('\n🚀 ÉTAPE 2: Lancement de l\'extraction complète...');
  
  // 2. Lancer l'extraction complète
  try {
    const extractionResponse = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'start' })
    });
    
    const extractionResult = await extractionResponse.json();
    console.log('🎯 Extraction lancée:', extractionResult);
    
    if (extractionResult.session_id) {
      console.log(`📊 Session ID: ${extractionResult.session_id}`);
      console.log('⏰ Monitoring du progrès...');
      
      // 3. Monitor le progrès
      await monitorProgress(baseUrl, headers, extractionResult.session_id);
    }
  } catch (error) {
    console.error('❌ Erreur lancement extraction:', error);
  }
}

async function monitorProgress(baseUrl, headers, sessionId) {
  let attempts = 0;
  const maxAttempts = 60; // 30 minutes max
  
  while (attempts < maxAttempts) {
    try {
      const statusResponse = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          action: 'status', 
          session_id: sessionId 
        })
      });
      
      const status = await statusResponse.json();
      console.log(`📈 Progrès [${new Date().toLocaleTimeString()}]:`, {
        status: status.status,
        items_extracted: status.items_extracted,
        page_number: status.page_number,
        total_expected: status.total_expected
      });
      
      if (status.status === 'termine') {
        console.log('🎉 EXTRACTION TERMINÉE !');
        await generateFinalReport(baseUrl, headers);
        break;
      } else if (status.status === 'erreur') {
        console.error('❌ ERREUR LORS DE L\'EXTRACTION:', status.error_message);
        break;
      }
      
      // Attendre 30 secondes avant le prochain check
      await new Promise(resolve => setTimeout(resolve, 30000));
      attempts++;
      
    } catch (error) {
      console.error('❌ Erreur monitoring:', error);
      attempts++;
    }
  }
}

async function generateFinalReport(baseUrl, headers) {
  console.log('\n📊 GÉNÉRATION DU RAPPORT FINAL...');
  
  try {
    const reportResponse = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'rapport' })
    });
    
    const report = await reportResponse.json();
    
    console.log('\n🎯 RAPPORT FINAL D\'EXTRACTION OIC');
    console.log('==========================================');
    console.log(`✅ Compétences extraites: ${report.total_competences_extraites}`);
    console.log(`🎯 Compétences attendues: ${report.total_competences_attendues}`);
    console.log(`📈 Completude globale: ${report.completude_globale}%`);
    console.log(`📚 Items EDN couverts: ${report.items_ern_couverts}`);
    
    // Vérification finale dans la base
    console.log('\n🔍 VÉRIFICATION FINALE...');
    // Cette partie serait faite par une requête SQL séparée
    
  } catch (error) {
    console.error('❌ Erreur génération rapport:', error);
  }
}

// Lancer l'extraction
console.log('🚀 LANCEMENT DE L\'EXTRACTION OIC - 4,872 COMPÉTENCES');
console.log('=====================================================');
testOICExtraction().catch(error => {
  console.error('💥 Erreur fatale:', error);
});