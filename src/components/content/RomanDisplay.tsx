import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Bookmark,
  Type,
  Eye,
  Clock
} from 'lucide-react';

interface RomanChapter {
  id: string;
  title: string;
  content: string;
  chapter_number: number;
  medical_concepts: string[];
}

interface RomanData {
  title: string;
  item_code: string;
  subtitle?: string;
  chapters: RomanChapter[];
  style: string;
  total_words: number;
  reading_time_minutes: number;
  generated_at: string;
}

interface RomanDisplayProps {
  data: RomanData;
  className?: string;
}

export const RomanDisplay: React.FC<RomanDisplayProps> = ({
  data,
  className
}) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [readingProgress, setReadingProgress] = useState(0);

  const nextChapter = () => {
    if (currentChapter < data.chapters.length - 1) {
      setCurrentChapter(prev => prev + 1);
      setReadingProgress(((currentChapter + 2) / data.chapters.length) * 100);
    }
  };
  
  const prevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(prev => prev - 1);
      setReadingProgress(((currentChapter) / data.chapters.length) * 100);
    }
  };

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  if (!data || !data.chapters || data.chapters.length === 0) {
    return (
      <Card className={`border-2 border-blue-200 ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-16 w-16 text-blue-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Roman pédagogique en préparation
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Le roman médical pour {data?.item_code || 'cet item'} est en cours de génération IA
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentChapterData = data.chapters[currentChapter];

  return (
    <Card className={`border-2 border-blue-200 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {data.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              {data.chapters.length} chapitres
            </Badge>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              <Clock className="h-3 w-3 mr-1" />
              {data.reading_time_minutes} min
            </Badge>
          </div>
        </div>
        {data.subtitle && (
          <p className="text-blue-100 text-sm mt-1">{data.subtitle}</p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Barre de progression */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression de lecture</span>
            <span className="text-sm text-gray-600">
              {Math.round(readingProgress)}% complété
            </span>
          </div>
          <Progress value={readingProgress} className="w-full" />
        </div>

        {/* Contrôles de lecture */}
        <div className="p-4 bg-gray-50 border-b flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevChapter}
              disabled={currentChapter === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Chapitre précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextChapter}
              disabled={currentChapter === data.chapters.length - 1}
            >
              Chapitre suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={decreaseFontSize}>
              <Type className="h-4 w-4" />
              A-
            </Button>
            <span className="text-sm px-2">{fontSize}px</span>
            <Button variant="outline" size="sm" onClick={increaseFontSize}>
              <Type className="h-4 w-4" />
              A+
            </Button>
          </div>
        </div>

        {/* Navigation chapitres */}
        <div className="p-4 bg-blue-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">
                Chapitre {currentChapterData.chapter_number}: {currentChapterData.title}
              </h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {currentChapterData.medical_concepts.map((concept, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-blue-100 border-blue-300">
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>
            <Badge className="bg-blue-600">
              {currentChapter + 1}/{data.chapters.length}
            </Badge>
          </div>
        </div>

        {/* Contenu du chapitre */}
        <ScrollArea className="h-[500px]">
          <div className="p-6">
            <div 
              className="prose prose-lg max-w-none leading-relaxed text-justify"
              style={{ fontSize: `${fontSize}px`, lineHeight: '1.7' }}
            >
              {currentChapterData.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-800">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Navigation rapide chapitres */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Bookmark className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-600 flex-shrink-0">Chapitres:</span>
            {data.chapters.map((chapter, index) => (
              <Button
                key={chapter.id}
                variant={index === currentChapter ? "default" : "outline"}
                size="sm"
                className="flex-shrink-0"
                onClick={() => {
                  setCurrentChapter(index);
                  setReadingProgress(((index + 1) / data.chapters.length) * 100);
                }}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </div>

        {/* Footer informatif */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {data.total_words} mots
              </span>
              <span>
                📚 Contenu pédagogique généré par IA - Version unique partagée
              </span>
            </div>
            <span>
              Généré le {new Date(data.generated_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};