import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PremiumCardProps {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: 'primary' | 'accent' | 'warning' | 'success';
  variant?: 'default' | 'glass' | 'gradient' | 'outline';
  hoverable?: boolean;
  onClick?: () => void;
}

/**
 * Carte premium glassmorphism style Apple
 */
export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className,
  title,
  description,
  icon: Icon,
  iconColor = 'primary',
  variant = 'default',
  hoverable = true,
  onClick
}) => {
  const iconColors = {
    primary: 'text-primary bg-primary/10',
    accent: 'text-accent bg-accent/10',
    warning: 'text-warning bg-warning/10',
    success: 'text-success bg-success/10'
  };

  const variantClasses = {
    default: 'bg-card/80 backdrop-blur-xl border border-border/50 shadow-soft',
    glass: 'bg-card/40 backdrop-blur-2xl border border-white/10 shadow-large',
    gradient: 'bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl border border-border/30 shadow-medium',
    outline: 'bg-transparent border-2 border-border hover:border-primary/50'
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -4, scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        variantClasses[variant],
        hoverable && "hover:shadow-large hover:border-primary/20",
        onClick && "cursor-pointer",
        className
      )}
    >
      {(Icon || title || description) && (
        <div className="mb-4">
          {Icon && (
            <div className={cn(
              "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4",
              iconColors[iconColor]
            )}>
              <Icon className="h-6 w-6" />
            </div>
          )}
          
          {title && (
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {title}
            </h3>
          )}
          
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      
      {children}
    </motion.div>
  );
};
