import React from 'react';
import { EnhancedContentViewer } from './EnhancedContentViewer';

interface PedagogicalContentDisplayProps {
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
  className?: string;
}

export const PedagogicalContentDisplay: React.FC<PedagogicalContentDisplayProps> = ({
  itemCode,
  tableauRangA,
  tableauRangB,
  className
}) => {
  const itemData = {
    title: `Item ${itemCode}`,
    tableau_rang_a: tableauRangA,
    tableau_rang_b: tableauRangB
  };

  return (
    <div className={className}>
      <EnhancedContentViewer 
        itemCode={itemCode} 
        itemData={itemData}
      />
    </div>
  );
};