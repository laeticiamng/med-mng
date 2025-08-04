// Diagnostic Edge Function - Test simple
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEdgeFunction() {
  console.log('🔍 Test de l\'Edge Function generate-all-lyrics...\n');
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-all-lyrics', {
      body: { test: true }
    });
    
    if (error) {
      console.log('❌ Erreur Edge Function:');
      console.log('- Message:', error.message);
      console.log('- Context:', error.context);
      console.log('- Details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Edge Function fonctionne!');
      console.log('- Réponse:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('❌ Erreur catch:');
    console.log('- Type:', err.constructor.name);
    console.log('- Message:', err.message);
    console.log('- Stack:', err.stack);
  }
}

// Test des Edge Functions disponibles
async function listFunctions() {
  console.log('\n📋 Test de connectivité générale...');
  
  try {
    // Test simple de ping
    const { data, error } = await supabase.functions.invoke('hello-world', {
      body: { ping: true }
    });
    
    if (error) {
      console.log('⚠️  Aucune Edge Function trouvée ou problème de connectivité');
    } else {
      console.log('✅ Connectivité Edge Functions OK');
    }
  } catch (err) {
    console.log('❌ Problème de connectivité Edge Functions');
  }
}

async function main() {
  await testEdgeFunction();
  await listFunctions();
  
  console.log('\n🎯 DIAGNOSTIC:');
  console.log('1. Vérifiez que l\'Edge Function "generate-all-lyrics" est bien déployée');
  console.log('2. Vérifiez les logs Supabase pour plus de détails');
  console.log('3. L\'erreur "non-2xx status code" indique un crash/erreur interne');
  console.log('\n💡 Solution recommandée:');
  console.log('- Redéployez l\'Edge Function');
  console.log('- Vérifiez les dépendances dans le code de la fonction');
  console.log('- Ajoutez des logs de debug dans la fonction');
}

main().catch(console.error);