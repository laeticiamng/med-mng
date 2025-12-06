
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, AlertTriangle } from 'lucide-react';

interface ParolesMusicalesEmptyStateProps {
  itemCode: string;
}

export const ParolesMusicalesEmptyState: React.FC<ParolesMusicalesEmptyStateProps> = ({ itemCode }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-6 w-6 text-warning" />
          Génération Musicale - {itemCode}
        </CardTitle>
        <CardDescription>
          Créez des chansons pédagogiques personnalisées
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-warning mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Données manquantes
          </h3>
          <p className="text-muted-foreground mb-6">
            Les paroles et les tableaux de données ne sont pas encore disponibles pour cet item.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-primary text-sm">
              📝 <strong>En cours de développement</strong> - Le contenu musical sera ajouté prochainement.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
