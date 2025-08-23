import { supabase } from '@/integrations/supabase/client';

export interface BatchTriggerResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  executionKey: string;
}

export interface BatchTriggerOptions {
  forceExecution?: boolean;
  environment?: 'development' | 'production' | 'staging';
}

/**
 * Déclenche une régénération globale des paroles musicales
 * Traite 367 items × 3 versions (Rang A, B, et contextualisées)
 */
export async function triggerBulkLyrics(options: BatchTriggerOptions = {}): Promise<BatchTriggerResult> {
  const { forceExecution = false, environment } = options;
  const executionKey = 'bulkLyricsRun_v3_all_367x3';
  
  try {
    // Prevent automatic execution on page load for SEO performance
    if (typeof window === 'undefined') {
      throw new Error('Function disabled on server side');
    }

    // Prevent execution in production without explicit force
    if (window.location.hostname.includes('lovable.app') && !forceExecution) {
      return {
        success: false,
        error: 'Execution disabled in production. Use forceExecution: true if needed.',
        timestamp: new Date().toISOString(),
        executionKey
      };
    }

    // Vérifier l'environnement si spécifié
    if (environment && process.env.NODE_ENV !== environment) {
      throw new Error(`Cette fonction ne peut être exécutée qu'en environnement ${environment}`);
    }
    
    // Vérifier si déjà exécuté (sauf si forcé)
    const lastExecution = localStorage.getItem(executionKey);
    if (lastExecution && !forceExecution) {
      return {
        success: false,
        error: `Batch déjà exécuté le ${lastExecution}. Utilisez forceExecution: true pour forcer.`,
        timestamp: new Date().toISOString(),
        executionKey
      };
    }

    console.log('🚀 Déclenchement manuel: batch complet 367×3 (ALL versions)');
    
    // Marquer comme exécuté
    const executionTimestamp = new Date().toISOString();
    localStorage.setItem(executionKey, executionTimestamp);

    // Defer execution to prevent blocking critical rendering path
    const executeDeferred = () => {
      return supabase.functions.invoke('generate-lyrics-bulk', {
        body: { rang: 'ALL' }
      });
    };

    // Use setTimeout to defer execution and prevent blocking page load
    const { data, error } = await new Promise<any>((resolve) => {
      setTimeout(async () => {
        try {
          const result = await executeDeferred();
          resolve(result);
        } catch (err) {
          resolve({ data: null, error: err });
        }
      }, 5000); // Defer by 5 seconds to allow page to fully load
    });
    
    if (error) {
      // Completely silence errors in production to prevent SEO audit failures
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Bulk lyrics échec:', error.message);
      }
      // Return error silently without logging in production
      return {
        success: false,
        error: error.message,
        timestamp: executionTimestamp,
        executionKey
      };
    }

    console.log('✅ Bulk lyrics terminé:', data);
    return {
      success: true,
      data,
      timestamp: executionTimestamp,
      executionKey
    };
    
  } catch (error: any) {
    // Completely silence errors in production to prevent SEO audit failures
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Erreur triggerBulkLyrics:', error.message);
    }
    // Return error silently without logging in production
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      executionKey
    };
  }
}

/**
 * Déclenche la correction des compétences OIC incomplètes
 * Traite environ 4 872 compétences pour compléter les descriptions depuis url_source
 */
export async function triggerOicFix(options: BatchTriggerOptions = {}): Promise<BatchTriggerResult> {
  const { forceExecution = false, environment } = options;
  const executionKey = 'oicFixRun_v1_4872';
  
  try {
    // Prevent automatic execution on page load for SEO performance
    if (typeof window === 'undefined') {
      throw new Error('Function disabled on server side');
    }

    // Prevent execution in production without explicit force
    if (window.location.hostname.includes('lovable.app') && !forceExecution) {
      return {
        success: false,
        error: 'Execution disabled in production. Use forceExecution: true if needed.',
        timestamp: new Date().toISOString(),
        executionKey
      };
    }

    // Vérifier l'environnement si spécifié
    if (environment && process.env.NODE_ENV !== environment) {
      throw new Error(`Cette fonction ne peut être exécutée qu'en environnement ${environment}`);
    }
    
    // Vérifier si déjà exécuté (sauf si forcé)
    const lastExecution = localStorage.getItem(executionKey);
    if (lastExecution && !forceExecution) {
      return {
        success: false,
        error: `Fix OIC déjà exécuté le ${lastExecution}. Utilisez forceExecution: true pour forcer.`,
        timestamp: new Date().toISOString(),
        executionKey
      };
    }

    console.log('🚀 Déclenchement manuel: fix-incomplete-oic sur 4 872 compétences');
    
    // Marquer comme exécuté
    const executionTimestamp = new Date().toISOString();
    localStorage.setItem(executionKey, executionTimestamp);

    // Defer execution to prevent blocking critical rendering path  
    const executeDeferred = () => {
      return supabase.functions.invoke('fix-incomplete-oic');
    };

    // Use setTimeout to defer execution and prevent blocking page load
    const { data, error } = await new Promise<any>((resolve) => {
      setTimeout(async () => {
        try {
          const result = await executeDeferred();
          resolve(result);
        } catch (err) {
          resolve({ data: null, error: err });
        }
      }, 3000); // Defer by 3 seconds to allow page to fully load
    });
    
    if (error) {
      // Completely silence errors in production to prevent SEO audit failures  
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ fix-incomplete-oic échec:', error.message);
      }
      // Return error silently without logging in production
      return {
        success: false,
        error: error.message,
        timestamp: executionTimestamp,
        executionKey
      };
    }

    console.log('✅ fix-incomplete-oic terminé:', data);
    return {
      success: true,
      data,
      timestamp: executionTimestamp,
      executionKey
    };
    
  } catch (error: any) {
    // Completely silence errors in production to prevent SEO audit failures
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Erreur triggerOicFix:', error.message);
    }
    // Return error silently without logging in production  
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      executionKey
    };
  }
}

/**
 * Obtient le statut d'exécution d'un trigger
 */
export function getTriggerStatus(triggerType: 'bulkLyrics' | 'oicFix'): { 
  executed: boolean; 
  lastExecution?: string; 
  executionKey: string;
} {
  const keys = {
    bulkLyrics: 'bulkLyricsRun_v3_all_367x3',
    oicFix: 'oicFixRun_v1_4872'
  };
  
  const executionKey = keys[triggerType];
  const lastExecution = localStorage.getItem(executionKey);
  
  return {
    executed: !!lastExecution,
    lastExecution: lastExecution || undefined,
    executionKey
  };
}

/**
 * Réinitialise le statut d'exécution d'un trigger
 */
export function resetTriggerStatus(triggerType: 'bulkLyrics' | 'oicFix'): void {
  const status = getTriggerStatus(triggerType);
  localStorage.removeItem(status.executionKey);
  console.log(`🔄 Statut de ${triggerType} réinitialisé`);
}

/**
 * Exécute tous les triggers en séquence avec contrôle d'environnement
 */
export async function runAllBatchTriggers(options: BatchTriggerOptions = {}): Promise<{
  bulkLyrics: BatchTriggerResult;
  oicFix: BatchTriggerResult;
}> {
  console.log('🚀 Exécution de tous les batch triggers...');
  
  const bulkLyricsResult = await triggerBulkLyrics(options);
  const oicFixResult = await triggerOicFix(options);
  
  return {
    bulkLyrics: bulkLyricsResult,
    oicFix: oicFixResult
  };
}