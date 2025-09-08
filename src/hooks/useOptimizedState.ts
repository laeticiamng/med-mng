/**
 * 🚀 HOOKS D'ÉTAT OPTIMISÉS - MED-MNG v2.0
 * Gestion d'état haute performance avec cache et memoization
 */

import { useRef } from 'react';
import { logger } from '@/lib/logger';

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return {
    renderCount: renderCount.current,
    logRender: (additionalData?: Record<string, any>) => {
      logger.performance(`${componentName} render #${renderCount.current}`, additionalData);
    }
  };
}