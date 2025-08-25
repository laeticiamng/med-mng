import React from 'react';
import { createRoot } from 'react-dom/client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UXToolbar } from '@/components/ux/UXToolbar';
import App from './App.minimal';

const AppWithToolbar = () => {
  return (
    <TooltipProvider>
      <App />
      <UXToolbar />
    </TooltipProvider>
  );
};

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<AppWithToolbar />);
}
