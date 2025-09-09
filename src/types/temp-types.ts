/**
 * Types temporaires pour la migration
 */

export interface EDNItemDTO {
  id: string;
  title: string;
  category?: string;
  subcategory?: string;
  description?: string;
  objectives?: string[];
  keyPoints?: string[];
  difficulty?: 'A' | 'B';
  estimatedStudyTime?: number;
  prerequisites?: string[];
  relatedItems?: string[];
  lastUpdated?: string;
}

export interface UserProgressDTO {
  userId: string;
  itemId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  timeSpent?: number;
  lastAccessed?: string;
  attempts?: number;
  bestScore?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface APIResponse<T> {
  success: boolean;                      
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    timestamp: string;
  };
}

export interface EdnOperationResult {
  success: boolean;
  data?: any;
  totalItems?: number;
  error?: {
    code: string;
    message: string;
  };
}