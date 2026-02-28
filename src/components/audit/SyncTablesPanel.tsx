import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Database, Zap } from 'lucide-react';

/**
 * SyncTablesPanel — DÉSACTIVÉ
 * Les Edge Functions sync-edn-tables et update-edn-unique-content ont été supprimées.
 * Ce composant est conservé comme placeholder en attendant une migration vers les routeurs consolidés.
 */
export const SyncTablesPanel = ({ onComplete: _onComplete }: { onComplete?: () => void }) => {
  return (
    <Card className="border-muted bg-muted/5 opacity-75">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              Synchronisation des tables EDN
            </CardTitle>
            <CardDescription>
              Fonctionnalité en cours de migration
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs border-muted text-muted-foreground">
            <Zap className="h-3 w-3 mr-1" />
            Désactivé
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="border-muted bg-muted/10">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <AlertDescription>
            Les fonctions <code>sync-edn-tables</code> et <code>update-edn-unique-content</code> ont été consolidées. 
            Cette fonctionnalité sera disponible via les routeurs unifiés dans une prochaine version.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
