import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface ImmersiveHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'outline';
    color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
  };
  backTo?: string;
  actions?: React.ReactNode;
  gradient?: string;
}

export const ImmersiveHeader: React.FC<ImmersiveHeaderProps> = ({
  title,
  subtitle,
  icon,
  badge,
  backTo = '/',
  actions,
  gradient = 'from-purple-500 to-blue-500'
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const getBadgeClasses = (color: string = 'blue') => {
    const colorMap = {
      blue: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      purple: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      green: 'bg-green-500/20 text-green-300 border-green-400/30',
      orange: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
      pink: 'bg-pink-500/20 text-pink-300 border-pink-400/30',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-purple-500/10">
      <div className="container mx-auto px-4 py-4 md:px-6 md:py-6">
        {/* Navigation Back */}
        <div className="mb-4">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => navigate(backTo)}
            className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="Retour à la page précédente"
          >
            <ArrowLeft className="h-4 w-4" />
            {!isMobile && 'Retour'}
          </Button>
        </div>

        {/* Main Header Content */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            {icon && (
              <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${gradient} rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 relative`}>
                {icon}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient.replace('from-', 'from-').replace('to-', 'to-')}/20 rounded-3xl blur animate-pulse`} />
              </div>
            )}

            {/* Title and Subtitle */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  {title}
                </h1>
                {badge && (
                  <Badge className={getBadgeClasses(badge.color)}>
                    {badge.text}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-gray-300 text-sm md:text-lg">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};