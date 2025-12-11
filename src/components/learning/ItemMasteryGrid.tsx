import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Target, Search, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface ItemMastery {
  itemCode: string;
  title: string;
  masteryLevel: number; // 0-100
  reviewCount: number;
  lastReviewed: string | null;
  weakAreas: string[];
}

export const ItemMasteryGrid: React.FC = () => {
  const [items, setItems] = useState<ItemMastery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'weak' | 'mastered'>('all');

  useEffect(() => {
    const loadMastery = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get all EDN items
      const { data: ednItems } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title')
        .order('item_code');

      if (!ednItems) {
        setLoading(false);
        return;
      }

      // Get user's review history from local storage
      const examHistory = JSON.parse(localStorage.getItem('exam_history') || '[]');
      const flashcardData = JSON.parse(localStorage.getItem('srs_card_data') || '{}');
      const clinicalHistory = JSON.parse(localStorage.getItem('clinical_cases_history') || '[]');

      // Calculate mastery per item
      const masteryMap: Record<string, { correct: number; total: number; lastReviewed: string | null }> = {};

      // From exams
      examHistory.forEach((exam: any) => {
        exam.questions?.forEach((q: any) => {
          const answer = exam.answers?.[q.id];
          if (!masteryMap[q.item_code]) {
            masteryMap[q.item_code] = { correct: 0, total: 0, lastReviewed: null };
          }
          masteryMap[q.item_code].total++;
          if (answer?.correct) masteryMap[q.item_code].correct++;
          masteryMap[q.item_code].lastReviewed = exam.completed_at || exam.started_at;
        });
      });

      // Build mastery items
      const masteryItems: ItemMastery[] = ednItems.map(item => {
        const data = masteryMap[item.item_code];
        const masteryLevel = data && data.total > 0 
          ? Math.round((data.correct / data.total) * 100)
          : 0;

        return {
          itemCode: item.item_code,
          title: item.title,
          masteryLevel,
          reviewCount: data?.total || 0,
          lastReviewed: data?.lastReviewed || null,
          weakAreas: masteryLevel < 50 && data?.total > 0 ? ['Révision recommandée'] : []
        };
      });

      setItems(masteryItems);
      setLoading(false);
    };

    loadMastery();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'weak' && item.masteryLevel < 50 && item.reviewCount > 0) ||
      (filter === 'mastered' && item.masteryLevel >= 70);

    return matchesSearch && matchesFilter;
  });

  const getMasteryColor = (level: number, reviewed: boolean): string => {
    if (!reviewed) return 'bg-muted';
    if (level >= 70) return 'bg-success';
    if (level >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  const stats = {
    total: items.length,
    reviewed: items.filter(i => i.reviewCount > 0).length,
    mastered: items.filter(i => i.masteryLevel >= 70).length,
    weak: items.filter(i => i.masteryLevel < 50 && i.reviewCount > 0).length
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-10 gap-1">
              {Array(100).fill(0).map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Maîtrise des Items
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              {stats.mastered} maîtrisés
            </Badge>
            <Badge variant="outline" className="gap-1">
              <AlertTriangle className="h-3 w-3 text-warning" />
              {stats.weak} à travailler
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'weak', 'mastered'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-xs rounded-md transition-colors ${
                  filter === f 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {f === 'all' ? 'Tous' : f === 'weak' ? 'À revoir' : 'Maîtrisés'}
              </button>
            ))}
          </div>
        </div>

        {/* Progress overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression globale</span>
            <span className="text-muted-foreground">
              {stats.reviewed} / {stats.total} révisés
            </span>
          </div>
          <Progress value={(stats.reviewed / stats.total) * 100} className="h-2" />
        </div>

        {/* Mastery grid */}
        <TooltipProvider>
          <div className="grid grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-1">
            {filteredItems.slice(0, 200).map((item) => (
              <Tooltip key={item.itemCode}>
                <TooltipTrigger asChild>
                  <div
                    className={`aspect-square rounded-sm cursor-pointer transition-transform hover:scale-150 hover:z-10 ${
                      getMasteryColor(item.masteryLevel, item.reviewCount > 0)
                    }`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium">Item {item.itemCode}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs">
                      {item.reviewCount > 0 ? (
                        <>
                          <Badge variant={item.masteryLevel >= 70 ? 'default' : item.masteryLevel >= 50 ? 'secondary' : 'destructive'}>
                            {item.masteryLevel}%
                          </Badge>
                          <span>{item.reviewCount} révisions</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Pas encore révisé</span>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <span>Légende:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <span>Non révisé</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-destructive" />
            <span>&lt;50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-warning" />
            <span>50-70%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-success" />
            <span>&gt;70%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemMasteryGrid;
