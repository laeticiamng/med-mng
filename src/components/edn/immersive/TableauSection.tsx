
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TableauSectionProps {
  data: any;
  title: string;
  type: 'rang_a' | 'rang_b';
}

export const TableauSection: React.FC<TableauSectionProps> = ({ data, title, type }) => {
  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">⚠️ {title} - Contenu indisponible</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Les données pour ce tableau ne sont pas encore disponibles dans Supabase.</p>
        </CardContent>
      </Card>
    );
  }

  const sections = data.sections || [];
  const theme = data.theme || title;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant={type === 'rang_a' ? 'default' : 'secondary'}>
            {type === 'rang_a' ? 'Rang A' : 'Rang B'}
          </Badge>
          {theme}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-blue-800">
              {section.titre}
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Contenu : </span>
                <p className="text-gray-600">{section.contenu}</p>
              </div>
              {section.exemple && (
                <div>
                  <span className="font-medium text-green-700">Exemple : </span>
                  <p className="text-gray-600 italic">{section.exemple}</p>
                </div>
              )}
              {section.piege && (
                <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                  <span className="font-medium text-orange-700">⚠️ Piège à éviter : </span>
                  <p className="text-orange-600">{section.piege}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
