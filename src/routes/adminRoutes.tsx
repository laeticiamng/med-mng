import { lazy } from 'react';

// Lazy load admin components
const AdminCenter = lazy(() => import('@/pages/AdminCenter'));

export const adminRoutes = [
  {
    path: '/admin',
    element: AdminCenter,
    title: 'Centre d\'Administration'
  }
];