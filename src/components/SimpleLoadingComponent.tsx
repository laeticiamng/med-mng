import React from 'react';

export const SimpleLoadingComponent: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center text-white">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Chargement...</p>
      </div>
    </div>
  );
};