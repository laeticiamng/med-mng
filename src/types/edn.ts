// ==========================================
// MED-MNG EDN TYPES - Types pour les tableaux EDN
// ==========================================

export interface EDNItem {
  id: string;
  item_code: string;
  title: string;
  content: string;
  rang_a?: string[];
  rang_b?: string[];
  tableau_rang_a?: any[];
  tableau_rang_b?: any[];
  paroles?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  metadata?: Record<string, any>;
}

export interface ProcessingData {
  item_code: string;
  rang: 'A' | 'B' | 'AB';
  content: any[];
  processed_content: any[];
  metadata?: Record<string, any>;
}

export interface ColonneConfig {
  id: string;
  titre: string;
  type: 'text' | 'number' | 'boolean' | 'array';
  required?: boolean;
  validation?: (value: any) => boolean;
}

export interface TableauResult {
  success: boolean;
  data: any[];
  error?: string;
  metadata?: {
    total_items: number;
    processed_items: number;
    failed_items: number;
  };
}