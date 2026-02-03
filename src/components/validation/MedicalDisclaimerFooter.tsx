/**
 * MedicalDisclaimerFooter - Footer disclaimer médical obligatoire
 * À intégrer sur toutes les pages contenant du contenu médical IA
 */

import React from 'react';
import { AlertTriangle, ExternalLink, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MedicalDisclaimerFooterProps {
  variant?: 'compact' | 'full' | 'minimal';
  className?: string;
  showLearnMore?: boolean;
}

export const MedicalDisclaimerFooter: React.FC<MedicalDisclaimerFooterProps> = ({
  variant = 'compact',
  className,
  showLearnMore = false
}) => {
  if (variant === 'minimal') {
    return (
      <div className={cn(
        'flex items-center gap-2 text-xs text-muted-foreground py-2',
        className
      )}>
        <Shield className="h-3 w-3" />
        <span>
          Contenu pédagogique uniquement - Validez avec des sources officielles
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800',
        className
      )}>
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Contenu à visée pédagogique
          </p>
          <p className="text-amber-700 dark:text-amber-300 mt-1">
            Les contenus générés par IA sont fournis à titre éducatif. 
            Vérifiez toujours avec les référentiels officiels (Collèges, HAS).
          </p>
        </div>
      </div>
    );
  }

  // variant === 'full'
  return (
    <Alert 
      variant="default" 
      className={cn(
        'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-300 dark:border-amber-700',
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        Avertissement médical important
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-amber-700 dark:text-amber-300">
          Cette plateforme est un <strong>outil pédagogique expérimental</strong> destiné 
          aux étudiants en médecine. Elle ne constitue en aucun cas :
        </p>
        <ul className="list-disc list-inside text-amber-700 dark:text-amber-300 space-y-1 ml-2">
          <li>Un dispositif médical certifié</li>
          <li>Une source de référence pour les décisions cliniques</li>
          <li>Un substitut aux cours officiels et recommandations validées</li>
        </ul>
        <p className="text-amber-700 dark:text-amber-300">
          Les contenus générés par IA peuvent contenir des erreurs. 
          <strong> Vérifiez systématiquement</strong> avec les référentiels 
          (Collèges, HAS, sociétés savantes).
        </p>
        
        {showLearnMore && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-amber-700 dark:text-amber-300 border-amber-400"
              asChild
            >
              <a href="/mentions-legales" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                En savoir plus
              </a>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default MedicalDisclaimerFooter;
