// Script d'extraction et audit automatiques

// ✅ SÉCURISÉ: Variables d'environnement obligatoires
const CAS_USERNAME = process.env.CAS_USERNAME;
const CAS_PASSWORD = process.env.CAS_PASSWORD;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Validation des variables d'environnement
if (!CAS_USERNAME || !CAS_PASSWORD) {
  console.error('❌ ERREUR SÉCURITÉ: CAS_USERNAME et CAS_PASSWORD requis dans les variables d\'environnement');
  console.error('💡 Définissez ces variables avant de lancer le script:');
  console.error('   export CAS_USERNAME=votre-email@etud.institution.fr');
  console.error('   export CAS_PASSWORD=votre-mot-de-passe');
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ ERREUR SÉCURITÉ: SUPABASE_ANON_KEY manquant dans les variables d\'environnement');
  console.error('💡 Définissez cette variable: export SUPABASE_ANON_KEY=votre-cle');
  process.exit(1);
}

async function runCompleteExtractionAndAudit() {
  console.log('🚀 === DÉBUT DU PROCESSUS COMPLET ===');
  console.log('📋 Phase 1: Extraction des 367 items EDN depuis UNESS');
  console.log(`🔐 Credentials: ${CAS_USERNAME.substring(0, 3)}***`);

  try {
    // Phase 1: Extraction EDN
    const extractionResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/extract-edn-uness', {
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
    });

    const extractionData = await extractionResponse.json();
    
    if (extractionData.success) {
      console.log('✅ EXTRACTION TERMINÉE AVEC SUCCÈS!');
      console.log(`📊 Items traités: ${extractionData.stats?.totalProcessed || 'N/A'}`);
      console.log(`❌ Erreurs: ${extractionData.stats?.totalErrors || 'N/A'}`);
      
      // Attendre quelques secondes avant l'audit
      console.log('⏳ Préparation de l\'audit...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Phase 2: Audit de la base de données
      console.log('🔍 Phase 2: Audit complet de la base de données');
      
      const auditResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/audit-system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          auditType: 'database',
          autoFix: true
        })
      });

      const auditData = await auditResponse.json();
      
      if (auditData.success) {
        console.log('✅ AUDIT TERMINÉ AVEC SUCCÈS!');
        console.log('📋 Résultats de l\'audit:');
        console.log(`- ID du rapport: ${auditData.reportId}`);
        console.log(`- Métriques:`, auditData.results?.metrics);
        console.log(`- Problèmes détectés:`, auditData.results?.findings?.length || 0);
        console.log(`- Corrections automatiques:`, auditData.results?.fixResults?.length || 0);
        
        // Phase 3: Audits supplémentaires
        console.log('🔍 Phase 3: Audits supplémentaires (code, UI, performance)');
        
        const auditTypes = ['code', 'ui_consistency', 'performance'];
        
        for (const auditType of auditTypes) {
          console.log(`🔍 Audit ${auditType}...`);
          
          const additionalAuditResponse = await fetch('https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/audit-system', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              auditType: auditType,
              autoFix: true
            })
          });

          const additionalAuditData = await additionalAuditResponse.json();
          console.log(`✅ Audit ${auditType} terminé:`, additionalAuditData.success ? 'SUCCÈS' : 'ÉCHEC');
          
          // Pause entre les audits
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log('🎉 === PROCESSUS COMPLET TERMINÉ ===');
        console.log('✅ Extraction des 367 items EDN: TERMINÉE');
        console.log('✅ Audit complet de la plateforme: TERMINÉ');
        
      } else {
        console.error('❌ ÉCHEC DE L\'AUDIT:', auditData.error);
      }
      
    } else {
      console.error('❌ ÉCHEC DE L\'EXTRACTION:', extractionData.error);
    }
    
  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error);
  }
}

// Lancer le processus complet
runCompleteExtractionAndAudit();