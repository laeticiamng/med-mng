import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Book, FileText, Palette, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoryContent {
  type: 'bd' | 'roman' | 'poeme';
  title: string;
  content: string | Panel[];
  metadata?: {
    author?: string;
    style?: string;
    theme?: string;
  };
}

interface Panel {
  id: number;
  image_url: string;
  text: string;
  dialogue?: string;
}

interface ContentViewerProps {
  content: StoryContent;
  itemCode: string;
  onClose?: () => void;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({ content, itemCode, onClose }) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showText, setShowText] = useState(true);

  const renderBD = () => {
    const panels = content.content as Panel[];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPanel(Math.max(0, currentPanel - 1))}
              disabled={currentPanel === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPanel + 1} / {panels.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPanel(Math.min(panels.length - 1, currentPanel + 1))}
              disabled={currentPanel === panels.length - 1}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(50, zoom - 25))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">{zoom}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(200, zoom + 25))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <div 
            className="mx-auto max-w-2xl transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <img
              src={panels[currentPanel]?.image_url}
              alt={`Panel ${currentPanel + 1}`}
              className="w-full rounded-lg shadow-lg"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
          
          {showText && panels[currentPanel]?.text && (
            <Card className="mt-4 bg-background/95 backdrop-blur">
              <CardContent className="p-4">
                <p className="text-sm">{panels[currentPanel].text}</p>
                {panels[currentPanel]?.dialogue && (
                  <blockquote className="mt-2 border-l-4 border-primary pl-4 italic">
                    {panels[currentPanel].dialogue}
                  </blockquote>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  const renderRoman = () => {
    const text = content.content as string;
    const chapters = text.split('\n\n');
    
    return (
      <ScrollArea className="h-[600px] w-full">
        <div className="prose dark:prose-invert max-w-none p-6">
          {chapters.map((chapter, index) => (
            <div key={index} className="mb-6">
              <p className="text-justify leading-relaxed">{chapter}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  const renderPoeme = () => {
    const verses = (content.content as string).split('\n');
    
    return (
      <div className="space-y-6 p-6 text-center">
        <div className="space-y-4">
          {verses.map((verse, index) => (
            <p key={index} className="text-lg leading-relaxed italic">
              {verse}
            </p>
          ))}
        </div>
      </div>
    );
  };

  const getIcon = () => {
    switch (content.type) {
      case 'bd': return <Palette className="h-5 w-5" />;
      case 'roman': return <Book className="h-5 w-5" />;
      case 'poeme': return <FileText className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (content.type) {
      case 'bd': return 'Bande Dessinée';
      case 'roman': return 'Roman';
      case 'poeme': return 'Poème';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-xl">{getTitle()}</CardTitle>
            <Badge variant="secondary">{itemCode}</Badge>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
        
        <div>
          <h3 className="font-semibold text-lg">{content.title}</h3>
          {content.metadata && (
            <div className="flex gap-2 mt-2">
              {content.metadata.style && (
                <Badge variant="outline">{content.metadata.style}</Badge>
              )}
              {content.metadata.theme && (
                <Badge variant="outline">{content.metadata.theme}</Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          ⚠️ Contenu généré par IA • Version unique partagée • Lecture seule
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        {content.type === 'bd' && renderBD()}
        {content.type === 'roman' && renderRoman()}
        {content.type === 'poeme' && renderPoeme()}
      </CardContent>
    </Card>
  );
};

export const ContentLibrary: React.FC<{ itemCode: string }> = ({ itemCode }) => {
  const [selectedContent, setSelectedContent] = useState<StoryContent | null>(null);
  
  // Données exemple - en réel, viendraient de l'API
  const contents: StoryContent[] = [
    {
      type: 'bd',
      title: `${itemCode} en BD - L'aventure médicale`,
      content: [
        {
          id: 1,
          image_url: 'https://via.placeholder.com/500x700/4f46e5/white?text=Panel+1',
          text: "Notre histoire commence dans le service d'urgences...",
          dialogue: "Docteur, nous avons un cas urgent !"
        },
        {
          id: 2,
          image_url: 'https://via.placeholder.com/500x700/7c3aed/white?text=Panel+2',
          text: "Le médecin analyse rapidement la situation...",
          dialogue: "Voyons les symptômes..."
        },
      ],
      metadata: { style: 'Médical', theme: 'Urgences' }
    },
    {
      type: 'roman',
      title: `${itemCode} - Le Roman Médical`,
      content: `Chapitre 1: La Découverte\n\nDans les couloirs blancs de l'hôpital, le Dr. Martin avançait d'un pas assuré. Cette journée allait marquer un tournant dans sa compréhension de ${itemCode}.\n\nChapitre 2: L'Analyse\n\nFace au patient, tous ses sens étaient en éveil. Chaque détail comptait pour établir le bon diagnostic.\n\nChapitre 3: La Révélation\n\nSoudain, tout s'éclaircit. Les pièces du puzzle s'assemblaient enfin...`,
      metadata: { style: 'Fiction Médicale', theme: 'Diagnostic' }
    },
    {
      type: 'poeme',
      title: `${itemCode} - Vers Médicaux`,
      content: `Dans le silence des salles blanches,\nRésonne l'écho des diagnostics,\nChaque symptôme a sa révélation,\nChaque patient, son histoire unique.\n\nLa médecine, art et science mêlés,\nGuide nos pas vers la guérison,\n${itemCode}, clé de compréhension,\nOuvre les portes du savoir.`,
      metadata: { style: 'Poésie Médicale', theme: 'Humanisme' }
    }
  ];

  if (selectedContent) {
    return (
      <ContentViewer
        content={selectedContent}
        itemCode={itemCode}
        onClose={() => setSelectedContent(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Contenus Pédagogiques IA</h2>
        <p className="text-muted-foreground">
          Contenus uniques générés par IA • Même version pour tous les utilisateurs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contents.map((content, index) => (
          <Card 
            key={index}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedContent(content)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                {content.type === 'bd' && <Palette className="h-5 w-5 text-accent" />}
                {content.type === 'roman' && <Book className="h-5 w-5 text-primary" />}
                {content.type === 'poeme' && <FileText className="h-5 w-5 text-success" />}
                <CardTitle className="text-lg">{content.title}</CardTitle>
              </div>
              {content.metadata && (
                <div className="flex gap-1">
                  {content.metadata.style && (
                    <Badge variant="outline" className="text-xs">
                      {content.metadata.style}
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Lire {content.type === 'bd' ? 'la BD' : content.type === 'roman' ? 'le roman' : 'le poème'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};