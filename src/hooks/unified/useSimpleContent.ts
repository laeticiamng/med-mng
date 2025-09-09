/**
 * Hook unifié pour la gestion de contenu simplifié
 */

import { useState, useEffect, useCallback } from 'react';
import { contentService } from '@/services/UnifiedContentService';
import { useErrorHandler } from './useErrorHandler';
import type { ContentModule, ContentFilters, StudyPlan } from '@/services/business/SimpleContentService';

export const useSimpleContent = () => {
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);

  const getModules = useCallback(async (filters?: ContentFilters): Promise<ContentModule[]> => {
    try {
      setLoading(true);
      const response = await contentService.getModules(filters);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data || [];
    } catch (error) {
      handleError(error as Error, 'api_call');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getModule = useCallback(async (id: string): Promise<ContentModule | null> => {
    try {
      setLoading(true);
      const response = await contentService.getModule(id);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    } catch (error) {
      handleError(error as Error, 'api_call');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const saveProgress = useCallback(async (moduleId: string, progress: number): Promise<boolean> => {
    try {
      const response = await contentService.saveProgress(moduleId, progress);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data || false;
    } catch (error) {
      handleError(error as Error, 'api_call');
      return false;
    }
  }, [handleError]);

  const generateStudyPlan = useCallback(async (preferences: any): Promise<StudyPlan | null> => {
    try {
      setLoading(true);
      const response = await contentService.generateStudyPlan(preferences);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    } catch (error) {
      handleError(error as Error, 'api_call');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const searchContent = useCallback(async (query: string): Promise<ContentModule[]> => {
    try {
      setLoading(true);
      const response = await contentService.searchContent(query);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data || [];
    } catch (error) {
      handleError(error as Error, 'api_call');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    loading,
    getModules,
    getModule,
    saveProgress,
    generateStudyPlan,
    searchContent
  };
};