import { supabase } from '@/integrations/supabase/client';

/**
 * ❌ SCRIPT DÉSACTIVÉ POUR SÉCURITÉ
 * Ce script contenait des credentials hardcodés et a été désactivé.
 * Utilisez l'interface d'administration sécurisée à la place.
 */
async function launchEdnExtraction() {
  console.log('❌ Script désactivé pour des raisons de sécurité');
  
  throw new Error(`
    ❌ SCRIPT DÉSACTIVÉ POUR SÉCURITÉ
    
    Ce script utilisait des credentials hardcodés et a été désactivé.
    
    ✅ Solution sécurisée:
    - Utilisez l'interface d'administration: /admin/extract-edn
    - Authentification via composant sécurisé
    - Pas de credentials en dur dans le code
    
    Pour plus d'informations, consultez docs/SECURITY_AUDIT_COMPLETE.md
  `);
}

// Lancer l'extraction immédiatement
launchEdnExtraction()
  .then(result => {
    console.log('🎉 Extraction terminée avec succès:', result);
  })
  .catch(error => {
    console.error('💥 Erreur critique:', error);
  });