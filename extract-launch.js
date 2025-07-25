// ✅ SÉCURISÉ: Script extraction EDN avec variables d'environnement
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const CAS_USERNAME = process.env.CAS_USERNAME;
const CAS_PASSWORD = process.env.CAS_PASSWORD;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ ERREUR SÉCURITÉ: SUPABASE_ANON_KEY manquant dans les variables d\'environnement');
  process.exit(1);
}

if (!CAS_USERNAME || !CAS_PASSWORD) {
  console.error('❌ ERREUR SÉCURITÉ: CAS_USERNAME et CAS_PASSWORD requis dans les variables d\'environnement');
  process.exit(1);
}

console.log('🚀 Lancement sécurisé de l\'extraction des 367 items EDN...');

fetch(`${SUPABASE_URL}/functions/v1/extract-edn-uness`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    action: 'start',
    credentials: {
      username: CAS_USERNAME,
      password: CAS_PASSWORD
    }
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Réponse de l\'extraction:', data);
  if (data.success) {
    console.log(`🎉 Extraction lancée avec succès!`);
    console.log(`📊 Statistiques:`, data.stats);
  } else {
    console.error('❌ Erreur:', data.error);
  }
})
.catch(error => {
  console.error('💥 Erreur critique:', error);
});

console.log('⏳ Extraction en cours... Cela peut prendre 10-15 minutes pour traiter les 367 items.');
console.log('📊 Vous pouvez suivre le progrès sur: /admin/extract-edn');