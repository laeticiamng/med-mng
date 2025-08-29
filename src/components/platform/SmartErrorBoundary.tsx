import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Home, 
  RefreshCw, 
  ArrowLeft, 
  BookOpen, 
  Music,
  MessageSquare,
  BarChart3
} from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const SmartErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();

  // Suggestions intelligentes basées sur l'erreur
  const getSmartSuggestions = () => {
    const suggestions = [
      { title: 'Accueil', path: '/', icon: Home, description: 'Retourner à la page principale' },
      { title: 'Items EDN', path: '/edn', icon: BookOpen, description: 'Contenus pédagogiques' },
      { title: 'Générateur Musical', path: '/generator', icon: Music, description: 'Créer de la musique' },
      { title: 'Assistant IA', path: '/chat', icon: MessageSquare, description: 'Aide intelligente' },
      { title: 'Dashboard', path: '/dashboard', icon: BarChart3, description: 'Vue d\'ensemble' }
    ];

    return suggestions;
  };

  const suggestions = getSmartSuggestions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900/20 via-orange-900/20 to-yellow-900/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-black/80 backdrop-blur-xl border-red-500/30">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <CardTitle className="text-2xl text-white mb-2">
            Oups ! Quelque chose s'est mal passé
          </CardTitle>
          
          <CardDescription className="text-white/70 text-lg">
            Une erreur inattendue s'est produite. Ne vous inquiétez pas, nous pouvons vous aider à continuer.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Détails de l'erreur (en mode développement) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-2">Détails de l'erreur:</h4>
              <code className="text-red-300 text-sm bg-black/50 p-2 rounded block overflow-auto">
                {error.message}
              </code>
            </div>
          )}

          {/* Actions principales */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={resetErrorBoundary}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>

          {/* Suggestions intelligentes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="text-white font-semibold">Suggestions pour continuer :</h4>
              <Badge className="bg-blue-500/20 border-blue-500/40 text-blue-300">
                Navigation intelligente
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((suggestion) => {
                const IconComponent = suggestion.icon;
                
                return (
                  <Button
                    key={suggestion.path}
                    variant="ghost"
                    onClick={() => navigate(suggestion.path)}
                    className="h-auto p-4 text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-blue-400 shrink-0" />
                      <div>
                        <div className="text-white font-medium">{suggestion.title}</div>
                        <div className="text-white/60 text-sm">{suggestion.description}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Message d'encouragement */}
          <div className="text-center bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-300">
              🚀 MED MNG est conçu pour être robuste et fiable. 
              Cette erreur nous aide à améliorer l'expérience pour tous !
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SmartErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={SmartErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Application Error:', error);
        console.error('Error Info:', errorInfo);
        
        // En production, on pourrait envoyer l'erreur à un service de monitoring
        if (process.env.NODE_ENV === 'production') {
          // Exemple: Sentry.captureException(error);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
};