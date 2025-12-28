import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Image, ChevronLeft, ChevronRight, Maximize2, 
  Download, Share2, Eye, BookOpen, Flame, Star, Loader2
} from 'lucide-react';
import { exportToPDF, shareContent, exportAsImage } from '@/utils/exportUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { useOicCompetences } from '@/hooks/useOicCompetences';
import { supabase } from '@/integrations/supabase/client';

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
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const isMobile = useIsMobile();
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();
  
  // Charger les vraies compétences OIC
  const { competences: competencesA, loading: loadingA } = useOicCompetences(itemCode, 'A');
  const { competences: competencesB, loading: loadingB } = useOicCompetences(itemCode, 'B');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadStats(user.id);
        logActivity({ activity_type: 'study', metadata: { action: 'view_bd_gallery', itemCode } });
        addPoints(user.id, 'itemReviewed');
      }
    };
    load();
  }, [loadStats, logActivity, addPoints, itemCode]);

  // Générer des vignettes basées sur les vraies compétences OIC
  const generateVignettes = () => {
    const vignettes = [];
    
    // Vignette d'introduction
    vignettes.push({
      id: 'intro',
      title: `${itemCode} - Introduction`,
      description: `Découvrez l'univers médical de ${title}`,
      image: `https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop`,
      type: 'intro',
      competences: []
    });

    // Vignettes pour rang A (vraies compétences OIC)
    if (competencesA.length > 0) {
      // Grouper par 3 compétences par vignette
      for (let i = 0; i < competencesA.length; i += 3) {
        const batch = competencesA.slice(i, i + 3);
        vignettes.push({
          id: `rang-a-${i}`,
          title: `Rang A - Compétences ${i + 1}-${Math.min(i + 3, competencesA.length)}`,
          description: batch.map(c => c.intitule).join(' • '),
          image: `https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=600&fit=crop`,
          type: 'rang-a',
          competences: batch
        });
      }
    }

    // Vignettes pour rang B (vraies compétences OIC)
    if (competencesB.length > 0) {
      for (let i = 0; i < competencesB.length; i += 3) {
        const batch = competencesB.slice(i, i + 3);
        vignettes.push({
          id: `rang-b-${i}`,
          title: `Rang B - Compétences ${i + 1}-${Math.min(i + 3, competencesB.length)}`,
          description: batch.map(c => c.intitule).join(' • '),
          image: `https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop`,
          type: 'rang-b',
          competences: batch
        });
      }
    }

    // Vignette de conclusion
    vignettes.push({
      id: 'conclusion',
      title: `${itemCode} - Synthèse`,
      description: `${competencesA.length + competencesB.length} compétences OIC maîtrisées`,
      image: `https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&h=600&fit=crop`,
      type: 'conclusion',
      competences: []
    });

    return vignettes;
  };

  const vignettes = generateVignettes();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentVignette((prev) => (prev + 1) % vignettes.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentVignette((prev) => (prev - 1 + vignettes.length) % vignettes.length);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentVignette(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentVignette(vignettes.length - 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vignettes.length]);

  const nextVignette = () => {
    setCurrentVignette((prev) => (prev + 1) % vignettes.length);
  };

  const prevVignette = () => {
    setCurrentVignette((prev) => (prev - 1 + vignettes.length) % vignettes.length);
  };

  const getVignetteColor = (type: string) => {
    switch (type) {
      case 'intro': return 'border-primary/30 bg-primary/5';
      case 'rang-a': return 'border-success/30 bg-success/5';
      case 'rang-b': return 'border-accent/30 bg-accent/5';
      case 'conclusion': return 'border-warning/30 bg-warning/5';
      default: return 'border-border bg-muted';
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

  if (loadingA || loadingB) {
    return (
      <Card className="border-2 border-accent/20">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
          </div>
          <p className="text-muted-foreground mt-4">Chargement de la BD interactive...</p>
        </CardContent>
      </Card>
    );
  }

  if (vignettes.length === 0) {
    return (
      <Card className="border-2 border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-6 w-6" />
            BD Interactive - {itemCode}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Génération de la BD en cours...</p>
        </CardContent>
      </Card>
    );
  }

  const currentVig = vignettes[currentVignette];

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <Card className="border-2 border-accent/20">
        <CardHeader className="bg-gradient-to-r from-accent to-primary text-primary-foreground">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Image className="h-6 w-6" />
              BD Interactive - {itemCode}
            </CardTitle>
            <div className="flex items-center gap-2">
              {stats && (
                <>
                  <Badge className="bg-primary-foreground/20 text-primary-foreground gap-1">
                    <Flame className="h-3 w-3" />
                    {stats.currentStreak}j
                  </Badge>
                  <Badge className="bg-primary-foreground/20 text-primary-foreground gap-1">
                    <Star className="h-3 w-3" />
                    Niv. {stats.level}
                  </Badge>
                </>
              )}
              <Badge className="bg-primary-foreground/20 text-primary-foreground">
                {currentVignette + 1} / {vignettes.length}
              </Badge>
            </div>
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
            <div className="text-sm text-muted-foreground">
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
            <p className="text-muted-foreground mb-4">{currentVig.description}</p>
            
            {currentVig.competences && currentVig.competences.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-semibold text-muted-foreground">Compétences OIC:</h4>
                <div className="space-y-2">
                  {currentVig.competences.map((comp: any, idx: number) => (
                    <div key={idx} className="p-2 bg-muted/50 rounded-lg text-sm">
                      <span className="font-medium">{comp.objectif_id}</span>: {comp.intitule}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={isExporting}
                onClick={async () => {
                  setIsExporting(true);
                  const allContent = vignettes.map(v => 
                    `${v.title}\n${v.description}\n${v.competences?.map((c: any) => `- ${c.objectif_id}: ${c.intitule}`).join('\n') || ''}`
                  ).join('\n\n---\n\n');
                  await exportToPDF({
                    title,
                    content: allContent,
                    itemCode,
                    type: 'bd'
                  });
                  setIsExporting(false);
                }}
              >
                {isExporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                Télécharger
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={isSharing}
                onClick={async () => {
                  setIsSharing(true);
                  await shareContent({
                    title,
                    content: currentVig.description,
                    itemCode,
                    type: 'bd'
                  });
                  setIsSharing(false);
                }}
              >
                {isSharing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Share2 className="h-4 w-4 mr-1" />}
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
                    ? 'border-accent ring-2 ring-accent/20' 
                    : 'border-border hover:border-muted-foreground'
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