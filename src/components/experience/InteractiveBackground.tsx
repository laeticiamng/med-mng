// ==========================================
// INTERACTIVE BACKGROUND - Arrière-plan interactif premium
// ==========================================

import React, { memo, useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InteractiveBackgroundProps {
  variant?: 'medical' | 'minimal' | 'dynamic' | 'particles';
  intensity?: 'low' | 'medium' | 'high';
  children?: React.ReactNode;
  className?: string;
}

// Floating Medical Icons
const MedicalParticles = memo(({ intensity = 'medium' }: { intensity: string }) => {
  const particleCount = intensity === 'low' ? 8 : intensity === 'medium' ? 12 : 20;
  
  const medicalIcons = ['🩺', '💊', '🫀', '🧬', '⚕️', '🔬', '💉', '🏥'];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: [null, Math.random() * window.innerWidth],
            y: [null, Math.random() * window.innerHeight],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {medicalIcons[Math.floor(Math.random() * medicalIcons.length)]}
        </motion.div>
      ))}
    </div>
  );
});

// Geometric Particles
const GeometricParticles = memo(({ intensity = 'medium' }: { intensity: string }) => {
  const particleCount = intensity === 'low' ? 15 : intensity === 'medium' ? 25 : 40;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute rounded-full",
            Math.random() > 0.5 ? 'bg-primary/10' : 'bg-accent/10'
          )}
          style={{
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: [null, Math.random() * window.innerWidth],
            y: [null, Math.random() * window.innerHeight],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
});

// Interactive Cursor Trail
const CursorTrail = memo(() => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsMoving(true);
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMoving(false), 150);
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      <motion.div
        className="absolute w-6 h-6 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-sm"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          scale: isMoving ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      />
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-primary/50 to-accent/50"
        animate={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
        }}
        transition={{
          type: "spring",
          stiffness: 800,
          damping: 25,
          mass: 0.3
        }}
      />
    </div>
  );
});

// Gradient Orbs
const GradientOrbs = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-accent/20 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-transparent rounded-full blur-2xl"
        animate={{
          x: [0, 120, -60, 0],
          y: [0, -80, 40, 0],
          scale: [1, 1.3, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
});

// Grid Pattern
const GridPattern = memo(() => {
  return (
    <div className="absolute inset-0 opacity-[0.02]">
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
});

// Main Interactive Background Component
const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({
  variant = 'medical',
  intensity = 'medium',
  children,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (isReducedMotion) {
    return (
      <div ref={containerRef} className={cn("relative", className)}>
        <GridPattern />
        {children}
      </div>
    );
  }

  const renderBackground = () => {
    switch (variant) {
      case 'medical':
        return (
          <>
            <GradientOrbs />
            <MedicalParticles intensity={intensity} />
            <GridPattern />
          </>
        );
      case 'minimal':
        return (
          <>
            <GradientOrbs />
            <GridPattern />
          </>
        );
      case 'dynamic':
        return (
          <>
            <GradientOrbs />
            <GeometricParticles intensity={intensity} />
            <CursorTrail />
          </>
        );
      case 'particles':
        return (
          <>
            <GeometricParticles intensity={intensity} />
            <GridPattern />
          </>
        );
      default:
        return <GridPattern />;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {renderBackground()}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default memo(InteractiveBackground);