
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ParolesMusicalesErrorDisplayProps {
  lastError: string;
}

export const ParolesMusicalesErrorDisplay: React.FC<ParolesMusicalesErrorDisplayProps> = ({ lastError }) => {
  if (!lastError) return null;

  return (
    <Card className="border-destructive/30 bg-destructive/10">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Erreur de génération</span>
        </div>
        <p className="text-destructive mt-2">{lastError}</p>
      </CardContent>
    </Card>
  );
};
