/**
 * 🚀 APP ROUTES - MED-MNG v3.0
 * Routage optimisé avec authentification
 */

import React from 'react';
import { OptimizedRoutes } from '@/components/routes/OptimizedRoutes';

interface AppRoutesProps {
  className?: string;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ className }) => {
  return (
    <div className={className}>
      <OptimizedRoutes />
    </div>
  );
};

export default AppRoutes;