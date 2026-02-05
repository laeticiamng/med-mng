// ✅ SÉCURISÉ: Déclencheur immédiat avec variables d'environnement
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ ERREUR SÉCURITÉ: SUPABASE_ANON_KEY manquant dans les variables d\'environnement');
  process.exit(1);
}

console.log('⚡ DÉCLENCHEMENT SÉCURISÉ DE L\'EXTRACTION AUTONOME');

// Appel sécurisé de la fonction d'auto-extraction
fetch(`${SUPABASE_URL}/functions/v1/auto-extract-oic`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    manual_trigger: true,
    timestamp: new Date().toISOString()
  })
})
.then(response => response.json())
.then(data => {
  console.log('🎯 RÉPONSE DU DÉCLENCHEUR:', data);
  
  if (data.success) {
    console.log('✅ EXTRACTION AUTONOME DÉMARRÉE !');
    console.log(`📊 Session ID: ${data.session_id}`);
    console.log('🔄 Surveillance automatique: ACTIVE');
    console.log('');
    console.log('🤖 Le système va maintenant :');
    console.log('   ✓ Authentifier via CAS automatiquement');
    console.log('   ✓ Extraire les 4,872 compétences OIC');
    console.log('   ✓ Surveiller le progrès toutes les 15s');
    console.log('   ✓ Générer le rapport final automatiquement');
    console.log('');
    console.log('⏰ Durée estimée: 15-30 minutes');
    console.log('📋 Résultats disponibles dans les logs Supabase');
  } else {
    console.error('❌ ÉCHEC DU DÉCLENCHEMENT:', data.error);
  }
})
.catch(error => {
  console.error('💥 ERREUR CRITIQUE:', error);
});

console.log('⚡ Déclenchement envoyé - Vérifiez les logs Edge Functions');
console.log('🔗 Logs: https://supabase.com/dashboard/project/1b544bf9-a0a9-40d7-aa20-d14835dcd1a3/functions/auto-extract-oic/logs');