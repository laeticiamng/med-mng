// Déclenchement autonome immédiat de l'extraction OIC
console.log('🚀 DÉCLENCHEMENT AUTONOME IMMÉDIAT');
console.log('==================================');
console.log(`📅 ${new Date().toLocaleString('fr-FR')}`);
console.log('');

const triggerAutonomousExtraction = async () => {
  try {
    console.log('⚡ Démarrage de l\'extraction autonome...');
    
    const response = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/auto-extract-oic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({ 
        action: 'immediate_extraction',
        source: 'autonomous_trigger',
        force: true 
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('🎉 EXTRACTION AUTONOME DÉMARRÉE !');
      console.log(`🆔 Session: ${result.session_id}`);
      console.log('📊 Surveillance automatique: ACTIVE');
      console.log('');
      console.log('🤖 LE SYSTÈME FONCTIONNE EN AUTONOMIE TOTALE');
      console.log('=============================================');
      console.log('');
      console.log('📋 PROCESSUS AUTOMATIQUE:');
      console.log('  1. ✅ Authentification (simulée)');
      console.log('  2. 🔄 Extraction 4,872 compétences OIC');
      console.log('  3. 💾 Mise à jour table backup_oic_competences');
      console.log('  4. 📊 Surveillance temps réel (15s)');
      console.log('  5. 📋 Rapport final automatique');
      console.log('');
      console.log('🔗 SURVEILLANCE TEMPS RÉEL:');
      console.log('   📱 https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions');
      console.log('   💾 https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/editor');
      console.log('');
      console.log('⏰ Durée estimée: 5-10 minutes');
      console.log('✨ AUCUNE INTERVENTION REQUISE');
      
      return true;
    } else {
      throw new Error(result.error || 'Échec déclenchement');
    }
    
  } catch (error) {
    console.error('💥 ERREUR:', error.message);
    console.log('');
    console.log('🔧 DIAGNOSTIC AUTOMATIQUE:');
    
    if (error.message.includes('404')) {
      console.log('❌ Edge Functions non déployées');
    } else if (error.message.includes('auth')) {
      console.log('⚠️  Problème d\'authentification');
    } else if (error.message.includes('fetch')) {
      console.log('❌ Problème de connectivité');
    } else {
      console.log('⚠️  Erreur technique:', error.message);
    }
    
    return false;
  }
};

// Déclencher immédiatement
triggerAutonomousExtraction().then(success => {
  if (success) {
    console.log('');
    console.log('🎯 EXTRACTION EN COURS - SYSTÈME AUTONOME ACTIF');
    console.log('Surveillez les logs Supabase pour le progrès en temps réel');
  } else {
    console.log('');
    console.log('❌ ÉCHEC DU DÉCLENCHEMENT - Vérifiez les logs Edge Functions');
  }
});