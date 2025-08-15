import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, CheckCircle, Music, Target } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface EdnItem {
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
}

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-200 animate-pulse" />
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
      </div>
      
      <div className="mb-6">
        <div className="h-10 bg-gray-200 rounded w-80 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

const ItemCard = ({ item }: { item: EdnItem }) => {
  const getCompletionPercentage = () => {
    let score = 0;
    if (item.tableau_rang_a) score += 25;
    if (item.tableau_rang_b) score += 25;
    if (item.paroles_musicales?.length) score += 25;
    if (item.competences_oic_rang_a || item.competences_oic_rang_b) score += 25;
    return score;
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <Link to={`/edn/${item.slug}`} className="block">
      <div className="h-full bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {item.item_code}
          </span>
          <span className={`px-2 py-1 text-xs rounded ${
            completionPercentage >= 80 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {completionPercentage}%
          </span>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {item.title}
        </h3>
        
        {item.subtitle && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.subtitle}
          </p>
        )}
        
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
};

export default function EdnCompleteFast() {
  const [items, setItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Début du chargement des items EDN...');
        
        const { data, error } = await supabase
          .from('edn_items_complete')
          .select('id, item_code, title, subtitle, slug, paroles_musicales, tableau_rang_a, tableau_rang_b, competences_oic_rang_a, competences_oic_rang_b')
          .order('item_code')
          .limit(100); // Limiter pour améliorer la performance

        if (error) {
          console.error('❌ Erreur Supabase:', error);
        } else {
          console.log('✅ Items chargés:', data?.length || 0);
          setItems(data || []);
        }
      } catch (err) {
        console.error('❌ Erreur réseau:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredItems = searchTerm 
    ? items.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;

  if (loading) {
    return <LoadingSkeleton />;
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
            <input
              type="text"
              placeholder="Rechercher un item EDN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/70 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">
              {searchTerm ? `Aucun item trouvé pour "${searchTerm}"` : 'Aucun item disponible'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}