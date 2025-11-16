import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Type,
  Heart,
  Share2,
  Copy,
  Volume2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PoemeStanza {
  id: string;
  lines: string[];
  medical_focus: string;
  stanza_number: number;
}

interface PoemeData {
  title: string;
  item_code: string;
  subtitle?: string;
  stanzas: PoemeStanza[];
  style: string;
  rhyme_scheme: string;
  total_lines: number;
  key_concepts: string[];
  generated_at: string;
}

interface PoemeDisplayProps {
  data: PoemeData;
  className?: string;
}

export const PoemeDisplay: React.FC<PoemeDisplayProps> = ({
  data,
  className
}) => {
  const [fontSize, setFontSize] = useState(18);
  const [highlightedStanza, setHighlightedStanza] = useState<number | null>(null);
  const { toast } = useToast();

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 28));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 14));

  const copyToClipboard = async () => {
    const fullPoem = data.stanzas
      .map(stanza => stanza.lines.join('\n'))
      .join('\n\n');
    
    try {
      await navigator.clipboard.writeText(fullPoem);
      toast({
        title: "📋 Poème copié !",
        description: "Le texte a été copié dans votre presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur de copie",
        description: "Impossible de copier le texte",
        variant: "destructive",
      });
    }
  };

  const speakPoem = () => {
    if ('speechSynthesis' in window) {
      const fullText = data.stanzas
        .map(stanza => stanza.lines.join('. '))
        .join('. ');
      
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
      
      toast({
        title: "🔊 Lecture audio démarrée",
        description: "Le poème est lu à voix haute",
      });
    } else {
      toast({
        title: "Fonction non disponible",
        description: "La lecture audio n'est pas supportée par votre navigateur",
        variant: "destructive",
      });
    }
  };

  if (!data || !data.stanzas || data.stanzas.length === 0) {
    return (
      <Card className={`border-2 border-purple-200 ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-purple-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Poème pédagogique en préparation
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Le poème médical pour {data?.item_code || 'cet item'} est en cours de génération IA
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 border-purple-200 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {data.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              {data.stanzas.length} strophes
            </Badge>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              {data.total_lines} vers
            </Badge>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              {data.rhyme_scheme}
            </Badge>
          </div>
        </div>
        {data.subtitle && (
          <p className="text-purple-100 text-sm mt-1 italic">{data.subtitle}</p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Contrôles */}
        <div className="p-4 bg-gray-50 border-b flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={decreaseFontSize}>
              <Type className="h-4 w-4" />
              A-
            </Button>
            <span className="text-sm px-2">{fontSize}px</span>
            <Button variant="outline" size="sm" onClick={increaseFontSize}>
              <Type className="h-4 w-4" />
              A+
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={speakPoem}>
              <Volume2 className="h-4 w-4 mr-1" />
              Écouter
            </Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-1" />
              Copier
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Partager
            </Button>
          </div>
        </div>

        {/* Concepts clés */}
        <div className="p-4 bg-purple-50 border-b">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Concepts médicaux intégrés
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.key_concepts.map((concept, index) => (
              <Badge key={index} variant="outline" className="bg-purple-100 border-purple-300 text-purple-700">
                {concept}
              </Badge>
            ))}
          </div>
        </div>

        {/* Poème */}
        <ScrollArea className="h-[600px]">
          <div className="p-8">
            <div className="max-w-2xl mx-auto">
              {data.stanzas.map((stanza, stanzaIndex) => (
                <div
                  key={stanza.id}
                  className={`mb-8 p-4 rounded-lg transition-all cursor-pointer ${
                    highlightedStanza === stanzaIndex
                      ? 'bg-purple-50 border-2 border-purple-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHighlightedStanza(stanzaIndex)}
                  onMouseLeave={() => setHighlightedStanza(null)}
                >
                  {/* Numéro de strophe et focus médical */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      Strophe {stanza.stanza_number}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                      {stanza.medical_focus}
                    </Badge>
                  </div>

                  {/* Vers de la strophe */}
                  <div 
                    className="text-center space-y-2"
                    style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
                  >
                    {stanza.lines.map((line, lineIndex) => (
                      <p 
                        key={lineIndex} 
                        className="text-gray-800 font-medium"
                        style={{ 
                          fontFamily: 'Georgia, serif',
                          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Informations sur le style */}
        <div className="p-4 bg-purple-50 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-purple-700 font-medium">
                Style: {data.style}
              </span>
              <span className="text-purple-600">
                Schéma de rimes: {data.rhyme_scheme}
              </span>
            </div>
            <span className="text-gray-600">
              {data.total_lines} vers au total
            </span>
          </div>
        </div>

        {/* Footer informatif */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
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
  );
};