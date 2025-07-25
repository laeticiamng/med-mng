// ✅ SCRIPT DE VALIDATION SÉCURITÉ - Ticket 3.1
// Vérifie que tous les secrets requis sont configurés

const requiredSecrets = [
  'SUPABASE_ANON_KEY',
  'SUNO_API_KEY', 
  'OPENAI_API_KEY',
  'CAS_USERNAME',
  'CAS_PASSWORD',
  'UNES_EMAIL',
  'UNES_PASSWORD',
  'RESEND_API_KEY'
];

const optionalSecrets = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY'
];

function validateSecrets() {
  console.log('🔐 VALIDATION SÉCURITÉ - Ticket 3.1');
  console.log('='.repeat(50));
  
  let missingRequired = [];
  let missingOptional = [];
  let foundSecrets = [];
  
  // Vérifier les secrets requis
  requiredSecrets.forEach(secret => {
    if (process.env[secret]) {
      foundSecrets.push(secret);
      console.log(`✅ ${secret}: Configuré`);
    } else {
      missingRequired.push(secret);
      console.log(`❌ ${secret}: MANQUANT (REQUIS)`);
    }
  });
  
  // Vérifier les secrets optionnels
  optionalSecrets.forEach(secret => {
    if (process.env[secret]) {
      foundSecrets.push(secret);
      console.log(`✅ ${secret}: Configuré`);
    } else {
      missingOptional.push(secret);
      console.log(`⚠️  ${secret}: Manquant (optionnel)`);
    }
  });
  
  console.log('='.repeat(50));
  console.log(`📊 RÉSUMÉ:`);
  console.log(`   Secrets trouvés: ${foundSecrets.length}`);
  console.log(`   Secrets requis manquants: ${missingRequired.length}`);
  console.log(`   Secrets optionnels manquants: ${missingOptional.length}`);
  
  if (missingRequired.length > 0) {
    console.log('');
    console.log('🚨 ERREUR CRITIQUE: Secrets requis manquants!');
    console.log('   Configurez dans Supabase Edge Functions Secrets:');
    missingRequired.forEach(secret => {
      console.log(`   - ${secret}`);
    });
    console.log('');
    console.log('🔗 Configuration: https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/settings/functions');
    process.exit(1);
  }
  
  console.log('');
  console.log('✅ VALIDATION RÉUSSIE - Tous les secrets requis sont configurés');
  console.log('🎯 Conformité Ticket 3.1: OK');
  
  return {
    success: true,
    foundSecrets: foundSecrets.length,
    missingRequired: missingRequired.length,
    missingOptional: missingOptional.length
  };
}

// Lancer la validation si appelé directement
if (require.main === module) {
  validateSecrets();
}

module.exports = { validateSecrets, requiredSecrets, optionalSecrets };