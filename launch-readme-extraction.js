// 🚀 Lanceur de l'extraction OIC selon README-OIC-EXTRACTION.md
console.log('🎫 TICKET 4-bis — Extraction API-first des 4,872 objectifs EDN');
console.log('===============================================================');

// Configuration basée sur votre README
const config = {
  SUPABASE_URL: 'https://yaincoxihiqdksxgrsrk.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU',
  // Vos identifiants CAS stockés dans Supabase
  CAS_USER: 'laeticia.moto-ngane@etud.u-picardie.fr'
};

async function launchREADMEExtraction() {
  console.log('🔍 Lancement de l\'extraction selon la méthode README...');
  
  try {
    // Test d'accès public à l'API selon votre doc
    console.log('🔍 Test d\'accès public à l\'API MediaWiki...');
    
    const testUrl = 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=1&format=json&origin=*';
    const testResponse = await fetch(testUrl);
    
    if (testResponse.ok) {
      console.log('✅ API MediaWiki publique accessible!');
      
      // Lancer l'extraction complète via votre méthode
      const extractionResponse = await fetch(`${config.SUPABASE_URL}/functions/v1/complete-oic-competences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'extract_all_api_first',
          use_readme_method: true,
          batch_size: 50, // Selon README: batches de 50 pages
          endpoints: {
            listing: '/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=500&format=json',
            content: '/lisa/2025/api.php?action=query&prop=revisions&rvprop=content|timestamp&format=json&formatversion=2'
          }
        })
      });

      const result = await extractionResponse.json();
      
      if (result.success) {
        console.log('✅ Extraction API-first lancée avec succès !');
        console.log(`📊 Pages à traiter: 4,872 objectifs EDN`);
        console.log(`🔄 Méthode: Batches de 50 pages avec parsing selon README`);
        console.log(`📈 Progrès: ${result.progress || 'En cours...'}`)
        
        // Monitoring selon README
        monitorExtractionProgress();
        
      } else {
        console.error('❌ Erreur lors du lancement:', result.error);
        
        // Fallback: utilisation du script local
        console.log('🔄 Fallback: Tentative avec script local...');
        console.log('💡 Alternative: Exécutez directement src/scripts/scrape_oic_complete.ts');
      }
      
    } else {
      console.log('⚠️ API publique inaccessible - authentification CAS requise');
      
      // Utiliser vos identifiants CAS stockés
      const casResponse = await fetch(`${config.SUPABASE_URL}/functions/v1/extract-edn-objectifs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'start',
          use_stored_credentials: true,
          cas_user: config.CAS_USER,
          extraction_method: 'api_first_readme'
        })
      });

      const casResult = await casResponse.json();
      console.log('🔐 Extraction CAS lancée:', casResult);
    }

  } catch (error) {
    console.error('💥 Erreur critique:', error);
    console.log('\n🛠 Solutions de dépannage selon README:');
    console.log('1. Vérifier la connexion réseau et les credentials CAS');
    console.log('2. Examiner les contraintes de la table et permissions RLS');
    console.log('3. Relancer l\'extraction avec: deno run --allow-net src/scripts/scrape_oic_complete.ts');
  }
}

function monitorExtractionProgress() {
  console.log('📊 Démarrage du monitoring...');
  
  const checkInterval = setInterval(async () => {
    try {
      const statusResponse = await fetch(`${config.SUPABASE_URL}/rest/v1/backup_oic_competences?select=count()&extraction_status=eq.completed`, {
        headers: {
          'Authorization': `Bearer ${config.SUPABASE_ANON_KEY}`,
          'apikey': config.SUPABASE_ANON_KEY
        }
      });
      
      const data = await statusResponse.json();
      const completed = data?.[0]?.count || 0;
      const progressPct = ((completed / 4872) * 100).toFixed(2);
      
      console.log(`📊 Progrès: ${completed}/4,872 compétences (${progressPct}%)`);
      
      if (completed >= 4800) { // Seuil de complétude selon README
        clearInterval(checkInterval);
        console.log('🎉 Extraction quasiment terminée !');
        console.log('📈 Génération du rapport de complétude...');
        generateFinalReport();
      }
      
    } catch (error) {
      console.error('⚠️ Erreur monitoring:', error);
    }
  }, 10000); // Check toutes les 10 secondes selon README
}

async function generateFinalReport() {
  try {
    const reportResponse = await fetch(`${config.SUPABASE_URL}/functions/v1/complete-oic-competences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ action: 'generate_report' })
    });

    const report = await reportResponse.json();
    console.log('\n📊 RAPPORT FINAL DE COMPLÉTUDE');
    console.log('==============================');
    console.log(JSON.stringify(report, null, 2));
    
  } catch (error) {
    console.error('Erreur génération rapport:', error);
  }
}

// Lancement selon la méthode README
launchREADMEExtraction();