import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CompetenceOIC {
  intitule: string;
  description: string;
}

interface TableauCompetencesOICProps {
  data: {
    title: string;
    competences: CompetenceOIC[];
    count: number;
    theme: string;
  };
  itemCode: string;
  rang: 'A' | 'B';
}

export const TableauCompetencesOIC: React.FC<TableauCompetencesOICProps> = ({ 
  data, 
  itemCode, 
  rang 
}) => {
  // Gestion du cas où il n'y a pas de compétences OIC définies
  if (!data || !data.competences || data.competences.length === 0 || data.count === 0) {
    return (
      <Card className="w-full">
        <CardHeader className={`${rang === 'A' ? 'bg-amber-50' : 'bg-orange-50'} border-b`}>
          <CardTitle className={`${rang === 'A' ? 'text-amber-800' : 'text-orange-800'} flex items-center justify-between`}>
            <span>{itemCode} Rang {rang} - Compétences OIC</span>
            <Badge variant="outline" className="ml-2 text-gray-500">
              0 compétence OIC
            </Badge>
          </CardTitle>
          <p className={`text-sm ${rang === 'A' ? 'text-amber-600' : 'text-orange-600'}`}>
            Aucune compétence OIC officielle définie pour ce rang
          </p>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <div className={`w-16 h-16 mx-auto rounded-full ${rang === 'A' ? 'bg-amber-100' : 'bg-orange-100'} flex items-center justify-center`}>
              <span className={`text-2xl ${rang === 'A' ? 'text-amber-600' : 'text-orange-600'}`}>📋</span>
            </div>
            <h4 className="font-semibold text-gray-900">
              Aucune compétence OIC disponible
            </h4>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              Cet item n'a pas encore de compétences OIC officielles définies pour le rang {rang} 
              dans le référentiel extracté de la base de données.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { title, competences, count, theme } = data;

  return (
    <Card className="w-full">
      <CardHeader className={`${rang === 'A' ? 'bg-blue-50' : 'bg-purple-50'} border-b`}>
        <CardTitle className={`${rang === 'A' ? 'text-blue-800' : 'text-purple-800'} flex items-center justify-between`}>
          <span>{title}</span>
          <Badge variant="secondary" className="ml-2">
            {count} compétence{count > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        <p className={`text-sm ${rang === 'A' ? 'text-blue-600' : 'text-purple-600'}`}>
          {theme}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {competences.map((competence, index) => (
            <div
              key={index}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                index === competences.length - 1 ? 'border-b-0' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${
                  rang === 'A' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                } flex items-center justify-center text-sm font-semibold`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
                    {competence.intitule}
                  </h4>
                  {competence.description && competence.description.trim() !== '' && (
                    <div className="text-xs text-gray-600 leading-relaxed">
                      {/* Nettoyer les balises HTML et les entités */}
                      <div 
                        dangerouslySetInnerHTML={{
                          __html: competence.description
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/<br\s*\/?>/gi, '<br>')
                            .replace(/^\s*-\s+/, '')
                            .trim()
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};