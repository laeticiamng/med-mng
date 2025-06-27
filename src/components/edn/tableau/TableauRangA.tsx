
import { useState, useEffect } from 'react';
import { TableauRangAHeader } from './TableauRangAHeader';
import { TableauRangAFooter } from './TableauRangAFooter';

interface TableauRangAProps {
  data: {
    tableau_rang_a?: {
      title?: string;
      theme?: string;
      colonnes?: string[];
      lignes?: string[][];
    };
    title?: string;
    item_code?: string;
  };
}

export const TableauRangA = ({ data }: TableauRangAProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Extraire les données du tableau depuis Supabase
  const tableauData = data.tableau_rang_a;
  const colonnes = tableauData?.colonnes || [];
  const lignes = tableauData?.lignes || [];
  const theme = tableauData?.theme || data.title || 'Tableau des connaissances';

  console.log('TableauRangA - Données reçues:', { tableauData, colonnes: colonnes.length, lignes: lignes.length });

  if (!tableauData || !lignes.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tableau Rang A</h2>
        <p className="text-gray-600">Aucune donnée disponible pour ce tableau.</p>
      </div>
    );
  }

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  // Configuration des couleurs pour les colonnes
  const getColumnConfig = (index: number) => {
    const configs = [
      { couleur: 'bg-blue-600', couleurCellule: 'bg-blue-50 border-blue-300', couleurTexte: 'text-blue-900 font-bold' },
      { couleur: 'bg-green-600', couleurCellule: 'bg-green-50 border-green-300', couleurTexte: 'text-green-800' },
      { couleur: 'bg-amber-600', couleurCellule: 'bg-amber-50 border-amber-300', couleurTexte: 'text-amber-800' },
      { couleur: 'bg-red-600', couleurCellule: 'bg-red-50 border-red-300', couleurTexte: 'text-red-800 font-semibold' },
      { couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50 border-purple-300', couleurTexte: 'text-purple-800 font-medium italic' },
      { couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50 border-indigo-300', couleurTexte: 'text-indigo-800 font-medium' },
      { couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50 border-teal-300', couleurTexte: 'text-teal-800' },
      { couleur: 'bg-orange-600', couleurCellule: 'bg-orange-50 border-orange-300', couleurTexte: 'text-orange-800 font-medium' }
    ];
    return configs[index % configs.length];
  };

  return (
    <div className="space-y-6">
      <TableauRangAHeader 
        theme={theme}
        itemCode={data.item_code || ''}
        totalCompetences={lignes.length}
      />

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* En-têtes des colonnes */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 gap-2 p-4 min-w-[800px]" style={{ gridTemplateColumns: `repeat(${colonnes.length}, minmax(150px, 1fr))` }}>
            {colonnes.map((colonne, index) => {
              const config = getColumnConfig(index);
              return (
                <div
                  key={index}
                  className={`${config.couleur} text-white p-3 rounded-lg text-center font-semibold text-sm`}
                >
                  {colonne}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lignes de données */}
        <div className="divide-y divide-gray-200">
          {lignes.map((ligne, rowIndex) => (
            <div key={rowIndex} className="hover:bg-gray-50">
              {/* Ligne principale - mobile */}
              <div className="block md:hidden p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm flex-1 pr-2">
                    {ligne[0]}
                  </h3>
                  <button
                    onClick={() => toggleRow(rowIndex)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2 flex-shrink-0"
                  >
                    {expandedRows.has(rowIndex) ? 'Réduire' : 'Voir plus'}
                  </button>
                </div>
                
                {expandedRows.has(rowIndex) && (
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    {ligne.slice(1).map((cellule, cellIndex) => {
                      if (!cellule || cellule.trim() === '') return null;
                      const config = getColumnConfig(cellIndex + 1);
                      return (
                        <div key={cellIndex} className="space-y-1">
                          <div className="text-xs font-medium text-gray-600">
                            {colonnes[cellIndex + 1]}
                          </div>
                          <div className={`p-2 rounded ${config.couleurCellule} ${config.couleurTexte} text-xs`}>
                            {cellule}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Ligne principale - desktop */}
              <div className="hidden md:block overflow-x-auto">
                <div className="grid gap-2 p-4 min-w-[800px]" style={{ gridTemplateColumns: `repeat(${colonnes.length}, minmax(150px, 1fr))` }}>
                  {ligne.map((cellule, cellIndex) => {
                    const config = getColumnConfig(cellIndex);
                    return (
                      <div
                        key={cellIndex}
                        className={`p-3 rounded border-2 ${config.couleurCellule} ${config.couleurTexte} text-sm`}
                      >
                        {cellule || '-'}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TableauRangAFooter 
        totalLignes={lignes.length}
        itemCode={data.item_code || ''}
        theme={theme}
      />
    </div>
  );
};
