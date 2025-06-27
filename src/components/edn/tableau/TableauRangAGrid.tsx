
import { Card } from '@/components/ui/card';
import { getColumnIcon } from './TableauRangAIcons';

interface TableauRangAGridProps {
  colonnesUtiles: any[];
  lignesEnrichies: string[][];
}

export const TableauRangAGrid = ({ colonnesUtiles, lignesEnrichies }: TableauRangAGridProps) => {
  return (
    <div className="space-y-8">
      {lignesEnrichies.map((ligne, ligneIndex) => (
        <div key={ligneIndex} className="space-y-4">
          {/* Titre principal du concept */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-amber-900 mb-2">{ligne[0]}</h3>
            <p className="text-lg text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-200">
              {ligne[1]}
            </p>
          </div>
          
          {/* Grille de cartes pour les autres informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ligne.slice(2).map((cellule, celluleIndex) => {
              if (!cellule || cellule.trim() === '') return null;
              
              const colonneIndex = celluleIndex + 2;
              const colonne = colonnesUtiles[colonneIndex];
              
              if (!colonne) return null;
              
              return (
                <Card
                  key={celluleIndex}
                  className={`p-4 border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${colonne.couleurCellule}`}
                >
                  <div className="mb-3">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${colonne.couleur}`}>
                      {getColumnIcon(colonne.nom)}
                      <span className="ml-2">{colonne.nom}</span>
                    </div>
                  </div>
                  <div className={`text-sm leading-relaxed ${colonne.couleurTexte}`}>
                    <div className="space-y-2">
                      {cellule.split('\n').map((ligne, index) => (
                        <div key={index} className="leading-relaxed">
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
