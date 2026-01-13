/**
 * 🧪 MODE TEST - Bypass temporaire de l'authentification
 * 
 * ⚠️ IMPORTANT: Mettre à false en production !
 * 
 * Quand TEST_MODE_ENABLED = true:
 * - Toutes les routes protégées sont accessibles sans login
 * - Un utilisateur fictif est simulé pour les hooks
 * - Une bannière d'avertissement s'affiche
 */

// ⚠️ Mode Test - À mettre à false en production ⚠️
// Note: Actuellement en mode test pour développement
export const TEST_MODE_ENABLED = process.env.NODE_ENV === 'development' ? true : false;

// Utilisateur simulé pour le mode test
export const TEST_USER = {
  id: 'test-user-uuid-12345',
  email: 'testeur@med-mng.test',
  created_at: new Date().toISOString(),
  user_metadata: {
    full_name: 'Testeur MED-MNG',
    avatar_url: null
  }
};

// Vérifier si le mode test est actif
export const isTestMode = (): boolean => {
  return TEST_MODE_ENABLED;
};
