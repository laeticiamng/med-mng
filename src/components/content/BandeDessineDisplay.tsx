import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  BookOpen,
  Grid3X3
} from 'lucide-react';

interface BDPanel {
  id: string;
  image_url: string;
  text: string;
  character?: string;
  panel_number: number;
}

interface BDData {
  title: string;
  item_code: string;
  panels: BDPanel[];
  style: string;
  generated_at: string;
}

interface BandeDessineDisplayProps {
  data: BDData;
  className?: string;
}

export const BandeDessineDisplay: React.FC<BandeDessineDisplayProps> = ({
  data,
  className
}) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  
  const nextPanel = () => {
    setCurrentPanel(prev => (prev + 1) % data.panels.length);
  };
  
  const prevPanel = () => {
    setCurrentPanel(prev => (prev - 1 + data.panels.length) % data.panels.length);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!data || !data.panels || data.panels.length === 0) {
    return (
      <Card className={`border-2 border-warning/30 ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-16 w-16 text-warning mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Bande Dessinée en préparation
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            La BD pédagogique pour {data?.item_code || 'cet item'} est en cours de génération IA
          </p>
        </CardContent>
      </Card>
    );
  }

  const containerClass = isFullscreen 
    ? 'fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col'
    : `${className}`;

  return (
    <div className={containerClass}>
      <Card className={`border-2 border-warning/30 ${isFullscreen ? 'border-none' : ''}`}>
        <CardHeader className={`bg-gradient-to-r from-primary to-accent text-primary-foreground ${isFullscreen ? 'px-6 py-4' : ''}`}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {data.title} - Bande Dessinée
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                {data.panels.length} panels
              </Badge>
              <Badge variant="outline" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                {data.style}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className={`p-0 ${isFullscreen ? 'flex-1' : ''}`}>
          {/* Contrôles */}
          <div className="p-4 bg-muted/50 border-b flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('single')}
              >
                Vue Panel
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Galerie
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Affichage selon le mode */}
          {viewMode === 'single' ? (
            <div className="relative">
              {/* Navigation panels */}
              <div className="flex items-center justify-between p-4 bg-muted">
                <Button variant="outline" size="sm" onClick={prevPanel}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <span className="text-sm font-medium">
                  Panel {currentPanel + 1} sur {data.panels.length}
                </span>
                <Button variant="outline" size="sm" onClick={nextPanel}>
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {/* Panel unique */}
              <div className={`flex flex-col items-center p-6 ${isFullscreen ? 'flex-1' : 'min-h-[500px]'}`}>
                <div 
                  className="relative bg-card border-2 border-border rounded-lg shadow-lg overflow-hidden"
                  style={{ 
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center',
                    maxWidth: isFullscreen ? '80vw' : '600px',
                    maxHeight: isFullscreen ? '70vh' : '400px'
                  }}
                >
                  <img
                    src={data.panels[currentPanel]?.image_url || '/placeholder-bd-panel.png'}
                    alt={`Panel ${currentPanel + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-bd-panel.png';
                    }}
                  />
                  
                  {/* Texte du panel */}
                  {data.panels[currentPanel]?.text && (
                    <div className="absolute bottom-0 left-0 right-0 bg-card/90 p-3 border-t">
                      <p className="text-sm font-medium text-foreground">
                        {data.panels[currentPanel].text}
                      </p>
                      {data.panels[currentPanel].character && (
                        <p className="text-xs text-primary mt-1">
                          — {data.panels[currentPanel].character}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Mode galerie */
            <ScrollArea className={isFullscreen ? 'flex-1' : 'h-[600px]'}>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {data.panels.map((panel, index) => (
                    <div
                      key={panel.id}
                      className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                        index === currentPanel ? 'border-warning shadow-lg' : 'border-border'
                      }`}
                      onClick={() => {
                        setCurrentPanel(index);
                        setViewMode('single');
                      }}
                    >
                      <img
                        src={panel.image_url || '/placeholder-bd-panel.png'}
                        alt={`Panel ${index + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-bd-panel.png';
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-foreground/70 text-background">
                          {index + 1}
                        </Badge>
                      </div>
                      {panel.text && (
                        <div className="p-2 bg-card border-t">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {panel.text}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}

          {/* Footer informatif */}
          <div className="p-4 bg-muted/50 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                📚 Contenu pédagogique généré par IA - Version unique partagée
              </span>
              <span>
                Généré le {new Date(data.generated_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};