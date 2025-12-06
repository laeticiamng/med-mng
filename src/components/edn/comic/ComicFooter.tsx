
export const ComicFooter = () => {
  return (
    <div className="text-center space-y-4">
      {/* Message de conclusion avec style bande dessinée */}
      <div className="relative bg-gradient-to-r from-warning/20 to-warning/10 p-6 rounded-2xl border-3 border-warning/50 shadow-xl max-w-3xl mx-auto">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <div className="w-2 h-2 bg-warning/80 rounded-full"></div>
            <div className="w-2 h-2 bg-warning rounded-full"></div>
          </div>
        </div>
        
        <p className="text-warning font-bold text-lg leading-relaxed">
          Cette bande dessinée illustre les concepts clés de la relation médecin-patient de manière narrative et engageante.
        </p>
        
        <div className="mt-4 flex justify-center items-center space-x-6">
          <div className="flex items-center space-x-2 text-warning">
            <span className="text-2xl">🏥</span>
            <span className="font-semibold">Médecine</span>
          </div>
          <div className="w-px h-6 bg-warning/50"></div>
          <div className="flex items-center space-x-2 text-warning">
            <span className="text-2xl">🤝</span>
            <span className="font-semibold">Relation</span>
          </div>
          <div className="w-px h-6 bg-warning/50"></div>
          <div className="flex items-center space-x-2 text-warning">
            <span className="text-2xl">💡</span>
            <span className="font-semibold">Apprentissage</span>
          </div>
        </div>
      </div>
      
      {/* Signature de fin */}
      <div className="text-sm text-warning/80 italic font-medium">
        Une création éducative immersive • EDN Formation Médicale
      </div>
      
      {/* Éléments décoratifs de fin */}
      <div className="flex justify-center items-center space-x-4 pt-4">
        <div className="w-12 h-px bg-gradient-to-r from-transparent to-warning/50"></div>
        <div className="text-warning text-xl">📖</div>
        <div className="w-12 h-px bg-gradient-to-r from-warning/50 to-transparent"></div>
      </div>
    </div>
  );
};
