
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, AlertTriangle } from 'lucide-react';

interface ParolesMusicalesProps {
  paroles?: string[];
  itemCode: string;
  tableauRangA?: any;
  tableauRangB?: any;
}

export const ParolesMusicales: React.FC<ParolesMusicalesProps> = ({
  paroles = [],
  itemCode,
  tableauRangA,
  tableauRangB
}) => {
  console.log('🎵 ParolesMusicales - Rendu avec props:', { 
    paroles: paroles?.length, 
    itemCode, 
    hasTableauA: !!tableauRangA, 
    hasTableauB: !!tableauRangB 
  });

  const [selectedStyle, setSelectedStyle] = useState<string>('pop');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-6 w-6 text-amber-600" />
            Génération Musicale - {itemCode}
          </CardTitle>
          <CardDescription>
            Interface de génération musicale simplifiée pour débogage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Page chargée avec succès</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>Item Code: {itemCode}</p>
                <p>Paroles disponibles: {paroles?.length || 0}</p>
                <p>Tableau Rang A: {tableauRangA ? '✅ Présent' : '❌ Absent'}</p>
                <p>Tableau Rang B: {tableauRangB ? '✅ Présent' : '❌ Absent'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Style musical :</label>
                <select 
                  value={selectedStyle} 
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                  <option value="jazz">Jazz</option>
                  <option value="classical">Classique</option>
                </select>
              </div>

              {paroles && paroles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Paroles disponibles :</h3>
                  
                  {paroles[0] && (
                    <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                      <h4 className="font-medium text-amber-800 mb-2">Rang A :</h4>
                      <p className="text-sm text-amber-700 whitespace-pre-wrap">
                        {paroles[0].substring(0, 200)}
                        {paroles[0].length > 200 && '...'}
                      </p>
                      <Button 
                        className="mt-3 bg-amber-600 hover:bg-amber-700"
                        onClick={() => console.log('🎵 Génération Rang A demandée')}
                      >
                        Générer musique Rang A
                      </Button>
                    </div>
                  )}

                  {paroles[1] && (
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <h4 className="font-medium text-blue-800 mb-2">Rang B :</h4>
                      <p className="text-sm text-blue-700 whitespace-pre-wrap">
                        {paroles[1].substring(0, 200)}
                        {paroles[1].length > 200 && '...'}
                      </p>
                      <Button 
                        className="mt-3 bg-blue-600 hover:bg-blue-700"
                        onClick={() => console.log('🎵 Génération Rang B demandée')}
                      >
                        Générer musique Rang B
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {(!paroles || paroles.length === 0) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold">Aucune parole disponible</span>
                  </div>
                  <p className="text-yellow-700 mt-2">
                    Cet item ne contient pas encore de paroles musicales.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
