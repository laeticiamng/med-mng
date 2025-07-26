import { useState, useCallback } from 'react';

export type RangType = 'A' | 'B';

interface UseTableauNavigationProps {
  initialRang?: RangType;
  onRangChange?: (rang: RangType) => void;
}

export const useTableauNavigation = ({ 
  initialRang = 'A', 
  onRangChange 
}: UseTableauNavigationProps = {}) => {
  const [activeRang, setActiveRang] = useState<RangType>(initialRang);

  const switchToRang = useCallback((rang: RangType) => {
    setActiveRang(rang);
    onRangChange?.(rang);
  }, [onRangChange]);

  const toggleRang = useCallback(() => {
    const newRang = activeRang === 'A' ? 'B' : 'A';
    switchToRang(newRang);
  }, [activeRang, switchToRang]);

  return {
    activeRang,
    switchToRang,
    toggleRang,
    isRangA: activeRang === 'A',
    isRangB: activeRang === 'B'
  };
};