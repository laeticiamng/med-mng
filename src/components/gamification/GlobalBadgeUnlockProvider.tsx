import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BadgeUnlockAnimation } from './BadgeUnlockAnimation';
import { Badge } from '@/hooks/useGamification';

interface BadgeUnlockContextType {
  showBadgeUnlock: (badge: Badge) => void;
  hideBadgeUnlock: () => void;
}

const BadgeUnlockContext = createContext<BadgeUnlockContextType | undefined>(undefined);

export const useBadgeUnlockContext = () => {
  const context = useContext(BadgeUnlockContext);
  if (!context) {
    // Return no-op functions if not in provider (graceful degradation)
    return {
      showBadgeUnlock: () => {},
      hideBadgeUnlock: () => {},
    };
  }
  return context;
};

interface GlobalBadgeUnlockProviderProps {
  children: ReactNode;
}

export const GlobalBadgeUnlockProvider: React.FC<GlobalBadgeUnlockProviderProps> = ({ children }) => {
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);

  const showBadgeUnlock = useCallback((badge: Badge) => {
    setUnlockedBadge(badge);
  }, []);

  const hideBadgeUnlock = useCallback(() => {
    setUnlockedBadge(null);
  }, []);

  const handleShare = async () => {
    if (!unlockedBadge) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `J'ai débloqué le badge "${unlockedBadge.name}" !`,
          text: `${unlockedBadge.icon} ${unlockedBadge.description}`,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(
          `J'ai débloqué le badge "${unlockedBadge.name}" sur MED-MNG ! ${unlockedBadge.icon}`
        );
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <BadgeUnlockContext.Provider value={{ showBadgeUnlock, hideBadgeUnlock }}>
      {children}
      {unlockedBadge && (
        <BadgeUnlockAnimation
          badge={unlockedBadge}
          onClose={hideBadgeUnlock}
          onShare={handleShare}
        />
      )}
    </BadgeUnlockContext.Provider>
  );
};

export default GlobalBadgeUnlockProvider;
