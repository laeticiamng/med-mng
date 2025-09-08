/**
 * 🎬 ANIMATION SYSTEM - MED-MNG v3.0
 * Système d'animations avancé avec support accessibilité
 */

import React, { forwardRef, HTMLAttributes, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';

// ==========================================
// TYPES ET INTERFACES
// ==========================================

type AnimationType = 
  | 'fade-in' | 'fade-out'
  | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
  | 'scale-in' | 'scale-out'
  | 'bounce' | 'pulse' | 'shake'
  | 'flip-x' | 'flip-y'
  | 'zoom-in' | 'zoom-out'
  | 'rotate-in' | 'rotate-out';

type AnimationDuration = 'fast' | 'normal' | 'slow' | 'very-slow';
type AnimationEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';

interface AnimationProps {
  type: AnimationType;
  duration?: AnimationDuration;
  easing?: AnimationEasing;
  delay?: number;
  infinite?: boolean;
  paused?: boolean;
  trigger?: 'immediate' | 'hover' | 'focus' | 'intersection';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  onStart?: () => void;
  onEnd?: () => void;
  className?: string;
  children: React.ReactNode;
}

// ==========================================
// ANIMATION UTILITIES
// ==========================================

const durationMap: Record<AnimationDuration, string> = {
  fast: '0.2s',
  normal: '0.5s', 
  slow: '0.8s',
  'very-slow': '1.2s'
};

const easingMap: Record<AnimationEasing, string> = {
  linear: 'linear',
  ease: 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};

const animationClasses: Record<AnimationType, string> = {
  'fade-in': 'animate-fade-in',
  'fade-out': 'animate-fade-out',
  'slide-up': 'animate-slide-up',
  'slide-down': 'animate-slide-down',
  'slide-left': 'animate-slide-left',
  'slide-right': 'animate-slide-right',
  'scale-in': 'animate-scale-in',
  'scale-out': 'animate-scale-out',
  'bounce': 'animate-bounce',
  'pulse': 'animate-pulse',
  'shake': 'animate-shake',
  'flip-x': 'animate-flip-x',
  'flip-y': 'animate-flip-y',
  'zoom-in': 'animate-zoom-in',
  'zoom-out': 'animate-zoom-out',
  'rotate-in': 'animate-rotate-in',
  'rotate-out': 'animate-rotate-out'
};

// ==========================================
// ANIMATED COMPONENT
// ==========================================

export const Animated = forwardRef<HTMLDivElement, AnimationProps>(({
  type,
  duration = 'normal',
  easing = 'ease-out',
  delay = 0,
  infinite = false,
  paused = false,
  trigger = 'immediate',
  direction = 'normal',
  fillMode = 'both',
  onStart,
  onEnd,
  className,
  children,
  ...props
}, ref) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { preferences } = useAccessibility();
  const [isVisible, setIsVisible] = React.useState(trigger === 'immediate');
  const [hasAnimated, setHasAnimated] = React.useState(false);

  // Observer pour trigger par intersection
  useEffect(() => {
    if (trigger !== 'intersection' || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [trigger, hasAnimated]);

  // Gestionnaires d'événements d'animation
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleAnimationStart = () => {
      onStart?.();
    };

    const handleAnimationEnd = () => {
      onEnd?.();
    };

    element.addEventListener('animationstart', handleAnimationStart);
    element.addEventListener('animationend', handleAnimationEnd);

    return () => {
      element.removeEventListener('animationstart', handleAnimationStart);
      element.removeEventListener('animationend', handleAnimationEnd);
    };
  }, [onStart, onEnd]);

  // Styles d'animation dynamiques
  const animationStyle: React.CSSProperties = {
    animationDuration: preferences.reducedMotion ? '0.01ms' : durationMap[duration],
    animationTimingFunction: easingMap[easing],
    animationDelay: preferences.reducedMotion ? '0ms' : `${delay}ms`,
    animationIterationCount: infinite ? 'infinite' : 1,
    animationDirection: direction,
    animationFillMode: fillMode,
    animationPlayState: paused ? 'paused' : 'running'
  };

  // Classes conditionnelles
  const animationClass = isVisible ? animationClasses[type] : '';
  const triggerClasses = {
    hover: 'hover:' + animationClasses[type],
    focus: 'focus:' + animationClasses[type],
    immediate: animationClass,
    intersection: animationClass
  };

  return (
    <div
      ref={(node) => {
        elementRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cn(
        'transform-gpu', // Accélération GPU
        trigger === 'immediate' || trigger === 'intersection' ? animationClass : '',
        trigger === 'hover' && 'hover:' + animationClass,
        trigger === 'focus' && 'focus:' + animationClass,
        preferences.reducedMotion && 'motion-reduce:animate-none',
        className
      )}
      style={animationStyle}
      {...props}
    >
      {children}
    </div>
  );
});

Animated.displayName = 'Animated';

// ==========================================
// COMPOSANTS D'ANIMATION PRÉDÉFINIS
// ==========================================

// Fade In Animation
export const FadeIn = forwardRef<HTMLDivElement, Omit<AnimationProps, 'type'>>(
  (props, ref) => <Animated ref={ref} type="fade-in" {...props} />
);
FadeIn.displayName = 'FadeIn';

// Slide Up Animation
export const SlideUp = forwardRef<HTMLDivElement, Omit<AnimationProps, 'type'>>(
  (props, ref) => <Animated ref={ref} type="slide-up" {...props} />
);
SlideUp.displayName = 'SlideUp';

// Scale In Animation
export const ScaleIn = forwardRef<HTMLDivElement, Omit<AnimationProps, 'type'>>(
  (props, ref) => <Animated ref={ref} type="scale-in" {...props} />
);
ScaleIn.displayName = 'ScaleIn';

// Bounce Animation
export const Bounce = forwardRef<HTMLDivElement, Omit<AnimationProps, 'type'>>(
  (props, ref) => <Animated ref={ref} type="bounce" {...props} />
);
Bounce.displayName = 'Bounce';

// ==========================================
// COMPOSANTS D'ANIMATION SÉQUENTIELLE
// ==========================================

interface StaggeredAnimationProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  animationType?: AnimationType;
  duration?: AnimationDuration;
  className?: string;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  staggerDelay = 100,
  animationType = 'fade-in',
  duration = 'normal',
  className
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <Animated
          key={index}
          type={animationType}
          duration={duration}
          delay={index * staggerDelay}
          trigger="intersection"
        >
          {child}
        </Animated>
      ))}
    </div>
  );
};

// ==========================================
// ANIMATION ROUTE TRANSITIONS
// ==========================================

interface RouteTransitionProps {
  children: React.ReactNode;
  isEntering?: boolean;
  isExiting?: boolean;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  isEntering = true,
  isExiting = false
}) => {
  return (
    <Animated
      type={isEntering ? 'fade-in' : isExiting ? 'fade-out' : 'fade-in'}
      duration="fast"
      className="w-full h-full"
    >
      {children}
    </Animated>
  );
};

// ==========================================
// ANIMATION HOOKS
// ==========================================

export const useAnimation = (
  type: AnimationType,
  trigger: 'manual' | 'mount' = 'mount'
) => {
  const [isPlaying, setIsPlaying] = React.useState(trigger === 'mount');
  const { preferences } = useAccessibility();

  const play = React.useCallback(() => {
    if (!preferences.reducedMotion) {
      setIsPlaying(true);
    }
  }, [preferences.reducedMotion]);

  const pause = React.useCallback(() => {
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    play,
    pause,
    className: isPlaying ? animationClasses[type] : ''
  };
};

// ==========================================
// TYPES EXPORT
// ==========================================

export type {
  AnimationType,
  AnimationDuration,
  AnimationEasing,
  AnimationProps
};