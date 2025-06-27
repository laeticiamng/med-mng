
import { Card } from '@/components/ui/card';
import { getColumnIcon } from './TableauRangAIcons';

interface TableauRangAGridProps {
  colonnesUtiles: any[];
  lignesEnrichies: string[][];
}

export const TableauRangAGrid = ({ colonnesUtiles, lignesEnrichies }: TableauRangAGridProps) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {lignesEnrichies.map((ligne, ligneIndex) => (
        <div key={ligneIndex} className="space-y-4">
          {/* Titre principal du concept - responsive */}
          <div className="text-center px-4 sm:px-0">
            <h3 className="text-xl sm:text-2xl font-bold text-amber-900 mb-2">{ligne[0]}</h3>
            <p className="text-base sm:text-lg text-amber-700 bg-amber-50 p-3 sm:p-4 rounded-lg border border-amber-200 leading-relaxed">
              {ligne[1]}
            </p>
          </div>
          
          {/* Grille de cartes - optimisée mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-2 sm:px-0">
            {ligne.slice(2).map((cellule, celluleIndex) => {
              if (!cellule || cellule.trim() === '') return null;
              
              const colonneIndex = celluleIndex + 2;
              const colonne = colonnesUtiles[colonneIndex];
              
              if (!colonne) return null;
              
              return (
                <Card
                  key={celluleIndex}
                  className={`p-3 sm:p-4 border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${colonne.couleurCellule}`}
                >
                  <div className="mb-2 sm:mb-3">
                    <div className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium text-white ${colonne.couleur}`}>
                      <span className="flex-shrink-0">
                        {getColumnIcon(colonne.nom)}
                      </span>
                      <span className="ml-1 sm:ml-2 truncate">{colonne.nom}</span>
                    </div>
                  </div>
                  <div className={`text-xs sm:text-sm leading-relaxed ${colonne.couleurTexte}`}>
                    <div className="space-y-1 sm:space-y-2">
                      {cellule.split('\n').map((ligne, index) => (
                        <div key={index} className="leading-relaxed break-words">
                          {ligne}
                        </div>
                      ))}
                    </div>
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
