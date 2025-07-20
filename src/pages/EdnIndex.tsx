import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, Search, BookOpen, Users, Target } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
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

const EdnIndex = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');

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

  const groupedItems = specialties.slice(1).reduce((acc, specialty) => {
    acc[specialty] = items.filter(item => getSpecialtyFromItemCode(item.item_code) === specialty);
    return acc;
  }, {} as Record<string, EdnItem[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">EDN - Items de Connaissance</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explorez les 367 items EDN avec plus de 4,872 compétences OIC organisées par rang.
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un item ou code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSpecialty === specialty
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty} {specialty !== 'Tous' && `(${groupedItems[specialty]?.length || 0})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
            <div className="text-gray-600">Items EDN</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">10</div>
            <div className="text-gray-600">Spécialités</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{filteredItems.length}</div>
            <div className="text-gray-600">Items filtrés</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
            <Brain className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">100%</div>
            <div className="text-gray-600">Complétude</div>
          </div>
        </div>

        {/* Actions principales */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <PremiumCard className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Base EDN Complète</h3>
              <p className="text-gray-600 mb-6">
                Accédez à tous les items EDN avec leurs compétences détaillées, organisés de manière immersive.
              </p>
              <PremiumButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/edn-complete')}
              >
                Explorer les items <ArrowRight className="w-5 h-5 ml-2" />
              </PremiumButton>
            </div>
          </PremiumCard>

          <PremiumCard className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Générateur Musical</h3>
              <p className="text-gray-600 mb-6">
                Créez des compositions musicales à partir des compétences EDN pour faciliter l'apprentissage.
              </p>
              <PremiumButton
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/generator')}
              >
                Créer de la musique <ArrowRight className="w-5 h-5 ml-2" />
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>

        {/* Liste des items par spécialité */}
        {!loading && (
          <div className="max-w-6xl mx-auto">
            {selectedSpecialty === 'Tous' ? (
              Object.entries(groupedItems).map(([specialty, specialtyItems]) => (
                specialtyItems.length > 0 && (
                  <div key={specialty} className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <Badge className={getSpecialtyColor(specialty)}>
                        {specialtyItems.length} items
                      </Badge>
                      {specialty}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {specialtyItems.slice(0, 6).map((item) => (
                        <PremiumCard key={item.id} className="hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">{item.item_code}</Badge>
                              <Badge className={getSpecialtyColor(specialty)} variant="secondary">
                                {getSpecialtyFromItemCode(item.item_code)}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {item.subtitle || 'Compétences médicales essentielles'}
                            </p>
                            <PremiumButton
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => navigate(`/edn-item/${item.slug}`)}
                            >
                              Explorer <ArrowRight className="w-4 h-4 ml-1" />
                            </PremiumButton>
                          </div>
                        </PremiumCard>
                      ))}
                    </div>
                    {specialtyItems.length > 6 && (
                      <div className="text-center mt-4">
                        <PremiumButton
                          variant="outline"
                          onClick={() => setSelectedSpecialty(specialty)}
                        >
                          Voir tous les {specialtyItems.length} items de {specialty}
                        </PremiumButton>
                      </div>
                    )}
                  </div>
                )
              ))
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Badge className={getSpecialtyColor(selectedSpecialty)}>
                    {filteredItems.length} items
                  </Badge>
                  {selectedSpecialty}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <PremiumCard key={item.id} className="hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{item.item_code}</Badge>
                          <Badge className={getSpecialtyColor(getSpecialtyFromItemCode(item.item_code))} variant="secondary">
                            {getSpecialtyFromItemCode(item.item_code)}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.subtitle || 'Compétences médicales essentielles'}
                        </p>
                        <PremiumButton
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => navigate(`/edn-item/${item.slug}`)}
                        >
                          Explorer <ArrowRight className="w-4 h-4 ml-1" />
                        </PremiumButton>
                      </div>
                    </PremiumCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement des items EDN...</p>
          </div>
        )}

        <div className="text-center mt-12">
          <PremiumButton
            variant="outline"
            onClick={() => navigate('/')}
          >
            ← Retour à l'accueil
          </PremiumButton>
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default EdnIndex;