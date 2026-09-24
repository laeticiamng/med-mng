import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, Flame, Search, Star, Target } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ItemMastery {
  itemCode: string;
  title: string;
  masteryLevel: number; // 0-100
  reviewCount: number;
  lastReviewed: string | null;
  weakAreas: string[];
}

export const ItemMasteryGrid: React.FC = () => {
  const navigate = useNavigate();
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats } = useGamification();
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

      // Load gamification stats
      loadStats(user.id);

      // Tracker la consultation de la grille de maîtrise
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'item_mastery_grid', action: 'view' }
      });

      // Get all EDN items
      const { data: ednItems } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title')
        .order('item_code');

      if (!ednItems) {
        setLoading(false);
        return;
      }

      // Get user's progress from Supabase (real data)
      const { data: progressData } = await supabase
        .from('user_item_progress')
        .select('item_code, ease_factor, interval_days, repetitions, last_reviewed, next_review')
        .eq('user_id', user.id);

      // Get review sessions for more detailed stats
      await supabase
        .from('review_sessions')
        .select('item_codes, correct_count, total_count, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(100);

      // Calculate mastery per item from real progress data
      const masteryMap: Record<string, { masteryLevel: number; reviewCount: number; lastReviewed: string | null }> = {};

      // From user_item_progress
      progressData?.forEach((progress: any) => {
        // ease_factor starts at 2.5, increases with good reviews
        // Convert to 0-100 scale: (ease_factor - 1.3) / 2.2 * 100
        const easeFactor = progress.ease_factor || 2.5;
        const intervalDays = progress.interval_days || 0;
        
        // Mastery based on ease factor and interval
        let masteryLevel = 0;
        if (intervalDays > 30) masteryLevel = 90;
        else if (intervalDays > 14) masteryLevel = 75;
        else if (intervalDays > 7) masteryLevel = 60;
        else if (intervalDays > 3) masteryLevel = 45;
        else if (intervalDays > 1) masteryLevel = 30;
        else if (progress.repetitions > 0) masteryLevel = 15;
        
        // Adjust with ease factor
        if (easeFactor > 2.5) masteryLevel = Math.min(100, masteryLevel + 10);
        if (easeFactor < 2.0) masteryLevel = Math.max(0, masteryLevel - 10);
        
        masteryMap[progress.item_code] = {
          masteryLevel,
          reviewCount: progress.repetitions || 0,
          lastReviewed: progress.last_reviewed
        };
      });

      // Build mastery items
      const masteryItems: ItemMastery[] = ednItems.map(item => {
        const data = masteryMap[item.item_code];
        
        return {
          itemCode: item.item_code,
          title: item.title,
          masteryLevel: data?.masteryLevel || 0,
          reviewCount: data?.reviewCount || 0,
          lastReviewed: data?.lastReviewed || null,
          weakAreas: (data?.masteryLevel || 0) < 50 && (data?.reviewCount || 0) > 0 ? ['Révision recommandée'] : []
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
            {gamificationStats && (
              <>
                <Badge variant="outline" className="gap-1">
                  <Flame className="h-3 w-3 text-warning" />
                  {gamificationStats.currentStreak}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3 text-primary" />
                  Nv.{gamificationStats.level}
                </Badge>
              </>
            )}
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
                  <button
                    onClick={() => {
                      logActivity({
                        activity_type: 'study',
                        count: 1,
                        metadata: { 
                          component: 'item_mastery_grid', 
                          action: 'click_item',
                          item_code: item.itemCode,
                          mastery_level: item.masteryLevel 
                        }
                      });
                      navigate(`/edn/${item.itemCode}`);
                    }}
                    className={`aspect-square rounded-sm cursor-pointer transition-all hover:scale-150 hover:z-10 hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                      getMasteryColor(item.masteryLevel, item.reviewCount > 0)
                    }`}
                    aria-label={`Item ${item.itemCode}: ${item.masteryLevel}% maîtrisé - Cliquer pour réviser`}
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
                    <p className="text-xs text-primary font-medium mt-1">Cliquer pour réviser →</p>
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
