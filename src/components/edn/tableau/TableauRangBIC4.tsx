
import { useState, useEffect } from 'react';
import { TableauRangAHeader } from './TableauRangAHeader';
import { TableauRangAFooter } from './TableauRangAFooter';
import { generateLignesRangBIntelligentIC4, determinerColonnesUtilesIC4 } from './TableauRangAUtilsIC4';

interface TableauRangBIC4Props {
  data: {
    tableau_rang_b?: any;
    title?: string;
    item_code?: string;
  };
}

export const TableauRangBIC4 = ({ data }: TableauRangBIC4Props) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [processedData, setProcessedData] = useState<{
    lignesEnrichies: string[][];
    colonnesUtiles: any[];
    theme: string;
  } | null>(null);

  useEffect(() => {
    console.log('TableauRangBIC4 - Données reçues:', data);
    
    const tableauData = data.tableau_rang_b;
    
    if (tableauData && tableauData.sections) {
      // Convertir les sections en lignes pour l'affichage
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
      
      const colonnes = determinerColonnesUtilesIC4(lignes);
      
      setProcessedData({
        lignesEnrichies: lignes,
        colonnesUtiles: colonnes,
        theme: tableauData.theme || 'IC-4 : Qualité et sécurité des soins - Rang B Expert'
      });
    } else {
      // Utiliser les données par défaut
      const lignesDefault = generateLignesRangBIntelligentIC4({});
      const colonnesDefault = determinerColonnesUtilesIC4(lignesDefault);
      
      setProcessedData({
        lignesEnrichies: lignesDefault,
        colonnesUtiles: colonnesDefault,
        theme: 'IC-4 : Qualité et sécurité des soins - Rang B Expert'
      });
    }
  }, [data]);

  if (!processedData || !processedData.lignesEnrichies.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tableau Rang B Expert</h2>
        <p className="text-gray-600">Aucune donnée disponible pour ce tableau.</p>
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
    <div className="space-y-6">
      <TableauRangAHeader 
        theme={theme}
        itemCode={data.item_code || 'IC-4'}
        totalCompetences={lignesEnrichies.length}
      />

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* En-têtes des colonnes */}
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

        {/* Lignes de données */}
        <div className="divide-y divide-gray-200">
          {lignesEnrichies.map((ligne, rowIndex) => (
            <div key={rowIndex} className="hover:bg-gray-50">
              {/* Version mobile avec expansion */}
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
                      const colonne = colonnesUtiles[cellIndex + 1];
                      if (!colonne) return null;
                      
                      return (
                        <div key={cellIndex} className="space-y-1">
                          <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
                            {colonne.icone && <span>{colonne.icone}</span>}
                            {colonne.nom}
                          </div>
                          <div className={`p-2 rounded border-2 ${colonne.couleurCellule} ${colonne.couleurTexte} text-xs`}>
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
