import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Volume2, VolumeX } from 'lucide-react';

interface MusicVersionSelectorProps {
  paroles: string[];
  selectedVersion: 'A' | 'B' | 'AB';
  onVersionChange: (version: 'A' | 'B' | 'AB') => void;
  onGenerate: (version: 'A' | 'B' | 'AB') => void;
  isGenerating: boolean;
  generatedAudio: {
    rangA?: string;
    rangB?: string;
    rangAB?: string;
  };
}

export const MusicVersionSelector: React.FC<MusicVersionSelectorProps> = ({
  paroles,
  selectedVersion,
  onVersionChange,
  onGenerate,
  isGenerating,
  generatedAudio
}) => {
  const versions = [
    {
      key: 'A' as const,
      title: 'Version Rang A',
      description: 'Compétences fondamentales',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hasParoles: paroles && paroles[0],
      audioUrl: generatedAudio.rangA
    },
    {
      key: 'B' as const,
      title: 'Version Rang B',
      description: 'Compétences avancées',
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hasParoles: paroles && paroles[1],
      audioUrl: generatedAudio.rangB
    },
    {
      key: 'AB' as const,
      title: 'Version Rang A + B',
      description: 'Compétences complètes combinées',
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hasParoles: paroles && paroles[0] && paroles[1],
      audioUrl: generatedAudio.rangAB
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {versions.map((version) => (
        <Card
          key={version.key}
          className={`cursor-pointer transition-all duration-200 ${
            selectedVersion === version.key
              ? `${version.borderColor} border-2 shadow-lg`
              : 'border border-gray-200 hover:shadow-md'
          }`}
          onClick={() => onVersionChange(version.key)}
        >
          <CardHeader className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${version.color} flex items-center justify-center`}>
              <Music className="h-8 w-8 text-white" />
            </div>
            <CardTitle className={`text-lg ${version.textColor}`}>
              {version.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {version.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Statut des paroles */}
            <div className={`p-3 rounded-lg ${version.bgColor} ${version.borderColor} border`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Paroles</span>
                {version.hasParoles ? (
                  <span className="text-green-600 text-xs font-semibold">✓ Disponibles</span>
                ) : (
                  <span className="text-red-600 text-xs font-semibold">✗ Manquantes</span>
                )}
              </div>
            </div>

            {/* Statut audio */}
            <div className={`p-3 rounded-lg ${version.bgColor} ${version.borderColor} border`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Audio</span>
                {version.audioUrl ? (
                  <Volume2 className="h-4 w-4 text-green-600" />
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Bouton de génération */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onGenerate(version.key);
              }}
              disabled={!version.hasParoles || isGenerating}
              className={`w-full bg-gradient-to-r ${version.color} hover:opacity-90 text-white`}
              size="sm"
            >
              {isGenerating && selectedVersion === version.key ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Génération...
                </>
              ) : version.audioUrl ? (
                'Régénérer'
              ) : (
                'Générer'
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};