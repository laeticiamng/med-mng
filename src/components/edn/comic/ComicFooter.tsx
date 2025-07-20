
export const ComicFooter = () => {
  return (
    <div className="text-center space-y-4">
      {/* Message de conclusion avec style bande dessinée */}
      <div className="relative bg-gradient-to-r from-amber-100 to-orange-100 p-6 rounded-2xl border-3 border-amber-400 shadow-xl max-w-3xl mx-auto">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
          </div>
        </div>
        
        <p className="text-amber-800 font-bold text-lg leading-relaxed">
          Cette bande dessinée illustre les concepts clés de la relation médecin-patient de manière narrative et engageante.
        </p>
        
        <div className="mt-4 flex justify-center items-center space-x-6">
          <div className="flex items-center space-x-2 text-amber-700">
            <span className="text-2xl">🏥</span>
            <span className="font-semibold">Médecine</span>
          </div>
          <div className="w-px h-6 bg-amber-300"></div>
          <div className="flex items-center space-x-2 text-amber-700">
            <span className="text-2xl">🤝</span>
            <span className="font-semibold">Relation</span>
          </div>
          <div className="w-px h-6 bg-amber-300"></div>
          <div className="flex items-center space-x-2 text-amber-700">
            <span className="text-2xl">💡</span>
            <span className="font-semibold">Apprentissage</span>
          </div>
        </div>
      </div>
      
      {/* Signature de fin */}
      <div className="text-sm text-amber-600 italic font-medium">
        Une création éducative immersive • EDN Formation Médicale
      </div>
      
      {/* Éléments décoratifs de fin */}
      <div className="flex justify-center items-center space-x-4 pt-4">
        <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-300"></div>
        <div className="text-amber-500 text-xl">📖</div>
        <div className="w-12 h-px bg-gradient-to-r from-amber-300 to-transparent"></div>
      </div>
    </div>
  );
};
