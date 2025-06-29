
import { useState, useEffect } from 'react';
import { TableauRangAHeader } from './TableauRangAHeader';
import { TableauRangAFooter } from './TableauRangAFooter';
import { isIC4Item, processTableauRangAIC4 } from './TableauRangAUtilsIC4Integration';
import { useIsMobile } from '@/hooks/use-mobile';

interface TableauRangAProps {
  data: {
    tableau_rang_a?: any;
    title?: string;
    item_code?: string;
  };
}

export const TableauRangA = ({ data }: TableauRangAProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [processedData, setProcessedData] = useState<{
    lignesEnrichies: string[][];
    colonnesUtiles: any[];
    theme: string;
  } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    console.log('TableauRangA - Données reçues:', data);
    
    if (isIC4Item(data)) {
      console.log('Item IC-4 détecté, traitement spécialisé');
      const processed = processTableauRangAIC4(data.tableau_rang_a || data);
      setProcessedData(processed);
    } else {
      // Traitement standard pour les autres items
      const tableauData = data.tableau_rang_a;
      if (tableauData && tableauData.sections) {
        const lignes: string[][] = [];
        tableauData.sections.forEach((section: any) => {
          section.concepts?.forEach((concept: any) => {
            lignes.push([
              concept.concept || '',
              concept.definition || '',
              concept.exemple || '',
              concept.piege || '',
              concept.mnemo || '',
              concept.subtilite || '',
              concept.application || '',
              concept.vigilance || ''
            ]);
          });
        });
        
        const colonnes = [
          { nom: 'Concept', couleur: 'bg-blue-600', couleurCellule: 'bg-blue-50 border-blue-300', couleurTexte: 'text-blue-900 font-bold' },
          { nom: 'Définition', couleur: 'bg-green-600', couleurCellule: 'bg-green-50 border-green-300', couleurTexte: 'text-green-800' },
          { nom: 'Exemple', couleur: 'bg-amber-600', couleurCellule: 'bg-amber-50 border-amber-300', couleurTexte: 'text-amber-800' },
          { nom: 'Piège', couleur: 'bg-red-600', couleurCellule: 'bg-red-50 border-red-300', couleurTexte: 'text-red-800 font-semibold' },
          { nom: 'Mnémotechnique', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50 border-purple-300', couleurTexte: 'text-purple-800 font-medium italic' },
          { nom: 'Subtilité', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50 border-indigo-300', couleurTexte: 'text-indigo-800 font-medium' },
          { nom: 'Application', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50 border-teal-300', couleurTexte: 'text-teal-800' },
          { nom: 'Vigilance', couleur: 'bg-orange-600', couleurCellule: 'bg-orange-50 border-orange-300', couleurTexte: 'text-orange-800 font-medium' }
        ];
        
        setProcessedData({
          lignesEnrichies: lignes,
          colonnesUtiles: colonnes,
          theme: tableauData.theme || data.title || 'Tableau des connaissances'
        });
      }
    }
  }, [data]);

  if (!processedData || !processedData.lignesEnrichies.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mx-2 sm:mx-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Tableau Rang A</h2>
        <p className="text-gray-600 text-sm sm:text-base">Aucune donnée disponible pour ce tableau.</p>
      </div>
    );
  }

  const { lignesEnrichies, colonnesUtiles, theme } = processedData;

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      <TableauRangAHeader 
        theme={theme}
        itemCode={data.item_code || ''}
        totalCompetences={lignesEnrichies.length}
      />

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-2 sm:mx-0">
        {/* En-têtes des colonnes - masqués sur mobile */}
        {!isMobile && (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 gap-2 p-4 min-w-[800px]" style={{ gridTemplateColumns: `repeat(${colonnesUtiles.length}, minmax(150px, 1fr))` }}>
              {colonnesUtiles.map((colonne, index) => (
                <div
                  key={index}
                  className={`${colonne.couleur} text-white p-3 rounded-lg text-center font-semibold text-sm flex items-center justify-center gap-1`}
                >
                  {colonne.icone && <span>{colonne.icone}</span>}
                  {colonne.nom}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lignes de données - optimisées mobile */}
        <div className="divide-y divide-gray-200">
          {lignesEnrichies.map((ligne, rowIndex) => (
            <div key={rowIndex} className="hover:bg-gray-50">
              {/* Version mobile avec expansion améliorée */}
              <div className="block md:hidden p-3 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                    {ligne[0]}
                  </h3>
                  <button
                    onClick={() => toggleRow(rowIndex)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium flex-shrink-0 px-2 py-1 bg-blue-50 rounded-full border border-blue-200"
                  >
                    {expandedRows.has(rowIndex) ? 'Réduire' : 'Détails'}
                  </button>
                </div>
                
                {/* Définition toujours visible sur mobile */}
                <div className="bg-green-50 border border-green-200 p-2 rounded text-xs text-green-800">
                  {ligne[1]}
                </div>
                
                {expandedRows.has(rowIndex) && (
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    {ligne.slice(2).map((cellule, cellIndex) => {
                      if (!cellule || cellule.trim() === '') return null;
                      const colonne = colonnesUtiles[cellIndex + 2];
                      if (!colonne) return null;
                      
                      return (
                        <div key={cellIndex} className="space-y-1">
                          <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
                            {colonne.icone && <span>{colonne.icone}</span>}
                            {colonne.nom}
                          </div>
                          <div className={`p-2 rounded border ${colonne.couleurCellule} ${colonne.couleurTexte} text-xs leading-relaxed`}>
                            {cellule}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Version desktop */}
              <div className="hidden md:block overflow-x-auto">
                <div className="grid gap-2 p-4 min-w-[800px]" style={{ gridTemplateColumns: `repeat(${colonnesUtiles.length}, minmax(150px, 1fr))` }}>
                  {ligne.map((cellule, cellIndex) => {
                    const colonne = colonnesUtiles[cellIndex];
                    if (!colonne) return null;
                    
                    return (
                      <div
                        key={cellIndex}
                        className={`p-3 rounded border-2 ${colonne.couleurCellule} ${colonne.couleurTexte} text-sm min-h-[60px] flex items-start`}
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
        colonnesCount={colonnesUtiles.length}
        lignesCount={lignesEnrichies.length}
      />
    </div>
  );
};
