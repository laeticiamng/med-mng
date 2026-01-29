import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showOrbs?: boolean;
  gradient?: 'default' | 'medical' | 'accent' | 'warm';
}

/**
 * Layout premium style Apple avec orbes flottantes et fond dégradé
 * À utiliser sur toutes les pages pour une cohérence visuelle
 */
export const PremiumPageLayout: React.FC<PremiumPageLayoutProps> = ({
  children,
  className,
  showOrbs = true,
  gradient = 'default'
}) => {
  const gradientClasses = {
    default: 'from-background via-primary/5 to-accent/10',
    medical: 'from-background via-primary/10 to-accent/5',
    accent: 'from-background via-accent/10 to-primary/5',
    warm: 'from-background via-warning/5 to-accent/10'
  };

  return (
    <div className={cn("relative min-h-screen overflow-hidden", className)}>
      {/* Animated gradient background */}
      <div className={cn(
        "fixed inset-0 bg-gradient-to-br pointer-events-none -z-10",
        gradientClasses[gradient]
      )} />
      
      {/* Floating orbs */}
      {showOrbs && (
        <>
          <motion.div 
            className="fixed top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10"
            animate={{ 
              x: [0, 50, 0], 
              y: [0, 30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="fixed bottom-20 right-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none -z-10"
            animate={{ 
              x: [0, -40, 0], 
              y: [0, -50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-warning/5 blur-3xl pointer-events-none -z-10"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
