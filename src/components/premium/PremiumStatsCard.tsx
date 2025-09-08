// ==========================================
// MED-MNG PREMIUM STATS CARD
// Composant de statistiques réutilisable
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PremiumStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    period: string;
  };
  progress?: number;
  color?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const PremiumStatsCard: React.FC<PremiumStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  progress,
  color = "text-primary",
  className,
  size = 'md',
  animated = true
}) => {
  const isPositiveChange = change && change.value > 0;
  const TrendIcon = isPositiveChange ? TrendingUp : TrendingDown;
  const trendColor = isPositiveChange ? "text-success" : "text-destructive";

  const cardContent = (
    <CardContent className={cn(
      "flex items-center justify-between",
      size === 'sm' ? "p-4" : size === 'lg' ? "p-8" : "p-6"
    )}>
      <div className="flex-1">
        <p className={cn(
          "text-muted-foreground mb-1",
          size === 'sm' ? "text-xs" : "text-sm"
        )}>
          {title}
        </p>
        
        <p className={cn(
          "font-bold",
          size === 'sm' ? "text-lg" : size === 'lg' ? "text-3xl" : "text-2xl"
        )}>
          {animated ? (
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={value}
            >
              {value}
            </motion.span>
          ) : (
            value
          )}
        </p>

        {/* Changement de valeur */}
        {change && (
          <div className="flex items-center gap-1 mt-2">
            <TrendIcon className={cn("w-3 h-3", trendColor)} />
            <span className={cn(
              "font-medium",
              trendColor,
              size === 'sm' ? "text-xs" : "text-sm"
            )}>
              {Math.abs(change.value)}% {change.period}
            </span>
          </div>
        )}

        {/* Barre de progression */}
        {progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </div>

      {/* Icône */}
      <div className={cn(
        "flex items-center justify-center rounded-full bg-muted/20",
        color,
        size === 'sm' ? "w-10 h-10" : size === 'lg' ? "w-16 h-16" : "w-12 h-12"
      )}>
        <Icon className={cn(
          size === 'sm' ? "w-5 h-5" : size === 'lg' ? "w-8 h-8" : "w-6 h-6"
        )} />
      </div>
    </CardContent>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className={className}
    >
      <Card className="medical-card">
        {cardContent}
      </Card>
    </motion.div>
  );
};

export default PremiumStatsCard;