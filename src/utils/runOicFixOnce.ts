import { supabase } from '@/integrations/supabase/client';

/**
 * ⚠️ FONCTION DÉSACTIVÉE - Utiliser batchTriggers.ts
 * Cette fonction a été déplacée vers src/utils/batchTriggers.ts
 * pour éviter l'exécution automatique au chargement de la page.
 */
export async function runOicFixOnce() {
  console.warn('⚠️ runOicFixOnce désactivée - Utilisez triggerOicFix depuis batchTriggers.ts');
  throw new Error(`
    Cette fonction a été désactivée pour éviter l'exécution automatique.
    
    ✅ Nouvelle approche:
    - Import: import { triggerOicFix } from '@/utils/batchTriggers'
    - Usage: await triggerOicFix({ forceExecution: true })
    - Interface admin recommandée pour l'exécution manuelle
  `);
}