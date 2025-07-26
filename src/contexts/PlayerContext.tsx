import React, { createContext, useContext } from 'react';
import { usePlayer } from '@/hooks/usePlayer';

const PlayerContext = createContext<ReturnType<typeof usePlayer> | null>(null);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const playerValue = usePlayer();
  
  return (
    <PlayerContext.Provider value={playerValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};