/**
 * 💾 Music Database Operations
 * 
 * Fonctions pour gérer les opérations de base de données liées à la génération musicale
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface MusicTrackInsertData {
  task_id: string;
  title: string;
  suno_track_id: string;
  user_id?: string;
  metadata: {
    style: string;
    rang: string;
    duration: number;
    language: string;
    itemCode: string;
    model: string;
    prompt: string;
    provider: string;
    generatedAt: string;
  };
  generation_status: string;
}

/**
 * Insérer un track de musique générée
 */
export async function insertMusicTrack(
  supabase: SupabaseClient,
  data: MusicTrackInsertData
): Promise<{ success: boolean; trackId?: string; error?: string }> {
  try {
    const { data: insertedTrack, error: insertError } = await supabase
      .from('generated_music_tracks')
      .insert(data)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erreur insertion BDD:', insertError);
      return { success: false, error: insertError.message };
    }
    
    console.log('✅ Track enregistrée en BDD:', insertedTrack?.id);
    return { success: true, trackId: insertedTrack?.id };
    
  } catch (error: unknown) {
    console.error('❌ Erreur critique BDD:', error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Mettre à jour le statut d'un track
 */
export async function updateTrackStatus(
  supabase: SupabaseClient,
  taskId: string,
  status: string,
  additionalData?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {
      generation_status: status,
      updated_at: new Date().toISOString()
    };
    
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }
    
    const { error } = await supabase
      .from('generated_music_tracks')
      .update(updateData)
      .eq('task_id', taskId);
    
    if (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Statut mis à jour:', taskId, '->', status);
    return { success: true };
    
  } catch (error: unknown) {
    console.error('❌ Erreur critique mise à jour:', error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Insérer une métrique de génération
 */
export async function insertGenerationMetric(
  supabase: SupabaseClient,
  data: {
    track_id: string;
    user_id?: string;
    content_type: string;
    item_code: string;
    rang: string;
    style: string;
    status?: string;
    api_response_time_ms?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const metricData: any = {
      track_id: data.track_id,
      content_type: data.content_type,
      item_code: data.item_code,
      rang: data.rang,
      style: data.style,
      status: data.status || 'initiated',
      api_response_time_ms: data.api_response_time_ms
    };
    
    // Ajouter user_id seulement si non null
    if (data.user_id) {
      metricData.user_id = data.user_id;
    }
    
    const { error } = await supabase
      .from('music_generation_metrics')
      .insert(metricData);
    
    if (error) {
      console.error('⚠️ Erreur insertion métrique (non bloquant):', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Métrique enregistrée');
    return { success: true };
    
  } catch (error: unknown) {
    console.error('⚠️ Erreur critique métrique (non bloquant):', error);
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Obtenir un utilisateur authentifié depuis le header
 */
export async function getAuthenticatedUser(
  supabase: SupabaseClient,
  authHeader: string | null
): Promise<{ userId: string | null; isAuthenticated: boolean }> {
  console.log('🔐 AuthHeader présent:', !!authHeader);
  
  if (!authHeader) {
    console.log('⚠️ Aucun header d\'authentification - génération anonyme');
    return { userId: null, isAuthenticated: false };
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (user?.id) {
      console.log('👤 User authentifié:', { userId: user.id, hasUser: !!user });
      return { userId: user.id, isAuthenticated: true };
    } else {
      console.log('⚠️ Token invalide - génération anonyme');
      return { userId: null, isAuthenticated: false };
    }
  } catch (authError) {
    console.error('❌ Erreur authentification - génération anonyme:', authError);
    return { userId: null, isAuthenticated: false };
  }
}
