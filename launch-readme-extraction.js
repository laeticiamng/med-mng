// 🎫 LANCEMENT EXTRACTION README - Implementation exacte du README-OIC-EXTRACTION.md
console.log('🚀 EXTRACTION SELON LE README - API-FIRST DES 4,872 OBJECTIFS EDN');
console.log('================================================================');
console.log('✅ Suit exactement le flux décrit dans README-OIC-EXTRACTION.md');
console.log('✅ Test API publique → Listing catégorie → Batches de 50 → Parsing → Insertion');
console.log('✅ Performance optimisée : ~100 requêtes API au lieu de 4,872');

fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/oic-readme-extraction', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
  },
  body: JSON.stringify({ action: 'extract_readme_method' })
})
.then(response => {
  console.log('📊 Statut HTTP:', response.status);
  return response.json();
})
.then(data => {
  console.log('🎉 EXTRACTION README TERMINÉE !');
  console.log('================================');
  console.log('📈 Résultats complets:', JSON.stringify(data, null, 2));
  
  if (data.success) {
    console.log(`🎯 Pages trouvées: ${data.summary.total_found || 'N/A'}`);
    console.log(`✅ Compétences extraites: ${data.summary.total_extracted || 'N/A'}`);
    console.log(`📊 Taux de complétude: ${data.summary.completeness_pct || 'N/A'}%`);
    console.log(`⏱️ Durée: ${data.summary.duration_seconds || 'N/A'}s`);
    console.log(`🚀 Performance: ${data.performance.pages_per_second || 'N/A'} pages/sec`);
    console.log(`❌ Erreurs: ${data.summary.total_errors || 0}`);
    console.log(`🎭 Méthode: ${data.method || 'README API-first'}`);
  } else {
    console.error('❌ Erreur:', data.error);
  }
})
.catch(error => {
  console.error('💥 Erreur critique:', error);
});

console.log('🎯 EXTRACTION README LANCÉE - FLUX OPTIMISÉ SELON DOCUMENTATION !');
console.log('📊 Cette version suit exactement l\'architecture décrite dans le README !');