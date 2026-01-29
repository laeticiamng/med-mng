import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon, Sparkles } from 'lucide-react';

interface PremiumHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeIcon?: LucideIcon;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center';
  gradient?: boolean;
}

/**
 * En-tête premium avec badge, titre et sous-titre animés
 */
export const PremiumHeader: React.FC<PremiumHeaderProps> = ({
  title,
  subtitle,
  badge,
  badgeIcon: BadgeIcon = Sparkles,
  className,
  size = 'md',
  align = 'left',
  gradient = true
}) => {
  const sizeClasses = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl lg:text-5xl',
    lg: 'text-4xl sm:text-5xl lg:text-6xl'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(
        "mb-8 lg:mb-12",
        align === 'center' && "text-center",
        className
      )}
    >
      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={cn(
            "inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6",
            align === 'center' && "mx-auto"
          )}
        >
          <BadgeIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">{badge}</span>
        </motion.div>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={cn(
          "font-bold tracking-tight mb-4",
          sizeClasses[size]
        )}
      >
        {gradient ? (
          <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
            {title}
          </span>
        ) : (
          <span className="text-foreground">{title}</span>
        )}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={cn(
            "text-lg sm:text-xl text-muted-foreground max-w-3xl leading-relaxed",
            align === 'center' && "mx-auto"
          )}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
};
