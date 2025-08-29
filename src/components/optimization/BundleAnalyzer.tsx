import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, FileText, Zap, TrendingDown } from 'lucide-react';

interface BundleChunk {
  name: string;
  size: number;
  gzipSize: number;
  modules: number;
  isLazy: boolean;
}

export const BundleAnalyzer: React.FC = () => {
  const [chunks, setChunks] = useState<BundleChunk[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Simulation des données de bundle
    const mockChunks: BundleChunk[] = [
      { name: 'main', size: 1.2, gzipSize: 0.4, modules: 45, isLazy: false },
      { name: 'vendor', size: 2.8, gzipSize: 0.9, modules: 156, isLazy: false },
      { name: 'components', size: 0.8, gzipSize: 0.3, modules: 32, isLazy: true },
      { name: 'pages', size: 1.1, gzipSize: 0.4, modules: 28, isLazy: true },
      { name: 'utils', size: 0.3, gzipSize: 0.1, modules: 12, isLazy: true }
    ];
    
    setChunks(mockChunks);
    setTotalSize(mockChunks.reduce((acc, chunk) => acc + chunk.size, 0));
  }, []);

  const analyzeBundle = async () => {
    setIsAnalyzing(true);
    // Simulation d'analyse
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
  };

  const formatSize = (size: number) => `${size.toFixed(1)} MB`;

  const getSizeColor = (size: number) => {
    if (size < 0.5) return 'hsl(var(--success))';
    if (size < 1.5) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Analyse des Bundles
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Taille totale: {formatSize(totalSize)}
          </div>
          <Button 
            onClick={analyzeBundle} 
            disabled={isAnalyzing}
            size="sm"
            variant="outline"
          >
            {isAnalyzing ? 'Analyse...' : 'Réanalyser'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chunks.map((chunk) => (
            <div key={chunk.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{chunk.name}</span>
                  {chunk.isLazy && (
                    <Badge variant="secondary" className="text-xs">Lazy</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {formatSize(chunk.size)} → {formatSize(chunk.gzipSize)}
                  </span>
                  <Badge 
                    variant="outline" 
                    style={{ color: getSizeColor(chunk.size) }}
                  >
                    {chunk.modules} modules
                  </Badge>
                </div>
              </div>
              <Progress 
                value={(chunk.size / totalSize) * 100} 
                className="h-2" 
              />
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            Recommandations
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Lazy loading configuré pour 60% des composants</li>
            <li>• Bundle vendor optimisé avec tree-shaking</li>
            <li>• Compression gzip active (réduction moyenne: 65%)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};