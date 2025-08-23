import React from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useResponsiveSpacing } from '@/hooks/useBreakpoints';

const AdminCenter = () => {
  const spacing = useResponsiveSpacing();
  
  return (
    <div className="min-h-screen bg-background">
      <div className={`container mx-auto ${spacing.container}`}>
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminCenter;