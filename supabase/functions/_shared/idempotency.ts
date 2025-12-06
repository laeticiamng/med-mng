/**
 * Système d'idempotence pour les callbacks et opérations critiques
 * Évite les doublons et race conditions
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface IdempotencyRecord {
  operation_key: string;
  user_id?: string;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  result?: any;
}

/**
 * Vérifie si une opération a déjà été traitée (idempotence)
 * Retourne true si on peut continuer, false si déjà traité
 */
export async function checkIdempotency(
  supabase: SupabaseClient,
  operationKey: string,
  userId?: string,
  ttlSeconds: number = 300 // 5 minutes par défaut
): Promise<{ canProceed: boolean; existingResult?: any }> {
  try {
    // Créer la table si elle n'existe pas (première utilisation)
    await supabase.from('idempotency_records').select('operation_key').limit(1);
  } catch {
    // Table n'existe probablement pas, la créer
    console.log('Creating idempotency_records table...');
    await supabase.rpc('create_idempotency_table');
  }

  // Nettoyer les vieux records
  await supabase
    .from('idempotency_records')
    .delete()
    .lt('created_at', new Date(Date.now() - ttlSeconds * 1000).toISOString());

  // Vérifier si l'opération existe déjà
  const { data: existing, error } = await supabase
    .from('idempotency_records')
    .select('*')
    .eq('operation_key', operationKey)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Idempotency check error:', error);
    return { canProceed: true }; // En cas d'erreur, laisser passer
  }

  if (existing) {
    if (existing.status === 'completed') {
      console.log(`⏭️ Operation ${operationKey} already completed, skipping`);
      return { canProceed: false, existingResult: existing.result };
    }
    
    if (existing.status === 'processing') {
      const age = Date.now() - new Date(existing.created_at).getTime();
      if (age < 60000) { // Moins d'1 minute
        console.log(`⏳ Operation ${operationKey} still processing, skipping`);
        return { canProceed: false };
      }
      // Si > 1 minute en "processing", considérer comme abandonné et réessayer
      console.log(`🔄 Operation ${operationKey} timed out, retrying`);
    }
  }

  // Insérer un nouveau record "processing"
  const { error: insertError } = await supabase
    .from('idempotency_records')
    .insert({
      operation_key: operationKey,
      user_id: userId,
      status: 'processing',
      created_at: new Date().toISOString()
    });

  if (insertError) {
    console.error('Failed to insert idempotency record:', insertError);
    // En cas de conflit (race condition), considérer comme déjà traité
    if (insertError.code === '23505') { // Unique violation
      return { canProceed: false };
    }
  }

  return { canProceed: true };
}

/**
 * Marque une opération comme complétée
 */
export async function markCompleted(
  supabase: SupabaseClient,
  operationKey: string,
  result?: any
): Promise<void> {
  await supabase
    .from('idempotency_records')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      result: result
    })
    .eq('operation_key', operationKey);
}

/**
 * Marque une opération comme échouée
 */
export async function markFailed(
  supabase: SupabaseClient,
  operationKey: string,
  error?: any
): Promise<void> {
  await supabase
    .from('idempotency_records')
    .update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      result: { error: error?.message || 'Unknown error' }
    })
    .eq('operation_key', operationKey);
}
