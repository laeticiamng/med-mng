// 🚀 Lancement via Edge Function Supabase (Alternative à GitHub Actions)
console.log('🔧 ALTERNATIVE À GITHUB ACTIONS : Edge Function Supabase');
console.log('======================================================');

fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/oic-readme-extraction', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
  },
  body: JSON.stringify({ action: 'extract_all_readme' })
})
.then(response => {
  console.log('📊 Statut HTTP:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ EXTRACTION TERMINÉE !');
  console.log('📈 Résultats:', data);
  
  if (data.success) {
    console.log(`🎯 Pages extraites: ${data.summary?.total_extracted || 'N/A'}`);
    console.log(`📊 Taux de complétude: ${data.summary?.completeness_pct || 'N/A'}%`);
    console.log(`❌ Erreurs: ${data.summary?.total_errors || 0}`);
    console.log(`⚡ Méthode: ${data.summary?.extraction_method || 'Edge Function'}`);
  } else {
    console.error('❌ Erreur:', data.error);
  }
})
.catch(error => {
  console.error('💥 Erreur critique:', error);
});

console.log('⚡ Extraction Edge Function lancée (alternative GitHub Actions)');
console.log('📊 Suivi en temps réel dans les logs Supabase...');