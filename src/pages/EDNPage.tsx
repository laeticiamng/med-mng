import React from 'react';
import { EDNNavigation } from '@/components/navigation/EDNNavigation';

export const EDNPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <EDNNavigation />
      </div>
    </div>
  );
};