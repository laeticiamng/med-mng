// 🚀 EXÉCUTION IMMÉDIATE - Version Deno dans Edge Function
console.log('🔥 ESSAI IMMÉDIAT - EXTRACTION DENO DANS EDGE FUNCTION');
console.log('================================================');

fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/deno-oic-extractor', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
  },
  body: JSON.stringify({ action: 'extract_with_deno_now' })
})
.then(response => {
  console.log('📊 Statut HTTP:', response.status);
  return response.json();
})
.then(data => {
  console.log('🎉 EXTRACTION DENO TERMINÉE !');
  console.log('📈 Résultats complets:', data);
  
  if (data.success) {
    console.log(`🎯 Compétences extraites: ${data.totalExtracted || 'N/A'}`);
    console.log(`📊 Taux de complétude: ${data.completionRate || 'N/A'}`);
    console.log(`⏱️ Durée: ${data.duration || 'N/A'}`);
    console.log(`🔧 Méthode: ${data.method || 'Deno Edge Function'}`);
    console.log(`❌ Erreurs: ${data.totalErrors || 0}`);
  } else {
    console.error('❌ Erreur:', data.error);
  }
})
.catch(error => {
  console.error('💥 Erreur critique:', error);
});

console.log('⚡ EXTRACTION DENO LANCÉE - EXÉCUTION EN COURS...');
console.log('📊 Cette version utilise Deno natif dans une Edge Function Supabase !');