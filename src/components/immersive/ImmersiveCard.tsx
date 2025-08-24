import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ImmersiveCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'gradient' | 'neon' | 'minimal';
  hover?: boolean;
  glow?: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const ImmersiveCard: React.FC<ImmersiveCardProps> = ({
  title,
  children,
  className,
  variant = 'glass',
  hover = true,
  glow = 'purple',
  size = 'md',
  onClick
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/10 backdrop-blur-sm border-white/20';
      case 'gradient':
        return 'bg-gradient-to-br from-white/15 to-white/5 border-white/20';
      case 'neon':
        return 'bg-black/40 border-white/30 shadow-2xl';
      case 'minimal':
        return 'bg-white/5 border-white/10';
      default:
        return 'bg-white/10 backdrop-blur-sm border-white/20';
    }
  };

  const getGlowClasses = () => {
    if (!hover) return '';
    
    const glowMap = {
      blue: 'hover:shadow-blue-500/20 hover:border-blue-400/50',
      purple: 'hover:shadow-purple-500/20 hover:border-purple-400/50',
      green: 'hover:shadow-green-500/20 hover:border-green-400/50',
      orange: 'hover:shadow-orange-500/20 hover:border-orange-400/50',
      pink: 'hover:shadow-pink-500/20 hover:border-pink-400/50',
    };
    
    return `${glowMap[glow]} hover:shadow-xl`;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-4 md:p-6';
      case 'lg':
        return 'p-6 md:p-8';
      default:
        return 'p-4 md:p-6';
    }
  };

  const cardClasses = cn(
    getVariantClasses(),
    hover && 'transition-all duration-300 hover:scale-105',
    getGlowClasses(),
    'group relative overflow-hidden',
    className
  );

  return (
    <Card className={cardClasses} onClick={onClick}>
      {/* Animated background effect */}
      {hover && (
        <div className={`absolute inset-0 bg-gradient-to-br from-${glow}-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {title && (
          <CardHeader className="pb-3">
            <CardTitle className="text-white">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className={title ? 'pt-0' : getSizeClasses()}>
          {children}
        </CardContent>
      </div>
      
      {/* Subtle border glow */}
      {variant === 'neon' && (
        <div className="absolute inset-0 rounded-lg opacity-50 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      )}
    </Card>
  );
};