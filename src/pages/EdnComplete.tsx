import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, BookOpen, Search, Filter } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { AppFooter } from '@/components/AppFooter';

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
}

const EdnComplete = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<EdnItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des items EDN
    setTimeout(() => {
      const mockItems: EdnItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i + 1}`,
        item_code: `IC-${i + 1}`,
        title: `Item EDN ${i + 1} - Connaissances médicales essentielles`,
        subtitle: `Compétences fondamentales pour l'item ${i + 1}`,
        slug: `ic-${i + 1}`
      }));
      setItems(mockItems);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des items EDN...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PremiumButton
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
              >
                ← Retour
              </PremiumButton>
              <div className="flex items-center space-x-2">
                <Brain className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Base EDN Complète</h1>
                  <p className="text-sm text-gray-600">367 items avec 4,872 compétences OIC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un item EDN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <PremiumButton variant="outline" size="md">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </PremiumButton>
        </div>

        {/* Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredItems.map((item) => (
            <PremiumCard
              key={item.id}
              className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/edn-complete/${item.slug}`)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
                    {item.item_code}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.subtitle}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Rang A + B</span>
                  <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun item trouvé</h3>
            <p className="text-gray-500">Essayez de modifier votre recherche</p>
          </div>
        )}
      </div>

      <AppFooter />
    </div>
  );
};

export default EdnComplete;