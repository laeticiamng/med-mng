import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} reset={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  reset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, reset }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-warning/5 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl text-destructive">
            Oups ! Une erreur s'est produite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Nous sommes désolés, quelque chose s'est mal passé. Vous pouvez essayer de recharger la page ou retourner à l'accueil.
          </p>
          
          {error && import.meta.env.DEV && (
            <details className="bg-muted p-3 rounded-lg text-sm">
              <summary className="cursor-pointer font-semibold text-destructive mb-2">
                Détails de l'erreur (développement)
              </summary>
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={reset}
              className="flex-1 flex items-center gap-2"
              variant="default"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="flex-1 flex items-center gap-2"
              variant="outline"
            >
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};