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
    <Card className="w-full shadow-sm border-0 bg-gradient-to-br from-background via-background to-muted/20">
      <CardHeader className={`${rang === 'A' ? 'bg-gradient-to-r from-blue-50 to-blue-100/50' : 'bg-gradient-to-r from-purple-50 to-purple-100/50'} border-b border-border/50`}>
        <CardTitle className={`${rang === 'A' ? 'text-blue-900' : 'text-purple-900'} flex items-center justify-between text-lg font-bold`}>
          <span className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${rang === 'A' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
            {title}
          </span>
          <Badge 
            variant="secondary" 
            className={`ml-2 ${rang === 'A' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-purple-100 text-purple-800 border-purple-200'} font-semibold`}
          >
            {count} compétence{count > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        <p className={`text-sm ${rang === 'A' ? 'text-blue-700' : 'text-purple-700'} font-medium mt-1`}>
          {theme}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          {competences.map((competence, index) => (
            <div
              key={index}
              className={`p-5 hover:bg-gradient-to-r ${
                rang === 'A' 
                  ? 'hover:from-blue-50/30 hover:to-transparent' 
                  : 'hover:from-purple-50/30 hover:to-transparent'
              } transition-all duration-200 group`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${
                  rang === 'A' 
                    ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 shadow-sm border border-blue-200/50' 
                    : 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800 shadow-sm border border-purple-200/50'
                } flex items-center justify-center text-sm font-bold group-hover:scale-105 transition-transform duration-200`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <h4 className="text-base font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors duration-200">
                    {competence.intitule}
                  </h4>
                  {competence.description && competence.description.trim() !== '' && (
                    <div className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3 border border-border/20">
                      <div 
                        className="prose prose-sm max-w-none"
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