import React from 'react';
import { motion } from 'framer-motion';
import { UniversalNavBar } from '@/components/navigation/UniversalNavBar';
import { cn } from '@/lib/utils';

interface PremiumLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark' | 'gradient' | 'glass';
  showNav?: boolean;
}

export const PremiumLayout: React.FC<PremiumLayoutProps> = ({
  children,
  className,
  variant = 'default',
  showNav = true
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'dark':
        return 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900';
      case 'gradient':
        return 'bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5';
      case 'glass':
        return 'bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-xl';
      default:
        return 'bg-background';
    }
  };

  return (
    <div className={cn('min-h-screen', getVariantClasses(), className)}>
      {showNav && <UniversalNavBar />}
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        {/* Premium Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-accent/5 to-secondary/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.main>
    </div>
  );
};