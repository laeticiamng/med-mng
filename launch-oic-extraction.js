// ✅ SÉCURISÉ: Script extraction OIC avec variables d'environnement
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ ERREUR SÉCURITÉ: SUPABASE_ANON_KEY manquant dans les variables d\'environnement');
  process.exit(1);
}

console.log('🚀 Lancement sécurisé de l\'extraction complète des objectifs OIC...');

fetch(`${SUPABASE_URL}/functions/v1/extract-edn-objectifs`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    action: 'start'
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Réponse de l\'extraction:', data);
  if (data.success) {
    console.log(`🎉 Extraction lancée avec succès!`);
    console.log(`📊 Session ID: ${data.session_id}`);
    console.log(`🔍 Suivi du progrès: ${data.status_url}`);
  } else {
    console.error('❌ Erreur:', data.error);
  }
})
.catch(error => {
  console.error('💥 Erreur critique:', error);
});

console.log('⏳ Extraction lancée avec authentification CAS...');
console.log('📊 Vérifiez les logs Edge Function pour le diagnostic détaillé');