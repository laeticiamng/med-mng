import React from 'react';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  showBackButton?: boolean;
  backTo?: string;
  className?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  showBackButton = true,
  backTo = '/',
  className,
  actions
}) => {
  const navigate = useNavigate();

  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      {/* Navigation */}
      {showBackButton && (
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => navigate(backTo)}
            className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Retourner à la page précédente"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          {actions && (
            <div className="flex gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Header Content */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          {Icon && (
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 relative">
              <Icon className="h-8 w-8 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-3xl blur animate-pulse"></div>
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2" id="main-content">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-300 text-lg">{subtitle}</p>
            )}
          </div>
        </div>
        
        {badge && (
          <div className="flex items-center justify-center gap-3">
            <Badge variant={badge.variant || 'default'} className="px-4 py-2 border border-purple-400/30">
              {badge.text}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};