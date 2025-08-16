import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Music, Gamepad2, FileText } from 'lucide-react';
import { EdnItemLight } from '@/hooks/useEdnItemsPaginated';

interface EdnItemCardProps {
  item: EdnItemLight;
  onClick: (item: EdnItemLight) => void;
}

export const EdnItemCard = memo<EdnItemCardProps>(({ item, onClick }) => {
  const completionPercentage = item.completeness_score || 0;
  
  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden hover:-translate-y-1"
      onClick={() => onClick(item)}
    >
      <CardContent className="p-0">
        <div className="p-6 space-y-4">
          {/* Header avec numéro item */}
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/40 transition-all duration-300">
              <span className="text-white font-bold text-sm">{item.item_code.replace('IC-', '')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full shadow-sm ${
                completionPercentage === 100 ? 'bg-emerald-500' : 
                completionPercentage > 70 ? 'bg-amber-500' : 'bg-slate-400'
              }`}></div>
              <Badge variant="outline" className="text-xs font-medium bg-white/60 backdrop-blur-sm border-white/30 rounded-lg px-2 py-1">
                {completionPercentage}%
              </Badge>
            </div>
          </div>
          
          {/* Titre */}
          <div>
            <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            {item.specialite && (
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                {item.specialite}
              </p>
            )}
          </div>
          
          {/* Indicateurs de contenu */}
          <div className="flex items-center gap-2">
            {item.has_music && (
              <div className="flex items-center gap-1 text-green-600 bg-green-50 rounded-full px-2 py-1">
                <Music className="h-3 w-3" />
                <span className="text-xs font-medium">Paroles</span>
              </div>
            )}
            {item.has_scene && (
              <div className="flex items-center gap-1 text-purple-600 bg-purple-50 rounded-full px-2 py-1">
                <Gamepad2 className="h-3 w-3" />
                <span className="text-xs font-medium">Scène</span>
              </div>
            )}
            {item.has_quiz && (
              <div className="flex items-center gap-1 text-blue-600 bg-blue-50 rounded-full px-2 py-1">
                <FileText className="h-3 w-3" />
                <span className="text-xs font-medium">Quiz</span>
              </div>
            )}
          </div>
          
          {/* Validation */}
          {item.is_validated && (
            <div className="flex items-center gap-1 text-emerald-600">
              <CheckCircle className="h-3 w-3" />
              <span className="text-xs font-medium">Validé</span>
            </div>
          )}
          
          {/* Compétences count */}
          {item.competences_count_total > 0 && (
            <div className="text-xs text-muted-foreground">
              {item.competences_count_total} compétences OIC
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

EdnItemCard.displayName = 'EdnItemCard';