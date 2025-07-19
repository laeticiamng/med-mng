import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Music, Play, BookOpen } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
import { AppFooter } from '@/components/AppFooter';

interface EdnItemDetail {
  id: string;
  item_code: string;
  title: string;
  subtitle: string;
  tableau_rang_a: any;
  tableau_rang_b: any;
  paroles_musicales: string[];
}

const EdnItemImmersive = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<EdnItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rang-a' | 'rang-b' | 'musique'>('rang-a');

  useEffect(() => {
    // Simuler le chargement d'un item spécifique
    setTimeout(() => {
      const mockItem: EdnItemDetail = {
        id: '1',
        item_code: slug?.toUpperCase() || 'IC-1',
        title: `Item EDN ${slug?.toUpperCase()} - Connaissances médicales essentielles`,
        subtitle: 'Compétences fondamentales pour la pratique médicale',
        tableau_rang_a: {
          title: 'Rang A - Connaissances de base',
          sections: [
            {
              title: 'Concepts fondamentaux',
              content: 'Les bases essentielles à maîtriser pour cet item EDN.'
            }
          ]
        },
        tableau_rang_b: {
          title: 'Rang B - Connaissances approfondies',
          sections: [
            {
              title: 'Expertise avancée',
              content: 'Connaissances spécialisées et approfondies pour cet item.'
            }
          ]
        },
        paroles_musicales: [
          `Item ${slug?.toUpperCase()} fondamental à maîtriser`,
          'Compétences médicales essentielles',
          'Formation continue pour l\'excellence'
        ]
      };
      setItem(mockItem);
      setLoading(false);
    }, 1000);
  }, [slug]);

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
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Item non trouvé</h2>
          <PremiumButton onClick={() => navigate('/edn-complete')}>
            Retour aux items
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{item.item_code}</h1>
                <p className="text-sm text-gray-600">{item.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h2>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
            <button
              onClick={() => setActiveTab('rang-a')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'rang-a'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Rang A
            </button>
            <button
              onClick={() => setActiveTab('rang-b')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'rang-b'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Rang B
            </button>
            <button
              onClick={() => setActiveTab('musique')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'musique'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Music className="w-4 h-4 inline mr-2" />
              Musique
            </button>
          </div>

          {/* Content */}
          <div className="grid gap-6">
            {activeTab === 'rang-a' && (
              <PremiumCard>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{item.tableau_rang_a.title}</h3>
                  {item.tableau_rang_a.sections.map((section: any, index: number) => (
                    <div key={index} className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">{section.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{section.content}</p>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            )}

            {activeTab === 'rang-b' && (
              <PremiumCard>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{item.tableau_rang_b.title}</h3>
                  {item.tableau_rang_b.sections.map((section: any, index: number) => (
                    <div key={index} className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">{section.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{section.content}</p>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            )}

            {activeTab === 'musique' && (
              <PremiumCard>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Composition musicale</h3>
                  <div className="space-y-4 mb-6">
                    {item.paroles_musicales.map((ligne, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-800 font-medium">{ligne}</p>
                      </div>
                    ))}
                  </div>
                  <PremiumButton variant="primary" size="lg">
                    <Play className="w-5 h-5 mr-2" />
                    Générer la musique
                  </PremiumButton>
                </div>
              </PremiumCard>
            )}
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default EdnItemImmersive;