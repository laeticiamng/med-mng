/**
 * Service pour la gestion du contenu EDN
 */

import { logger } from '@/lib/logger';
import { apiService } from '../core/ApiService';
import type { EdnItem, ApiResponse, PaginatedResponse } from '@/types';

interface ContentFilters {
  search?: string;
  item_code?: string;
  content_status?: 'draft' | 'published' | 'archived';
  is_premium?: boolean;
  limit?: number;
  offset?: number;
}

class ContentService {
  async getEdnItems(filters?: ContentFilters): Promise<PaginatedResponse<EdnItem>> {
    try {
      logger.debug('Récupération items EDN', {
        component: 'ContentService',
        action: 'get_edn_items',
        metadata: { filters }
      });

      return await apiService.getPaginated<EdnItem>('/api/content/edn-items', filters || {});
    } catch (error) {
      logger.error('Erreur récupération items EDN', {
        component: 'ContentService',
        action: 'get_edn_items',
        metadata: { error, filters }
      });
      throw error;
    }
  }

  async getEdnItem(itemCode: string): Promise<ApiResponse<EdnItem>> {
    try {
      logger.debug('Récupération item EDN', {
        component: 'ContentService',
        action: 'get_edn_item',
        metadata: { itemCode }
      });

      return await apiService.get<EdnItem>(`/api/content/edn-items/${itemCode}`);
    } catch (error) {
      logger.error('Erreur récupération item EDN', {
        component: 'ContentService',
        action: 'get_edn_item',
        metadata: { error, itemCode }
      });
      throw error;
    }
  }

  async updateEdnItem(itemCode: string, updates: Partial<EdnItem>): Promise<ApiResponse<EdnItem>> {
    try {
      logger.info('Mise à jour item EDN', {
        component: 'ContentService',
        action: 'update_edn_item',
        metadata: { itemCode, updateFields: Object.keys(updates) }
      });

      return await apiService.put<EdnItem>(`/api/content/edn-items/${itemCode}`, updates);
    } catch (error) {
      logger.error('Erreur mise à jour item EDN', {
        component: 'ContentService',
        action: 'update_edn_item',
        metadata: { error, itemCode }
      });
      throw error;
    }
  }

  async generateContent(itemCode: string, contentType: 'tableau_rang_a' | 'tableau_rang_b' | 'paroles_musicales' | 'quiz_questions'): Promise<ApiResponse<{ content: unknown }>> {
    try {
      logger.info('Génération contenu EDN', {
        component: 'ContentService',
        action: 'generate_content',
        metadata: { itemCode, contentType }
      });

      return await apiService.post<{ content: unknown }>('/api/content/generate', {
        item_code: itemCode,
        content_type: contentType
      });
    } catch (error) {
      logger.error('Erreur génération contenu', {
        component: 'ContentService',
        action: 'generate_content',
        metadata: { error, itemCode, contentType }
      });
      throw error;
    }
  }

  async searchContent(query: string, filters?: {
    content_type?: string;
    limit?: number;
  }): Promise<ApiResponse<EdnItem[]>> {
    try {
      logger.debug('Recherche contenu', {
        component: 'ContentService',
        action: 'search_content',
        metadata: { query, filters }
      });

      return await apiService.get<EdnItem[]>('/api/content/search', {
        body: JSON.stringify({ query, ...filters })
      });
    } catch (error) {
      logger.error('Erreur recherche contenu', {
        component: 'ContentService',
        action: 'search_content',
        metadata: { error, query }
      });
      throw error;
    }
  }

  async validateContent(itemCode: string): Promise<ApiResponse<{
    isValid: boolean;
    issues: Array<{
      field: string;
      message: string;
      severity: 'error' | 'warning';
    }>;
  }>> {
    try {
      logger.debug('Validation contenu', {
        component: 'ContentService',
        action: 'validate_content',
        metadata: { itemCode }
      });

      return await apiService.post<{
        isValid: boolean;
        issues: Array<{
          field: string;
          message: string;
          severity: 'error' | 'warning';
        }>;
      }>(`/api/content/validate`, { item_code: itemCode });
    } catch (error) {
      logger.error('Erreur validation contenu', {
        component: 'ContentService',
        action: 'validate_content',
        metadata: { error, itemCode }
      });
      throw error;
    }
  }

  async publishContent(itemCode: string): Promise<ApiResponse<EdnItem>> {
    try {
      logger.info('Publication contenu', {
        component: 'ContentService',
        action: 'publish_content',
        metadata: { itemCode }
      });

      return await apiService.post<EdnItem>(`/api/content/edn-items/${itemCode}/publish`);
    } catch (error) {
      logger.error('Erreur publication contenu', {
        component: 'ContentService',
        action: 'publish_content',
        metadata: { error, itemCode }
      });
      throw error;
    }
  }

  async archiveContent(itemCode: string): Promise<ApiResponse<EdnItem>> {
    try {
      logger.info('Archivage contenu', {
        component: 'ContentService',
        action: 'archive_content',
        metadata: { itemCode }
      });

      return await apiService.post<EdnItem>(`/api/content/edn-items/${itemCode}/archive`);
    } catch (error) {
      logger.error('Erreur archivage contenu', {
        component: 'ContentService',
        action: 'archive_content',
        metadata: { error, itemCode }
      });
      throw error;
    }
  }
}

export const contentService = new ContentService();