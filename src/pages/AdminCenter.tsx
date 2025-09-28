import React from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

const AdminCenter = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminCenter;