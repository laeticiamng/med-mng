/**
 * 🎵 Visualisation audio en temps réel
 * Utilise l'API Web Audio pour analyser les fréquences audio réelles
 */

import { cn } from '@/lib/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface RealTimeAudioWaveformProps {
  audioElement?: HTMLAudioElement | null;
  audioUrl?: string;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  className?: string;
  barCount?: number;
  color?: 'primary' | 'warning' | 'success';
  showProgress?: boolean;
}

export const RealTimeAudioWaveform: React.FC<RealTimeAudioWaveformProps> = ({
  audioElement,
  audioUrl,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  onSeek,
  className,
  barCount = 64,
  color = 'primary',
  showProgress = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [isAnalyserConnected, setIsAnalyserConnected] = useState(false);

  // Couleurs selon le thème
  const getColors = useCallback(() => {
    switch (color) {
      case 'warning':
        return { 
          main: 'hsl(var(--warning))', 
          dim: 'hsla(var(--warning) / 0.3)',
          glow: 'hsla(var(--warning) / 0.5)'
        };
      case 'success':
        return { 
          main: 'hsl(var(--success))', 
          dim: 'hsla(var(--success) / 0.3)',
          glow: 'hsla(var(--success) / 0.5)'
        };
      default:
        return { 
          main: 'hsl(var(--primary))', 
          dim: 'hsla(var(--primary) / 0.3)',
          glow: 'hsla(var(--primary) / 0.5)'
        };
    }
  }, [color]);

  // Connecter l'analyser audio
  useEffect(() => {
    if (!audioElement || isAnalyserConnected) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (!sourceRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
      }
      
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
      }
      
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      setIsAnalyserConnected(true);
    } catch (err) {
      console.warn('[RealTimeAudioWaveform] Web Audio API non supporté:', err);
    }
  }, [audioElement, isAnalyserConnected]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = getColors();
    const { width, height } = canvas;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Background
      ctx.fillStyle = 'hsla(var(--muted) / 0.1)';
      ctx.fillRect(0, 0, width, height);

      let frequencyData: number[];
      
      if (analyserRef.current && isPlaying) {
        // Utiliser les vraies fréquences audio
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        frequencyData = Array.from(dataArray);
      } else {
        // Fallback: générer des barres statiques basées sur l'URL
        frequencyData = [];
        const seed = (audioUrl || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        for (let i = 0; i < barCount; i++) {
          const base = 80 + Math.sin((i + seed) * 0.3) * 40;
          const variation = ((seed * (i + 1)) % 100) / 2;
          frequencyData.push(Math.min(255, Math.max(30, base + variation)));
        }
      }

      // Calculer la position de lecture
      const playPosition = duration > 0 ? currentTime / duration : 0;
      
      // Dessiner les barres
      const barWidth = (width / barCount) * 0.7;
      const gap = (width / barCount) * 0.3;
      const samplesPerBar = Math.floor(frequencyData.length / barCount);

      for (let i = 0; i < barCount; i++) {
        // Moyenne des fréquences pour cette barre
        let sum = 0;
        for (let j = 0; j < samplesPerBar; j++) {
          sum += frequencyData[i * samplesPerBar + j] || 0;
        }
        const value = sum / samplesPerBar / 255;
        
        const x = i * (barWidth + gap);
        const barHeight = Math.max(4, value * height * 0.9);
        const y = (height - barHeight) / 2;
        
        // Couleur basée sur la position de lecture
        const isPlayed = showProgress && (i / barCount < playPosition);
        
        // Glow effect for playing bars
        if (isPlaying && isPlayed) {
          ctx.shadowColor = colors.glow;
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = isPlayed ? colors.main : colors.dim;
        
        // Dessiner la barre avec coins arrondis
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      // Progress line
      if (showProgress && duration > 0) {
        const lineX = playPosition * width;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = colors.main;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lineX, 0);
        ctx.lineTo(lineX, height);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, barCount, audioUrl, getColors, showProgress]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={64}
      className={cn(
        "w-full h-16 cursor-pointer rounded-lg transition-opacity",
        !isPlaying && "opacity-80 hover:opacity-100",
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
        const step = duration / 20;
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          onSeek(Math.min(duration, currentTime + step));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          onSeek(Math.max(0, currentTime - step));
        }
      }}
    />
  );
};
