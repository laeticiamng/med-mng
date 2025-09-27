import { useState, useCallback } from 'react';

export const useEdnProgressionData = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [progress, setProgress] = useState([]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      setItems([]);
      setProgress([]);
    } catch (error) {
      console.error('Error loading EDN data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    progress,
    loading,
    loadItems,
    saveSessionPlan: () => Promise.resolve(null),
    deleteSessionPlan: () => Promise.resolve(true),
  };
};