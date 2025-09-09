import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface AdvancedBandeDessineeProps {
  item: {
    id: string;
    title: string;
    scene_immersive?: any;
    item_code: string;
  };
  onProgress?: (progress: number) => void;
}

export const AdvancedBandeDessinee: React.FC<AdvancedBandeDessineeProps> = ({
  item,
  onProgress
}) => {
  const [bdData, setBdData] = useState(null);
  
  useEffect(() => {
    if (item?.scene_immersive) {
      const bdContent = {
        panels: item.scene_immersive.panels || [],
        characters: item.scene_immersive.characters || [],
        story: item.scene_immersive.scenario || ""
      };
      setBdData(bdContent);
    }
  }, [item]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>🎨 Bande Dessinée Médicale - {item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Bande dessinée interactive pour l'item {item.item_code}
          </p>
          {bdData ? (
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p>{JSON.stringify(bdData, null, 2)}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Chargement du contenu BD...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};