
import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'purple' | 'amber' | 'emerald';
  className?: string;
}

export const PremiumBackground: React.FC<PremiumBackgroundProps> = ({
  children,
  variant = 'default',
  className
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'blue':
        return 'from-blue-50 via-sky-50 to-indigo-50';
      case 'purple':
        return 'from-purple-50 via-violet-50 to-fuchsia-50';
      case 'amber':
        return 'from-amber-50 via-orange-50 to-yellow-50';
      case 'emerald':
        return 'from-emerald-50 via-teal-50 to-cyan-50';
      default:
        return 'from-slate-50 via-white to-gray-50';
    }
  };

  return (
    <div className={cn(
      'min-h-screen relative overflow-hidden',
      `bg-gradient-to-br ${getVariantClasses()}`,
      className
    )}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl animate-pulse-glow animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-400/10 to-orange-500/10 rounded-full blur-2xl animate-pulse-glow animation-delay-2000"></div>
      </div>
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[0.5px]"></div>
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
