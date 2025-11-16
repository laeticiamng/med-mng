
import { Card } from '@/components/ui/card';
import { getColumnIcon } from './TableauRangAIcons';
import { useIsMobile } from '@/hooks/use-mobile';

interface TableauRangAGridProps {
  colonnesUtiles: any[];
  lignesEnrichies: string[][];
}

export const TableauRangAGrid = ({ colonnesUtiles, lignesEnrichies }: TableauRangAGridProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6 sm:space-y-10 px-2 sm:px-0">
      {lignesEnrichies.map((ligne, ligneIndex) => (
        <div key={ligneIndex} className="space-y-4 sm:space-y-6">
          {/* En-tête de compétence amélioré */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {ligneIndex + 1}
              </div>
              <h3 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent leading-tight">
                {ligne[0]}
              </h3>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 sm:p-6 mx-1 sm:mx-0 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">💡</span>
                </div>
                <p className="text-sm sm:text-lg text-amber-800 leading-relaxed text-left font-medium">
                  {ligne[1]}
                </p>
              </div>
            </div>
          </div>
          
          {/* Grille de cartes optimisée */}
          <div className={`grid gap-4 sm:gap-6 ${
            isMobile 
              ? 'grid-cols-1' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {ligne.slice(2).map((cellule, celluleIndex) => {
              if (!cellule || cellule.trim() === '') return null;
              
              const colonneIndex = celluleIndex + 2;
              const colonne = colonnesUtiles[colonneIndex];
              
              if (!colonne) return null;
              
              return (
                <Card
                  key={celluleIndex}
                  className={`p-4 sm:p-6 border-2 transition-all duration-300 hover:shadow-lg group ${colonne.couleurCellule} ${
                    isMobile ? 'mx-1' : 'hover:scale-[1.02] hover:-translate-y-1'
                  } relative overflow-hidden`}
                >
                  {/* Indicateur de catégorie */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60"
                       style={{background: `linear-gradient(90deg, ${colonne.couleur?.includes('blue') ? '#3b82f6' : colonne.couleur?.includes('green') ? '#10b981' : colonne.couleur?.includes('purple') ? '#8b5cf6' : '#f59e0b'}, transparent)`}}>
                  </div>
                  
                  <div className="mb-3 sm:mb-4">
                    <div className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white ${colonne.couleur} max-w-full shadow-sm`}>
                      <span className="flex-shrink-0 mr-2">
                        {getColumnIcon(colonne.nom)}
                      </span>
                      <span className="truncate">{colonne.nom}</span>
                    </div>
                  </div>
                  
                  <div className={`text-sm sm:text-base leading-relaxed ${colonne.couleurTexte} group-hover:text-opacity-90`}>
                    <div className="space-y-2 sm:space-y-3">
                      {cellule.split('\n').map((ligne, index) => (
                        <div key={index} className="leading-relaxed break-words font-medium">
                          {ligne.startsWith('•') || ligne.startsWith('-') ? (
                            <div className="flex items-start gap-2">
                              <span className="text-amber-500 font-bold mt-0.5">•</span>
                              <span>{ligne.replace(/^[•-]\s*/, '')}</span>
                            </div>
                          ) : (
                            ligne
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Effet visuel subtil */}
                  <div className="absolute bottom-0 right-0 w-16 h-16 opacity-5 transform translate-x-4 translate-y-4">
                    {getColumnIcon(colonne.nom)}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
