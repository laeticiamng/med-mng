/**
 * ContentValidationBadge - Badge de validation du contenu médical
 * Affiche le statut de validation du contenu IA avec disclaimers appropriés
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Info,
  Clock
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type ValidationStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision' | 'ai_generated';

interface ContentValidationBadgeProps {
  status: ValidationStatus;
  validatorName?: string;
  validatedAt?: string;
  showDisclaimer?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<ValidationStatus, {
  icon: React.ElementType;
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  color: string;
  description: string;
}> = {
  pending: {
    icon: Clock,
    label: 'En attente',
    variant: 'outline',
    color: 'text-muted-foreground',
    description: 'Ce contenu n\'a pas encore été validé par un professionnel de santé.'
  },
  in_review: {
    icon: Shield,
    label: 'En révision',
    variant: 'secondary',
    color: 'text-blue-600',
    description: 'Ce contenu est actuellement en cours de révision par un validateur.'
  },
  approved: {
    icon: ShieldCheck,
    label: 'Validé',
    variant: 'default',
    color: 'text-green-600',
    description: 'Ce contenu a été vérifié et approuvé par un professionnel de santé.'
  },
  rejected: {
    icon: ShieldAlert,
    label: 'Rejeté',
    variant: 'destructive',
    color: 'text-destructive',
    description: 'Ce contenu a été rejeté et ne devrait pas être utilisé pour l\'apprentissage.'
  },
  needs_revision: {
    icon: AlertTriangle,
    label: 'À réviser',
    variant: 'outline',
    color: 'text-amber-600',
    description: 'Ce contenu nécessite des corrections avant validation.'
  },
  ai_generated: {
    icon: Info,
    label: 'Généré par IA',
    variant: 'outline',
    color: 'text-purple-600',
    description: 'Ce contenu a été généré par intelligence artificielle et n\'a pas été validé médicalement.'
  }
};

export const ContentValidationBadge: React.FC<ContentValidationBadgeProps> = ({
  status,
  validatorName,
  validatedAt,
  showDisclaimer = true,
  className,
  size = 'md'
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={config.variant}
            className={cn(
              'gap-1 font-medium cursor-help',
              sizeClasses[size],
              className
            )}
          >
            <Icon size={iconSizes[size]} className={config.color} />
            <span>{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3">
          <div className="space-y-2">
            <p className="font-medium">{config.label}</p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
            
            {validatorName && status === 'approved' && (
              <p className="text-xs text-muted-foreground">
                Validé par: {validatorName}
                {validatedAt && ` le ${new Date(validatedAt).toLocaleDateString('fr-FR')}`}
              </p>
            )}
            
            {showDisclaimer && status !== 'approved' && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ Ce contenu est fourni à titre pédagogique uniquement. 
                  Consultez toujours des sources officielles pour les décisions médicales.
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ContentValidationBadge;
