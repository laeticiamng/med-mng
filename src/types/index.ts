/**
 * Centralized type definitions to eliminate 'any' types
 */

export interface EDNItem {
  id: string;
  item_code: string;
  title: string;
  theme?: string;
  slug?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  tableau_rang_a?: TableauData;
  tableau_rang_b?: TableauData;
}

// Type pour les données temporaires de traitement
export interface ProcessingData {
  theme?: string;
  title?: string;
  subtitle?: string;
  colonnes?: string[];
  lignes?: string[][];
  sections?: any[];
  competences_oic?: any[];
  id?: string;
  item_code?: string;
  rang?: string;
  tableau_rang_a?: TableauData;
  tableau_rang_b?: TableauData;
}

export interface TableauData {
  sections?: TableauSection[];
  metadata?: Record<string, unknown>;
}

export interface TableauSection {
  title?: string;
  concepts?: TableauConcept[];
}

export interface TableauConcept {
  concept: string;
  definition: string;
  exemple: string;
  piege: string;
  mnemo: string;
  subtilite: string;
  application: string;
  vigilance: string;
}

export interface ColonneConfig {
  nom: string;
  description?: string;
  couleur?: string;
  couleurCellule?: string;
  couleurTexte?: string;
}

export interface TableauResult {
  lignesEnrichies: string[][];
  colonnesUtiles: ColonneConfig[];
  theme: string;
  isRangB?: boolean;
  isComplete?: boolean;
  expertiseLevel?: 'basic' | 'intermediate' | 'advanced';
}

export interface AuditResult {
  item_code: string;
  status: 'valid' | 'invalid' | 'error';
  issues: string[];
  score: number;
}

export interface AuditReport {
  timestamp: string;
  totalItems: number;
  validItems: number;
  invalidItems: number;
  errorItems: number;
  results: AuditResult[];
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
}

export interface OptimizationConfig {
  enableVirtualization: boolean;
  enableLazyLoading: boolean;
  enablePreloading: boolean;
  maxConcurrentRequests: number;
}