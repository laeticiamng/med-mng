import React, { createContext, useContext, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface PremiumThemeContextType {
  applyPremiumEffects: (element: HTMLElement) => void;
  createRippleEffect: (x: number, y: number, element: HTMLElement) => void;
  addHoverGlow: (element: HTMLElement) => void;
  enableSmoothScrolling: () => void;
}

const PremiumThemeContext = createContext<PremiumThemeContextType | null>(null);

export const usePremiumTheme = () => {
  const context = useContext(PremiumThemeContext);
  if (!context) {
    throw new Error('usePremiumTheme must be used within PremiumThemeProvider');
  }
  return context;
};

// Hook pour les animations de révélation progressive
export const usePremiumReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.25, 0, 1] as const, // Courbe premium
        staggerChildren: 0.1
      }
    }
  };

  return { ref, variants, controls, isInView };
};

// Hook pour les effets de parallaxe subtils
export const usePremiumParallax = (strength: number = 0.5) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength * 0.01;
      const y = (e.clientY - rect.top - rect.height / 2) * strength * 0.01;
      
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const handleMouseLeave = () => {
      element.style.transform = 'translate3d(0, 0, 0)';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return ref;
};

// Composant enveloppeur pour les éléments premium
export const PremiumElement: React.FC<{
  children: React.ReactNode;
  className?: string;
  enableHover?: boolean;
  enableParallax?: boolean;
  parallaxStrength?: number;
}> = ({ 
  children, 
  className = '', 
  enableHover = true, 
  enableParallax = false,
  parallaxStrength = 0.5 
}) => {
  const { ref, variants, controls } = usePremiumReveal();
  const parallaxRef = usePremiumParallax(parallaxStrength);

  const combinedRef = (node: HTMLDivElement) => {
    if (ref) ref.current = node;
    if (parallaxRef && enableParallax) parallaxRef.current = node;
  };

  return (
    <motion.div
      ref={combinedRef}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={`premium-element ${enableHover ? 'premium-hover-effect' : ''} ${className}`}
      whileHover={enableHover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// Composant pour les boutons premium avec effets avancés
export const PremiumButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  loading = false
}) => {
  const baseClasses = `
    premium-button relative overflow-hidden
    font-medium rounded-lg transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-primary/20
    active:scale-95 transform
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-primary to-accent
      text-primary-foreground shadow-lg
      hover:shadow-xl hover:shadow-primary/25
      before:absolute before:inset-0 before:bg-gradient-to-r 
      before:from-white/20 before:to-transparent before:opacity-0
      hover:before:opacity-100 before:transition-opacity
    `,
    secondary: `
      bg-gradient-to-r from-secondary to-secondary-hover
      text-secondary-foreground border border-border
      hover:shadow-md hover:border-primary/20
    `,
    outline: `
      border-2 border-primary/20 bg-background/50 backdrop-blur-sm
      text-foreground hover:bg-primary/5 hover:border-primary/40
      hover:shadow-md
    `,
    ghost: `
      bg-transparent hover:bg-muted/50
      text-muted-foreground hover:text-foreground
    `
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {children}
      </span>
      
      {/* Effet de ripple au clic */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-lg opacity-0"
        whileTap={{ opacity: [0, 0.3, 0], scale: [0.8, 1] }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

// Composant pour les cartes premium
export const PremiumCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  interactive?: boolean;
}> = ({ children, className = '', variant = 'default', interactive = true }) => {
  const variantClasses = {
    default: `
      bg-card border border-border shadow-soft
      hover:shadow-medium hover:border-primary/20
    `,
    elevated: `
      bg-gradient-to-br from-card to-card/80
      border border-border shadow-large
      hover:shadow-xl hover:shadow-primary/10
    `,
    glass: `
      bg-card/80 backdrop-blur-md border border-border/50
      shadow-soft hover:bg-card/90
    `,
    gradient: `
      bg-gradient-to-br from-primary/5 via-card to-accent/5
      border border-primary/10 shadow-medium
      hover:from-primary/10 hover:to-accent/10
    `
  };

  return (
    <PremiumElement
      className={`
        premium-card rounded-xl transition-all duration-300
        ${variantClasses[variant]}
        ${interactive ? 'cursor-pointer' : ''}
        ${className}
      `}
      enableHover={interactive}
    >
      {children}
    </PremiumElement>
  );
};

export const PremiumThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const applyPremiumEffects = (element: HTMLElement) => {
    element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.25, 0, 1)';
    element.style.willChange = 'transform, opacity';
  };

  const createRippleEffect = (x: number, y: number, element: HTMLElement) => {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: hsl(var(--primary) / 0.3);
      pointer-events: none;
      transform: scale(0);
      animation: ripple 0.6s linear;
      width: ${size}px;
      height: ${size}px;
      left: ${x - rect.left - size/2}px;
      top: ${y - rect.top - size/2}px;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  };

  const addHoverGlow = (element: HTMLElement) => {
    element.addEventListener('mouseenter', () => {
      element.style.boxShadow = 'var(--shadow-glow)';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.boxShadow = '';
    });
  };

  const enableSmoothScrolling = () => {
    document.documentElement.style.scrollBehavior = 'smooth';
  };

  useEffect(() => {
    enableSmoothScrolling();
    
    // Ajouter les styles CSS pour les animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
      }
      
      .premium-element {
        transform-style: preserve-3d;
        backface-visibility: hidden;
      }
      
      .premium-hover-effect:hover {
        transform: translateY(-2px) scale(1.02);
        filter: brightness(1.05);
      }
      
      .premium-button:before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        transition: opacity 0.3s ease;
      }
      
      .premium-card {
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      
      @media (prefers-reduced-motion: reduce) {
        .premium-element,
        .premium-button,
        .premium-card {
          transition: none !important;
          animation: none !important;
          transform: none !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <PremiumThemeContext.Provider value={{
      applyPremiumEffects,
      createRippleEffect,
      addHoverGlow,
      enableSmoothScrolling
    }}>
      {children}
    </PremiumThemeContext.Provider>
  );
};