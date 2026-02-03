import React from 'react';
import { AlertTriangle, Info, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface MedicalDisclaimerProps {
  variant?: 'inline' | 'banner' | 'minimal';
  className?: string;
  showIcon?: boolean;
}

/**
 * Composant de disclaimer médical obligatoire
 * À afficher sur toutes les pages utilisant l'IA pour du contenu médical
 */
export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({
  variant = 'inline',
  className,
  showIcon = true,
}) => {
  const disclaimerText = {
    title: "Avertissement important",
    short: "Outil pédagogique uniquement - Ne remplace pas un avis médical professionnel.",
    full: "MED-MNG est un outil pédagogique destiné à l'apprentissage et la révision des étudiants en médecine. Les informations générées par l'intelligence artificielle sont fournies à titre éducatif uniquement et ne constituent en aucun cas un diagnostic médical, un avis clinique ou une recommandation de traitement. Consultez toujours un professionnel de santé qualifié pour toute question relative à votre santé ou celle de vos patients."
  };

  if (variant === 'minimal') {
    return (
      <div className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        className
      )}>
        {showIcon && <Info className="h-3 w-3 flex-shrink-0" />}
        <span>{disclaimerText.short}</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        "bg-warning/10 border-b border-warning/20 px-4 py-2",
        className
      )}>
        <div className="container mx-auto flex items-center gap-3 text-sm">
          {showIcon && <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />}
          <p className="text-warning-foreground">
            <strong>Outil pédagogique :</strong> {disclaimerText.short}
          </p>
        </div>
      </div>
    );
  }

  // variant === 'inline' (default)
  return (
    <Alert variant="default" className={cn("border-warning/50 bg-warning/5", className)}>
      {showIcon && <Shield className="h-4 w-4 text-warning" />}
      <AlertTitle className="text-warning-foreground font-semibold">
        {disclaimerText.title}
      </AlertTitle>
      <AlertDescription className="text-sm text-muted-foreground mt-2">
        {disclaimerText.full}
      </AlertDescription>
    </Alert>
  );
};

/**
 * Version courte du disclaimer pour les footers et espaces restreints
 */
export const MedicalDisclaimerFooter: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn(
    "text-center text-xs text-muted-foreground py-4 border-t border-border/50",
    className
  )}>
    <p className="flex items-center justify-center gap-2">
      <Shield className="h-3 w-3" />
      <span>
        MED-MNG est un outil pédagogique. L'IA fournit des contenus éducatifs, 
        non des avis médicaux. Consultez un professionnel de santé pour tout diagnostic.
      </span>
    </p>
  </div>
);

/**
 * Modal de consentement au premier usage de l'IA
 */
export const MedicalDisclaimerConsent: React.FC<{
  onAccept: () => void;
  isOpen: boolean;
}> = ({ onAccept, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-warning/10">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <h2 className="text-xl font-bold">Conditions d'utilisation de l'IA médicale</h2>
        </div>
        
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Avant d'utiliser les fonctionnalités d'intelligence artificielle de MED-MNG, 
            veuillez prendre connaissance des points suivants :
          </p>
          
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong>Usage pédagogique uniquement :</strong> Les réponses de l'IA sont 
              destinées à l'apprentissage et ne constituent pas des conseils médicaux.
            </li>
            <li>
              <strong>Vérification nécessaire :</strong> Toute information doit être 
              vérifiée dans des sources médicales officielles (Collèges, recommandations HAS).
            </li>
            <li>
              <strong>Pas de diagnostic :</strong> L'IA ne peut pas établir de diagnostic 
              ni prescrire de traitement.
            </li>
            <li>
              <strong>Consultation professionnelle :</strong> En cas de doute médical, 
              consultez toujours un professionnel de santé qualifié.
            </li>
          </ul>
        </div>

        <button
          onClick={onAccept}
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          J'ai compris et j'accepte ces conditions
        </button>
      </div>
    </div>
  );
};

export default MedicalDisclaimer;
