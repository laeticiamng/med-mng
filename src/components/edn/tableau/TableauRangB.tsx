
import { useState } from 'react';
import { processTableauRangAIC2, isIC2Item } from './TableauRangAUtilsIC2Integration';
import { processTableauRangAIC3, isIC3Item } from './TableauRangAUtilsIC3Integration';
import { processTableauRangAIC5, isIC5Item } from './TableauRangAUtilsIC5Integration';
import { processStandardTableauData } from './TableauRangAUtilsStandard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TableauRangBProps {
  data: {
    tableau_rang_b?: any;
    title?: string;
    item_code?: string;
    theme?: string;
  };
}

export const TableauRangB = ({ data }: TableauRangBProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  console.log('🔍 TableauRangB - Données reçues:', data);

  // Traitement spécialisé selon l'item
  let processedData = null;

  if (isIC2Item(data)) {
    console.log('✅ Item IC-2 détecté, traitement spécialisé E-LiSA');
    processedData = processTableauRangAIC2({
      ...data,
      rang: 'B',
      theme: 'Rang B - IC-2 Valeurs professionnelles'
    });
  } else if (isIC3Item(data)) {
    console.log('✅ Item IC-3 détecté, traitement spécialisé Décision');
    processedData = processTableauRangAIC3({
      ...data,
      rang: 'B',
      theme: 'Rang B - IC-3 Raisonnement et décision médicale'
    });
  } else if (isIC5Item(data)) {
    console.log('✅ Item IC-5 détecté, traitement spécialisé Organisation');
    processedData = processTableauRangAIC5({
      ...data,
      rang: 'B',
      theme: 'Rang B - IC-5 Organisation système de santé'
    });
  } else {
    console.log('📋 Traitement standard Rang B pour:', data?.item_code);
    processedData = processStandardTableauData(data, true);
  }

  // Vérifier si des données Rang B existent
  if (!processedData || (!processedData.isRangB && !data.tableau_rang_b)) {
    return renderEmptyRangB(data?.item_code || 'Item');
  }

  if (!processedData.lignesEnrichies || processedData.lignesEnrichies.length === 0) {
    return renderEmptyRangB(data?.item_code || 'Item');
  }

  const { lignesEnrichies, colonnesUtiles, theme } = processedData;

  return renderTableauRangB(lignesEnrichies, colonnesUtiles, theme, data?.item_code || 'Item');

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
                  Connaissances Rang B disponibles
                </CardTitle>
                <CardDescription className="text-blue-600 text-sm leading-relaxed">
                  Pour cet item <span className="font-semibold">{itemCode}</span>, des connaissances approfondies 
                  de <span className="font-semibold">Rang B</span> sont désormais disponibles.
                  <br />
                  <span className="text-xs text-blue-500 mt-2 block">
                    ℹ️ Le Rang B présente les compétences expertes et spécialisées
                  </span>
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }
};
