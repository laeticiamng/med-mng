// Script de lancement immédiat pour les extractions autonomes
// À exécuter dans la console du navigateur

console.log('🚀 SYSTÈME D\'EXTRACTION AUTONOME UNESS');
console.log('════════════════════════════════════════');
console.log('📊 Prêt à extraire toutes les données UNESS');
console.log('⚡ Mode: COMPLÈTEMENT AUTONOME');
console.log('');

// Import dynamique du script d'extraction
import('/src/scripts/auto-complete-extraction.ts').then(module => {
  console.log('✅ Module d\'extraction chargé');
  console.log('🎯 Lancement automatique en cours...');
}).catch(error => {
  console.error('❌ Erreur chargement module:', error);
  
  // Fallback: lancement direct via Supabase
  console.log('🔄 Fallback: Lancement direct...');
  launchDirectExtraction();
});

// Fonction de fallback
async function launchDirectExtraction() {
  // ⚠️ CLÉS DE TEST UNIQUEMENT - À remplacer par les vraies clés en production
  const supabaseUrl = 'https://sandbox-test.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TEST_KEY_DEV_SANDBOX_ONLY';
  
  const extractionTypes = [
    {
      type: 'edn',
      name: '📚 EDN (Items de connaissance)',
      config: { batch_size: 50, max_concurrent: 6 }
    },
    {
      type: 'oic', 
      name: '🎯 OIC (4,872 compétences)',
      config: { batch_size: 100, max_concurrent: 10 }
    },
    {
      type: 'ecos',
      name: '🏥 ECOS (Situations cliniques)', 
      config: { batch_size: 30, max_concurrent: 5 }
    }
  ];
  
  console.log('🚀 Lancement de toutes les extractions...');
  
  for (const extraction of extractionTypes) {
    try {
      console.log(`\n${extraction.name}`);
      console.log('─'.repeat(40));
      
      const response = await fetch(`${supabaseUrl}/functions/v1/extract-uness-enhanced`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'start',
          extraction_type: extraction.type,
          ...extraction.config
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${extraction.type.toUpperCase()} lancé`);
        console.log(`📊 Session: ${result.session_id}`);
        console.log(`⚙️ Config: ${extraction.config.batch_size} batch, ${extraction.config.max_concurrent} parallèle`);
      } else {
        console.error(`❌ Erreur ${extraction.type.toUpperCase()}:`, result);
      }
      
      // Pause entre les lancements
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error(`💥 Erreur critique ${extraction.type.toUpperCase()}:`, error);
    }
  }
  
  console.log('\n🎉 TOUTES LES EXTRACTIONS LANCÉES!');
  console.log('══════════════════════════════════════');
  console.log('📊 Les processus continuent en arrière-plan');
  console.log('🔍 Vérifiez les logs Supabase pour le suivi');
}

// Auto-lancement après 2 secondes
setTimeout(() => {
  console.log('⏰ Auto-lancement activé...');
}, 2000);