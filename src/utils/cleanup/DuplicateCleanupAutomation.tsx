// DEPRECATED: Use RealDuplicateCleanup instead
export { RealDuplicateCleanup as DuplicateCleanupAutomation } from './RealDuplicateCleanup';

// Legacy component - redirect to new implementation
import React from 'react';
import { RealDuplicateCleanup } from './RealDuplicateCleanup';

export const LegacyDuplicateCleanupAutomation: React.FC = () => {
  // Redirect to new implementation
  return <RealDuplicateCleanup />;
};