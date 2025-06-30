
import { useState } from 'react';
import { processTableauRangAIC2, isIC2Item } from './TableauRangAUtilsIC2Integration';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
        {/* En-tête principal */}
        <Card className="border-l-4 border-slate-600">
          <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              📚 Rang B - Connaissances Approfondies
            </CardTitle>
            <CardDescription className="text-slate-200">
              {theme}
            </CardDescription>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="secondary" className="bg-slate-600 text-white">
                Item {itemCode}
              </Badge>
              <Badge variant="outline" className="border-slate-300 text-slate-200">
                {lignes.length} compétence{lignes.length > 1 ? 's' : ''} expert{lignes.length > 1 ? 'es' : 'e'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Tableau des compétences */}
        <div className="space-y-4">
          {lignes.map((ligne, rowIndex) => (
            <Card key={rowIndex} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader 
                className="cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleRow(rowIndex)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-800 mb-2">
                      {ligne[0]}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      Cliquez pour voir les détails de cette compétence avancée
                    </CardDescription>
                  </div>
                  <div className="ml-4">
                    {expandedRows.has(rowIndex) ? 
                      <ChevronUp className="h-5 w-5 text-slate-500" /> : 
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    }
                  </div>
                </div>
              </CardHeader>
              
              {expandedRows.has(rowIndex) && (
                <CardContent className="pt-0">
                  <div className="border-t border-slate-200 pt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {colonnes.slice(1).map((colonne: any, index: number) => (
                            <TableHead key={index} className="font-semibold text-slate-700">
                              {colonne.nom || colonne}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          {ligne.slice(1).map((cellule, cellIndex) => {
                            const colonne = colonnes[cellIndex + 1];
                            return (
                              <TableCell 
                                key={cellIndex} 
                                className={`${colonne?.couleurCellule || 'bg-gray-50'} ${colonne?.couleurTexte || 'text-gray-800'} border-l-2 ${colonne?.couleur?.replace('bg-', 'border-') || 'border-gray-300'}`}
                              >
                                <div className="text-sm leading-relaxed">
                                  {cellule || '-'}
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Pied de page informatif */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-slate-600">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-slate-800">{lignes.length}</span>
                  compétence{lignes.length > 1 ? 's' : ''} de niveau expert
                </span>
                <span className="text-slate-400">•</span>
                <span className="flex items-center gap-1">
                  Item <span className="font-semibold text-slate-800">{itemCode}</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Rang B selon référentiel E-LiSA</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderEmptyRangB(itemCode: string) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 text-center">
            📚 Tableau Rang B - {itemCode}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-blue-800 mb-2">
                  Toutes les compétences sont classées en Rang A
                </CardTitle>
                <CardDescription className="text-blue-600 text-sm leading-relaxed">
                  Pour cet item <span className="font-semibold">{itemCode}</span>, toutes les compétences identifiées sont 
                  considérées comme fondamentales et sont donc classées en <span className="font-semibold">Rang A</span>.
                  <br />
                  <span className="text-xs text-blue-500 mt-2 block">
                    ℹ️ Le Rang B est réservé aux connaissances approfondies et spécialisées
                  </span>
                </CardDescription>
              </CardContent>
            </Card>
            
            {/* Bouton pour voir le Rang A */}
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">
                Consultez les compétences fondamentales dans le Rang A
              </p>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 px-4 py-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Toutes les compétences en Rang A</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
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
