import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Image, ChevronLeft, ChevronRight, Maximize2, 
  Download, Share2, Eye, BookOpen
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BdGalleryProps {
  itemCode: string;
  title: string;
  tableauRangA?: any;
  tableauRangB?: any;
}

export const BdGallery: React.FC<BdGalleryProps> = ({ 
  itemCode, 
  title, 
  tableauRangA, 
  tableauRangB 
}) => {
  const [currentVignette, setCurrentVignette] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();

  // Générer des vignettes basées sur les compétences
  const generateVignettes = (): Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    type: string;
    competences?: number;
  }> => {
    const vignettes: Array<{
      id: string;
      title: string;
      description: string;
      image: string;
      type: string;
      competences?: number;
    }> = [];
    
    // Vignette d'introduction
    vignettes.push({
      id: 'intro',
      title: `${itemCode} - Introduction`,
      description: `Découvrez l'univers médical de ${title}`,
      image: `https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop`,
      type: 'intro'
    });

    // Vignettes pour rang A
    const rangASections = tableauRangA?.sections || [];
    rangASections.forEach((section: any, index: number) => {
      vignettes.push({
        id: `rang-a-${index}`,
        title: `Rang A - ${section.title || `Compétence ${index + 1}`}`,
        description: `Compétences fondamentales pour ${itemCode}`,
        image: `https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=600&fit=crop`,
        type: 'rang-a',
        competences: section.concepts?.length || 0
      });
    });

    // Vignettes pour rang B
    const rangBSections = tableauRangB?.sections || [];
    rangBSections.forEach((section: any, index: number) => {
      vignettes.push({
        id: `rang-b-${index}`,
        title: `Rang B - ${section.title || `Expertise ${index + 1}`}`,
        description: `Compétences expertes pour ${itemCode}`,
        image: `https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop`,
        type: 'rang-b',
        competences: section.concepts?.length || 0
      });
    });

    // Vignette de conclusion
    vignettes.push({
      id: 'conclusion',
      title: `${itemCode} - Synthèse`,
      description: `Intégration complète des compétences médicales`,
      image: `https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&h=600&fit=crop`,
      type: 'conclusion'
    });

    return vignettes;
  };

  const vignettes = generateVignettes();

  const nextVignette = () => {
    setCurrentVignette((prev) => (prev + 1) % vignettes.length);
  };

  const prevVignette = () => {
    setCurrentVignette((prev) => (prev - 1 + vignettes.length) % vignettes.length);
  };

  const getVignetteColor = (type: string) => {
    switch (type) {
      case 'intro': return 'border-blue-300 bg-blue-50';
      case 'rang-a': return 'border-green-300 bg-green-50';
      case 'rang-b': return 'border-purple-300 bg-purple-50';
      case 'conclusion': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'intro': return <Eye className="h-4 w-4" />;
      case 'rang-a': return <BookOpen className="h-4 w-4" />;
      case 'rang-b': return <BookOpen className="h-4 w-4" />;
      case 'conclusion': return <Eye className="h-4 w-4" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  if (vignettes.length === 0) {
    return (
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-6 w-6" />
            BD Interactive - {itemCode}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Génération de la BD en cours...</p>
        </CardContent>
      </Card>
    );
  }

  const currentVig = vignettes[currentVignette];
  if (!currentVig) {
    return <div>Erreur: Vignette non trouvée</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <Card className="border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Image className="h-6 w-6" />
              BD Interactive - {itemCode}
            </CardTitle>
            <Badge className="bg-white/20 text-white">
              {currentVignette + 1} / {vignettes.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevVignette}
              disabled={vignettes.length <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <div className="text-sm text-gray-600">
              {currentVig.title}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextVignette}
              disabled={vignettes.length <= 1}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vignette principale */}
      <Card className={`border-2 ${getVignetteColor(currentVig.type)}`}>
        <CardContent className="p-0">
          <div className="relative">
            <img 
              src={currentVig.image} 
              alt={currentVig.title}
              className={`w-full ${isMobile ? 'h-48' : 'h-96'} object-cover rounded-t-lg`}
            />
            <div className="absolute top-4 left-4">
              <Badge className={`${getVignetteColor(currentVig.type)} border-2`}>
                {getTypeIcon(currentVig.type)}
                <span className="ml-1">{currentVig.type.toUpperCase()}</span>
              </Badge>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className={isMobile ? 'p-4' : 'p-6'}>
            <h3 className="text-xl font-bold mb-2">{currentVig.title}</h3>
            <p className="text-gray-600 mb-4">{currentVig.description}</p>
            
            {currentVig.competences && currentVig.competences > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">
                  {currentVig.competences} compétences
                </Badge>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Télécharger
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Partager
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Miniatures */}
      <Card>
        <CardContent className="p-4">
          <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8'} gap-2`}>
            {vignettes.map((vignette, index) => (
              <button
                key={vignette.id}
                onClick={() => setCurrentVignette(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                  ${index === currentVignette 
                    ? 'border-indigo-500 ring-2 ring-indigo-200' 
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <img 
                  src={vignette.image} 
                  alt={vignette.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-1 left-1">
                  {getTypeIcon(vignette.type)}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};