import { BookOpen, Lightbulb, Target } from 'lucide-react';

interface ComicHeaderProps {
  title: string;
  subtitle?: string;
}

export const ComicHeader = ({ title, subtitle }: ComicHeaderProps) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background artistique */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
      
      {/* Contenu principal */}
      <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl border-4 border-gradient-to-r shadow-2xl">
        <div className="text-center space-y-6">
          {/* Titre principal avec effet BD */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text blur-sm scale-110">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wide">
                {title}
              </h1>
            </div>
            <h1 className="relative text-4xl md:text-6xl font-black text-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-wide transform hover:scale-105 transition-transform duration-300">
              {title}
            </h1>
          </div>

          {subtitle && (
            <p className="text-xl text-gray-700 font-semibold italic max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}

          {/* Éléments décoratifs BD */}
          <div className="flex justify-center items-center space-x-8 mt-8">
            <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full border-2 border-blue-300">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-blue-800 font-bold">Éducatif</span>
            </div>
            <div className="flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full border-2 border-purple-300">
              <Lightbulb className="h-6 w-6 text-purple-600" />
              <span className="text-purple-800 font-bold">Immersif</span>
            </div>
            <div className="flex items-center space-x-2 bg-pink-100 px-4 py-2 rounded-full border-2 border-pink-300">
              <Target className="h-6 w-6 text-pink-600" />
              <span className="text-pink-800 font-bold">Objectifs</span>
            </div>
          </div>

          {/* Bulles BD décoratives */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-yellow-200 rounded-full border-4 border-yellow-400 flex items-center justify-center transform rotate-12 animate-bounce">
            <span className="text-2xl">💡</span>
          </div>
          <div className="absolute top-4 left-4 w-12 h-12 bg-blue-200 rounded-full border-3 border-blue-400 flex items-center justify-center transform -rotate-12 animate-pulse">
            <span className="text-xl">🎯</span>
          </div>
        </div>
      </div>
    </div>
  );
};