import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book, Sparkles } from 'lucide-react';

interface BandeDessineeProps {
  item: any;
  storyData?: any;
  onProgress?: (progress: number) => void;
}

export const BandeDessinee: React.FC<BandeDessineeProps> = ({ item, storyData, onProgress }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <Book className="h-5 w-5 text-white" />
          </div>
          <CardTitle>Bande Dessinée</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
          <Sparkles className="h-16 w-16 text-orange-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Histoire illustrée</h3>
          <p className="text-muted-foreground mb-4">
            Découvrez {item?.title} à travers une aventure narrative
          </p>
          <Badge variant="secondary">Création artistique en cours</Badge>
        </div>
      </CardContent>
    </Card>
  );
};