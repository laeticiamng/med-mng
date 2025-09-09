/**
 * Types spécifiques à Supabase pour compatibilité
 */

import type { MusicTrack } from './index';

export interface SupabaseMusicTrack extends Omit<MusicTrack, 'duration' | 'genre' | 'is_generated' | 'generation_status'> {
  // Propriétés Supabase spécifiques
  supabase_id?: string;
  raw_metadata?: Record<string, unknown>;
  
  // Propriétés requises avec valeurs par défaut
  duration: number;
  genre: string;
  is_generated: boolean;
  generation_status: 'pending' | 'processing' | 'completed' | 'failed';
}