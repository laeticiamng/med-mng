import React from 'react';
import { AdminNavigation } from '@/components/navigation/AdminNavigation';

export const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <AdminNavigation />
      </div>
    </div>
  );
};