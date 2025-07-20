
import { Button } from '@/components/ui/button';
import { BookOpen, Palette, Music } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

type SectionType = 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

interface EdnItemNavigationProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

export const EdnItemNavigation = ({ activeSection, onSectionChange }: EdnItemNavigationProps) => {
  return (
    <div className="mb-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeSection === 'tableau-a' ? 'default' : 'outline'}
            onClick={() => onSectionChange('tableau-a')}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            <TranslatedText text="Tableau Rang A" />
          </Button>
          
          <Button
            variant={activeSection === 'tableau-b' ? 'default' : 'outline'}
            onClick={() => onSectionChange('tableau-b')}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            <TranslatedText text="Tableau Rang B" />
          </Button>
          
          <Button
            variant={activeSection === 'scene' ? 'default' : 'outline'}
            onClick={() => onSectionChange('scene')}
            className="flex items-center gap-2"
          >
            <Palette className="h-4 w-4" />
            <TranslatedText text="Scène Immersive" />
          </Button>
          
          <Button
            variant={activeSection === 'bd' ? 'default' : 'outline'}
            onClick={() => onSectionChange('bd')}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            <TranslatedText text="Bande Dessinée" />
          </Button>
          
          <Button
            variant={activeSection === 'music' ? 'default' : 'outline'}
            onClick={() => onSectionChange('music')}
            className="flex items-center gap-2"
          >
            <Music className="h-4 w-4" />
            <TranslatedText text="Génération Musicale" />
          </Button>
          
          <Button
            variant={activeSection === 'quiz' ? 'default' : 'outline'}
            onClick={() => onSectionChange('quiz')}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            <TranslatedText text="Quiz Final" />
          </Button>
        </div>
      </div>
    </div>
  );
};
