import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href?: string;
  onClick?: () => void;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children?: ReactNode;
  className?: string;
  variant?: 'default' | 'premium' | 'coming-soon';
  disabled?: boolean;
  external?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  badge,
  badgeVariant = 'secondary',
  children,
  className,
  variant = 'default',
  disabled = false,
  external = false
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    
    if (onClick) {
      onClick();
    } else if (href) {
      if (external) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        navigate(href);
      }
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'premium':
        return 'border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15';
      case 'coming-soon':
        return 'border-dashed border-muted-foreground/30 bg-muted/20';
      default:
        return 'border-border hover:border-border/80';
    }
  };

  const isClickable = !disabled && (href || onClick);

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        getVariantClasses(),
        isClickable && 'cursor-pointer hover:scale-[1.02]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            variant === 'premium' ? 'bg-primary/20' : 'bg-muted'
          )}>
            <Icon className={cn(
              'w-6 h-6',
              variant === 'premium' ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>
          
          <div className="flex items-center gap-2">
            {badge && (
              <Badge variant={badgeVariant} className="text-xs">
                {badge}
              </Badge>
            )}
            {external && (
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        <div>
          <CardTitle className="text-lg leading-6">{title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {description}
          </p>
        </div>
      </CardHeader>

      {children && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}

      {isClickable && (
        <CardContent className="pt-0">
          <Button 
            variant={variant === 'premium' ? 'default' : 'outline'} 
            size="sm" 
            className="w-full group"
            disabled={disabled}
          >
            {variant === 'coming-soon' ? 'Bientôt disponible' : 'Accéder'}
            {!disabled && variant !== 'coming-soon' && (
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  );
};