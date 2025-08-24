import React, { useEffect, useState } from 'react';

interface WaveformProps {
  isPlaying?: boolean;
  height?: number;
  barCount?: number;
  color?: string;
}

export const MusicWaveform: React.FC<WaveformProps> = ({ 
  isPlaying = false, 
  height = 40, 
  barCount = 32,
  color = 'bg-gradient-to-t from-purple-500 to-pink-500'
}) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    // Initialiser les barres
    setBars(Array.from({ length: barCount }, () => Math.random() * height + 5));
  }, [barCount, height]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setBars(prevBars => 
        prevBars.map(() => Math.random() * height + 5)
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, height]);

  return (
    <div className="flex items-end justify-center space-x-0.5" style={{ height: `${height + 10}px` }}>
      {bars.map((barHeight, index) => (
        <div
          key={index}
          className={`${color} rounded-full transition-all duration-150 ease-out`}
          style={{
            width: '3px',
            height: isPlaying ? `${barHeight}px` : '5px',
            opacity: isPlaying ? 0.8 : 0.3
          }}
        />
      ))}
    </div>
  );
};