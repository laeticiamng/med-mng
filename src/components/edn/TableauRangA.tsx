
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
  console.log('TableauRangA received data:', data);
  
  // Vérifications de sécurité
  if (!data) {
    console.error('TableauRangA: No data provided');
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
        <p className="text-amber-700">Aucune donnée disponible</p>
      </div>
    );
  }

  if (!data.colonnes || !Array.isArray(data.colonnes)) {
    console.error('TableauRangA: Invalid colonnes data', data.colonnes);
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
        <p className="text-amber-700">Format des colonnes invalide</p>
      </div>
    );
  }

  if (!data.lignes || !Array.isArray(data.lignes)) {
    console.error('TableauRangA: Invalid lignes data', data.lignes);
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
        <p className="text-amber-700">Format des lignes invalide</p>
      </div>
    );
  }

  const colCount = data.colonnes.length;
  
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
          
          {data.lignes.map((ligne, ligneIndex) => (
            <div key={ligneIndex} className={`grid gap-2 mb-2`} style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
              {ligne.map((cellule, celluleIndex) => (
                <Card
                  key={celluleIndex}
                  className="p-4 bg-white/80 border-amber-200 hover:bg-amber-50 transition-colors min-h-[80px] flex items-center"
                >
                  <div className="text-sm text-amber-800 leading-relaxed text-center w-full">
                    {cellule}
                  </div>
                </Card>
              ))}
            </div>
          ))}
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
