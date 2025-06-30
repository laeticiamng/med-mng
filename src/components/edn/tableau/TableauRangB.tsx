import { useState } from 'react';
import { processTableauRangAIC2, isIC2Item } from './TableauRangAUtilsIC2Integration';

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
    theme?: string; // Ajout de la propriété theme au niveau racine
  };
}

export const TableauRangB = ({ data }: TableauRangBProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  console.log('🔍 TableauRangB - Données reçues:', data);
  console.log('📊 TableauRangB - Item code:', data?.item_code);
  console.log('📋 TableauRangB - Tableau rang B brut:', data?.tableau_rang_b);

  // Traitement spécialisé pour IC-2
  if (isIC2Item(data)) {
    console.log('✅ Item IC-2 détecté, traitement spécialisé E-LiSA');
    
    try {
      const processedData = processTableauRangAIC2({
        ...data,
        theme: data.theme || 'Rang B - IC-2 Valeurs professionnelles'
      });
      
      console.log('📈 IC-2 Rang B traité:', processedData);
      
      if (processedData.isRangB && processedData.lignesEnrichies && processedData.lignesEnrichies.length > 0) {
        return renderTableauRangB(
          processedData.lignesEnrichies,
          processedData.colonnesUtiles,
          processedData.theme,
          data?.item_code || 'IC-2'
        );
      }
    } catch (error) {
      console.error('❌ Erreur traitement IC-2 Rang B:', error);
    }
  }

  // Traitement standard pour les autres items
  const tableauData = data?.tableau_rang_b;
  const colonnes = tableauData?.colonnes || [];
  const lignes = tableauData?.lignes || [];
  const theme = tableauData?.theme || tableauData?.title || 'Connaissances approfondies - Rang B';
  const itemCode = data?.item_code || 'Item';

  console.log('📊 TableauRangB standard - Données extraites:', { 
    colonnes: colonnes.length, 
    lignes: lignes.length, 
    theme,
    itemCode 
  });

  // Si pas de données Rang B disponibles
  if (!lignes.length) {
    return renderEmptyRangB(itemCode);
  }

  return renderTableauRangB(lignes, generateStandardColumns(), theme, itemCode);

  function renderTableauRangB(lignes: string[][], colonnes: any[], theme: string, itemCode: string) {
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
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">
            📚 Rang B - Connaissances Approfondies
          </h2>
          <p className="text-slate-200">
            {theme} - {lignes.length} compétence{lignes.length > 1 ? 's' : ''} de niveau expert
          </p>
          <div className="text-xs text-slate-300 mt-2">
            Item {itemCode} • Niveau d'expertise avancé
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-slate-600">
          {/* En-têtes des colonnes - Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <div className="grid grid-cols-1 gap-2 p-4 min-w-[800px]" style={{ gridTemplateColumns: `repeat(${colonnes.length}, minmax(180px, 1fr))` }}>
              {colonnes.map((colonne: any, index: number) => (
                <div
                  key={index}
                  className={`${colonne.couleur || 'bg-slate-700'} text-white p-3 rounded-lg text-center font-semibold text-sm`}
                >
                  {colonne.nom || colonne}
                </div>
              ))}
            </div>
          </div>

          {/* Lignes de données */}
          <div className="divide-y divide-gray-200">
            {lignes.map((ligne, rowIndex) => (
              <div key={rowIndex} className="hover:bg-gray-50">
                {/* Version mobile */}
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
                        const colonne = colonnes[cellIndex + 1];
                        return (
                          <div key={cellIndex} className="space-y-1">
                            <div className="text-xs font-medium text-gray-600">
                              {colonne?.nom || colonnes[cellIndex + 1] || `Colonne ${cellIndex + 2}`}
                            </div>
                            <div className={`p-2 rounded ${colonne?.couleurCellule || 'bg-gray-50'} text-xs leading-relaxed`}>
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
                  <div className="grid gap-2 p-4 min-w-[800px]" style={{ gridTemplateColumns: `repeat(${colonnes.length}, minmax(180px, 1fr))` }}>
                    {ligne.map((cellule, cellIndex) => {
                      const colonne = colonnes[cellIndex];
                      return (
                        <div
                          key={cellIndex}
                          className={`p-3 rounded border-2 ${colonne?.couleurCellule || 'bg-gray-50 border-gray-300'} text-sm leading-relaxed`}
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
            Item <span className="font-medium">{itemCode}</span> • 
            Rang B selon référentiel E-LiSA
          </div>
        </div>
      </div>
    );
  }

  function renderEmptyRangB(itemCode: string) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📚 Tableau Rang B - {itemCode}
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Toutes les compétences sont classées en Rang A
            </h3>
            <p className="text-blue-600 text-sm leading-relaxed">
              Pour cet item <span className="font-semibold">{itemCode}</span>, toutes les compétences identifiées sont 
              considérées comme fondamentales et sont donc classées en <span className="font-semibold">Rang A</span>.
              <br />
              <span className="text-xs text-blue-500 mt-2 block">
                ℹ️ Le Rang B est réservé aux connaissances approfondies et spécialisées
              </span>
            </p>
          </div>
          
          {/* Bouton pour voir le Rang A */}
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3">
              Consultez les compétences fondamentales dans le Rang A
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-lg border border-amber-300">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Toutes les compétences en Rang A</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function generateStandardColumns() {
    return [
      { nom: 'Concept Expert', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50 border-indigo-300' },
      { nom: 'Analyse Approfondie', couleur: 'bg-blue-600', couleurCellule: 'bg-blue-50 border-blue-300' },
      { nom: 'Cas Complexe', couleur: 'bg-emerald-600', couleurCellule: 'bg-emerald-50 border-emerald-300' },
      { nom: 'Écueil Expert', couleur: 'bg-red-600', couleurCellule: 'bg-red-50 border-red-300' },
      { nom: 'Technique Avancée', couleur: 'bg-amber-600', couleurCellule: 'bg-amber-50 border-amber-300' },
      { nom: 'Distinction Fine', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50 border-purple-300' },
      { nom: 'Maîtrise Technique', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50 border-teal-300' },
      { nom: 'Excellence Requise', couleur: 'bg-slate-600', couleurCellule: 'bg-slate-50 border-slate-300' }
    ];
  }
};
