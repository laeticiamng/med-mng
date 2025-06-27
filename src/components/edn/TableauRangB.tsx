
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
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-4">
          Rang B - Approfondissement
        </Badge>
        <h2 className="text-2xl font-serif text-amber-900 mb-2">{data.theme}</h2>
        <p className="text-amber-700">Outils pratiques et dimensions complexes</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-8 gap-2 mb-2">
            {data.colonnes.map((colonne, index) => (
              <div
                key={index}
                className="bg-blue-600 text-white p-3 rounded-lg text-center font-semibold text-sm"
              >
                {colonne}
              </div>
            ))}
          </div>
          
          {data.lignes.map((ligne, ligneIndex) => (
            <div key={ligneIndex} className="grid grid-cols-8 gap-2 mb-2">
              {ligne.map((cellule, celluleIndex) => (
                <Card
                  key={celluleIndex}
                  className="p-3 bg-white/80 border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-xs text-blue-800 leading-relaxed">
                    {cellule}
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-blue-600 italic">
          ✅ Tableau complet 8×5 = 40 éléments de connaissance rang B
        </p>
      </div>
    </div>
  );
};
