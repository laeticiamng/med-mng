/**
 * 🎯 TYPES UTILISATEUR - MED-MNG v3.0
 * Types liés aux utilisateurs et authentification
 */

import type { ID, Timestamp } from './core';

// ==========================================
// TYPES USER & AUTH
// ==========================================

export interface User {
  id: ID;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UserProfile extends User {
  subscription_type: 'free' | 'premium' | 'professional';
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  notifications: boolean;
  music_quality: 'standard' | 'high' | 'lossless';
  auto_play: boolean;
}

export interface UserStats {
  total_listening_time: number;
  songs_generated: number;
  favorite_genres: string[];
  last_active: Timestamp;
}