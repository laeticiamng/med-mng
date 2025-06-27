
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComicPanelProps {
  panel: {
    id: number;
    title: string;
    text: string;
    imageUrl: string;
  };
}

export const ComicPanel = ({ panel }: ComicPanelProps) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-amber-700 border-amber-300">
            Vignette {panel.id}
          </Badge>
          <h3 className="text-lg font-semibold text-amber-900">
            {panel.title}
          </h3>
        </div>
        
        <div className="relative">
          <img 
            src={panel.imageUrl} 
            alt={panel.title}
            className="w-full h-48 object-cover rounded-lg border-2 border-amber-200"
          />
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-amber-200">
          <p className="text-amber-900 font-medium italic">
            {panel.text}
          </p>
        </div>
      </div>
    </Card>
  );
};
