import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnhancedTableauDisplayProps {
  item: {
    id: string;
    title: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
    item_code: string;
  };
  rang: 'A' | 'B';
  onProgress?: (progress: number) => void;
}

export const EnhancedTableauDisplay: React.FC<EnhancedTableauDisplayProps> = ({
  item,
  rang,
  onProgress
}) => {
  const [tableauData, setTableauData] = useState(null);
  
  useEffect(() => {
    if (rang === 'A' && item?.tableau_rang_a) {
      setTableauData(item.tableau_rang_a);
    } else if (rang === 'B' && item?.tableau_rang_b) {
      setTableauData(item.tableau_rang_b);
    }
  }, [item, rang]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>📊 Tableau Rang {rang} - {item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Contenu médical pour l'item {item.item_code} - Rang {rang}
          </p>
          {tableauData ? (
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(tableauData, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Chargement du tableau...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};