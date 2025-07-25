import { lazy } from 'react';

// Lazy load monitoring components
const MonitoringCenter = lazy(() => import('@/pages/MonitoringCenter'));

export const monitoringRoutes = [
  {
    path: '/monitoring',
    element: MonitoringCenter,
    title: 'Centre de Monitoring'
  }
];