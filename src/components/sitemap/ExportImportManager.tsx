import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, FileJson, CheckCircle, AlertCircle } from 'lucide-react';
import { TagData } from './TagManager';

interface ExportData {
  version: string;
  exportDate: string;
  favorites: string[];
  tags: TagData[];
  visitStats?: Record<string, { count: number; timestamps: number[] }>;
}

interface ExportImportManagerProps {
  favorites: Set<string>;
  tags: TagData[];
  visitStats: Record<string, { count: number; timestamps: number[] }>;
  onImport: (data: { favorites: Set<string>; tags: TagData[]; visitStats?: Record<string, { count: number; timestamps: number[] }> }) => void;
}

export function ExportImportManager({ favorites, tags, visitStats, onImport }: ExportImportManagerProps) {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [includeStats, setIncludeStats] = useState(false);

  const handleExport = () => {
    const exportData: ExportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      favorites: Array.from(favorites),
      tags: tags,
    };

    if (includeStats) {
      exportData.visitStats = visitStats;
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sitemap-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setImportStatus({
      type: 'success',
      message: `Export réussi : ${Array.from(favorites).length} favoris, ${tags.length} tags${includeStats ? ' et statistiques' : ''}`,
    });

    setTimeout(() => setImportStatus(null), 5000);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);

      // Validation basique
      if (!data.favorites || !Array.isArray(data.favorites)) {
        throw new Error('Format invalide : favoris manquants');
      }
      if (!data.tags || !Array.isArray(data.tags)) {
        throw new Error('Format invalide : tags manquants');
      }

      // Valider la structure des tags
      data.tags.forEach(tag => {
        if (!tag.id || !tag.name || !tag.color || !Array.isArray(tag.routes)) {
          throw new Error('Format invalide : structure de tag incorrecte');
        }
      });

      onImport({
        favorites: new Set(data.favorites),
        tags: data.tags,
        visitStats: data.visitStats,
      });

      setImportStatus({
        type: 'success',
        message: `Import réussi : ${data.favorites.length} favoris, ${data.tags.length} tags${data.visitStats ? ' et statistiques' : ''}`,
      });

      // Réinitialiser l'input
      event.target.value = '';
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur lors de l\'import',
      });
    }

    setTimeout(() => setImportStatus(null), 5000);
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileJson className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Export / Import</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Sauvegardez ou partagez vos favoris et tags
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {importStatus && (
          <Alert variant={importStatus.type === 'error' ? 'destructive' : 'default'}>
            {importStatus.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{importStatus.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Export */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-background">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exporter
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Télécharger vos données au format JSON
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="include-stats"
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="include-stats" className="text-sm cursor-pointer">
                Inclure les statistiques
              </Label>
            </div>

            <Button onClick={handleExport} className="w-full gap-2" disabled={favorites.size === 0 && tags.length === 0}>
              <Download className="h-4 w-4" />
              Exporter
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• {favorites.size} favoris</p>
              <p>• {tags.length} tags</p>
              {includeStats && <p>• {Object.keys(visitStats).length} pages avec stats</p>}
            </div>
          </div>

          {/* Import */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-background">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importer
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Charger des données depuis un fichier JSON
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-file" className="text-sm">
                Sélectionner un fichier
              </Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="cursor-pointer"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                L'import remplacera vos favoris et tags actuels. Les statistiques seront fusionnées si présentes.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <h4 className="text-sm font-semibold mb-2">💡 Cas d'usage</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Partager vos favoris avec des collègues</li>
            <li>• Sauvegarder vos données avant de changer de navigateur</li>
            <li>• Synchroniser entre plusieurs appareils manuellement</li>
            <li>• Créer des profils thématiques de navigation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
