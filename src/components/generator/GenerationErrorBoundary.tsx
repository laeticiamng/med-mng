import React from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumCard } from '@/components/ui/premium-card';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';

interface GenerationErrorBoundaryProps {
  error: Error | string | null;
  onRetry?: () => void;
  onReset?: () => void;
  showHomeButton?: boolean;
  className?: string;
}

export const GenerationErrorBoundary: React.FC<GenerationErrorBoundaryProps> = ({
  error,
  onRetry,
  onReset,
  showHomeButton = true,
  className = '',
}) => {
  const navigate = useNavigate();

  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  // Déterminer le type d'erreur pour afficher un message approprié
  const getErrorInfo = () => {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('quota') || lowerError.includes('limit')) {
      return {
        title: 'Quota atteint',
        description: 'Vous avez atteint votre limite de générations pour ce mois.',
        action: 'upgrade',
      };
    }
    
    if (lowerError.includes('network') || lowerError.includes('fetch')) {
      return {
        title: 'Erreur réseau',
        description: 'Vérifiez votre connexion internet et réessayez.',
        action: 'retry',
      };
    }
    
    if (lowerError.includes('timeout')) {
      return {
        title: 'Délai dépassé',
        description: 'La génération a pris trop de temps. Réessayez.',
        action: 'retry',
      };
    }
    
    if (lowerError.includes('auth') || lowerError.includes('permission')) {
      return {
        title: 'Non autorisé',
        description: 'Veuillez vous connecter pour continuer.',
        action: 'login',
      };
    }
    
    return {
      title: 'Erreur de génération',
      description: errorMessage || 'Une erreur inattendue s\'est produite.',
      action: 'retry',
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <PremiumCard variant="glass" className={`p-6 ${className}`}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {errorInfo.title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {errorInfo.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {errorInfo.action === 'retry' && onRetry && (
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          )}
          
          {errorInfo.action === 'upgrade' && (
            <Button 
              onClick={() => navigate(ROUTE_PATHS.medMngPricing)}
              className="gap-2"
            >
              Voir les offres
            </Button>
          )}
          
          {errorInfo.action === 'login' && (
            <Button 
              onClick={() => navigate(ROUTE_PATHS.medMngLogin)}
              className="gap-2"
            >
              Se connecter
            </Button>
          )}

          {onReset && (
            <Button variant="outline" onClick={onReset} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Recommencer
            </Button>
          )}

          {showHomeButton && (
            <Button 
              variant="ghost" 
              onClick={() => navigate(ROUTE_PATHS.home)}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          )}
        </div>
      </div>
    </PremiumCard>
  );
};
