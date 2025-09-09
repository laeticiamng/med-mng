/**
 * Graphique de progrès EDN
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface EdnProgressChartProps {
  userProgress: any[];
}

export const EdnProgressChart: React.FC<EdnProgressChartProps> = ({
  userProgress
}) => {
  const completionRate = 0.75;
  const masteredItems = 30;
  const totalItems = 367;
  const userLevel = 'intermediate';
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Progrès EDN</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Complétion</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(completionRate * 100)}%
            </span>
          </div>
          <Progress value={completionRate * 100} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{masteredItems}</div>
            <div className="text-sm text-muted-foreground">Items maîtrisés</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{totalItems}</div>
            <div className="text-sm text-muted-foreground">Total items</div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="text-sm font-medium">Niveau actuel:</div>
          <div className="text-lg font-bold capitalize text-accent">{userLevel}</div>
        </div>
      </div>
    </Card>
  );
};