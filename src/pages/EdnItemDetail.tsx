import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, BookOpen, Target, ArrowLeft, Music, Play, Pause } from 'lucide-react';
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
  paroles_musicales?: string[];
  scene_immersive?: any;
  quiz_questions?: any[];
}

const EdnItemDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<EdnItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rang-a');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      if (!slug) return;
      
      try {
        const { data, error } = await supabase
          .from('edn_items_immersive')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (error) throw error;
        setItem(data);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'item:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [slug]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'item EDN...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Item non trouvé</h2>
          <p className="text-gray-500 mb-6">L'item demandé n'existe pas ou a été supprimé.</p>
          <PremiumButton onClick={() => navigate('/edn-complete')}>
            Retour aux items EDN
          </PremiumButton>
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
            <div className="flex items-center space-x-4">
              <PremiumButton
                variant="outline"
                size="sm"
                onClick={() => navigate('/edn-complete')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </PremiumButton>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{item.item_code}</Badge>
                    <Badge className={getSpecialtyColor(getSpecialtyFromItemCode(item.item_code))}>
                      {getSpecialtyFromItemCode(item.item_code)}
                    </Badge>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">{item.title}</h1>
                  <p className="text-sm text-gray-600">{item.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('rang-a')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'rang-a'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Rang A - Fondamentaux
          </button>
          <button
            onClick={() => setActiveTab('rang-b')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'rang-b'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Rang B - Expertise
          </button>
          <button
            onClick={() => setActiveTab('musical')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'musical'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Music className="w-4 h-4 inline mr-2" />
            Paroles Musicales
          </button>
        </div>

        {/* Content */}
        {activeTab === 'rang-a' && item.tableau_rang_a && (
          <PremiumCard className="mb-8">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {item.tableau_rang_a.title || 'Compétences Rang A'}
              </h2>
              {item.tableau_rang_a.sections?.map((section: any, index: number) => (
                <div key={index} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{section.title}</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{section.content}</p>
                    {section.keywords && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {section.keywords.map((keyword: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        )}

        {activeTab === 'rang-b' && item.tableau_rang_b && (
          <PremiumCard className="mb-8">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {item.tableau_rang_b.title || 'Compétences Rang B'}
              </h2>
              {item.tableau_rang_b.sections?.map((section: any, index: number) => (
                <div key={index} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{section.title}</h3>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                    <p className="text-gray-700">{section.content}</p>
                    {section.keywords && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {section.keywords.map((keyword: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs bg-white">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        )}

        {activeTab === 'musical' && item.paroles_musicales && (
          <PremiumCard className="mb-8">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Paroles Musicales</h2>
                <PremiumButton
                  variant={isPlaying ? "secondary" : "primary"}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Écouter'}
                </PremiumButton>
              </div>
              
              <div className="space-y-4">
                {item.paroles_musicales.map((verse, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
                    <p className="text-lg font-medium text-gray-800 leading-relaxed">
                      {verse}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <PremiumButton variant="outline" onClick={() => navigate('/generator')}>
                  <Music className="w-4 h-4 mr-2" />
                  Créer une mélodie avec ces paroles
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        )}

        {/* Navigation */}
        <div className="text-center">
          <PremiumButton
            variant="outline"
            onClick={() => navigate('/edn-complete')}
          >
            ← Retour à tous les items EDN
          </PremiumButton>
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default EdnItemDetail;