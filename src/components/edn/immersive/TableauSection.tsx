
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

  console.log('🎯 TableauSection render:', {
    title: title,
    type: type,
    dataTitle: data?.title,
    sectionsCount: data?.sections?.length,
    firstConcept: data?.sections?.[0]?.concepts?.[0]?.concept
  });
  
  const sections = data.sections || [];
  const theme = data.title || title;

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
        {sections.map((section: any, sectionIndex: number) => (
          <div key={sectionIndex} className="space-y-4">
            {section.title && (
              <h3 className="font-semibold text-lg mb-3 text-blue-800">
                {section.title}
              </h3>
            )}
            
            {/* Afficher les compétences de la section */}
            {section.concepts && section.concepts.map((concept: any, conceptIndex: number) => (
              <div key={`${sectionIndex}-${conceptIndex}`} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {concept.competence_id}
                  </Badge>
                </div>
                
                <h4 className="font-semibold text-lg mb-3 text-blue-800">
                  {concept.concept}
                </h4>
                
                <div className="space-y-3">
                  {concept.definition && (
                    <div>
                      <span className="font-medium text-gray-700">Définition : </span>
                      <p className="text-gray-600">{concept.definition}</p>
                    </div>
                  )}
                  
                  {type === 'rang_a' && concept.exemple && (
                    <div>
                      <span className="font-medium text-green-700">Exemple : </span>
                      <p className="text-gray-600 italic">{concept.exemple}</p>
                    </div>
                  )}
                  
                  {type === 'rang_b' && concept.cas && (
                    <div>
                      <span className="font-medium text-green-700">Cas clinique : </span>
                      <p className="text-gray-600 italic">{concept.cas}</p>
                    </div>
                  )}
                  
                  {type === 'rang_a' && concept.piege && (
                    <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                      <span className="font-medium text-orange-700">⚠️ Piège à éviter : </span>
                      <p className="text-orange-600">{concept.piege}</p>
                    </div>
                  )}
                  
                  {type === 'rang_b' && concept.ecueil && (
                    <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                      <span className="font-medium text-orange-700">⚠️ Écueil d'expert : </span>
                      <p className="text-orange-600">{concept.ecueil}</p>
                    </div>
                  )}
                  
                  {type === 'rang_a' && concept.application && (
                    <div className="bg-blue-50 p-3 rounded">
                      <span className="font-medium text-blue-700">🎯 Application : </span>
                      <p className="text-blue-600">{concept.application}</p>
                    </div>
                  )}
                  
                  {type === 'rang_b' && concept.technique && (
                    <div className="bg-blue-50 p-3 rounded">
                      <span className="font-medium text-blue-700">🎯 Technique : </span>
                      <p className="text-blue-600">{concept.technique}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
