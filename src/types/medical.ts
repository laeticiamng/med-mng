/**
 * 🎯 TYPES MÉDICAUX - MED-MNG v3.0
 * Types spécifiques au domaine médical et EDN
 */

import type { ID, Timestamp, JSONObject } from './core';

// ==========================================
// TYPES EDUCATION MÉDICALE
// ==========================================

export interface EdnItem {
  id: ID;
  item_code: string;
  title: string;
  subtitle?: string;
  theme?: string;
  content?: JSONObject;
  competences_rang_a?: EdnCompetence[];
  competences_rang_b?: EdnCompetence[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface EdnCompetence {
  id: ID;
  title: string;
  description: string;
  keywords: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

export interface QuizQuestion {
  id: ID;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: ID;
  title: string;
  questions: QuizQuestion[];
  passing_score: number;
  time_limit?: number;
}

// ==========================================
// TYPES TABLEAU MÉDICAL
// ==========================================

export interface ColonneConfig {
  id: string;
  label: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
}

export interface ProcessingData {
  item_code?: string;
  title?: string; 
  theme?: string;
  subtitle?: string;
  rang?: string;
  content?: JSONObject;
  colonnes?: string[];
  lignes?: string[][];
  sections?: unknown[];
  competences_oic?: unknown[];
}

export interface TableauResult {
  lignesEnrichies: string[][];
  colonnesUtiles: ColonneConfig[];
  theme: string;
  isComplete: boolean;
}