
import { Card } from '@/components/ui/card';
import { getColumnIcon } from './TableauRangAIcons';

interface TableauRangAGridProps {
  colonnesUtiles: any[];
  lignesEnrichies: string[][];
}

export const TableauRangAGrid = ({ colonnesUtiles, lignesEnrichies }: TableauRangAGridProps) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
      <div className="min-w-full">
        {/* En-têtes de colonnes dynamiques */}
        <div className={`grid gap-2 mb-2 p-2`} style={{gridTemplateColumns: `repeat(${colonnesUtiles.length}, 1fr)`}}>
          {colonnesUtiles.map((colonne, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg text-center font-bold text-sm text-white ${colonne.couleur} shadow-md`}
            >
              <div className="flex items-center justify-center space-x-1">
                <span>{colonne.nom}</span>
                {getColumnIcon(colonne.nom)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Lignes de données optimisées */}
        {lignesEnrichies.map((ligne, ligneIndex) => (
          <div key={ligneIndex} className={`grid gap-2 mb-2 p-2`} style={{gridTemplateColumns: `repeat(${colonnesUtiles.length}, 1fr)`}}>
            {ligne.map((cellule, celluleIndex) => {
              if (!cellule || cellule.trim() === '') return null;
              
              return (
                <Card
                  key={celluleIndex}
                  className={`p-4 border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] min-h-[120px] ${colonnesUtiles[celluleIndex].couleurCellule}`}
                >
                  <div className={`text-sm leading-relaxed ${colonnesUtiles[celluleIndex].couleurTexte}`}>
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
        ))}
      </div>
    </div>
  );
};
