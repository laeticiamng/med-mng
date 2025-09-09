import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

interface InteractionEffect {
  id: string;
  x: number;
  y: number;
  timestamp: number;
  type: 'click' | 'hover' | 'focus';
}

interface EnhancedInteractionLayerProps {
  children: React.ReactNode;
  enableParticles?: boolean;
  enableRipples?: boolean;
  enableMouseTrail?: boolean;
  className?: string;
}

const EnhancedInteractionLayer = memo<EnhancedInteractionLayerProps>(({
  children,
  enableParticles = true,
  enableRipples = true,
  enableMouseTrail = false,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [effects, setEffects] = useState<InteractionEffect[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 400 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Gestion du mouvement de la souris
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  // Gestion des clics avec effet de ripple
  const handleClick = useCallback((e: MouseEvent) => {
    if (!enableRipples || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newEffect: InteractionEffect = {
      id: `effect-${Date.now()}-${Math.random()}`,
      x,
      y,
      timestamp: Date.now(),
      type: 'click'
    };
    
    setEffects(prev => [...prev, newEffect]);
    
    // Nettoyer l'effet après l'animation
    setTimeout(() => {
      setEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
    }, 1000);
  }, [enableRipples]);

  // Gestion des focus avec effet de particules
  const handleFocus = useCallback((e: FocusEvent) => {
    if (!enableParticles || !containerRef.current) return;
    
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top + rect.height / 2;
    
    // Créer plusieurs particules pour l'effet de focus
    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        const newEffect: InteractionEffect = {
          id: `particle-${Date.now()}-${i}`,
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 40,
          timestamp: Date.now(),
          type: 'focus'
        };
        
        setEffects(prev => [...prev, newEffect]);
        
        setTimeout(() => {
          setEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
        }, 800);
      }, i * 100);
    }
  }, [enableParticles]);

  // Configuration des écouteurs d'événements
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);
    container.addEventListener('focusin', handleFocus);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('focusin', handleFocus);
    };
  }, [handleMouseMove, handleClick, handleFocus]);

  // Nettoyage périodique des effets
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setEffects(prev => 
        prev.filter(effect => now - effect.timestamp < 2000)
      );
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ isolation: 'isolate' }}
    >
      {children}
      
      {/* Couche d'effets visuels */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Traînée de souris subtile */}
        {enableMouseTrail && (
          <motion.div
            className="absolute w-6 h-6 bg-primary/10 rounded-full blur-sm"
            style={{
              x: smoothMouseX,
              y: smoothMouseY,
              translateX: '-50%',
              translateY: '-50%'
            }}
          />
        )}
        
        {/* Effets d'interaction */}
        <AnimatePresence>
          {effects.map((effect) => (
            <InteractionEffect key={effect.id} effect={effect} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

// Composant pour un effet d'interaction individuel
const InteractionEffect = memo<{ effect: InteractionEffect }>(({ effect }) => {
  if (effect.type === 'click') {
    return (
      <motion.div
        initial={{ 
          opacity: 0.6, 
          scale: 0,
          x: effect.x,
          y: effect.y
        }}
        animate={{ 
          opacity: 0, 
          scale: 2,
          x: effect.x,
          y: effect.y
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute w-20 h-20 border-2 border-primary/30 rounded-full"
        style={{
          transform: 'translate(-50%, -50%)'
        }}
      />
    );
  }
  
  if (effect.type === 'focus') {
    return (
      <motion.div
        initial={{ 
          opacity: 0.8, 
          scale: 0,
          x: effect.x,
          y: effect.y
        }}
        animate={{ 
          opacity: 0, 
          scale: 1,
          x: effect.x + (Math.random() - 0.5) * 100,
          y: effect.y - 50 - Math.random() * 50
        }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          opacity: { delay: 0.2 }
        }}
        className="absolute w-2 h-2 bg-accent rounded-full"
        style={{
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 6px currentColor'
        }}
      />
    );
  }
  
  return null;
});

// Hook personnalisé pour les interactions tactiles sur mobile
export const useTouchFeedback = () => {
  const hapticFeedback = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30]
      };
      
      navigator.vibrate(patterns[intensity]);
    }
  }, []);

  const touchRipple = useCallback((element: HTMLElement, color = 'rgba(255, 255, 255, 0.3)') => {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: ${color};
      pointer-events: none;
      transform: scale(0);
      animation: ripple 0.6s linear;
      width: ${size}px;
      height: ${size}px;
      top: 50%;
      left: 50%;
      margin-top: ${-size/2}px;
      margin-left: ${-size/2}px;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }, []);

  return { hapticFeedback, touchRipple };
};

InteractionEffect.displayName = 'InteractionEffect';
EnhancedInteractionLayer.displayName = 'EnhancedInteractionLayer';

export default EnhancedInteractionLayer;