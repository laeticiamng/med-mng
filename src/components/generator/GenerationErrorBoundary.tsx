import React from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft, Wifi, Clock, CreditCard, LogIn, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumCard } from '@/components/ui/premium-card';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface GenerationErrorBoundaryProps {
  error: Error | string | null;
  onRetry?: () => void;
  onReset?: () => void;
  showHomeButton?: boolean;
  className?: string;
  retryCount?: number;
  maxRetries?: number;
}

interface ErrorInfo {
  title: string;
  description: string;
  action: 'retry' | 'upgrade' | 'login' | 'contact' | 'wait';
  icon: React.ReactNode;
  suggestions: string[];
}

export const GenerationErrorBoundary: React.FC<GenerationErrorBoundaryProps> = ({
  error,
  onRetry,
  onReset,
  showHomeButton = true,
  className = '',
  retryCount = 0,
  maxRetries = 3
}) => {
  const navigate = useNavigate();

  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  // Déterminer le type d'erreur pour afficher un message approprié
  const getErrorInfo = (): ErrorInfo => {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('quota') || lowerError.includes('limit') || lowerError.includes('atteint')) {
      return {
        title: 'Quota atteint',
        description: 'Vous avez atteint votre limite de générations pour ce mois.',
        action: 'upgrade',
        icon: <CreditCard className="h-6 w-6 text-warning" />,
        suggestions: [
          'Passez à un abonnement supérieur pour plus de générations',
          'Votre quota sera réinitialisé le 1er du mois prochain',
          'Consultez votre utilisation dans les paramètres'
        ]
      };
    }
    
    if (lowerError.includes('crédit') || lowerError.includes('credit') || lowerError.includes('suno')) {
      return {
        title: 'Crédits Suno épuisés',
        description: 'Vos crédits API Suno sont épuisés.',
        action: 'contact',
        icon: <CreditCard className="h-6 w-6 text-destructive" />,
        suggestions: [
          'Rechargez vos crédits Suno API',
          'Vérifiez votre abonnement Suno',
          'Contactez le support si le problème persiste'
        ]
      };
    }
    
    if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connexion') || lowerError.includes('réseau')) {
      return {
        title: 'Erreur réseau',
        description: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
        action: 'retry',
        icon: <Wifi className="h-6 w-6 text-warning" />,
        suggestions: [
          'Vérifiez votre connexion WiFi ou données mobiles',
          'Désactivez votre VPN si vous en utilisez un',
          'Réessayez dans quelques secondes'
        ]
      };
    }
    
    if (lowerError.includes('timeout') || lowerError.includes('délai') || lowerError.includes('trop long')) {
      return {
        title: 'Délai dépassé',
        description: 'La génération a pris trop de temps. Le serveur Suno peut être surchargé.',
        action: 'wait',
        icon: <Clock className="h-6 w-6 text-warning" />,
        suggestions: [
          'L\'API Suno peut être temporairement surchargée',
          'Réessayez dans quelques minutes',
          'Essayez avec des paroles plus courtes'
        ]
      };
    }
    
    if (lowerError.includes('auth') || lowerError.includes('permission') || lowerError.includes('unauthorized') || lowerError.includes('non autorisé')) {
      return {
        title: 'Non autorisé',
        description: 'Vous devez être connecté pour générer de la musique.',
        action: 'login',
        icon: <LogIn className="h-6 w-6 text-primary" />,
        suggestions: [
          'Connectez-vous à votre compte',
          'Créez un compte gratuit pour commencer',
          'Votre session a peut-être expiré'
        ]
      };
    }
    
    if (lowerError.includes('parole') || lowerError.includes('lyrics') || lowerError.includes('texte')) {
      return {
        title: 'Erreur de paroles',
        description: 'Les paroles sont invalides ou trop longues.',
        action: 'retry',
        icon: <AlertCircle className="h-6 w-6 text-warning" />,
        suggestions: [
          'Vérifiez que les paroles ne dépassent pas 3000 caractères',
          'Évitez les caractères spéciaux non supportés',
          'Sélectionnez un autre rang ou item'
        ]
      };
    }
    
    return {
      title: 'Erreur de génération',
      description: errorMessage || 'Une erreur inattendue s\'est produite.',
      action: 'retry',
      icon: <HelpCircle className="h-6 w-6 text-muted-foreground" />,
      suggestions: [
        'Réessayez la génération',
        'Rafraîchissez la page',
        'Contactez le support si le problème persiste'
      ]
    };
  };

  const errorInfo = getErrorInfo();
  const canRetry = retryCount < maxRetries;

  return (
    <PremiumCard 
      variant="glass" 
      className={`p-6 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center">
          {errorInfo.icon}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {errorInfo.title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {errorInfo.description}
          </p>
        </div>

        {/* Suggestions */}
        <Alert className="max-w-md text-left">
          <AlertTitle className="text-sm font-medium">Suggestions</AlertTitle>
          <AlertDescription>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              {errorInfo.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        {/* Compteur de tentatives */}
        {retryCount > 0 && (
          <p className="text-xs text-muted-foreground">
            Tentative {retryCount}/{maxRetries}
          </p>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          {(errorInfo.action === 'retry' || errorInfo.action === 'wait') && onRetry && canRetry && (
            <Button onClick={onRetry} className="gap-2" aria-label="Réessayer la génération">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Réessayer
            </Button>
          )}
          
          {errorInfo.action === 'upgrade' && (
            <Button 
              onClick={() => navigate(ROUTE_PATHS.medMngPricing)}
              className="gap-2"
              aria-label="Voir les offres d'abonnement"
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              Voir les offres
            </Button>
          )}
          
          {errorInfo.action === 'login' && (
            <Button 
              onClick={() => navigate(ROUTE_PATHS.medMngLogin)}
              className="gap-2"
              aria-label="Se connecter"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Se connecter
            </Button>
          )}
          
          {errorInfo.action === 'contact' && (
            <Button 
              variant="outline"
              onClick={() => window.open('mailto:contact@emotionscare.com', '_blank')}
              className="gap-2"
              aria-label="Contacter le support"
            >
              Contacter le support
            </Button>
          )}

          {onReset && (
            <Button variant="outline" onClick={onReset} className="gap-2" aria-label="Recommencer">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Recommencer
            </Button>
          )}

          {showHomeButton && (
            <Button 
              variant="ghost" 
              onClick={() => navigate(ROUTE_PATHS.home)}
              className="gap-2"
              aria-label="Retour à l'accueil"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Accueil
            </Button>
          )}
        </div>
        
        {/* Message si plus de tentatives */}
        {!canRetry && retryCount >= maxRetries && (
          <p className="text-xs text-destructive">
            Nombre maximum de tentatives atteint. Veuillez patienter ou contacter le support.
          </p>
        )}
      </div>
    </PremiumCard>
  );
};
