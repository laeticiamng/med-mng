import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { ROUTE_PATHS } from '@/config/routes';
import { TEST_MODE_ENABLED } from '@/config/testMode';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WithAuthProps {
  children: React.ReactNode;
  fallback?: string;
}

// 🧪 Bannière mode test améliorée avec lien de désactivation
const TestModeBanner: React.FC = () => {
  const [dismissed, setDismissed] = React.useState(false);
  
  if (!TEST_MODE_ENABLED || dismissed) return null;
  
  return (
    <div className="fixed top-16 left-0 right-0 z-[60] bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 shadow-lg">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>🧪 MODE TEST ACTIF - Authentification désactivée</span>
      <span className="hidden sm:inline text-destructive-foreground/80">
        | Pour désactiver: <code className="bg-destructive-foreground/20 px-1 rounded text-xs">src/config/testMode.ts → TEST_MODE_ENABLED = false</code>
      </span>
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <Button 
        variant="ghost" 
        size="icon"
        className="h-6 w-6 ml-2 hover:bg-destructive-foreground/20"
        onClick={() => setDismissed(true)}
        aria-label="Masquer la bannière"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Wrapper pour ajouter le padding si la bannière est visible
const TestModeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dismissed, setDismissed] = React.useState(false);
  
  return (
    <>
      <TestModeBanner />
      <div className={TEST_MODE_ENABLED && !dismissed ? "pt-10" : ""}>
        {children}
      </div>
    </>
  );
};

export const withAuth = (Component: React.ComponentType<any>) => {
  return function AuthenticatedComponent(props: any) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // 🧪 BYPASS MODE TEST
    if (TEST_MODE_ENABLED) {
      return (
        <>
          <TestModeBanner />
          <div className="pt-10">
            <Component {...props} />
          </div>
        </>
      );
    }

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-primary">Vérification de l'authentification...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to={ROUTE_PATHS.medMngLogin} state={{ from: location }} replace />;
    }

    return <Component {...props} />;
  };
};

export const ProtectedRoute: React.FC<WithAuthProps> = ({ 
  children, 
  fallback = ROUTE_PATHS.medMngLogin
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 🧪 BYPASS MODE TEST
  if (TEST_MODE_ENABLED) {
    return (
      <>
        <TestModeBanner />
        <div className="pt-10">
          {children}
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};