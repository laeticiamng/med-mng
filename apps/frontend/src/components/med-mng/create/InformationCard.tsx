
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const InformationCard: React.FC = () => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg">ℹ️ Comment ça fonctionne</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold mb-2">Contenu garanti :</h4>
            <ul className="space-y-1">
              <li>• Paroles pré-validées et complètes</li>
              <li>• Toutes les compétences du rang incluses</li>
              <li>• Contenu pédagogiquement vérifié</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Styles disponibles :</h4>
            <ul className="space-y-1">
              <li>• Lo-Fi Piano : relaxant et méditatif</li>
              <li>• Afrobeat : énergique et rythmé</li>
              <li>• Jazz Moderne : sophistiqué et smooth</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
