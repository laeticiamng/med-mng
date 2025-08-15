import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Filter, Grid, List, CheckCircle, Music, Target } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  slug: string;
  competences_count_rang_a?: number;
  competences_count_rang_b?: number;
  competences_count_total?: number;
  paroles_musicales?: string[];
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  completeness_score?: number;
}

// Fonction de tri intelligent pour IC-1, IC-2, ..., IC-10, IC-11, ..., IC-100, IC-101...
const sortItemsByCode = (items: EdnItem[]) => {
  return items.sort((a, b) => {
    const numA = parseInt(a.item_code.replace('IC-', ''));
    const numB = parseInt(b.item_code.replace('IC-', ''));
    return numA - numB;
  });
};

// Données initiales pour affichage instantané
const INITIAL_EDN_ITEMS: EdnItem[] = [
  { id: '1', item_code: 'IC-1', title: 'La relation médecin-malade', slug: 'ic-1', competences_count_rang_a: 5, competences_count_rang_b: 3, competences_count_total: 8, completeness_score: 85 },
  { id: '2', item_code: 'IC-2', title: 'Les droits du patient', slug: 'ic-2', competences_count_rang_a: 4, competences_count_rang_b: 4, competences_count_total: 8, completeness_score: 90 },
  { id: '3', item_code: 'IC-3', title: 'Le raisonnement médical', slug: 'ic-3', competences_count_rang_a: 6, competences_count_rang_b: 2, competences_count_total: 8, completeness_score: 75 },
  { id: '4', item_code: 'IC-4', title: 'Évaluation des pratiques', slug: 'ic-4', competences_count_rang_a: 3, competences_count_rang_b: 5, competences_count_total: 8, completeness_score: 80 },
  { id: '5', item_code: 'IC-5', title: 'La sécurité du patient', slug: 'ic-5', competences_count_rang_a: 7, competences_count_rang_b: 1, competences_count_total: 8, completeness_score: 95 }
];

export default function EdnInstant() {
  const [items, setItems] = useState<EdnItem[]>(INITIAL_EDN_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(INITIAL_EDN_ITEMS.length);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'code' | 'completion' | 'competences'>('code');

  // Charger tous les items en arrière-plan
  useEffect(() => {
    let mounted = true;

    const loadAllItems = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('edn_items_complete')
          .select(`
            id, 
            item_code, 
            title, 
            slug,
            competences_count_rang_a,
            competences_count_rang_b,
            competences_count_total,
            paroles_musicales,
            tableau_rang_a,
            tableau_rang_b,
            completeness_score
          `)
          .order('item_code');

        if (error) {
          console.error('Erreur chargement EDN:', error);
          return;
        }

        if (mounted && data) {
          console.log(`✅ ${data.length} items EDN chargés avec compétences`);
          const sortedItems = sortItemsByCode(data as EdnItem[]);
          setItems(sortedItems);
          setTotalCount(sortedItems.length);
        }
      } catch (err) {
        console.error('Erreur réseau EDN:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(loadAllItems, 100);
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Filtrage et tri intelligent
  const processedItems = useMemo(() => {
    let filtered = items;
    
    // Filtrage par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = items.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.item_code.toLowerCase().includes(term)
      );
    }
    
    // Tri intelligent
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'completion':
          return (b.completeness_score || 0) - (a.completeness_score || 0);
        case 'competences':
          return (b.competences_count_total || 0) - (a.competences_count_total || 0);
        case 'code':
        default:
          const numA = parseInt(a.item_code.replace('IC-', ''));
          const numB = parseInt(b.item_code.replace('IC-', ''));
          return numA - numB;
      }
    });
  }, [items, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header avec design moderne */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Interface EDN Complète
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                {totalCount} items • {processedItems.length} affichés • {loading ? 'Synchronisation...' : 'À jour'}
              </p>
            </div>
          </div>

          {/* Barre de contrôles moderne */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un item EDN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 font-medium"
              />
            </div>

            {/* Contrôles de tri et vue */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none font-medium"
              >
                <option value="code">Tri par numéro</option>
                <option value="completion">Tri par complétude</option>
                <option value="competences">Tri par compétences</option>
              </select>

              <div className="flex bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grille des items avec design moderne */}
        {processedItems.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {processedItems.map((item) => (
              <Link key={item.id} to={`/edn/${item.slug}`} className="block group">
                <div className={`h-full bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] ${
                  viewMode === 'list' ? 'flex items-center gap-6' : 'flex flex-col'
                }`}>
                  
                  {/* Badge et score */}
                  <div className={`flex items-center justify-between mb-4 ${viewMode === 'list' ? 'mb-0 min-w-[200px]' : ''}`}>
                    <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm font-bold rounded-lg">
                      {item.item_code}
                    </div>
                    <div className={`px-3 py-1 text-sm font-bold rounded-lg ${
                      (item.completeness_score || 0) >= 80 
                        ? 'bg-green-100 text-green-700' 
                        : (item.completeness_score || 0) >= 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.completeness_score || 0}%
                    </div>
                  </div>
                  
                  {/* Titre */}
                  <h3 className={`font-bold text-slate-900 leading-tight ${
                    viewMode === 'list' ? 'flex-1 text-lg' : 'text-lg mb-4 line-clamp-2'
                  }`}>
                    {item.title}
                  </h3>
                  
                  {/* Indicateurs de compétences */}
                  <div className={`flex flex-wrap gap-2 ${viewMode === 'list' ? 'min-w-[300px] justify-end' : 'mt-auto'}`}>
                    {item.tableau_rang_a && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md">
                        <CheckCircle className="w-3 h-3" />
                        Rang A ({item.competences_count_rang_a || 0})
                      </div>
                    )}
                    {item.tableau_rang_b && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                        <CheckCircle className="w-3 h-3" />
                        Rang B ({item.competences_count_rang_b || 0})
                      </div>
                    )}
                    {item.paroles_musicales?.length && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md">
                        <Music className="w-3 h-3" />
                        Musique
                      </div>
                    )}
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-md">
                      <Target className="w-3 h-3" />
                      {item.competences_count_total || 0} OIC
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Aucun item trouvé
            </h3>
            <p className="text-slate-500">
              {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun item disponible'}
            </p>
          </div>
        )}

        {/* Statistiques en bas */}
        <div className="mt-12 p-6 bg-white/70 backdrop-blur-sm border-2 border-slate-200 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
              <div className="text-sm text-slate-600 font-medium">Items totaux</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{processedItems.filter(i => (i.completeness_score || 0) >= 80).length}</div>
              <div className="text-sm text-slate-600 font-medium">Complétés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{processedItems.filter(i => i.paroles_musicales?.length).length}</div>
              <div className="text-sm text-slate-600 font-medium">Avec musique</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{processedItems.reduce((sum, i) => sum + (i.competences_count_total || 0), 0)}</div>
              <div className="text-sm text-slate-600 font-medium">Compétences OIC</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}