import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { TableauRangA } from '@/components/edn/tableau/TableauRangA';
import { TableauRangB } from '@/components/edn/tableau/TableauRangB';

interface TestItemProps {
  itemCode: string;
}

const TestItem: React.FC<TestItemProps> = ({ itemCode }) => {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', itemCode)
        .single();

      if (error) {
        console.error('Erreur:', error);
      } else {
        setItem(data);
        console.log('✅ Item chargé:', {
          item_code: data.item_code,
          title: data.title,
          sections_rang_a: (data.tableau_rang_a as any)?.sections?.length || 0,
          sections_rang_b: (data.tableau_rang_b as any)?.sections?.length || 0,
          paroles_count: data.paroles_musicales?.length || 0
        });
      }
      setLoading(false);
    };

    fetchItem();
  }, [itemCode]);

  if (loading) return <div>Chargement de {itemCode}...</div>;
  if (!item) return <div>Item {itemCode} non trouvé</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Badge variant="outline">{item.item_code}</Badge>
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Sections Rang A:</strong> {(item.tableau_rang_a as any)?.sections?.length || 0}
            </div>
            <div>
              <strong>Sections Rang B:</strong> {(item.tableau_rang_b as any)?.sections?.length || 0}
            </div>
            <div>
              <strong>Paroles musicales:</strong> {item.paroles_musicales?.length || 0}
            </div>
            <div>
              <strong>Fusion OIC:</strong> {(item.payload_v2 as any)?.fusion_oic_complete ? '✅' : '❌'}
            </div>
          </div>
        </CardContent>
      </Card>

      {(item.tableau_rang_a as any)?.sections?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Tableau Rang A</h3>
          <TableauRangA data={item.tableau_rang_a} itemCode={item.item_code} />
        </div>
      )}

      {(item.tableau_rang_b as any)?.sections?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Tableau Rang B</h3>
          <TableauRangB data={item.tableau_rang_b} itemCode={item.item_code} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Paroles Musicales</CardTitle>
        </CardHeader>
        <CardContent>
          {item.paroles_musicales?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {item.paroles_musicales.map((parole: string, index: number) => (
                <li key={index} className="text-sm">{parole}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucune parole musicale</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const TestItemCompetencesDisplay: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState('IC-100');
  
  const testItems = [
    'IC-1', 'IC-2', 'IC-10', 'IC-50', 'IC-100', 'IC-200', 'IC-300', 'IC-367'
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test d'affichage des compétences EDN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {testItems.map(itemCode => (
              <Button
                key={itemCode}
                variant={selectedItem === itemCode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedItem(itemCode)}
              >
                {itemCode}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <TestItem itemCode={selectedItem} />
    </div>
  );
};