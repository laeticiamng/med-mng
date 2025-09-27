/**
 * Types unifiés pour remplacer les types dispersés
 * Consolidation des interfaces UI et des composants
 */

import { ReactNode, ComponentType } from 'react';
import { BaseEntity, User } from './core';

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
  requiredRole?: User['role'];
}

// Form types
export interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: string;
}

// Component props types
export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ComponentType<{ className?: string }>;
}

// Analytics types
export interface AnalyticsMetrics {
  daily_active_users: number;
  total_generations: number;
  success_rate: number;
  average_response_time: number;
  top_content: Array<{
    id: string;
    title: string;
    usage_count: number;
  }>;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  filters_applied: SearchFilters;
  suggestions?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Playlist types
export interface Playlist extends BaseEntity {
  name: string;
  description?: string;
  user_id: string;
  tracks: string[]; // track IDs
  is_public: boolean;
  cover_image?: string;
}

// Medical categories
export interface MedicalCategory {
  id: string;
  name: string;
  specialties: MedicalSpecialty[];
}

export interface MedicalSpecialty {
  id: string;
  name: string;
  items: string[]; // item IDs
}