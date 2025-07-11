import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, ChevronLeft, ChevronRight, Volume2, 
  VolumeX, Download, Share2, Bookmark, Eye
} from 'lucide-react';

interface RomanNarratifProps {
  itemCode: string;
  title: string;
  tableauRangA?: any;
  tableauRangB?: any;
}

export const RomanNarratif: React.FC<RomanNarratifProps> = ({ 
  itemCode, 
  title, 
  tableauRangA, 
  tableauRangB 
}) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Générer les chapitres basés sur les compétences
  const generateChapters = () => {
    const chapters = [];
    
    // Chapitre d'introduction
    chapters.push({
      id: 'intro',
      title: 'Prologue : L\'Art Médical',
      content: `Dans l'univers complexe de la médecine moderne, ${title} représente un défi majeur pour tout praticien. Cette histoire vous plongera au cœur des compétences essentielles de l'${itemCode}, où chaque décision peut changer une vie.\n\nNotre protagoniste, Dr. Sarah Martin, jeune interne passionnée, découvre l'importance cruciale de maîtriser parfaitement ces concepts médicaux. Son parcours vous guidera à travers les nuances de cette spécialité.\n\n"La médecine, c'est avant tout comprendre l'humain dans sa complexité", se répète-t-elle en consultant le dossier du prochain patient.`,
      type: 'intro',
      competences: 0
    });

    // Chapitres pour rang A
    const rangASections = tableauRangA?.sections || [];
    rangASections.forEach((section: any, index: number) => {
      const concepts = section.concepts || [];
      chapters.push({
        id: `rang-a-${index}`,
        title: `Chapitre ${index + 1} : Les Fondements - ${section.title || 'Compétences de Base'}`,
        content: `Dr. Martin fait face à son premier cas complexe impliquant ${section.title || 'ces compétences fondamentales'}. L'équipe médicale se rassemble pour analyser la situation.\n\n${concepts.map((concept: any, i: number) => 
          `"${concept.concept || `Concept ${i + 1}`}" explique le chef de service. "${concept.definition || concept.exemple || 'Cette compétence est essentielle pour comprendre les bases de ce domaine médical.'}"\n\nLe Dr. Martin note scrupuleusement : "${concept.mnemo || concept.application || 'Il faut retenir cette approche pour les cas futurs.'}" Cette information sera cruciale pour la suite.`
        ).join('\n\n')}\n\nL'apprentissage se poursuit, chaque détail compte dans cette spécialité exigeante.`,
        type: 'rang-a',
        competences: concepts.length
      });
    });

    // Chapitres pour rang B
    const rangBSections = tableauRangB?.sections || [];
    rangBSections.forEach((section: any, index: number) => {
      const concepts = section.concepts || [];
      chapters.push({
        id: `rang-b-${index}`,
        title: `Chapitre ${rangASections.length + index + 1} : L'Expertise - ${section.title || 'Compétences Avancées'}`,
        content: `L'expertise de Dr. Martin est maintenant mise à l'épreuve avec ${section.title || 'des cas complexes nécessitant une expertise approfondie'}. Les enjeux sont plus élevés.\n\n${concepts.map((concept: any, i: number) => 
          `Face à ${concept.concept || `ce défi expert ${i + 1}`}, elle mobilise toute son expertise. "${concept.analyse || concept.cas || 'L\'analyse experte révèle des nuances importantes qu\'un praticien moins expérimenté pourrait manquer.'}"\n\nLe piège serait de ${concept.ecueil || 'sous-estimer la complexité de cette situation'}. La technique spécialisée requiert ${concept.technique || concept.maitrise || 'une maîtrise parfaite des protocoles avancés'}.\n\n"${concept.excellence || 'L\'excellence clinique se mesure dans ces moments critiques'}", réfléchit-elle en appliquant ses connaissances approfondies.`
        ).join('\n\n')}\n\nChaque décision expert façonne l'issue de ce cas délicat.`,
        type: 'rang-b',
        competences: concepts.length
      });
    });

    // Chapitre de conclusion
    chapters.push({
      id: 'epilogue',
      title: 'Épilogue : La Maîtrise Accomplie',
      content: `Plusieurs mois plus tard, Dr. Martin reflète sur son parcours d'apprentissage de l'${itemCode}. Chaque compétence maîtrisée, chaque concept intégré a contribué à faire d'elle une praticienne accomplie.\n\n"De la compréhension des fondements du rang A jusqu'à l'expertise avancée du rang B, chaque étape était nécessaire", se dit-elle en observant ses collègues internes débuter leur propre apprentissage.\n\nLe cycle de transmission des connaissances continue, perpétuant l'excellence médicale dans cette spécialité exigeante.\n\n${title} n'a plus de secrets pour elle. Elle est prête à affronter les défis les plus complexes de sa spécialité.`,
      type: 'conclusion',
      competences: 0
    });

    return chapters;
  };

  const chapters = generateChapters();

  const nextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setReadingProgress(((currentChapter + 1) / chapters.length) * 100);
    }
  };

  const prevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      setReadingProgress(((currentChapter - 1) / chapters.length) * 100);
    }
  };

  const getChapterColor = (type: string) => {
    switch (type) {
      case 'intro': return 'border-blue-300 bg-blue-50';
      case 'rang-a': return 'border-green-300 bg-green-50';
      case 'rang-b': return 'border-purple-300 bg-purple-50';
      case 'conclusion': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  if (chapters.length === 0) {
    return (
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Roman Narratif - {itemCode}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Génération du roman en cours...</p>
        </CardContent>
      </Card>
    );
  }

  const currentChap = chapters[currentChapter];

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <Card className="border-2 border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Roman Narratif - {itemCode}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white">
                Chapitre {currentChapter + 1} / {chapters.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className="text-white hover:bg-white/20"
              >
                {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Barre de progression */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression de lecture</span>
                <span>{Math.round(readingProgress)}%</span>
              </div>
              <Progress value={readingProgress} className="h-2" />
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={prevChapter}
                disabled={currentChapter === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <div className="text-sm text-gray-600 text-center flex-1 mx-4">
                {currentChap.title}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={nextChapter}
                disabled={currentChapter === chapters.length - 1}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu du chapitre */}
      <Card className={`border-2 ${getChapterColor(currentChap.type)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{currentChap.title}</CardTitle>
            <div className="flex items-center gap-2">
              {currentChap.competences > 0 && (
                <Badge variant="outline">
                  {currentChap.competences} compétences
                </Badge>
              )}
              <Badge className={getChapterColor(currentChap.type).replace('bg-', 'bg-').replace('border-', 'border-')}>
                {currentChap.type.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="prose prose-lg max-w-none">
            {currentChap.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          
          <div className="flex gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-1" />
              Marque-page
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Télécharger
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Partager
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table des matières */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Table des Matières
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                onClick={() => {
                  setCurrentChapter(index);
                  setReadingProgress((index / chapters.length) * 100);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all
                  ${index === currentChapter 
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{chapter.title}</span>
                  <div className="flex items-center gap-2">
                    {chapter.competences > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {chapter.competences}
                      </Badge>
                    )}
                    <Badge className={`text-xs ${getChapterColor(chapter.type)}`}>
                      {chapter.type}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};