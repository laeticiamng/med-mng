import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableauRangA } from '@/components/edn/tableau/TableauRangA';
import { TableauRangB } from '@/components/edn/TableauRangB';
import { BookOpen, Brain, Play, Plus } from 'lucide-react';

interface TableauRangSelectorProps {
  data: {
    tableau_rang_a?: any;
    tableau_rang_b?: any;
    competences_oic_rang_a?: any[];
    competences_oic_rang_b?: any[];
  };
  itemCode: string;
  onGenerateMusic?: (rang: 'A' | 'B' | 'Mix') => void;
  onGenerateQCM?: (rang: 'A' | 'B' | 'Mix') => void;
}

export const TableauRangSelector: React.FC<TableauRangSelectorProps> = ({
  data,
  itemCode,
  onGenerateMusic,
  onGenerateQCM
}) => {
  const [activeRang, setActiveRang] = useState<'A' | 'B'>('A');

  const getCompetencesCount = (rang: 'A' | 'B') => {
    if (rang === 'A') {
      return data?.competences_oic_rang_a?.length || 
             data?.tableau_rang_a?.sections?.length ||
             data?.tableau_rang_a?.competences?.length || 0;
    } else {
      return data?.competences_oic_rang_b?.length || 
             data?.tableau_rang_b?.sections?.length ||
             data?.tableau_rang_b?.competences?.length || 0;
    }
  };

  const hasData = (rang: 'A' | 'B') => {
    return getCompetencesCount(rang) > 0;
  };

  return (
    <div className="w-full space-y-6">
      {/* Navigation Tabs */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Tableaux de compétences - {itemCode}
            </span>
            <div className="flex gap-2">
              {onGenerateMusic && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onGenerateMusic('Mix')}
                  className="flex items-center gap-1"
                >
                  <Play className="h-4 w-4" />
                  Musique Mix A+B
                </Button>
              )}
              {onGenerateQCM && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onGenerateQCM('Mix')}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  QCM Mix A+B
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={activeRang === 'A' ? 'default' : 'outline'}
              onClick={() => setActiveRang('A')}
              className="flex items-center gap-2 flex-1"
            >
              <BookOpen className="h-4 w-4" />
              Rang A - Fondamentaux
              <Badge variant="secondary" className="ml-2">
                {getCompetencesCount('A')}
              </Badge>
            </Button>
            <Button
              variant={activeRang === 'B' ? 'default' : 'outline'}
              onClick={() => setActiveRang('B')}
              className="flex items-center gap-2 flex-1"
            >
              <Brain className="h-4 w-4" />
              Rang B - Expertise
              <Badge variant="secondary" className="ml-2">
                {getCompetencesCount('B')}
              </Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons for selected Rang */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {activeRang === 'A' ? (
                  <>
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Rang A - Compétences Fondamentales
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 text-purple-500" />
                    Rang B - Expertise Avancée
                  </>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {getCompetencesCount(activeRang)} compétence{getCompetencesCount(activeRang) > 1 ? 's' : ''} disponible{getCompetencesCount(activeRang) > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              {onGenerateMusic && hasData(activeRang) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onGenerateMusic(activeRang)}
                  className="flex items-center gap-1"
                >
                  <Play className="h-4 w-4" />
                  Générer Musique {activeRang}
                </Button>
              )}
              {onGenerateQCM && hasData(activeRang) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onGenerateQCM(activeRang)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Générer QCM {activeRang}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau Content */}
      <div className="min-h-[400px]">
        {activeRang === 'A' ? (
          hasData('A') ? (
            <TableauRangA 
              data={data.tableau_rang_a || data.competences_oic_rang_a} 
              itemCode={itemCode}
            />
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Compétences Rang A en préparation
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  Les compétences fondamentales pour {itemCode} sont en cours d'intégration
                </p>
              </CardContent>
            </Card>
          )
        ) : (
          hasData('B') ? (
            <TableauRangB 
              data={data.tableau_rang_b || data.competences_oic_rang_b} 
              itemCode={itemCode}
            />
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Expertise Rang B en préparation
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  Les compétences expertes pour {itemCode} sont en cours d'intégration
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};