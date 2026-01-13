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

// ⚠️ Mode Test - Désactivé par défaut pour éviter les erreurs UUID
// Active uniquement si explicitement défini dans localStorage
export const TEST_MODE_ENABLED = false;

// Utilisateur simulé pour le mode test avec UUID valide
// NOTE: Ce UUID doit correspondre à un vrai user dans auth.users pour les RPC
export const TEST_USER = {
  id: '00000000-0000-0000-0000-000000000000', // UUID null valide (format correct)
  email: 'testeur@med-mng.test',
  created_at: new Date().toISOString(),
  user_metadata: {
    full_name: 'Testeur MED-MNG',
    avatar_url: null
  },
  aud: 'authenticated',
  role: 'authenticated'
};

// Vérifier si le mode test est actif
export const isTestMode = (): boolean => {
  return TEST_MODE_ENABLED;
};
