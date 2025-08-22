import { supabase } from '@/integrations/supabase/client';

/**
 * ⚠️ FONCTION DÉSACTIVÉE - Utiliser batchTriggers.ts
 * Cette fonction a été déplacée vers src/utils/batchTriggers.ts
 * pour éviter l'exécution automatique au chargement de la page.
 */
export async function runBulkLyricsOnce() {
  console.warn('⚠️ runBulkLyricsOnce désactivée - Utilisez triggerBulkLyrics depuis batchTriggers.ts');
  throw new Error(`
    Cette fonction a été désactivée pour éviter l'exécution automatique.
    
    ✅ Nouvelle approche:
    - Import: import { triggerBulkLyrics } from '@/utils/batchTriggers'
    - Usage: await triggerBulkLyrics({ forceExecution: true })
    - Interface admin recommandée pour l'exécution manuelle
  `);
}
