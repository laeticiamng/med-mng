/**
 * Hook pour utiliser l'EdnController
 */

import { useState, useEffect } from 'react';
import { EdnController } from '@/controllers/EdnController';
import type { EDNItemDTO, UserProgressDTO } from '@/types/temp-types';

const ednController = new EdnController();

export const useEdnController = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<EDNItemDTO[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  const executeOperation = async <T>(operation: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startItem = async (itemId: string) => {
    return executeOperation(async () => {
      const result = await ednController.startStudySession('user1', itemId);
      return result;
    });
  };

  const bookmarkItem = async (itemId: string) => {
    return executeOperation(async () => {
      const result = await ednController.toggleBookmark('user1', itemId);
      return result;
    });
  };

  const getRecommendations = () => {
    return items.slice(0, 6); // Mock recommendations
  };

  const getProgressStats = () => {
    return {
      completionRate: 75,
      completedItems: 45,
      totalItems: 60,
      totalTimeSpent: 3600,
      masteredItems: 30
    };
  };

  useEffect(() => {
    const loadItems = async () => {
      const result = await executeOperation(async () => {
        return ednController.getItems({
          search: searchQuery,
          category: selectedCategory || undefined,
          difficulty: selectedDifficulty || undefined
        });
      });
      
      if (result?.success && result.data) {
        setItems(result.data);
      }
    };

    loadItems();
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  return {
    controller: ednController,
    loading,
    error,
    items,
    userProgress,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    executeOperation,
    startItem,
    bookmarkItem,
    getRecommendations,
    getProgressStats
  };
};