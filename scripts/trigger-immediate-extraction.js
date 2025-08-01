#!/usr/bin/env node
// scripts/trigger-immediate-extraction.js
// Déclencheur d'extraction OIC immédiate via GitHub Actions

const { Octokit } = require('@octokit/rest');

async function triggerImmediateExtraction() {
  console.log('🚀 Déclenchement d\'une extraction OIC immédiate...');
  
  // Configuration GitHub
  const owner = 'laeticiamng';
  const repo = 'med-mng';
  const workflow_id = 'weekly-oic-extraction.yml';
  
  // Token GitHub (peut être configuré via variable d'environnement)
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.log('ℹ️ GITHUB_TOKEN non configuré - utilisation de méthode alternative...');
    await triggerViaEdgeFunction();
    return;
  }

  try {
    const octokit = new Octokit({
      auth: githubToken,
    });

    console.log('📡 Déclenchement du workflow GitHub Actions...');
    
    const response = await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id,
      ref: 'main',
      inputs: {
        force_extraction: 'true'  // Forcer l'extraction même si données récentes
      }
    });

    console.log('✅ Workflow déclenché avec succès !');
    console.log(`🔗 Voir le progrès: https://github.com/${owner}/${repo}/actions/workflows/${workflow_id}`);
    
    // Attendre quelques secondes puis afficher les derniers runs
    setTimeout(async () => {
      try {
        const runs = await octokit.rest.actions.listWorkflowRuns({
          owner,
          repo,
          workflow_id,
          per_page: 5
        });
        
        console.log('\n📊 Dernières exécutions:');
        runs.data.workflow_runs.slice(0, 3).forEach((run, i) => {
          console.log(`   ${i+1}. ${run.status} - ${run.created_at} - ${run.html_url}`);
        });
      } catch (error) {
        console.log('⚠️ Impossible de récupérer l\'état des runs');
      }
    }, 3000);

  } catch (error) {
    console.error('❌ Erreur déclenchement GitHub Actions:', error.message);
    console.log('🔄 Tentative via Edge Function...');
    await triggerViaEdgeFunction();
  }
}

// Alternative : déclencher via Edge Function existante
async function triggerViaEdgeFunction() {
  console.log('🌐 Déclenchement via Edge Function Supabase...');
  
  try {
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/auto-extract-oic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'}`
      },
      body: JSON.stringify({ 
        action: 'immediate_extraction',
        source: 'manual_trigger' 
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Extraction démarrée via Edge Function !');
      console.log(`🆔 Session ID: ${result.session_id || 'N/A'}`);
      console.log('🔗 Voir les logs Edge Function:', 'https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/auto-extract-oic/logs');
      
      // Monitoring automatique
      if (result.session_id) {
        console.log('📊 Surveillance automatique activée...');
        monitorExtraction(result.session_id);
      }
    } else {
      throw new Error(result.error || 'Réponse Edge Function invalide');
    }
    
  } catch (error) {
    console.error('❌ Erreur Edge Function:', error.message);
    console.log('\n🔧 SOLUTIONS ALTERNATIVES:');
    console.log('1. 🌐 Aller sur GitHub Actions et déclencher manuellement');
    console.log('   https://github.com/laeticiamng/med-mng/actions/workflows/weekly-oic-extraction.yml');
    console.log('2. 🖥️ Exécuter localement: node extract-oic-competences.cjs');
    console.log('3. 🔄 Réessayer dans quelques minutes');
  }
}

// Surveiller le progrès de l'extraction
async function monitorExtraction(sessionId) {
  let attempts = 0;
  const maxAttempts = 20; // 10 minutes max
  
  const monitor = setInterval(async () => {
    attempts++;
    
    try {
      const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'}`
        },
        body: JSON.stringify({ 
          action: 'status', 
          session_id: sessionId 
        })
      });
      
      const status = await response.json();
      
      console.log(`📊 Progression [${attempts}/${maxAttempts}]: ${status.items_extracted || 0}/4872 compétences - ${status.status || 'en cours'}`);
      
      if (status.status === 'termine') {
        console.log(`🎉 EXTRACTION TERMINÉE ! ${status.items_extracted} compétences extraites`);
        clearInterval(monitor);
        
        // Générer rapport final
        setTimeout(() => {
          generateFinalReport(sessionId);
        }, 2000);
        
      } else if (status.status === 'erreur') {
        console.log(`💥 EXTRACTION ÉCHOUÉE: ${status.error_message}`);
        clearInterval(monitor);
      } else if (attempts >= maxAttempts) {
        console.log('⏰ Monitoring arrêté après 10 minutes - extraction peut continuer en arrière-plan');
        console.log('🔗 Vérifier les logs: https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions');
        clearInterval(monitor);
      }
      
    } catch (error) {
      console.log(`⚠️ Erreur monitoring tentative ${attempts}: ${error.message}`);
      if (attempts >= maxAttempts) {
        clearInterval(monitor);
      }
    }
  }, 30000); // Vérifier toutes les 30 secondes
}

// Générer un rapport final
async function generateFinalReport(sessionId) {
  try {
    console.log('📋 Génération du rapport final...');
    
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-objectifs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'}`
      },
      body: JSON.stringify({ action: 'rapport' })
    });
    
    const report = await response.json();
    
    console.log('\n📊 RAPPORT FINAL:');
    console.log('==================');
    console.log(`📈 Compétences extraites: ${report.total_extracted || 'N/A'}`);
    console.log(`⏱️ Durée: ${report.duration || 'N/A'}`);
    console.log(`✅ Succès: ${report.success_rate || 'N/A'}%`);
    console.log(`💾 Stockage: ${report.storage_success ? 'OK' : 'ERREUR'}`);
    
    if (report.errors && report.errors.length > 0) {
      console.log(`❌ Erreurs: ${report.errors.length}`);
      report.errors.slice(0, 3).forEach((error, i) => {
        console.log(`   ${i+1}. ${error}`);
      });
    }
    
  } catch (error) {
    console.log('⚠️ Impossible de générer le rapport final:', error.message);
  }
}

// Afficher les instructions
function showInstructions() {
  console.log('\n📖 INSTRUCTIONS POUR SURVEILLANCE:');
  console.log('===================================');
  console.log('🔗 GitHub Actions: https://github.com/laeticiamng/med-mng/actions');
  console.log('🔗 Logs Edge Functions: https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions');
  console.log('🔗 Table OIC: https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/editor');
  console.log('\n⏰ L\'extraction peut prendre 15-30 minutes pour 4,872 compétences');
  console.log('📊 Surveillance automatique activée pendant 10 minutes');
}

// Exécution principale
async function main() {
  console.log('🎯 DÉCLENCHEMENT EXTRACTION OIC IMMÉDIATE');
  console.log('==========================================');
  console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
  console.log('🤖 Mode: Autonome complet');
  console.log('🎯 Objectif: 4,872 compétences OIC');
  console.log('');
  
  await triggerImmediateExtraction();
  showInstructions();
}

// Gestion des erreurs non catchées
process.on('unhandledRejection', (error) => {
  console.error('💥 Erreur non gérée:', error.message);
  process.exit(1);
});

// Exécuter
main().catch(console.error);

module.exports = { triggerImmediateExtraction };