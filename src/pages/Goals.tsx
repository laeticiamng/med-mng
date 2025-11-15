import React from 'react';
import { GoalManager } from '@/components/goals/GoalManager';

/**
 * Goals Page
 * Page wrapper for GoalManager component
 * Route: /goals
 */
export const Goals: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <GoalManager />
    </div>
  );
};

export default Goals;
