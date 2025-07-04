import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600">Vérification de l'authentification...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      // Redirect to login with return path
      return <Navigate to="/med-mng/login" state={{ from: location }} replace />;
    }

    return <Component {...props} />;
  };
};

export const ProtectedRoute: React.FC<WithAuthProps> = ({ 
  children, 
  fallback = "/med-mng/login" 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};