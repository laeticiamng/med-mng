
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TableauRangBProps {
  data: {
    theme: string;
    colonnes: string[];
    lignes: string[][];
  };
}

export const TableauRangB = ({ data }: TableauRangBProps) => {
  console.log('TableauRangB component - Received data:', data);
  
  // Vérifications de sécurité
  if (!data || !data.colonnes || !data.lignes) {
    console.error('TableauRangB: Invalid data structure', data);
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-amber-900">Tableau Rang B</h2>
        <p className="text-amber-700">Structure de données invalide</p>
      </div>
    );
  }

  const colCount = data.colonnes.length;
  console.log('TableauRangB: Rendering table with', colCount, 'columns and', data.lignes.length, 'rows');
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-4">
          Rang B - Approfondissement
        </Badge>
        <h2 className="text-2xl font-serif text-amber-900 mb-2">{data.theme || 'Tableau Rang B'}</h2>
        <p className="text-amber-700">Outils pratiques et dimensions complexes</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(200px, 1fr))` }}>
            {data.colonnes.map((colonne, index) => (
              <div
                key={index}
                className="bg-blue-600 text-white p-4 rounded-lg text-center font-semibold text-sm"
              >
                {colonne}
              </div>
            ))}
          </div>
          
          {data.lignes.map((ligne, ligneIndex) => (
            <div key={ligneIndex} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(200px, 1fr))` }}>
              {ligne.map((cellule, celluleIndex) => (
                <Card
                  key={celluleIndex}
                  className="p-4 bg-white/80 border-blue-200 hover:bg-blue-50 transition-colors min-h-[100px] flex items-center"
                >
                  <div className="text-sm text-blue-800 leading-relaxed w-full">
                    {cellule || 'Vide'}
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-blue-600 italic">
          ✅ Tableau complet {colCount}×{data.lignes.length} = {colCount * data.lignes.length} éléments de connaissance rang B
        </p>
      </div>
    </div>
  );
};
