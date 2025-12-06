
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComicPanelProps {
  panel: {
    id: number;
    title: string;
    text: string;
    imageUrl: string;
    competences?: string[];
    isGenerated?: boolean;
  };
}

export const ComicPanel = ({ panel }: ComicPanelProps) => {
  const isPlaceholder = panel.imageUrl.startsWith('placeholder-') || panel.imageUrl.startsWith('data:image/svg+xml');
  
  return (
    <Card className="relative overflow-hidden bg-background border-4 border-primary shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-3xl group">
      {/* Effet de bande dessinée avec bordure stylée */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 opacity-20"></div>
      
      <div className="relative p-6 space-y-4">
        {/* En-tête de la vignette */}
        <div className="flex items-center justify-between mb-4">
          <Badge 
            variant="outline" 
            className="text-primary border-primary bg-primary/10 font-bold text-sm px-3 py-1 shadow-sm"
          >
            Panel {panel.id}
          </Badge>
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {panel.title}
          </div>
        </div>
        
        {/* Image principale avec effet bande dessinée */}
        <div className="relative overflow-hidden rounded-xl border-3 border-primary/30 shadow-xl">
          {panel.isGenerated && !isPlaceholder ? (
            <img 
              src={panel.imageUrl} 
              alt={panel.title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              {panel.imageUrl.startsWith('data:image/svg+xml') ? (
                <img 
                  src={panel.imageUrl} 
                  alt={panel.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <p className="text-primary font-medium">Image en attente de génération</p>
                </div>
              )}
            </div>
          )}
          
          {/* Effet de dégradé pour donner un aspect comic */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent"></div>
          
          {/* Bulle de dialogue stylée */}
          <div className="absolute top-2 right-2 bg-background rounded-full p-2 shadow-lg border-2 border-primary">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Texte narratif avec style bande dessinée */}
        <div className="relative bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-xl border-2 border-primary/20 shadow-inner">
          {/* Petite décoration en coin */}
          <div className="absolute -top-1 -left-1 w-4 h-4 bg-primary rotate-45 border border-primary"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rotate-45 border border-primary"></div>
          
          <p className="text-foreground font-medium italic leading-relaxed text-sm">
            {panel.text}
          </p>
          
          {/* Informations sur les compétences */}
          {panel.competences && panel.competences.length > 0 && (
            <div className="mt-3 pt-2 border-t border-primary/20">
              <p className="text-xs text-primary font-semibold">
                🎯 {panel.competences.length} compétence(s) abordée(s)
              </p>
            </div>
          )}
          
          {/* Signature artistique */}
          <div className="flex justify-end mt-2">
            <div className="text-xs text-primary font-bold opacity-70">
              #{panel.id}
            </div>
          </div>
        </div>
      </div>
      
      {/* Effet d'ombre portée pour donner de la profondeur */}
      <div className="absolute -bottom-2 -right-2 w-full h-full bg-primary/20 rounded-lg -z-10 opacity-30"></div>
    </Card>
  );
};
