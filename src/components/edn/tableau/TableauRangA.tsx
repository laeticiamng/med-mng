
import { useState } from 'react';
import { processTableauRangAIC1, isIC1Item } from './TableauRangAUtilsIC1Integration';
import { processTableauRangAIC2, isIC2Item } from './TableauRangAUtilsIC2Integration';
import { processTableauRangAIC4, isIC4Item } from './TableauRangAUtilsIC4Integration';
import { processTableauRangAIC5, isIC5Item } from './TableauRangAUtilsIC5Integration';
import { processStandardTableauData } from './TableauRangAUtilsStandard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TableauRangAProps {
  data: any;
}

export const TableauRangA = ({ data }: TableauRangAProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  console.log('🔍 TableauRangA - Données reçues:', data);

  // Traitement spécialisé selon l'item
  let processedData = null;

  if (isIC1Item(data)) {
    console.log('✅ Item IC-1 détecté');
    processedData = processTableauRangAIC1(data);
  } else if (isIC2Item(data)) {
    console.log('✅ Item IC-2 détecté');
    processedData = processTableauRangAIC2(data);
  } else if (isIC4Item(data)) {
    console.log('✅ Item IC-4 détecté');
    processedData = processTableauRangAIC4(data);
  } else if (isIC5Item(data)) {
    console.log('✅ Item IC-5 détecté');
    processedData = processTableauRangAIC5(data);
  } else {
    console.log('📋 Traitement standard pour:', data?.item_code);
    processedData = processStandardTableauData(data, false);
  }

  if (!processedData || !processedData.lignesEnrichies || processedData.lignesEnrichies.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 text-center">
            📚 Tableau Rang A - {data?.item_code || 'Item'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Données en cours de chargement...</p>
          </div>
        </CardContent>
      </Card>
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
      {/* En-tête principal */}
      <Card className="border-l-4 border-amber-600">
        <CardHeader className="bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            📚 Rang A - Connaissances Fondamentales
          </CardTitle>
          <CardDescription className="text-amber-200">
            {theme}
          </CardDescription>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="secondary" className="bg-amber-600 text-white">
              Item {data?.item_code || 'N/A'}
            </Badge>
            <Badge variant="outline" className="border-amber-300 text-amber-200">
              {lignesEnrichies.length} compétence{lignesEnrichies.length > 1 ? 's' : ''} fondamentale{lignesEnrichies.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Tableau des compétences */}
      <div className="space-y-4">
        {lignesEnrichies.map((ligne, rowIndex) => (
          <Card key={rowIndex} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader 
              className="cursor-pointer hover:bg-amber-50 transition-colors"
              onClick={() => toggleRow(rowIndex)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-amber-800 mb-2">
                    {ligne[0]}
                  </CardTitle>
                  <CardDescription className="text-sm text-amber-600">
                    Cliquez pour voir les détails de cette compétence fondamentale
                  </CardDescription>
                </div>
                <div className="ml-4">
                  {expandedRows.has(rowIndex) ? 
                    <ChevronUp className="h-5 w-5 text-amber-500" /> : 
                    <ChevronDown className="h-5 w-5 text-amber-500" />
                  }
                </div>
              </div>
            </CardHeader>
            
            {expandedRows.has(rowIndex) && (
              <CardContent className="pt-0">
                <div className="border-t border-amber-200 pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {colonnesUtiles.slice(1).map((colonne: any, index: number) => (
                          <TableHead key={index} className="font-semibold text-amber-700">
                            {colonne.nom || colonne}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        {ligne.slice(1).map((cellule, cellIndex) => {
                          const colonne = colonnesUtiles[cellIndex + 1];
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
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-amber-600">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-amber-800">{lignesEnrichies.length}</span>
                compétence{lignesEnrichies.length > 1 ? 's' : ''} fondamentale{lignesEnrichies.length > 1 ? 's' : ''}
              </span>
              <span className="text-amber-400">•</span>
              <span className="flex items-center gap-1">
                Item <span className="font-semibold text-amber-800">{data?.item_code || 'N/A'}</span>
              </span>
              <span className="text-amber-400">•</span>
              <span className="text-amber-500">Rang A selon référentiel E-LiSA</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
