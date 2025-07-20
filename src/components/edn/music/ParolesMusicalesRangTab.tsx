
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GenerateButton } from './GenerateButton';
import { ParolesDisplay } from './ParolesDisplay';

interface ParolesMusicalesRangTabProps {
  rang: 'A' | 'B';
  title: string;
  description: string;
  paroles: string[];
  hasParoles: boolean;
  tableauData: any;
  selectedStyle: string;
  selectedDuration: number;
  isGenerating: boolean;
  generatedAudio?: string;
  onGenerate: () => void;
}

export const ParolesMusicalesRangTab: React.FC<ParolesMusicalesRangTabProps> = ({
  rang,
  title,
  description,
  paroles,
  hasParoles,
  tableauData,
  selectedStyle,
  selectedDuration,
  isGenerating,
  generatedAudio,
  onGenerate
}) => {
  const styling = {
    A: {
      textColor: 'text-amber-800',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      buttonColor: 'bg-amber-600 hover:bg-amber-700'
    },
    B: {
      textColor: 'text-blue-800',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const colors = styling[rang];

  return (
    <Card>
      <CardHeader>
        <CardTitle className={colors.textColor}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasParoles && (
          <div>
            <h4 className="font-semibold mb-3">Paroles disponibles :</h4>
            <ParolesDisplay 
              parolesArray={paroles} 
              rang={rang} 
              textColor={colors.textColor} 
            />
          </div>
        )}
        
        <GenerateButton
          rang={rang}
          isGenerating={isGenerating}
          isDisabled={!selectedStyle || !tableauData}
          musicDuration={selectedDuration}
          buttonColor={colors.buttonColor}
          onGenerate={onGenerate}
        />
        
        {!tableauData && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-sm">
              ⚠️ Tableau Rang {rang} non disponible pour cet item
            </p>
          </div>
        )}

        {generatedAudio && (
          <div className={`mt-4 p-4 ${colors.bgColor} ${colors.borderColor} border rounded-lg`}>
            <h5 className={`font-semibold ${colors.textColor} mb-2`}>Musique générée - Rang {rang}</h5>
            <audio controls className="w-full">
              <source src={generatedAudio} type="audio/mpeg" />
              Votre navigateur ne supporte pas l'élément audio.
            </audio>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
