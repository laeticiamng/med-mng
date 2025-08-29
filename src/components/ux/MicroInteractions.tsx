import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Heart, Star, Bookmark, ThumbsUp, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Bouton avec effet de pulsation au clic
interface PulseButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}

export const PulseButton: React.FC<PulseButtonProps> = ({
  children,
  onClick,
  className,
  disabled = false,
  variant = 'primary'
}) => {
  const controls = useAnimation();

  const handleClick = async () => {
    if (disabled) return;
    
    await controls.start({
      scale: [1, 0.95, 1.05, 1],
      transition: { duration: 0.3, ease: "easeInOut" }
    });
    
    onClick?.();
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-600 hover:bg-green-500 shadow-green-500/25';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/25';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-500 shadow-gray-500/25';
      default:
        return 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/25';
    }
  };

  return (
    <motion.button
      animate={controls}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'px-6 py-3 rounded-xl text-white font-medium shadow-lg transition-all',
        getVariantClasses(),
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.button>
  );
};

// Animation de like/favori avec particules
interface AnimatedLikeProps {
  isLiked?: boolean;
  onToggle?: (liked: boolean) => void;
  type?: 'heart' | 'star' | 'bookmark' | 'thumbs';
  size?: 'sm' | 'md' | 'lg';
  showParticles?: boolean;
}

export const AnimatedLike: React.FC<AnimatedLikeProps> = ({
  isLiked: controlledLiked,
  onToggle,
  type = 'heart',
  size = 'md',
  showParticles = true
}) => {
  const [liked, setLiked] = useState(controlledLiked || false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledLiked !== undefined;
  const actualLiked = isControlled ? controlledLiked : liked;

  const getIcon = () => {
    switch (type) {
      case 'star': return Star;
      case 'bookmark': return Bookmark;
      case 'thumbs': return ThumbsUp;
      default: return Heart;
    }
  };

  const getSizes = () => {
    switch (size) {
      case 'sm': return { icon: 'h-4 w-4', container: 'p-2' };
      case 'lg': return { icon: 'h-8 w-8', container: 'p-4' };
      default: return { icon: 'h-6 w-6', container: 'p-3' };
    }
  };

  const Icon = getIcon();
  const sizes = getSizes();

  const handleToggle = () => {
    const newLiked = !actualLiked;
    
    if (!isControlled) {
      setLiked(newLiked);
    }
    
    onToggle?.(newLiked);

    // Générer des particules
    if (newLiked && showParticles && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: centerX + (Math.random() - 0.5) * 40,
        y: centerY + (Math.random() - 0.5) * 40
      }));
      
      setParticles(newParticles);
      
      // Nettoyer les particules après animation
      setTimeout(() => setParticles([]), 1000);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggle}
        className={cn(
          'rounded-full transition-colors relative overflow-hidden',
          sizes.container,
          actualLiked 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
            : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
        )}
      >
        <motion.div
          animate={actualLiked ? { scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Icon className={cn(sizes.icon, actualLiked && 'fill-current')} />
        </motion.div>
      </motion.button>

      {/* Particules d'animation */}
      {showParticles && particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: particle.x, 
            y: particle.y, 
            scale: 0, 
            opacity: 1 
          }}
          animate={{ 
            x: particle.x + (Math.random() - 0.5) * 60,
            y: particle.y - Math.random() * 60 - 20,
            scale: [0, 1, 0],
            opacity: [1, 1, 0]
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute pointer-events-none"
        >
          <Sparkles className="h-3 w-3 text-red-400" />
        </motion.div>
      ))}
    </div>
  );
};

// Chargement avec skeleton élégant
interface SkeletonLoaderProps {
  lines?: number;
  avatar?: boolean;
  className?: string;
  animated?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  lines = 3,
  avatar = false,
  className,
  animated = true
}) => {
  const shimmer = {
    hidden: { x: '-100%' },
    visible: { 
      x: '100%',
      transition: { 
        duration: 1.5, 
        ease: "easeInOut" as const, 
        repeat: Infinity,
        repeatDelay: 0.5
      }
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {avatar && (
        <div className="flex items-center space-x-3">
          <div className="relative overflow-hidden bg-white/10 rounded-full w-12 h-12">
            {animated && (
              <motion.div
                variants={shimmer}
                initial="hidden"
                animate="visible"
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            )}
          </div>
          <div className="space-y-2 flex-1">
            <div className="relative overflow-hidden bg-white/10 rounded h-4 w-1/3">
              {animated && (
                <motion.div
                  variants={shimmer}
                  initial="hidden"
                  animate="visible"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              )}
            </div>
            <div className="relative overflow-hidden bg-white/10 rounded h-3 w-1/4">
              {animated && (
                <motion.div
                  variants={shimmer}
                  initial="hidden"
                  animate="visible"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              )}
            </div>
          </div>
        </div>
      )}
      
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index}
          className="relative overflow-hidden bg-white/10 rounded h-4"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        >
          {animated && (
            <motion.div
              variants={shimmer}
              initial="hidden"
              animate="visible"
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Effet de survol magnétique
interface MagneticHoverProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticHover: React.FC<MagneticHoverProps> = ({
  children,
  strength = 0.3,
  className
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

// Indicateur de progression avec animation
interface AnimatedProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  thickness?: number;
  className?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  showLabel = true,
  color = 'purple',
  thickness = 8,
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClasses = () => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-purple-500';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div 
        className="bg-white/10 rounded-full overflow-hidden"
        style={{ height: thickness }}
      >
        <motion.div
          className={cn('h-full rounded-full shadow-lg', getColorClasses())}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      {showLabel && (
        <div className="flex justify-between items-center mt-2 text-sm text-white/70">
          <span>{value} / {max}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};