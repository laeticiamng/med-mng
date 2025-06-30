
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AuditInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comment utiliser l'audit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            <div>
              <h3 className="font-medium">Lancer l'audit</h3>
              <p className="text-sm text-gray-600">
                Cliquez sur "Lancer l'audit" pour analyser tous les items EDN en base
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <span className="text-blue-600 font-semibold text-sm">2</span>
            </div>
            <div>
              <h3 className="font-medium">Analyser les résultats</h3>
              <p className="text-sm text-gray-600">
                Consultez le tableau de bord pour identifier les items non conformes
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <span className="text-blue-600 font-semibold text-sm">3</span>
            </div>
            <div>
              <h3 className="font-medium">Exporter le rapport</h3>
              <p className="text-sm text-gray-600">
                Téléchargez le rapport au format JSON ou Markdown pour documentation
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
