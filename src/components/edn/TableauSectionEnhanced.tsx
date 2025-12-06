import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book, CheckCircle2, Lightbulb, AlertCircle } from 'lucide-react';

interface CompetenceDetail {
  competence_id: string;
  concept: string;
  definition: string;
  exemple?: string;
  application?: string;
  niveau?: string;
  intitule?: string;
  description?: string;
  objectif_id?: string;
  rubrique?: string;
}

interface TableauSectionEnhancedProps {
  section: {
    title: string;
    content?: string;
    competences?: CompetenceDetail[];
    keywords?: string[];
  };
  rang: 'A' | 'B';
  index: number;
}

export const TableauSectionEnhanced: React.FC<TableauSectionEnhancedProps> = ({ 
  section, 
  rang, 
  index 
}) => {
  const themeColors = rang === 'A' 
    ? 'from-blue-500 to-blue-600'
    : 'from-purple-500 to-purple-600';

  const bgColor = rang === 'A'
    ? 'bg-blue-50 dark:bg-blue-950/30'
    : 'bg-purple-50 dark:bg-purple-950/30';

  return (
    <Card className="overflow-hidden border-2 hover:shadow-lg transition-all duration-300">
      <CardHeader className={`${bgColor} border-b-2`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${themeColors} text-white flex items-center justify-center text-lg font-bold shadow-lg`}>
            {index + 1}
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            {section.title}
          </CardTitle>
          {section.competences && section.competences.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-sm">
              {section.competences.length} compétence{section.competences.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Contenu textuel */}
        {section.content && (
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        )}

        {/* Compétences détaillées */}
        {section.competences && section.competences.length > 0 && (
          <div className="space-y-4">
            {section.competences.map((comp, compIndex) => (
              <Card key={compIndex} className="border border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    {/* En-tête de compétence */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {comp.objectif_id && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {comp.objectif_id}
                            </Badge>
                          )}
                          {comp.niveau && (
                            <Badge className={`${rang === 'A' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                              {comp.niveau}
                            </Badge>
                          )}
                          {comp.rubrique && (
                            <Badge variant="secondary" className="text-xs">
                              {comp.rubrique}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-bold text-lg text-foreground mb-2">
                          {comp.intitule || comp.concept}
                        </h4>
                      </div>
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${themeColors} text-white flex items-center justify-center flex-shrink-0`}>
                        <Book className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Définition */}
                    {(comp.definition || comp.description) && (
                      <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-1">Définition</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {comp.definition || comp.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Exemple */}
                    {comp.exemple && (
                      <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">Exemple clinique</p>
                          <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                            {comp.exemple}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Application */}
                    {comp.application && (
                      <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">Application pratique</p>
                          <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                            {comp.application}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Mots-clés */}
        {section.keywords && section.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <span className="text-sm font-semibold text-muted-foreground">Mots-clés :</span>
            {section.keywords.map((keyword, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
