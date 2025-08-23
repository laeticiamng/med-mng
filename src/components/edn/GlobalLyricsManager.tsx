import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const GlobalLyricsManager: React.FC = () => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Gestionnaire Global des Paroles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-gray-300">
          <p>Fonctionnalité en développement...</p>
          <p>Ici vous pourrez gérer toutes les paroles de façon centralisée.</p>
        </div>
      </CardContent>
    </Card>
  );
};