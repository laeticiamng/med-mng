
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { GenerateButton } from './GenerateButton';
import { ParolesDisplay } from './ParolesDisplay';

interface TableauRangData {
  sections?: Array<{ concepts?: Array<{ concept?: string; definition?: string }> }>;
}

interface ParolesMusicalesRangTabProps {
  rang: 'A' | 'B';
  title: string;
  description: string;
  paroles: string[];
  hasParoles: boolean;
  tableauData: TableauRangData | null;
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
      textColor: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30'
    },
    B: {
      textColor: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30'
    }
  };

  const colors = styling[rang];
  const buttonVariant = rang === 'A' ? 'default' as const : 'secondary' as const;

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
          buttonVariant={buttonVariant}
          onGenerate={onGenerate}
        />
        
        {!tableauData && (
          <div className="p-3 bg-muted border border-border rounded-lg">
            <p className="text-muted-foreground text-sm">
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
