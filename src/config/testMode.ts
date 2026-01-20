/**
 * 🧪 MODE TEST - Bypass temporaire de l'authentification
 *
 * ⚠️ IMPORTANT: Ce mode NE DOIT JAMAIS être activé en production !
 *
 * Quand TEST_MODE_ENABLED = true:
 * - Toutes les routes protégées sont accessibles sans login
 * - Un utilisateur fictif est simulé pour les hooks
 * - Une bannière d'avertissement s'affiche
 *
 * SÉCURITÉ:
 * - Vérifie l'environnement pour bloquer en production
 * - Log toutes les tentatives d'accès en mode test
 */

// ⚠️ Mode Test - TOUJOURS désactivé en production
// Vérifie l'environnement pour plus de sécurité
const isProduction = typeof window !== 'undefined' &&
  (window.location.hostname === 'med-mng.com' ||
   window.location.hostname === 'www.med-mng.com' ||
   window.location.hostname.endsWith('.vercel.app') ||
   window.location.hostname.endsWith('.netlify.app'));

// DÉSACTIVÉ PAR DÉFAUT - Ne peut JAMAIS être activé en production
export const TEST_MODE_ENABLED = false && !isProduction;

// Utilisateur simulé pour le mode test avec UUID valide
// NOTE: Ce UUID est invalide par design pour éviter les collisions
export const TEST_USER = {
  id: '00000000-0000-0000-0000-000000000000', // UUID null - ne correspond à aucun vrai user
  email: 'testeur@med-mng.test',
  created_at: new Date().toISOString(),
  user_metadata: {
    full_name: 'Testeur MED-MNG (MODE TEST)',
    avatar_url: null,
    role: 'test' // Rôle explicitement "test" - pas admin
  },
  app_metadata: {
    role: 'test' // Double protection - pas de privilèges admin
  },
  aud: 'authenticated',
  role: 'authenticated'
};

// Vérifier si le mode test est actif avec logging
export const isTestMode = (): boolean => {
  if (isProduction && TEST_MODE_ENABLED) {
    console.error('🚨 SECURITY: Test mode was attempted in production - blocked');
    return false;
  }

  if (TEST_MODE_ENABLED) {
    console.warn('⚠️ TEST MODE ACTIVE - This should only be used in development');
  }

  return TEST_MODE_ENABLED && !isProduction;
};
