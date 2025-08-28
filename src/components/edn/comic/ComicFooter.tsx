import { Star, Award, BookOpen, Heart } from 'lucide-react';

export const ComicFooter = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-2xl">
      {/* Titre principal */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black uppercase tracking-wide mb-4">
          🎉 Mission Accomplie ! 🎉
        </h2>
        <p className="text-lg font-semibold opacity-90">
          Vous avez terminé cette bande dessinée éducative immersive
        </p>
      </div>

      {/* Stats et accomplissements */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-2">
            <BookOpen className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-black">100%</div>
          </div>
          <div className="text-sm font-semibold">Histoire Complétée</div>
        </div>
        
        <div className="text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-2">
            <Star className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-black">⭐⭐⭐</div>
          </div>
          <div className="text-sm font-semibold">Évaluation</div>
        </div>
        
        <div className="text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-2">
            <Award className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-black">🏆</div>
          </div>
          <div className="text-sm font-semibold">Compétences</div>
        </div>
        
        <div className="text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-2">
            <Heart className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-black">💯</div>
          </div>
          <div className="text-sm font-semibold">Maîtrise</div>
        </div>
      </div>

      {/* Message motivant */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold mb-3">🌟 Félicitations ! 🌟</h3>
        <p className="text-base leading-relaxed mb-4">
          Vous avez intégré les concepts médicaux à travers une expérience narrative immersive. 
          Cette approche pédagogique innovante renforce la mémorisation et la compréhension pratique.
        </p>
        
        {/* Prochaines étapes */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <span className="bg-blue-500/30 px-4 py-2 rounded-full text-sm font-semibold border border-blue-300">
            📚 Continuer l'apprentissage
          </span>
          <span className="bg-purple-500/30 px-4 py-2 rounded-full text-sm font-semibold border border-purple-300">
            🎯 Passer au quiz
          </span>
          <span className="bg-pink-500/30 px-4 py-2 rounded-full text-sm font-semibold border border-pink-300">
            🎵 Écouter les paroles
          </span>
        </div>
      </div>

      {/* Signature */}
      <div className="text-center mt-6 opacity-75">
        <p className="text-sm font-medium">
          Une production EDN • Pédagogie Immersive • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};