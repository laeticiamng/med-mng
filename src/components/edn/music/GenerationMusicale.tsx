import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Zap } from 'lucide-react';

interface GenerationMusicaleProps {
  item: any;
  paroles?: string[];
  onProgress?: (progress: number) => void;
}

export const GenerationMusicale: React.FC<GenerationMusicaleProps> = ({ item, paroles, onProgress }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Music className="h-5 w-5 text-white" />
          </div>
          <CardTitle>Génération Musicale</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
          <Zap className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">IA Musicale</h3>
          <p className="text-muted-foreground mb-4">
            Transformez les concepts de {item?.title} en chansons mémorables
          </p>
          {paroles && paroles.length > 0 && (
            <Badge variant="outline">{paroles.length} paroles disponibles</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};