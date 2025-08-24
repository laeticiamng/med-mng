
import { Button } from '@/components/ui/button';
import { BookOpen, Palette, Music, Target, Brain, Zap } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

type SectionType = 'immersive' | 'competences' | 'tableau-a' | 'tableau-b' | 'scene' | 'bd' | 'music' | 'quiz';

interface EdnItemNavigationProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

export const EdnItemNavigation = ({ activeSection, onSectionChange }: EdnItemNavigationProps) => {
  return (
    <div className="mb-8">
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
        <div className="flex flex-wrap gap-3">
          <Button
            variant={activeSection === 'immersive' ? 'default' : 'outline'}
            onClick={() => onSectionChange('immersive')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeSection === 'immersive' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/50 scale-105' 
                : 'bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-purple-400/50'
            }`}
          >
            <Zap className="h-5 w-5" />
            <TranslatedText text="Expérience Immersive" />
          </Button>
          
          <Button
            variant={activeSection === 'competences' ? 'default' : 'outline'}
            onClick={() => onSectionChange('competences')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeSection === 'competences' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/50 scale-105' 
                : 'bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-purple-400/50'
            }`}
          >
            <Brain className="h-5 w-5" />
            <TranslatedText text="Compétences OIC" />
          </Button>
          
          <Button
            variant={activeSection === 'tableau-a' ? 'default' : 'outline'}
            onClick={() => onSectionChange('tableau-a')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeSection === 'tableau-a' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/50 scale-105' 
                : 'bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-purple-400/50'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <TranslatedText text="Tableau Rang A" />
          </Button>
          
          <Button
            variant={activeSection === 'tableau-b' ? 'default' : 'outline'}
            onClick={() => onSectionChange('tableau-b')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeSection === 'tableau-b' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/50 scale-105' 
                : 'bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-purple-400/50'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <TranslatedText text="Tableau Rang B" />
          </Button>
          
          <Button
            variant={activeSection === 'scene' ? 'default' : 'outline'}
            onClick={() => onSectionChange('scene')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeSection === 'scene' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/50 scale-105' 
                : 'bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-purple-400/50'
            }`}
          >
            <Palette className="h-5 w-5" />
            <TranslatedText text="Scène Immersive" />
          </Button>
          
          <Button
            variant={activeSection === 'bd' ? 'default' : 'outline'}
            onClick={() => onSectionChange('bd')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeSection === 'bd' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/50 scale-105' 
                : 'bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-purple-400/50'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <TranslatedText text="Bande Dessinée" />
          </Button>
          
          <Button
            variant={activeSection === 'music' ? 'default' : 'outline'}
            onClick={() => onSectionChange('music')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeSection === 'music' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/50 scale-105' 
                : 'bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-purple-400/50'
            }`}
          >
            <Music className="h-5 w-5" />
            <TranslatedText text="Génération Musicale" />
          </Button>
          
          <Button
            variant={activeSection === 'quiz' ? 'default' : 'outline'}
            onClick={() => onSectionChange('quiz')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeSection === 'quiz' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/50 scale-105' 
                : 'bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-purple-400/50'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <TranslatedText text="Quiz Final" />
          </Button>
        </div>
      </div>
    </div>
  );
};
