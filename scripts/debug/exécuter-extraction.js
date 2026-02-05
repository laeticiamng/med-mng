// 🤖 EXTRACTION AUTONOME - Aucune intervention manuelle requise
console.log('🚀 DÉMARRAGE EXTRACTION AUTONOME - 4,872 compétences OIC');
console.log('⚡ Mode autonome activé - surveillance automatique');

const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

// État de l'extraction
let sessionId = null;
let isRunning = false;
let totalExtracted = 0;
let startTime = Date.now();

// Fonction utilitaire pour les requêtes
async function callExtraction(action, data = {}) {
  try {
    const response = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_TOKEN
      },
      body: JSON.stringify({ action, ...data })
    });
    return await response.json();
  } catch (error) {
    console.error(`❌ Erreur requête ${action}:`, error);
    return { error: error.message };
  }
}

// Affichage du progrès
function displayProgress(status) {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const percentage = Math.round((status.items_extracted / 4872) * 100);
  
  console.clear();
  console.log('🤖 EXTRACTION AUTONOME EN COURS');
  console.log('================================');
  console.log(`📊 Progrès: ${status.items_extracted}/4872 (${percentage}%)`);
  console.log(`⏱️  Temps écoulé: ${elapsed}s`);
  console.log(`📈 Statut: ${status.status}`);
  console.log(`🔄 Page actuelle: ${status.page_number}/${status.total_pages || 25}`);
  
  // Barre de progression ASCII
  const barLength = 30;
  const filledLength = Math.floor((percentage / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  console.log(`🔲 [${bar}] ${percentage}%`);
  
  if (status.last_activity) {
    const lastActivity = new Date(status.last_activity).toLocaleTimeString();
    console.log(`🕐 Dernière activité: ${lastActivity}`);
  }
}

// Démarrage de l'extraction
async function startExtraction() {
  console.log('🎯 Lancement de l\'extraction...');
  
  const result = await callExtraction('start');
  
  if (result.success) {
    sessionId = result.session_id;
    isRunning = true;
    console.log(`✅ Extraction démarrée - Session: ${sessionId}`);
    console.log('🔄 Début de la surveillance automatique...');
    
    // Démarrer la surveillance
    monitorProgress();
  } else {
    console.error('💥 Échec du démarrage:', result.error);
    process.exit(1);
  }
}

// Surveillance du progrès
async function monitorProgress() {
  if (!isRunning || !sessionId) return;
  
  const status = await callExtraction('status', { session_id: sessionId });
  
  if (status.error) {
    console.error('❌ Erreur surveillance:', status.error);
    setTimeout(monitorProgress, 10000); // Réessayer dans 10s
    return;
  }
  
  displayProgress(status);
  totalExtracted = status.items_extracted || 0;
  
  // Vérifier si terminé
  if (status.status === 'termine') {
    await handleCompletion();
    return;
  }
  
  if (status.status === 'erreur') {
    console.error('💥 EXTRACTION ÉCHOUÉE:', status.error_message);
    isRunning = false;
    return;
  }
  
  // Continuer la surveillance (intervalle adaptatif)
  const interval = totalExtracted > 0 ? 10000 : 5000; // 10s si progrès, 5s sinon
  setTimeout(monitorProgress, interval);
}

// Gestion de la fin d'extraction
async function handleCompletion() {
  isRunning = false;
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  
  console.log('\n🎉 EXTRACTION TERMINÉE AVEC SUCCÈS !');
  console.log('=====================================');
  console.log(`✅ Total extrait: ${totalExtracted}/4872 compétences`);
  console.log(`⏱️  Temps total: ${elapsed}s (${Math.floor(elapsed/60)}min ${elapsed%60}s)`);
  console.log(`📊 Taux de réussite: ${Math.round((totalExtracted/4872)*100)}%`);
  
  // Générer le rapport final
  console.log('\n📋 Génération du rapport final...');
  const rapport = await callExtraction('rapport');
  
  if (rapport.error) {
    console.error('❌ Erreur génération rapport:', rapport.error);
  } else {
    console.log('\n📊 RAPPORT FINAL:');
    console.log('=================');
    console.log(`📚 Compétences extraites: ${rapport.total_competences_extraites}`);
    console.log(`🎯 Compétences attendues: ${rapport.total_competences_attendues}`);
    console.log(`📈 Complétude globale: ${rapport.completude_globale}%`);
    console.log(`🏷️  Items couverts: ${rapport.items_ern_couverts}`);
    
    if (rapport.repartition_par_item && rapport.repartition_par_item.length > 0) {
      console.log('\n📋 Répartition par item (top 10):');
      rapport.repartition_par_item.slice(0, 10).forEach(item => {
        console.log(`  IC-${item.item_parent}: ${item.competences_extraites} compétences`);
      });
    }
  }
  
  console.log('\n🏁 EXTRACTION AUTONOME TERMINÉE - Mission accomplie !');
}

// Gestion des signaux système
process.on('SIGINT', () => {
  console.log('\n⚠️  Arrêt demandé - Nettoyage en cours...');
  isRunning = false;
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Arrêt système - Nettoyage en cours...');
  isRunning = false;
  process.exit(0);
});

// Point d'entrée principal
async function main() {
  console.log('🎬 Initialisation du processus autonome...');
  console.log('🔧 Configuration: Authentification CAS + Surveillance auto');
  console.log('⏰ Timeout maximum: 30 minutes');
  
  // Timeout de sécurité
  setTimeout(() => {
    if (isRunning) {
      console.log('\n⏰ TIMEOUT - Arrêt automatique après 30 minutes');
      console.log(`📊 Résultats partiels: ${totalExtracted} compétences extraites`);
      isRunning = false;
      process.exit(0);
    }
  }, 30 * 60 * 1000);
  
  // Démarrer l'extraction
  await startExtraction();
}

// Lancement immédiat
console.log('🚨 LANCEMENT AUTOMATIQUE DANS 3 SECONDES...');
setTimeout(main, 3000);