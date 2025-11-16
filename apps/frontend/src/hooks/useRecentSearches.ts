import { useState, useEffect } from 'react';

interface RecentSearch {
  id: string;
  type: 'page' | 'edn-item';
  label: string;
  path: string;
  timestamp: number;
}

const STORAGE_KEY = 'med-mng-recent-searches';
const MAX_RECENT = 5;

export const useRecentSearches = () => {
  const [recents, setRecents] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecents(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading recent searches:', error);
        setRecents([]);
      }
    }
  }, []);

  const addRecent = (item: Omit<RecentSearch, 'id' | 'timestamp'>) => {
    setRecents(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(r => r.path !== item.path);
      
      // Add new item at the beginning
      const updated = [
        {
          ...item,
          id: `${item.path}-${Date.now()}`,
          timestamp: Date.now(),
        },
        ...filtered,
      ].slice(0, MAX_RECENT);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecents = () => {
    setRecents([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { recents, addRecent, clearRecents };
};
