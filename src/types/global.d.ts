// Declarations globales pour résoudre les conflits TypeScript

declare global {
  // Interfaces pour corriger les types
  interface Window {
    supabase?: any;
  }
}

// Types pour les erreurs communes
export type NullableString = string | null | undefined;
export type OptionalString = string | undefined;

// Types pour les composants EDN
export interface EdnItem {
  id?: string;
  item_code: string;
  title: string;
  subtitle?: NullableString;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  paroles_musicales?: string[] | null;
  quiz_questions?: any;
  scene_immersive?: any;
  competences_oic_rang_a?: any;
  competences_oic_rang_b?: any;
  [key: string]: any;
}

export interface CompetenceOIC {
  objectif_id: string;
  intitule: string;
  description?: NullableString;
  rubrique?: NullableString;
  titre_complet?: NullableString;
  sommaire?: NullableString;
  mecanismes?: NullableString;
  indications?: NullableString;
  interactions?: NullableString;
  effets_indesirables?: NullableString;
  causes_echec?: NullableString;
  modalites_surveillance?: NullableString;
  contributeurs?: NullableString;
  ordre_affichage?: number;
  keywords?: string[];
  [key: string]: any;
}

export interface Conversation {
  id: string;
  title: string;
  last_message?: NullableString;
  created_at: string;
  updated_at: string;
  user_id: string;
  [key: string]: any;
}

export interface EdnItemPlatform {
  item_code: string;
  title: string;
  tableau_rang_a: any;
  tableau_rang_b: any;
  paroles_musicales: string[] | null;
  [key: string]: any;
}

export interface EdnItemComplete {
  id?: string;
  item_code: string;
  title: string;
  subtitle?: NullableString;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  paroles_musicales?: string[] | null;
  scene_immersive?: any;
  quiz_questions?: any;
  audio_ambiance?: any;
  visual_ambiance?: any;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

// Utilitaires pour conversion des types
export const safeString = (value: NullableString): string => value ?? '';
export const safeArray = <T>(value: T[] | null | undefined): T[] => value ?? [];
export const safeNumber = (value: number | undefined): number => value ?? 0;
export const convertNull = <T>(value: T | null): T | undefined => value === null ? undefined : value;

export {};