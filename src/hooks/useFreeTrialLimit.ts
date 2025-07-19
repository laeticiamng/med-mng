import { useState, useEffect } from 'react';

export const useFreeTrialLimit = () => {
  const [usedGenerations, setUsedGenerations] = useState(0);
  const maxFreeGenerations = 3;

  useEffect(() => {
    // Charger depuis le localStorage
    const stored = localStorage.getItem('usedGenerations');
    if (stored) {
      setUsedGenerations(parseInt(stored, 10));
    }
  }, []);

  const getRemainingGenerations = () => {
    return Math.max(0, maxFreeGenerations - usedGenerations);
  };

  const incrementUsedGenerations = () => {
    const newCount = usedGenerations + 1;
    setUsedGenerations(newCount);
    localStorage.setItem('usedGenerations', newCount.toString());
  };

  const resetGenerations = () => {
    setUsedGenerations(0);
    localStorage.removeItem('usedGenerations');
  };

  return {
    usedGenerations,
    maxFreeGenerations,
    getRemainingGenerations,
    incrementUsedGenerations,
    resetGenerations
  };
};