// Déclenchement direct via Edge Function
console.log('🚀 DÉCLENCHEMENT EXTRACTION OIC IMMÉDIATE');
console.log('==========================================');
console.log(`📅 ${new Date().toLocaleString('fr-FR')}`);
console.log('');

const triggerExtraction = async () => {
  try {
    console.log('🌐 Connexion à l\'Edge Function auto-extract-oic...');
    
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/auto-extract-oic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({ 
        action: 'immediate_extraction',
        source: 'manual_trigger_now',
        force: true 
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ EXTRACTION DÉMARRÉE AVEC SUCCÈS !');
      console.log(`🆔 Session: ${result.session_id || 'automatique'}`);
      console.log('🤖 Mode: Surveillance automatique activée');
      console.log('');
      console.log('📊 SURVEILLANCE EN COURS...');
      console.log('============================');
      
      // Afficher les liens utiles
      console.log('🔗 LIENS DE SURVEILLANCE:');
      console.log('   📱 Edge Functions: https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/auto-extract-oic/logs');
      console.log('   💾 Table OIC: https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/editor');
      console.log('   📊 GitHub Actions: https://github.com/laeticiamng/med-mng/actions');
      console.log('');
      console.log('⏰ Durée estimée: 15-30 minutes pour 4,872 compétences');
      console.log('🎯 L\'extraction se déroule maintenant en AUTONOMIE COMPLÈTE');
      console.log('');
      console.log('📋 Prochaines étapes automatiques:');
      console.log('   1. 🔐 Authentification CAS automatique');
      console.log('   2. 📡 Extraction via API MediaWiki'); 
      console.log('   3. 🧠 Parsing intelligent des contenus');
      console.log('   4. 💾 Mise à jour table backup_oic_competences');
      console.log('   5. 📊 Génération rapport de qualité');
      console.log('');
      console.log('✨ AUCUNE INTERVENTION REQUISE - Système 100% autonome !');
      
    } else {
      console.error('❌ ERREUR:', result.error || 'Échec du déclenchement');
      console.log('');
      console.log('🔧 SOLUTIONS ALTERNATIVES:');
      console.log('1. 🌐 GitHub Actions manuel:');
      console.log('   https://github.com/laeticiamng/med-mng/actions/workflows/weekly-oic-extraction.yml');
      console.log('2. 🖥️ Script local:');
      console.log('   node extract-oic-competences.cjs');
      console.log('3. 🔄 Réessayer dans 5 minutes');
    }
    
  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error.message);
    console.log('');
    console.log('🆘 PROCÉDURES DE SECOURS:');
    console.log('1. 🔄 Réessayer : node scripts/trigger-immediate-extraction.js');
    console.log('2. 🌐 GitHub Actions : https://github.com/laeticiamng/med-mng/actions');
    console.log('3. 💬 Support : Vérifier les logs Supabase');
  }
};

// Démarrer immédiatement
triggerExtraction();