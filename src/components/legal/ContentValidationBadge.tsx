/**
 * 🏷️ CONTENT VALIDATION BADGE
 * Badge indiquant le statut de validation d'un contenu généré par IA
 */

import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  XCircle,
  Shield,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type ValidationStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'ai_only';

interface ContentValidationBadgeProps {
  status: ValidationStatus;
  validatorName?: string;
  validatorRole?: string;
  validatedAt?: Date;
  className?: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<ValidationStatus, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  colors: string;
}> = {
  ai_only: {
    icon: AlertTriangle,
    label: 'Non validé',
    description: "Ce contenu est généré par IA et n'a pas été vérifié par un expert médical.",
    variant: 'outline',
    colors: 'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-950/30'
  },
  pending: {
    icon: Clock,
    label: 'En attente',
    description: "Ce contenu attend d'être soumis à validation par un expert.",
    variant: 'outline',
    colors: 'border-gray-300 text-gray-600 bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-900/30'
  },
  in_review: {
    icon: Shield,
    label: 'En cours de révision',
    description: "Ce contenu est en cours de vérification par un expert médical.",
    variant: 'secondary',
    colors: 'border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-950/30'
  },
  approved: {
    icon: CheckCircle,
    label: 'Validé',
    description: "Ce contenu a été vérifié et approuvé par un expert médical.",
    variant: 'default',
    colors: 'border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950/30'
  },
  rejected: {
    icon: XCircle,
    label: 'Rejeté',
    description: "Ce contenu contient des erreurs et ne doit pas être utilisé comme référence.",
    variant: 'destructive',
    colors: 'border-red-300 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-950/30'
  }
};

export const ContentValidationBadge: React.FC<ContentValidationBadgeProps> = ({
  status,
  validatorName,
  validatorRole,
  validatedAt,
  className,
  showTooltip = true,
  size = 'md'
}) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const BadgeContent = (
    <Badge
      variant={config.variant}
      className={cn(
        'inline-flex items-center font-medium',
        sizeClasses[size],
        config.colors,
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </Badge>
  );

  if (!showTooltip) return BadgeContent;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {BadgeContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{config.label}</p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
            
            {status === 'approved' && validatorName && (
              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">{validatorName}</p>
                  {validatorRole && (
                    <p className="text-muted-foreground">{validatorRole}</p>
                  )}
                  {validatedAt && (
                    <p className="text-xs text-muted-foreground">
                      {validatedAt.toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {status === 'rejected' && (
              <p className="text-xs text-destructive font-medium pt-1">
                ⚠️ Ne pas utiliser ce contenu comme référence
              </p>
            )}

            {status === 'ai_only' && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium pt-1">
                ⚠️ Vérifiez avec les recommandations officielles
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Composant simplifié pour les listes
 */
export const ValidationIndicator: React.FC<{
  status: ValidationStatus;
  className?: string;
}> = ({ status, className }) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Icon className={cn(
            'h-4 w-4',
            status === 'approved' && 'text-green-500',
            status === 'rejected' && 'text-red-500',
            status === 'in_review' && 'text-blue-500',
            status === 'pending' && 'text-gray-400',
            status === 'ai_only' && 'text-amber-500',
            className
          )} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}: {config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ContentValidationBadge;
