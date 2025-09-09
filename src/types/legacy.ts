/**
 * Types legacy pour compatibilité avec l'existant
 */

// Type pour les pistes Supabase existantes
export interface SupabaseMusicTrack {
  id: string;
  title: string;
  artist?: string;
  audio_url?: string;
  lyrics?: string[];
  created_at?: string;
  updated_at?: string;
  rang?: 'A' | 'B';
  metadata?: Record<string, unknown>;
  // Propriétés manquantes pour compatibilité
  duration: number;
  genre: string;
  is_generated: boolean;
  generation_status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Type pour les colonnes legacy
export interface LegacyColonneConfig {
  nom: string;
  couleur: string;
  couleurCellule: string;
  couleurTexte: string;
  // Propriétés requises pour nouvelle interface
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}