import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, BookOpen, Brain, FileText, Loader2, Microscope, Scale, Search, Settings, Shield, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface ItemSelectorProps {
  selectedItem: string | null;
  onItemSelect: (itemCode: string) => void;
}

// Fallback items si la DB n'est pas disponible
const FALLBACK_EDN_ITEMS = [
  {
    code: 'IC-1',
    title: 'La relation médecin-malade dans le cadre du colloque singulier ou au sein d\'une équipe',
    description: 'Communication, empathie et établissement de la confiance dans la relation soignant-soigné.'
  },
  {
    code: 'IC-2',
    title: 'Les valeurs professionnelles du médecin et des autres professions de santé',
    description: 'Principes éthiques, déontologie et responsabilités professionnelles.'
  },
  {
    code: 'IC-3',
    title: 'Le raisonnement et la décision en médecine',
    description: 'Processus de raisonnement clinique, prise de décision et gestion de l\'incertitude.'
  },
  {
    code: 'IC-4',
    title: 'La sécurité du patient. La gestion des risques',
    description: 'Prévention des erreurs, gestion des risques et amélioration continue de la qualité.'
  },
  {
    code: 'IC-5',
    title: 'L\'annonce d\'une maladie grave ou létale ou d\'un dommage associé aux soins',
    description: 'Techniques d\'annonce, accompagnement psychologique et gestion des émotions.'
  },
];

const getIconForItem = (code: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    'IC-1': Users,
    'IC-2': Shield,
    'IC-3': Brain,
    'IC-4': Shield,
    'IC-5': BookOpen,
    'IC-6': Settings,
    'IC-7': Scale,
    'IC-8': AlertTriangle,
    'IC-9': FileText,
    'IC-10': Microscope,
  };
  return icons[code] || BookOpen;
};

export const ItemSelector: React.FC<ItemSelectorProps> = ({ selectedItem, onItemSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRang, setSelectedRang] = useState<'A' | 'B' | ''>('');

  // Charger les items depuis la base de données
  const { data: dbItems, isLoading, error } = useQuery({
    queryKey: ['edn-items-for-creation'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('items')
        .select('id, code, title, type, rang, keywords')
        .order('code', { ascending: true })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });

  // Utiliser les items DB ou le fallback
  const items = useMemo(() => {
    if (dbItems && dbItems.length > 0) {
      return dbItems.map((item: any) => ({
        code: item.code,
        title: item.title,
        description: item.keywords?.join(', ') || 'Item de formation médicale',
        rang: item.rang,
        type: item.type,
      }));
    }
    return FALLBACK_EDN_ITEMS;
  }, [dbItems]);

  // Filtrer les items
  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const matchesSearch = !searchQuery || 
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRang = !selectedRang || item.rang === selectedRang;
      
      return matchesSearch && matchesRang;
    });
  }, [items, searchQuery, selectedRang]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement des items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un item (IC-1, relation médecin...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRang} onValueChange={(v) => setSelectedRang(v as 'A' | 'B' | '')}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Tous rangs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous rangs</SelectItem>
            <SelectItem value="A">Rang A</SelectItem>
            <SelectItem value="B">Rang B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Compteur de résultats */}
      <p className="text-sm text-muted-foreground">
        {filteredItems.length} item{filteredItems.length > 1 ? 's' : ''} disponible{filteredItems.length > 1 ? 's' : ''}
        {error && ' (mode hors-ligne)'}
      </p>

      {/* Liste des items */}
      <ScrollArea className="h-[400px] rounded-md border p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
          {filteredItems.map((item: any) => {
            const Icon = getIconForItem(item.code);
            const isSelected = selectedItem === item.code;
            
            return (
              <Card
                key={item.code}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => onItemSelect(item.code)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
                      {item.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {item.code}
                    </Badge>
                    {item.rang && (
                      <Badge 
                        variant={item.rang === 'A' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        Rang {item.rang}
                      </Badge>
                    )}
                    {isSelected && (
                      <Badge variant="default" className="text-xs bg-primary">
                        ✓ Sélectionné
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Aucun item ne correspond à votre recherche</p>
          <Button 
            variant="link" 
            onClick={() => { setSearchQuery(''); setSelectedRang(''); }}
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
};
