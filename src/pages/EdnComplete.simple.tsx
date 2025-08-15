import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, CheckCircle, Music, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from "@/integrations/supabase/client";

interface EdnItemSimple {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  paroles_musicales?: string[];
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  competences_oic_rang_a?: any;
  competences_oic_rang_b?: any;
  is_validated?: boolean;
  completeness_score?: number;
}

export default function EdnCompleteSimple() {
  const [items, setItems] = useState<EdnItemSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('edn_items_complete')
          .select(`
            id,
            item_code,
            title,
            subtitle,
            slug,
            paroles_musicales,
            tableau_rang_a,
            tableau_rang_b,
            competences_oic_rang_a,
            competences_oic_rang_b,
            is_validated,
            completeness_score
          `)
          .order('item_code');

        if (error) {
          console.error('Erreur:', error);
          return;
        }

        setItems(data || []);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const getCompletionPercentage = (item: EdnItemSimple): number => {
    let score = 0;
    if (item.tableau_rang_a) score += 25;
    if (item.tableau_rang_b) score += 25;
    if (item.paroles_musicales && item.paroles_musicales.length > 0) score += 25;
    if (item.competences_oic_rang_a || item.competences_oic_rang_b) score += 25;
    return Math.min(score, 100);
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-6">
            <Skeleton className="h-10 w-80 mb-4" />
            <Skeleton className="h-6 w-64 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Interface EDN</h1>
              <p className="text-slate-600">{items.length} items disponibles</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Rechercher un item EDN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/70 border-white/30"
            />
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const completionPercentage = getCompletionPercentage(item);
            
            return (
              <Link key={item.id} to={`/edn/${item.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/30 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.item_code}
                      </Badge>
                      <Badge 
                        variant={completionPercentage >= 80 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {completionPercentage}%
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {item.title}
                    </CardTitle>
                    {item.subtitle && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {item.subtitle}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {item.tableau_rang_a && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Rang A
                        </div>
                      )}
                      {item.tableau_rang_b && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <CheckCircle className="w-3 h-3" />
                          Rang B
                        </div>
                      )}
                      {item.paroles_musicales && item.paroles_musicales.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <Music className="w-3 h-3" />
                          Musique
                        </div>
                      )}
                      {(item.competences_oic_rang_a || item.competences_oic_rang_b) && (
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          <Target className="w-3 h-3" />
                          OIC
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-slate-500">Aucun item trouvé pour "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}