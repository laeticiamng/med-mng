import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, Eye, BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import MicroInteractions from '@/components/experience/MicroInteractions';

interface TableauData {
  headers: string[];
  rows: (string | number)[][];
  metadata?: {
    title?: string;
    subtitle?: string;
    source?: string;
    lastUpdated?: string;
  };
}

interface EnhancedTableauDisplayProps {
  itemData: {
    id: string;
    title: string;
    tableau_data_a?: TableauData;
    tableau_data_b?: TableauData;
    item_code?: string;
  };
  competences: string[];
  onProgress?: (progress: number) => void;
}

export const EnhancedTableauDisplay: React.FC<EnhancedTableauDisplayProps> = ({
  itemData,
  competences,
  onProgress
}) => {
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [highlightedCells, setHighlightedCells] = useState<string[]>([]);

  // Données par défaut si aucune fournie
  const defaultTableauA: TableauData = {
    headers: ['Élément', 'Valeur', 'Unité', 'Statut'],
    rows: [
      ['Paramètre 1', 125, 'mg/L', 'Normal'],
      ['Paramètre 2', 98, '%', 'Élevé'],
      ['Paramètre 3', 45, 'mm', 'Bas'],
      ['Paramètre 4', 78, 'U/L', 'Normal']
    ],
    metadata: {
      title: 'Tableau A - Résultats principaux',
      subtitle: 'Données de référence',
      source: 'Système EDN',
      lastUpdated: new Date().toLocaleDateString()
    }
  };

  const defaultTableauB: TableauData = {
    headers: ['Critère', 'Score', 'Seuil', 'Interprétation'],
    rows: [
      ['Critère 1', 8.5, 7.0, 'Excellent'],
      ['Critère 2', 6.2, 6.0, 'Satisfaisant'],
      ['Critère 3', 4.8, 5.0, 'Insuffisant'],
      ['Critère 4', 9.1, 8.0, 'Exceptionnel']
    ],
    metadata: {
      title: 'Tableau B - Évaluation détaillée',
      subtitle: 'Analyse comparative',
      source: 'Système EDN',
      lastUpdated: new Date().toLocaleDateString()
    }
  };

  const currentTableau = activeTab === 'A' 
    ? (itemData.tableau_data_a || defaultTableauA)
    : (itemData.tableau_data_b || defaultTableauB);

  // Données filtrées et triées
  const processedData = useMemo(() => {
    let filtered = currentTableau.rows;

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(row =>
        row.some(cell => 
          cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Tri
    if (sortColumn !== null) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = aVal.toString();
        const bStr = bVal.toString();
        return sortDirection === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return filtered;
  }, [currentTableau.rows, searchTerm, sortColumn, sortDirection]);

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const cellId = `${rowIndex}-${colIndex}`;
    setHighlightedCells(prev => 
      prev.includes(cellId) 
        ? prev.filter(id => id !== cellId)
        : [...prev, cellId]
    );
  };

  const getCellValue = (value: string | number) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const getCellColor = (value: string | number, columnIndex: number) => {
    // Logique de coloration basée sur la valeur et le contexte
    if (typeof value === 'number') {
      if (value > 100) return 'bg-red-50 text-red-700';
      if (value > 80) return 'bg-yellow-50 text-yellow-700';
      if (value > 60) return 'bg-green-50 text-green-700';
    }
    
    const strValue = value.toString().toLowerCase();
    if (strValue.includes('normal') || strValue.includes('excellent')) return 'bg-green-50 text-green-700';
    if (strValue.includes('élevé') || strValue.includes('insuffisant')) return 'bg-red-50 text-red-700';
    if (strValue.includes('satisfaisant')) return 'bg-yellow-50 text-yellow-700';
    
    return '';
  };

  return (
    <Card className="min-h-[600px] bg-gradient-to-br from-background/80 to-muted/40 backdrop-blur-sm">
        <CardHeader className="bg-background/90 backdrop-blur-xl border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Tableau Interactif
                  <Badge variant="secondary">
                    {processedData.length} entrées
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentTableau.metadata?.title || itemData.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'chart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('chart')}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Navigation entre tableaux */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'A' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('A')}
              >
                Tableau A
              </Button>
              <Button
                variant={activeTab === 'B' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('B')}
              >
                Tableau B
              </Button>
            </div>

            {/* Contrôles de recherche et filtrage */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Métadonnées */}
          {currentTableau.metadata && (
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Source: </span>
                  {currentTableau.metadata.source}
                </div>
                <div>
                  <span className="font-medium">Dernière mise à jour: </span>
                  {currentTableau.metadata.lastUpdated}
                </div>
              </div>
              {currentTableau.metadata.subtitle && (
                <p className="text-sm text-muted-foreground mt-2">
                  {currentTableau.metadata.subtitle}
                </p>
              )}
            </div>
          )}

          {/* Tableau principal */}
          <div className="rounded-lg border bg-background overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {currentTableau.headers.map((header, index) => (
                    <TableHead 
                      key={index}
                      className="cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleSort(index)}
                    >
                      <div className="flex items-center gap-2">
                        {header}
                        {sortColumn === index && (
                          <div className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-muted/20">
                    {row.map((cell, colIndex) => {
                      const cellId = `${rowIndex}-${colIndex}`;
                      const isHighlighted = highlightedCells.includes(cellId);
                      const cellColor = getCellColor(cell, colIndex);
                      
                      return (
                        <TableCell
                          key={colIndex}
                          className={`cursor-pointer transition-all ${cellColor} ${
                            isHighlighted ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                          {getCellValue(cell)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Statistiques rapides */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {processedData.length}
              </div>
              <div className="text-sm text-muted-foreground">Entrées</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {currentTableau.headers.length}
              </div>
              <div className="text-sm text-muted-foreground">Colonnes</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {highlightedCells.length}
              </div>
              <div className="text-sm text-muted-foreground">Sélectionnées</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                100%
              </div>
              <div className="text-sm text-muted-foreground">Complétude</div>
            </Card>
          </div>

          {/* Compétences développées */}
          <Card className="mt-6 bg-background/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                Compétences développées
              </h4>
              <div className="flex flex-wrap gap-2">
                {competences.map((comp, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                  >
                    {comp}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
    </Card>
  );
};