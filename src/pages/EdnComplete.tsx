import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, BookOpen, Search, Filter, Target, Users } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { AppFooter } from '@/components/AppFooter';
import { supabase } from '@/integrations/supabase/client';

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
}

const EdnComplete = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<EdnItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tous');

  useEffect(() => {
    async function fetchItems() {
      try {
        const { data, error } = await supabase
          .from('edn_items_immersive')
          .select('*')
          .order('item_code');
        
        if (error) throw error;
        setItems(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des items:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  const getSpecialtyFromItemCode = (itemCode: string) => {
    const num = parseInt(itemCode.replace('IC-', ''));
    if (num >= 1 && num <= 10) return 'Fondamentaux médicaux';
    if (num >= 23 && num <= 42) return 'Gynécologie-Obstétrique';
    if (num >= 47 && num <= 57) return 'Pédiatrie';
    if (num >= 60 && num <= 80) return 'Psychiatrie';
    if (num >= 91 && num <= 110) return 'Neurologie';
    if (num >= 221 && num <= 239) return 'Cardiologie';
    if (num >= 290 && num <= 320) return 'Cancérologie';
    if (num >= 331 && num <= 367) return 'Médecine d\'urgence';
    return 'Médecine spécialisée';
  };

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty) {
      case 'Fondamentaux médicaux': return 'bg-blue-100 text-blue-800';
      case 'Gynécologie-Obstétrique': return 'bg-pink-100 text-pink-800';
      case 'Pédiatrie': return 'bg-green-100 text-green-800';
      case 'Psychiatrie': return 'bg-purple-100 text-purple-800';
      case 'Neurologie': return 'bg-indigo-100 text-indigo-800';
      case 'Cardiologie': return 'bg-red-100 text-red-800';
      case 'Cancérologie': return 'bg-orange-100 text-orange-800';
      case 'Médecine d\'urgence': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const specialties = [
    'Tous',
    'Fondamentaux médicaux',
    'Gynécologie-Obstétrique', 
    'Pédiatrie',
    'Psychiatrie',
    'Neurologie',
    'Cardiologie',
    'Cancérologie',
    'Médecine d\'urgence',
    'Médecine spécialisée'
  ];

  const filteredItems = items.filter(item => {
    const specialty = getSpecialtyFromItemCode(item.item_code);
    const matchesSpecialty = selectedSpecialty === 'Tous' || specialty === selectedSpecialty;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

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
        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
            <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900">{items.length}</div>
            <div className="text-sm text-gray-600">Items EDN</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
            <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900">10</div>
            <div className="text-sm text-gray-600">Spécialités</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
            <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900">{filteredItems.length}</div>
            <div className="text-sm text-gray-600">Items filtrés</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
            <Brain className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900">100%</div>
            <div className="text-sm text-gray-600">Complétude</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
          </div>
          
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => {
              const count = specialty === 'Tous' ? items.length : items.filter(item => getSpecialtyFromItemCode(item.item_code) === specialty).length;
              return (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSpecialty === specialty
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty} ({count})
                </button>
              );
            })}
          </div>
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
                  <Badge variant="outline">
                    {item.item_code}
                  </Badge>
                </div>
                
                <Badge className={getSpecialtyColor(getSpecialtyFromItemCode(item.item_code))} variant="secondary">
                  {getSpecialtyFromItemCode(item.item_code)}
                </Badge>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 mt-3 line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.subtitle || 'Compétences médicales essentielles'}
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