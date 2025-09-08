/**
 * 🎯 INTERACTION FEEDBACK - MED-MNG v3.0
 * Système de retour d'interaction avancé pour UX optimale
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';

// ==========================================
// TYPES ET INTERFACES
// ==========================================

interface RippleEffect {
  x: number;
  y: number;
  size: number;
  id: string;
}

interface FeedbackProps {
  children: React.ReactNode;
  disabled?: boolean;
  ripple?: boolean;
  haptic?: boolean;
  sound?: boolean;
  highlight?: boolean;
  glow?: boolean;
  scale?: boolean;
  lift?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}

// ==========================================
// HAPTIC FEEDBACK
// ==========================================

const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    navigator.vibrate(patterns[type]);
  }
};

// ==========================================
// SOUND FEEDBACK
// ==========================================

const playFeedbackSound = (type: 'click' | 'hover' | 'focus' | 'success' | 'error') => {
  // Utiliser Web Audio API pour des sons courts et efficaces
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const frequencies = {
    click: 800,
    hover: 600,
    focus: 400,
    success: 523.25, // C5
    error: 220 // A3
  };

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};

// ==========================================
// INTERACTIVE FEEDBACK COMPONENT
// ==========================================

export const InteractiveFeedback: React.FC<FeedbackProps> = ({
  children,
  disabled = false,
  ripple = true,
  haptic = false,
  sound = false,
  highlight = true,
  glow = false,
  scale = true,
  lift = false,
  className,
  onClick,
  onFocus,
  onBlur
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { preferences, announce } = useAccessibility();

  // ==========================================
  // RIPPLE EFFECT
  // ==========================================

  const createRipple = useCallback((event: React.MouseEvent) => {
    if (!ripple || disabled || preferences.reducedMotion) return;

    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple: RippleEffect = {
      x,
      y,
      size,
      id: Date.now().toString()
    };

    setRipples(prev => [...prev, newRipple]);

    // Nettoyer le ripple après l'animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  }, [ripple, disabled, preferences.reducedMotion]);

  // ==========================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ==========================================

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled) return;

    setIsPressed(true);
    createRipple(event);
    
    if (haptic) {
      triggerHaptic('light');
    }
  }, [disabled, createRipple, haptic]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (disabled) return;

    if (sound && preferences.soundEffects) {
      playFeedbackSound('click');
    }

    if (haptic) {
      triggerHaptic('medium');
    }

    onClick?.(event);
  }, [disabled, sound, preferences.soundEffects, haptic, onClick]);

  const handleFocus = useCallback((event: React.FocusEvent) => {
    setIsFocused(true);
    
    if (sound && preferences.soundEffects) {
      playFeedbackSound('focus');
    }

    if (preferences.announcements) {
      announce('Élément sélectionné');
    }

    onFocus?.(event);
  }, [sound, preferences.soundEffects, preferences.announcements, announce, onFocus]);

  const handleBlur = useCallback((event: React.FocusEvent) => {
    setIsFocused(false);
    onBlur?.(event);
  }, [onBlur]);

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    
    setIsHovered(true);
    
    if (sound && preferences.soundEffects) {
      playFeedbackSound('hover');
    }
  }, [disabled, sound, preferences.soundEffects]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
  }, []);

  // ==========================================
  // CLASSES CONDITIONNELLES
  // ==========================================

  const feedbackClasses = cn(
    'relative overflow-hidden transition-all duration-200 ease-out',
    'focus:outline-none focus-visible:outline-none',
    
    // States de base
    !disabled && 'cursor-pointer',
    disabled && 'cursor-not-allowed opacity-50',
    
    // Highlight effect
    highlight && isFocused && 'ring-2 ring-primary ring-offset-2',
    highlight && !preferences.reducedMotion && 'focus-visible:ring-2 focus-visible:ring-primary',
    
    // Scale effect
    scale && !disabled && !preferences.reducedMotion && [
      'transform-gpu',
      isPressed && 'scale-95',
      isHovered && !isPressed && 'scale-105'
    ],
    
    // Lift effect (shadow)
    lift && !disabled && !preferences.reducedMotion && [
      isHovered && 'shadow-lg',
      isPressed && 'shadow-sm'
    ],
    
    // Glow effect
    glow && !disabled && !preferences.reducedMotion && [
      isFocused && 'shadow-lg shadow-primary/20',
      isHovered && 'shadow-md shadow-primary/10'
    ],
    
    // Reduced motion fallbacks
    preferences.reducedMotion && [
      'motion-reduce:transition-none',
      'motion-reduce:transform-none'
    ],
    
    className
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      ref={elementRef}
      className={feedbackClasses}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-disabled={disabled}
      data-pressed={isPressed}
      data-focused={isFocused}
      data-hovered={isHovered}
    >
      {children}
      
      {/* Ripple Effects */}
      {ripple && !preferences.reducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {ripples.map((ripple) => (
            <div
              key={ripple.id}
              className="absolute rounded-full bg-current opacity-20 animate-ping pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                animationDuration: '600ms'
              }}
            />
          ))}
        </div>
      )}
      
      {/* Focus indicator pour high contrast */}
      {preferences.highContrast && isFocused && (
        <div className="absolute inset-0 border-2 border-current pointer-events-none" />
      )}
    </div>
  );
};

// ==========================================
// COMPOSANTS PRÉDÉFINIS
// ==========================================

// Button avec feedback complet
export const FeedbackButton: React.FC<FeedbackProps> = (props) => (
  <InteractiveFeedback
    ripple
    haptic
    sound
    highlight
    scale
    {...props}
  />
);

// Card avec feedback subtil
export const FeedbackCard: React.FC<FeedbackProps> = (props) => (
  <InteractiveFeedback
    ripple={false}
    haptic
    highlight
    glow
    lift
    {...props}
  />
);

// Link avec feedback minimal
export const FeedbackLink: React.FC<FeedbackProps> = (props) => (
  <InteractiveFeedback
    ripple={false}
    sound
    highlight
    {...props}
  />
);

// ==========================================
// HOOK POUR FEEDBACK PERSONNALISÉ
// ==========================================

export const useInteractionFeedback = () => {
  const { preferences, announce } = useAccessibility();

  const provideFeedback = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    message?: string
  ) => {
    // Haptic feedback
    if (preferences.soundEffects) {
      triggerHaptic(type === 'error' ? 'heavy' : 'medium');
    }

    // Sound feedback
    if (preferences.soundEffects) {
      playFeedbackSound(type === 'error' ? 'error' : 'success');
    }

    // Announcement
    if (message && preferences.announcements) {
      announce(message, type === 'error' ? 'assertive' : 'polite');
    }
  }, [preferences, announce]);

  return { provideFeedback };
};

// ==========================================
// LOADING FEEDBACK COMPONENT
// ==========================================

interface LoadingFeedbackProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export const LoadingFeedback: React.FC<LoadingFeedbackProps> = ({
  isLoading,
  children,
  className
}) => {
  const { preferences } = useAccessibility();

  return (
    <div
      className={cn(
        'relative',
        isLoading && 'pointer-events-none',
        className
      )}
      aria-busy={isLoading}
    >
      {children}
      
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div
            className={cn(
              'w-6 h-6 border-2 border-primary border-t-transparent rounded-full',
              !preferences.reducedMotion && 'animate-spin'
            )}
            role="status"
            aria-label="Chargement en cours"
          />
        </div>
      )}
    </div>
  );
};