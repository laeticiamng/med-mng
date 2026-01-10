/**
 * Visualisation audio waveform simple
 * Utilise l'API Web Audio pour analyser et afficher les fréquences
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  audioUrl?: string;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  className?: string;
  barCount?: number;
  color?: 'primary' | 'warning' | 'success';
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioUrl,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  onSeek,
  className,
  barCount = 50,
  color = 'primary'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Couleurs selon le thème
  const getColors = useCallback(() => {
    switch (color) {
      case 'warning':
        return { main: 'rgb(234, 179, 8)', dim: 'rgba(234, 179, 8, 0.3)' };
      case 'success':
        return { main: 'rgb(34, 197, 94)', dim: 'rgba(34, 197, 94, 0.3)' };
      default:
        return { main: 'rgb(147, 51, 234)', dim: 'rgba(147, 51, 234, 0.3)' };
    }
  }, [color]);

  // Générer des données waveform simulées (pour la démo)
  useEffect(() => {
    if (!audioUrl) {
      setWaveformData([]);
      return;
    }

    setIsLoading(true);
    
    // Générer une waveform pseudo-aléatoire mais cohérente
    const seed = audioUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bars: number[] = [];
    
    for (let i = 0; i < barCount; i++) {
      // Générer des valeurs qui ressemblent à de la musique
      const base = 0.3 + Math.sin((i + seed) * 0.5) * 0.2;
      const variation = ((seed * (i + 1)) % 100) / 200;
      bars.push(Math.min(1, Math.max(0.1, base + variation)));
    }
    
    setWaveformData(bars);
    setIsLoading(false);
  }, [audioUrl, barCount]);

  // Dessiner la waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const colors = getColors();
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Calculer la position de lecture
    const playPosition = duration > 0 ? currentTime / duration : 0;
    
    // Dessiner les barres
    const barWidth = (width / waveformData.length) * 0.8;
    const gap = (width / waveformData.length) * 0.2;
    
    waveformData.forEach((value, index) => {
      const x = index * (barWidth + gap);
      const barHeight = value * height * 0.9;
      const y = (height - barHeight) / 2;
      
      // Couleur basée sur la position de lecture
      const isPlayed = index / waveformData.length < playPosition;
      ctx.fillStyle = isPlayed ? colors.main : colors.dim;
      
      // Dessiner la barre avec coins arrondis
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    });
  }, [waveformData, currentTime, duration, getColors]);

  // Gérer le clic pour seek
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || duration <= 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    onSeek(Math.max(0, Math.min(duration, newTime)));
  };

  if (isLoading) {
    return (
      <div className={cn("h-12 bg-muted/50 rounded animate-pulse", className)} />
    );
  }

  if (!audioUrl || waveformData.length === 0) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={48}
      className={cn(
        "w-full h-12 cursor-pointer transition-opacity",
        !isPlaying && "opacity-70 hover:opacity-100",
        className
      )}
      onClick={handleClick}
      title="Cliquez pour naviguer dans la piste"
      role="slider"
      aria-label="Position de lecture audio"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
      aria-valuetext={`${Math.round(currentTime)} secondes sur ${Math.round(duration)}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (!onSeek || duration <= 0) return;
        const step = duration / 20; // 5% par touche
        if (e.key === 'ArrowRight') {
          onSeek(Math.min(duration, currentTime + step));
        } else if (e.key === 'ArrowLeft') {
          onSeek(Math.max(0, currentTime - step));
        }
      }}
    />
  );
};
