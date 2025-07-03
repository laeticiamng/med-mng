import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book, FileText, PenTool, Heart, Sparkles, Music, Scroll, BookOpen } from 'lucide-react';

interface ContentFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  example: string;
}

interface ContentFormatSelectorProps {
  itemData: {
    title: string;
    item_code: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
  onFormatSelect: (format: ContentFormat) => void;
  selectedFormat: string | null;
}

const contentFormats: ContentFormat[] = [
  {
    id: 'bande-dessinee',
    name: 'Bande Dessinée',
    description: 'Format visuel avec bulles et illustrations',
    icon: Book,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    example: 'Vignettes illustrées avec dialogues et narration visuelle'
  },
  {
    id: 'roman',
    name: 'Roman',
    description: 'Récit narratif détaillé et immersif',
    icon: BookOpen,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    example: 'Histoire complète avec personnages et intrigue médicale'
  },
  {
    id: 'poesie',
    name: 'Poésie',
    description: 'Vers rythmés et mémorables',
    icon: PenTool,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    example: 'Strophes rimées pour faciliter la mémorisation'
  },
  {
    id: 'nouvelle',
    name: 'Nouvelle',
    description: 'Récit court et intense',
    icon: FileText,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    example: 'Histoire concentrée sur un cas clinique précis'
  },
  {
    id: 'fable',
    name: 'Fable',
    description: 'Récit moral avec leçon médicale',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    example: 'Histoire avec morale sur l\'éthique médicale'
  },
  {
    id: 'conte',
    name: 'Conte',
    description: 'Narration traditionnelle adaptée',
    icon: Sparkles,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    example: 'Récit merveilleux transposé en contexte médical'
  },
  {
    id: 'rap',
    name: 'Rap',
    description: 'Texte rythmé et percutant',
    icon: Music,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    example: 'Paroles rythmées avec flow et rimes médicales'
  },
  {
    id: 'théâtre',
    name: 'Pièce de Théâtre',
    description: 'Dialogue et mise en scène',
    icon: Scroll,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    example: 'Scènes dialoguées entre médecins et patients'
  }
];

export const ContentFormatSelector: React.FC<ContentFormatSelectorProps> = ({
  itemData,
  onFormatSelect,
  selectedFormat
}) => {
  const [previewFormat, setPreviewFormat] = useState<string | null>(null);

  const handleFormatClick = (format: ContentFormat) => {
    if (selectedFormat === format.id) {
      // Si déjà sélectionné, montrer l'aperçu
      setPreviewFormat(format.id);
    } else {
      // Sinon, sélectionner ce format
      onFormatSelect(format);
    }
  };

  const generatePreviewContent = (format: ContentFormat): string => {
    const baseContent = `Contenu pour "${itemData.title}" en format ${format.name}`;
    
    switch (format.id) {
      case 'bande-dessinee':
        return `VIGNETTE 1: [Image: Cabinet médical]\nDR. MARTIN: "Voyons ensemble les principes de ${itemData.title}..."\nPATIENT: "Docteur, pouvez-vous m'expliquer ?"\n\nVIGNETTE 2: [Image: Explication avec schéma]\nDR. MARTIN: "C'est un concept fondamental qui..."`;
        
      case 'roman':
        return `Chapitre 1: La consultation\n\nDr. Sarah Martin observait attentivement son patient. Cette situation illustrait parfaitement les principes de ${itemData.title}. Elle se souvenait de ses cours de médecine, où ce concept avait été présenté comme essentiel à la pratique médicale moderne...\n\n"Permettez-moi de vous expliquer," commença-t-elle doucement...`;
        
      case 'poesie':
        return `Ô ${itemData.title}, concept si cher,\nDans l'art médical tu brilles clair,\nTes principes guident le soignant,\nVers un avenir bienveillant.\n\nRang A et B se complètent,\nEn harmonie ils s'entremêlent,\nPour former un savoir complet,\nQue chaque médecin doit maîtriser.`;
        
      case 'nouvelle':
        return `L'urgence avait sonné à 3h du matin. Dr. Léna regardait le patient et réalisait que cette situation incarnait parfaitement ${itemData.title}. En quelques minutes, elle devrait appliquer tous les principes qu'elle avait appris...`;
        
      case 'fable':
        return `Il était une fois un jeune médecin qui négligeait les principes de ${itemData.title}. Un jour, face à un patient complexe, il réalisa l'importance de ces concepts. Cette histoire nous enseigne que...`;
        
      case 'conte':
        return `Dans un royaume où la médecine était reine, vivait un sage praticien qui maîtrisait parfaitement ${itemData.title}. Sa sagesse était légendaire, et tous venaient l'écouter...`;
        
      case 'rap':
        return `Yo, ${itemData.title} c'est le concept,\nQui fait que le médecin respecte,\nSes patients et ses valeurs,\nPour éviter toutes les erreurs.\n\nRang A, rang B, on maîtrise,\nTous les points, on s'applique,\nDans la pratique quotidienne,\nC'est la base, faut qu'on s'y tienne !`;
        
      case 'théâtre':
        return `ACTE I - SCÈNE 1\n[Décor: Cabinet médical]\n\nDR. DUBOIS: (s'adressant au public) Mesdames et messieurs, aujourd'hui nous allons explorer ${itemData.title}.\n\nPATIENT: (entrant) Docteur, j'ai besoin de vos conseils...\n\nDR. DUBOIS: Bien sûr, c'est exactement ce que nous allons voir !`;
        
      default:
        return baseContent;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <FileText className="h-6 w-6" />
            Formats de Contenu Éducatif
          </CardTitle>
          <CardDescription>
            Choisissez le format d'apprentissage qui vous convient le mieux pour {itemData.title}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {contentFormats.map((format) => {
          const Icon = format.icon;
          const isSelected = selectedFormat === format.id;
          const isPreview = previewFormat === format.id;
          
          return (
            <Card
              key={format.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? `${format.borderColor} border-2 shadow-lg`
                  : 'border border-gray-200 hover:shadow-md'
              }`}
              onClick={() => handleFormatClick(format)}
            >
              <CardHeader className="text-center pb-3">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-lg ${format.bgColor} ${format.borderColor} border flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${format.color}`} />
                </div>
                <CardTitle className={`text-base ${format.color}`}>
                  {format.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {format.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {isSelected && (
                  <Badge variant="secondary" className="w-full justify-center mb-2 bg-green-100 text-green-800">
                    ✓ Sélectionné
                  </Badge>
                )}
                <p className="text-xs text-gray-600 text-center">
                  {format.example}
                </p>
                
                {isSelected && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewFormat(isPreview ? null : format.id);
                    }}
                  >
                    {isPreview ? 'Masquer' : 'Aperçu'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Aperçu du contenu */}
      {previewFormat && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">
              Aperçu - {contentFormats.find(f => f.id === previewFormat)?.name}
            </CardTitle>
            <CardDescription>
              Exemple de contenu généré pour {itemData.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {generatePreviewContent(contentFormats.find(f => f.id === previewFormat)!)}
              </pre>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
              >
                Générer le contenu complet
              </Button>
              <Button
                variant="outline"
                onClick={() => setPreviewFormat(null)}
              >
                Fermer l'aperçu
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};