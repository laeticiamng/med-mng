
interface ComicHeaderProps {
  title: string;
}

export const ComicHeader = ({ title }: ComicHeaderProps) => {
  return (
    <div className="text-center relative">
      {/* Titre principal avec effet bande dessinée */}
      <div className="relative inline-block">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 mb-4 transform hover:scale-105 transition-transform duration-300">
          Bande Dessinée Éducative
        </h2>
        
        {/* Effet d'ombre pour le titre */}
        <div className="absolute inset-0 text-5xl font-black text-amber-200 -z-10 transform translate-x-2 translate-y-2">
          Bande Dessinée Éducative
        </div>
      </div>
      
      {/* Sous-titre avec style comic */}
      <div className="relative bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 p-6 rounded-2xl border-4 border-amber-400 shadow-xl max-w-4xl mx-auto">
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-amber-400"></div>
        
        <p className="text-xl text-amber-800 font-bold leading-relaxed">
          Découvrez <span className="text-amber-900 underline decoration-wavy decoration-amber-500">"{title}"</span> à travers une histoire illustrée captivante
        </p>
        
        {/* Petites décorations */}
        <div className="flex justify-center items-center mt-4 space-x-4">
          <div className="w-8 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
          <div className="text-amber-600 text-2xl">📚</div>
          <div className="w-8 h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
        </div>
      </div>
      
      {/* Éléments décoratifs flottants */}
      <div className="absolute -top-4 -left-4 text-4xl text-amber-300 opacity-50 animate-bounce">✨</div>
      <div className="absolute -top-2 -right-6 text-3xl text-orange-300 opacity-50 animate-pulse">🎨</div>
    </div>
  );
};
