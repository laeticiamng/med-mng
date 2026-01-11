import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { ROUTE_PATHS } from '@/config/routes';
import { TEST_MODE_ENABLED } from '@/config/testMode';
import { AlertTriangle } from 'lucide-react';

interface WithAuthProps {
  children: React.ReactNode;
  fallback?: string;
}

// 🧪 Bannière mode test
const TestModeBanner: React.FC = () => {
  if (!TEST_MODE_ENABLED) return null;
  
  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <AlertTriangle className="h-4 w-4" />
      🧪 MODE TEST ACTIF - Authentification désactivée
      <AlertTriangle className="h-4 w-4" />
    </div>
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