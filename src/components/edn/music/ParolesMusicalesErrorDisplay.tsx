
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ParolesMusicalesErrorDisplayProps {
  lastError: string;
}

export const ParolesMusicalesErrorDisplay: React.FC<ParolesMusicalesErrorDisplayProps> = ({ lastError }) => {
  if (!lastError) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Erreur de génération</span>
        </div>
        <p className="text-red-600 mt-2">{lastError}</p>
      </CardContent>
    </Card>
  );
};
