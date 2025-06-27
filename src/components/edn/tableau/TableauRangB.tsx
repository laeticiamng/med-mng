
import { useState } from 'react';

interface TableauRangBProps {
  data: {
    tableau_rang_b?: {
      title?: string;
      theme?: string;
      colonnes?: string[];
      lignes?: string[][];
    };
    title?: string;
    item_code?: string;
  };
}

export const TableauRangB = ({ data }: TableauRangBProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Extraire les données du tableau depuis Supabase
  const tableauData = data.tableau_rang_b;
  const colonnes = tableauData?.colonnes || [];
  const lignes = tableauData?.lignes || [];
  const theme = tableauData?.theme || 'Connaissances approfondies';

  console.log('TableauRangB - Données reçues:', { tableauData, colonnes: colonnes.length, lignes: lignes.length });

  if (!tableauData || !lignes.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tableau Rang B</h2>
        <p className="text-gray-600">Aucune donnée Rang B disponible pour cet item.</p>
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

  // Configuration des couleurs pour les colonnes (tons plus sombres pour Rang B)
  const getColumnConfig = (index: number) => {
    const configs = [
      { couleur: 'bg-slate-700', couleurCellule: 'bg-slate-100 border-slate-400', couleurTexte: 'text-slate-900 font-bold' },
      { couleur: 'bg-emerald-700', couleurCellule: 'bg-emerald-100 border-emerald-400', couleurTexte: 'text-emerald-900' },
      { couleur: 'bg-amber-700', couleurCellule: 'bg-amber-100 border-amber-400', couleurTexte: 'text-amber-900' },
      { couleur: 'bg-rose-700', couleurCellule: 'bg-rose-100 border-rose-400', couleurTexte: 'text-rose-900 font-semibold' },
      { couleur: 'bg-violet-700', couleurCellule: 'bg-violet-100 border-violet-400', couleurTexte: 'text-violet-900 font-medium italic' },
      { couleur: 'bg-cyan-700', couleurCellule: 'bg-cyan-100 border-cyan-400', couleurTexte: 'text-cyan-900 font-medium' },
      { couleur: 'bg-lime-700', couleurCellule: 'bg-lime-100 border-lime-400', couleurTexte: 'text-lime-900' },
      { couleur: 'bg-pink-700', couleurCellule: 'bg-pink-100 border-pink-400', couleurTexte: 'text-pink-900 font-medium' }
    ];
    return configs[index % configs.length];
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">
          📚 Rang B - Connaissances Approfondies
        </h2>
        <p className="text-slate-200">
          {theme} - {lignes.length} compétence{lignes.length > 1 ? 's' : ''} de niveau expert
        </p>
        <div className="text-xs text-slate-300 mt-2">
          Item {data.item_code} • Niveau d'expertise avancé
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-slate-600">
        {/* En-têtes des colonnes */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 gap-2 p-4 min-w-[800px]" style={{ gridTemplateColumns: `repeat(${colonnes.length}, minmax(180px, 1fr))` }}>
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
                    className="text-slate-700 hover:text-slate-900 text-sm font-medium ml-2 flex-shrink-0"
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
                          <div className={`p-2 rounded ${config.couleurCellule} ${config.couleurTexte} text-xs leading-relaxed`}>
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
                <div className="grid gap-2 p-4 min-w-[800px]" style={{ gridTemplateColumns: `repeat(${colonnes.length}, minmax(180px, 1fr))` }}>
                  {ligne.map((cellule, cellIndex) => {
                    const config = getColumnConfig(cellIndex);
                    return (
                      <div
                        key={cellIndex}
                        className={`p-3 rounded border-2 ${config.couleurCellule} ${config.couleurTexte} text-sm leading-relaxed`}
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

      {/* Pied de tableau */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="text-center text-sm text-slate-600">
          <span className="font-medium">{lignes.length}</span> compétence{lignes.length > 1 ? 's' : ''} de niveau expert • 
          Item <span className="font-medium">{data.item_code}</span> • 
          Rang B selon référentiel E-LiSA
        </div>
      </div>
    </div>
  );
};
