
import { useState, useEffect } from 'react';
import { TableauRangAHeader } from './TableauRangAHeader';
import { TableauRangAFooter } from './TableauRangAFooter';
import { generateLignesRangBIntelligentIC4, determinerColonnesUtilesIC4 } from './TableauRangAUtilsIC4';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mx-2 sm:mx-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Tableau Rang B Expert</h2>
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
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 sm:p-6 rounded-lg mx-2 sm:mx-0">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">
          📚 Rang B - Connaissances Approfondies
        </h2>
        <p className="text-slate-200 text-sm sm:text-base">
          {theme} - {lignesEnrichies.length} compétence{lignesEnrichies.length > 1 ? 's' : ''} de niveau expert
        </p>
        <div className="text-xs text-slate-300 mt-2">
          Item {data.item_code} • Niveau d'expertise avancé
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-slate-600 mx-2 sm:mx-0">
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
                    className="text-slate-700 hover:text-slate-900 text-xs font-medium flex-shrink-0 px-2 py-1 bg-slate-100 rounded-full border border-slate-300"
                  >
                    {expandedRows.has(rowIndex) ? 'Réduire' : 'Détails'}
                  </button>
                </div>
                
                {/* Définition toujours visible sur mobile */}
                <div className="bg-emerald-50 border border-emerald-200 p-2 rounded text-xs text-emerald-800">
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
