// Types temporaires pour corriger les erreurs de build
export type EDNCategory = string;
export type DifficultyLevel = string;
export interface APIResponse<T> { success: boolean; data?: T; error?: any; }
export interface UserProgressDTO { userId: string; itemId: string; status: string; }
export interface EDNItemDTO { id: string; title: string; category: string; }

// Exports temporaires
export * from './temp-types';