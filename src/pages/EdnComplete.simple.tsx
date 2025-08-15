import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, CheckCircle, Music, Target } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface EdnItemSimple {
  id: string;
  item_code: string;
  title: string;
  slug: string;
  paroles_musicales?: string[];
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  competences_oic_rang_a?: any;
  competences_oic_rang_b?: any;
}

export default function EdnCompleteSimple() {
  const [items, setItems] = useState<EdnItemSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('edn_items_complete')
        .select('id, item_code, title, slug, paroles_musicales, tableau_rang_a, tableau_rang_b, competences_oic_rang_a, competences_oic_rang_b')
        .order('item_code')
        .limit(50);

      if (fetchError) {
        console.error('Erreur Supabase:', fetchError);
        setError('Erreur de chargement des données');
        return;
      }

      console.log('Items chargés:', data?.length || 0);
      setItems(data || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de réseau');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const getCompletionPercentage = useCallback((item: EdnItemSimple): number => {
    let score = 0;
    if (item.tableau_rang_a) score += 25;
    if (item.tableau_rang_b) score += 25;
    if (item.paroles_musicales?.length) score += 25;
    if (item.competences_oic_rang_a || item.competences_oic_rang_b) score += 25;
    return score;
  }, []);

  const filteredItems = React.useMemo(() => {
    return items.filter(item => 
      !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-muted animate-pulse" />
            <div>
              <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse" />
              <div className="h-4 bg-muted rounded w-32 animate-pulse" />
            </div>
          </div>
          <div className="mb-6">
            <div className="h-10 bg-muted rounded w-80 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={fetchItems}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Interface EDN</h1>
              <p className="text-muted-foreground">{items.length} items disponibles</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un item EDN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const completionPercentage = getCompletionPercentage(item);
              
              return (
                <Link key={item.id} to={`/edn/${item.slug}`} className="block">
                  <div className="h-full bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                        {item.item_code}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        completionPercentage >= 80 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                      }`}>
                        {completionPercentage}%
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-3 line-clamp-2 text-foreground">
                      {item.title}
                    </h3>
                    
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
                      {item.paroles_musicales?.length && (
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
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? `Aucun item trouvé pour "${searchTerm}"` : 'Aucun item disponible'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}