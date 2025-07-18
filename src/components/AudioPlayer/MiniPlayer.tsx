import React from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';

interface MiniPlayerProps {
  song: any;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onExpand: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  song,
  isPlaying,
  onTogglePlay,
  onNext,
  onExpand,
}) => {
  if (!song) return null;

  return (
    <div className="mini-player" onClick={onExpand}>
      <div className="mini-song-info">
        <span className="mini-title">{song.title}</span>
        <span className="mini-style">{song.style}</span>
      </div>

      <div className="mini-controls" onClick={(e) => e.stopPropagation()}>
        <button onClick={onTogglePlay} className="mini-play-btn">
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button onClick={onNext} className="mini-next-btn">
          <SkipForward size={16} />
        </button>
      </div>
    </div>
  );
};
