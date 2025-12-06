import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Play, Music, Loader2, CheckCircle2, Volume2 } from 'lucide-react';
import { useMusicGeneration } from '@/hooks/useMusicGeneration';
import { usePlayer } from '@/hooks/usePlayer';

export type RangType = 'A' | 'B' | 'Mix';

interface MusicGeneratorProps {
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
  className?: string;
}

export const MusicGenerator: React.FC<MusicGeneratorProps> = ({
  itemCode,
  tableauRangA,
  tableauRangB,
  className
}) => {
  const musicGeneration = useMusicGeneration();
  const { playTrack } = usePlayer();
  const [lastGenerated, setLastGenerated] = useState<{ rang: RangType; trackId: string } | null>(null);

  const handleGenerate = async (rang: RangType) => {
    const tableauData = rang === 'A' ? tableauRangA : 
                       rang === 'B' ? tableauRangB : 
                       { // Mix A+B
                         sections: [
                           ...(tableauRangA?.sections || []),
                           ...(tableauRangB?.sections || [])
                         ]
                       };

    const result = await musicGeneration.generateMusic({
      itemCode,
      rang,
      tableauData
    });

    if (result) {
      setLastGenerated({ rang, trackId: result.id });
    }
  };

  const getCompetencesCount = (rang: RangType) => {
    if (rang === 'A') return tableauRangA?.sections?.length || 0;
    if (rang === 'B') return tableauRangB?.sections?.length || 0;
    return (tableauRangA?.sections?.length || 0) + (tableauRangB?.sections?.length || 0);
  };

  const hasData = (rang: RangType) => getCompetencesCount(rang) > 0;

  return (
    <Card className={`border-2 border-primary/20 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Génération Musicale IA - {itemCode}
        </CardTitle>
        <p className="text-primary-foreground/80 text-sm">
          Transformez les compétences médicales en chansons mémorisables
        </p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Progress pendant la génération */}
        {musicGeneration.isGenerating && (
          <Card className="border-primary/20 bg-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium text-primary">Génération en cours...</span>
              </div>
              <Progress value={75} className="mb-2" />
              <p className="text-sm text-primary">{musicGeneration.generationProgress}</p>
            </CardContent>
          </Card>
        )}

        {/* Options de génération */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rang A */}
          <Card className="border-orange-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Badge className="bg-orange-500">Rang A</Badge>
                  <span className="text-sm text-muted-foreground">
                    {getCompetencesCount('A')} compétences
                  </span>
                </div>
                <h3 className="font-semibold">Fondamentaux</h3>
                <p className="text-sm text-muted-foreground">
                  Concepts de base et définitions essentielles
                </p>
                <Button
                  onClick={() => handleGenerate('A')}
                  disabled={musicGeneration.isGenerating || !hasData('A')}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Générer Rang A
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rang B */}
          <Card className="border-purple-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Badge className="bg-purple-500">Rang B</Badge>
                  <span className="text-sm text-muted-foreground">
                    {getCompetencesCount('B')} compétences
                  </span>
                </div>
                <h3 className="font-semibold">Expertise</h3>
                <p className="text-sm text-muted-foreground">
                  Cas complexes et maîtrise approfondie
                </p>
                <Button
                  onClick={() => handleGenerate('B')}
                  disabled={musicGeneration.isGenerating || !hasData('B')}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Générer Rang B
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mix A+B */}
          <Card className="border-blue-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Badge className="bg-blue-500">Mix A+B</Badge>
                  <span className="text-sm text-muted-foreground">
                    {getCompetencesCount('Mix')} compétences
                  </span>
                </div>
                <h3 className="font-semibold">Complet</h3>
                <p className="text-sm text-muted-foreground">
                  Fusion fondamentaux + expertise
                </p>
                <Button
                  onClick={() => handleGenerate('Mix')}
                  disabled={musicGeneration.isGenerating || (!hasData('A') && !hasData('B'))}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Générer Mix A+B
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Informations sur la structure */}
        <Card className="bg-muted border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Structure musicale garantie
            </h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <div>🎵 <strong>Couplet 1</strong> - Introduction des concepts</div>
              <div>🎤 <strong>Refrain</strong> - Points clés à retenir</div>
              <div>🎵 <strong>Couplet 2</strong> - Développement pratique</div>
              <div>🎤 <strong>Refrain</strong> - Points clés à retenir</div>
              <div>🎵 <strong>Couplet 3</strong> - Application clinique</div>
              <div>🎤 <strong>Refrain</strong> - Points clés à retenir</div>
            </div>
          </CardContent>
        </Card>

        {/* Dernière génération */}
        {lastGenerated && (
          <Card className="border-success/20 bg-success/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="font-medium text-success">
                    Dernière génération : Rang {lastGenerated.rang}
                  </span>
                </div>
                <Button
                  onClick={() => playTrack({ 
                    id: lastGenerated.trackId, 
                    title: `${itemCode} Rang ${lastGenerated.rang}`,
                    item_code: itemCode,
                    type: lastGenerated.rang === 'A' ? 'rang_a' : lastGenerated.rang === 'B' ? 'rang_b' : 'mix',
                    created_at: new Date().toISOString()
                  })}
                  size="sm"
                  variant="outline"
                  className="border-success/30 text-success hover:bg-success/10"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Écouter
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};