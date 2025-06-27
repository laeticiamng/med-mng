
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TableauRangAProps {
  data: {
    theme: string;
    colonnes: string[];
    lignes: string[][];
  };
}

export const TableauRangA = ({ data }: TableauRangAProps) => {
  console.log('TableauRangA component - Received data:', data);
  
  // Vérifications de sécurité renforcées
  if (!data) {
    console.error('TableauRangA: No data provided');
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
        <p className="text-amber-700">Aucune donnée disponible</p>
      </div>
    );
  }

  if (!data.colonnes || !Array.isArray(data.colonnes) || data.colonnes.length === 0) {
    console.error('TableauRangA: Invalid or empty colonnes data', data.colonnes);
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
        <p className="text-amber-700">Format des colonnes invalide ou vide</p>
        <pre className="text-xs text-gray-500 bg-gray-100 p-4 rounded">
          Colonnes: {JSON.stringify(data.colonnes, null, 2)}
        </pre>
      </div>
    );
  }

  if (!data.lignes || !Array.isArray(data.lignes) || data.lignes.length === 0) {
    console.error('TableauRangA: Invalid or empty lignes data', data.lignes);
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
        <p className="text-amber-700">Format des lignes invalide ou vide</p>
        <pre className="text-xs text-gray-500 bg-gray-100 p-4 rounded">
          Lignes: {JSON.stringify(data.lignes, null, 2)}
        </pre>
      </div>
    );
  }

  const colCount = data.colonnes.length;
  console.log('TableauRangA: Rendering table with', colCount, 'columns and', data.lignes.length, 'rows');
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Badge variant="secondary" className="bg-green-100 text-green-800 mb-4">
          Rang A - Fondamentaux
        </Badge>
        <h2 className="text-2xl font-serif text-amber-900 mb-2">{data.theme || 'Tableau Rang A'}</h2>
        <p className="text-amber-700">Connaissances essentielles pour l'EDN</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* En-têtes de colonnes */}
          <div className={`grid gap-2 mb-2`} style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
            {data.colonnes.map((colonne, index) => (
              <div
                key={index}
                className="bg-amber-600 text-white p-4 rounded-lg text-center font-semibold text-sm"
              >
                {colonne}
              </div>
            ))}
          </div>
          
          {/* Lignes de données */}
          {data.lignes.map((ligne, ligneIndex) => {
            console.log('TableauRangA: Rendering row', ligneIndex, 'with', ligne.length, 'cells');
            return (
              <div key={ligneIndex} className={`grid gap-2 mb-2`} style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
                {ligne.map((cellule, celluleIndex) => (
                  <Card
                    key={celluleIndex}
                    className="p-4 bg-white/80 border-amber-200 hover:bg-amber-50 transition-colors min-h-[80px] flex items-center"
                  >
                    <div className="text-sm text-amber-800 leading-relaxed text-center w-full">
                      {cellule || 'Vide'}
                    </div>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-amber-600 italic">
          ✅ Tableau complet {colCount}×{data.lignes.length} = {colCount * data.lignes.length} éléments de connaissance rang A
        </p>
      </div>
    </div>
  );
};
