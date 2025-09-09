import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Camera } from 'lucide-react';

interface SceneImmersiveProps {
  item: any;
  sceneData?: any;
  onProgress?: (progress: number) => void;
}

export const SceneImmersive: React.FC<SceneImmersiveProps> = ({ item, sceneData, onProgress }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <CardTitle>Scène Immersive</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
          <Play className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Expérience immersive</h3>
          <p className="text-muted-foreground mb-4">
            Explorez {item?.title} dans un environnement 3D interactif
          </p>
          <Badge variant="secondary">Bientôt disponible</Badge>
        </div>
      </CardContent>
    </Card>
  );
};