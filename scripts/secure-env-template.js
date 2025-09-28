/**
 * 🔐 Template sécurisé pour scripts avec gestion d'environnement
 * 
 * Ce template montre comment CORRECTEMENT gérer les secrets dans les scripts
 * JAMAIS de token hardcodé - toujours via variables d'environnement
 */

// ✅ CORRECT: Récupération sécurisée des secrets
function getSecureConfig() {
  const config = {
    supabaseUrl: process.env.SUPABASE_URL || 'https://yaincoxihiqdksxgrsrk.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    sunoApiKey: process.env.SUNO_API_KEY,
    casUsername: process.env.CAS_USERNAME,
    casPassword: process.env.CAS_PASSWORD,
    unesEmail: process.env.UNES_EMAIL,
    unesPassword: process.env.UNES_PASSWORD
  };

  // Validation stricte des secrets requis
  const requiredSecrets = ['supabaseAnonKey', 'supabaseServiceKey'];
  const missingSecrets = requiredSecrets.filter(key => !config[key]);
  
  if (missingSecrets.length > 0) {
    console.error('❌ Secrets manquants:', missingSecrets);
    console.error('📋 Configurez ces variables d\'environnement ou secrets Supabase');
    process.exit(1);
  }

  return config;
}

// ✅ CORRECT: Headers sécurisés avec validation
function createSecureHeaders(config) {
  return {
    'Authorization': `Bearer ${config.supabaseAnonKey}`,
    'apikey': config.supabaseAnonKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };
}

// ✅ CORRECT: Logging sécurisé (masquer les secrets)
function secureLog(message, secret) {
  if (secret && secret.length > 6) {
    const masked = secret.substring(0, 3) + '***' + secret.substring(secret.length - 3);
    console.log(message, masked);
  } else {
    console.log(message, '***');
  }
}

// ✅ CORRECT: Exemple d'utilisation sécurisée
async function secureApiCall() {
  try {
    const config = getSecureConfig();
    const headers = createSecureHeaders(config);
    
    secureLog('🔐 Using API key:', config.supabaseAnonKey);
    
    const response = await fetch(`${config.supabaseUrl}/rest/v1/health`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    
    console.log('✅ API call successful');
    return await response.json();
    
  } catch (error) {
    console.error('❌ Secure API call failed:', error.message);
    throw error;
  }
}

// ❌ JAMAIS FAIRE - Exemples de ce qu'il NE FAUT PAS faire :
/*
const HARDCODED_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // ❌ INTERDIT
const headers = {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // ❌ INTERDIT
};
console.log('Token:', actualToken); // ❌ INTERDIT - expose le token dans les logs
*/

module.exports = {
  getSecureConfig,
  createSecureHeaders,
  secureLog,
  secureApiCall
};