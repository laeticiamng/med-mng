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
}

export interface CompetenceOIC {
  objectif_id: string;
  intitule: string;
  description?: OptionalString;
  rubrique?: OptionalString;
  titre_complet?: OptionalString;
  sommaire?: OptionalString;
  mecanismes?: OptionalString;
  indications?: OptionalString;
  interactions?: OptionalString;
  effets_indesirables?: OptionalString;
  causes_echec?: OptionalString;
  modalites_surveillance?: OptionalString;
  ordre_affichage?: number;
  keywords?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  last_message?: NullableString;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface EdnItemPlatform {
  item_code: string;
  title: string;
  tableau_rang_a: any;
  tableau_rang_b: any;
  paroles_musicales: string[];
}

// Utilitaires pour conversion des types
export const safeString = (value: NullableString): string => value ?? '';
export const safeArray = <T>(value: T[] | null | undefined): T[] => value ?? [];
export const safeNumber = (value: number | undefined): number => value ?? 0;

export {};