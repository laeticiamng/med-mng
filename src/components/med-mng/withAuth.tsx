import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { ROUTE_PATHS } from '@/config/routes';

interface WithAuthProps {
  children: React.ReactNode;
  fallback?: string;
}

export const withAuth = (Component: React.ComponentType<any>) => {
  return function AuthenticatedComponent(props: any) {
    const { user, loading } = useAuth();
    const location = useLocation();

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
      // Redirect to login with return path
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