// ✅ SÉCURISÉ: Force start avec variables d'environnement
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ ERREUR SÉCURITÉ: SUPABASE_ANON_KEY manquant dans les variables d\'environnement');
  process.exit(1);
}

console.log('🚀 Démarrage sécurisé avec authentification...');

fetch(`${SUPABASE_URL}/functions/v1/auto-extract-oic`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({ force_immediate: true })
})
.then(r => r.json())
.then(data => console.log('🚀 FORCE START:', data))
.catch(e => console.error('💥 ERREUR:', e));

// Backup: extraction directe
setTimeout(() => {
  fetch(`${SUPABASE_URL}/functions/v1/extract-edn-objectifs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ action: 'start' })
  })
  .then(r => r.json())
  .then(data => console.log('🎯 BACKUP START:', data));
}, 2000);