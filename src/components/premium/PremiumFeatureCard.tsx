// ==========================================
// MED-MNG PREMIUM FEATURE CARD
// Composant de carte de fonctionnalité réutilisable
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ChevronRight, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  premium?: boolean;
  badge?: string;
  stats?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  disabled?: boolean;
}

export const PremiumFeatureCard: React.FC<PremiumFeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  premium = false,
  badge,
  stats,
  onClick,
  className,
  variant = 'default',
  disabled = false
}) => {
  const cardContent = (
    <CardContent className={cn(
      "relative overflow-hidden transition-all duration-300",
      variant === 'compact' ? "p-4" : "p-6",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      {/* Effet lumineux au hover */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500",
        color
      )} />
      
      {/* Badge Premium */}
      {premium && (
        <Badge className="absolute top-4 right-4 bg-accent/20 text-accent-foreground border-accent/20">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      )}

      {/* Badge personnalisé */}
      {badge && !premium && (
        <Badge className="absolute top-4 right-4" variant="secondary">
          {badge}
        </Badge>
      )}

      {/* Icône */}
      <div className={cn(
        "rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg",
        color,
        variant === 'compact' ? "w-10 h-10" : "w-12 h-12"
      )}>
        <Icon className={cn(
          "text-white",
          variant === 'compact' ? "w-5 h-5" : "w-6 h-6"
        )} />
      </div>

      {/* Contenu */}
      <h3 className={cn(
        "font-semibold mb-3 group-hover:text-primary transition-colors",
        variant === 'compact' ? "text-base" : "text-lg"
      )}>
        {title}
      </h3>
      
      <p className={cn(
        "text-muted-foreground leading-relaxed mb-4",
        variant === 'compact' ? "text-xs" : "text-sm"
      )}>
        {description}
      </p>

      {/* Statistiques */}
      {stats && (
        <div className={cn(
          "text-primary font-medium mb-4",
          variant === 'compact' ? "text-xs" : "text-sm"
        )}>
          {stats}
        </div>
      )}

      {/* Actions selon la variante */}
      {variant === 'detailed' ? (
        <Button 
          className="w-full mt-4" 
          onClick={onClick}
          disabled={disabled}
        >
          Utiliser cette fonctionnalité
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <div className="flex items-center justify-between">
          <span className={cn(
            "font-medium",
            variant === 'compact' ? "text-xs" : "text-sm"
          )}>
            {variant === 'compact' ? 'Voir' : 'Utiliser'}
          </span>
          <ChevronRight className={cn(
            "group-hover:translate-x-1 transition-transform",
            variant === 'compact' ? "w-3 h-3" : "w-4 h-4"
          )} />
        </div>
      )}
    </CardContent>
  );

  const cardClasses = cn(
    "medical-card group cursor-pointer h-full relative",
    disabled && "cursor-not-allowed",
    className
  );

  if (onClick && !disabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className={cardClasses} onClick={onClick}>
          {cardContent}
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cardClasses}>
        {cardContent}
      </Card>
    </motion.div>
  );
};

export default PremiumFeatureCard;