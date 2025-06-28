
import React from 'react';
import { useAuth } from './AuthProvider';
import { Navigate } from 'react-router-dom';

export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/med-mng/login" replace />;
    }

    return <Component {...props} />;
  };
};
