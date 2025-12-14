// Waveform visualization for music generation progress
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface MusicGenerationWaveformProps {
  isGenerating: boolean;
  progress: number;
  className?: string;
}

export const MusicGenerationWaveform: React.FC<MusicGenerationWaveformProps> = ({
  isGenerating,
  progress,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      timeRef.current += 0.05;
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, width, 0);
      bgGradient.addColorStop(0, 'hsl(var(--primary) / 0.1)');
      bgGradient.addColorStop(1, 'hsl(var(--accent) / 0.1)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw progress bar
      const progressWidth = (progress / 100) * width;
      const progressGradient = ctx.createLinearGradient(0, 0, progressWidth, 0);
      progressGradient.addColorStop(0, 'hsl(var(--primary) / 0.3)');
      progressGradient.addColorStop(1, 'hsl(var(--success) / 0.3)');
      ctx.fillStyle = progressGradient;
      ctx.fillRect(0, 0, progressWidth, height);
      
      // Draw waveform bars
      const barCount = 40;
      const barWidth = width / barCount - 2;
      const maxBarHeight = height * 0.8;
      
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2) + 1;
        
        // Calculate bar height with wave animation
        const baseFreq = 0.3 + Math.sin(i * 0.5) * 0.2;
        const waveHeight = isGenerating 
          ? Math.abs(Math.sin(timeRef.current * baseFreq + i * 0.2)) * maxBarHeight
          : maxBarHeight * 0.1;
        
        const barHeight = waveHeight * (0.3 + (progress / 100) * 0.7);
        
        // Color based on progress
        const isCompleted = (i / barCount) * 100 < progress;
        const gradient = ctx.createLinearGradient(x, centerY - barHeight / 2, x, centerY + barHeight / 2);
        
        if (isCompleted) {
          gradient.addColorStop(0, 'hsl(var(--primary))');
          gradient.addColorStop(1, 'hsl(var(--primary) / 0.6)');
        } else {
          gradient.addColorStop(0, 'hsl(var(--muted-foreground) / 0.5)');
          gradient.addColorStop(1, 'hsl(var(--muted-foreground) / 0.2)');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2);
        ctx.fill();
      }
      
      if (isGenerating) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isGenerating, progress]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={60}
      className={cn("w-full h-[60px] rounded-lg", className)}
    />
  );
};
