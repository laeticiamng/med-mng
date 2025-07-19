import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Play, Download, ArrowLeft, Sparkles } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
import { AppFooter } from '@/components/AppFooter';

const Generator = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState('');
  const [musicStyle, setMusicStyle] = useState('lofi');
  const [loading, setLoading] = useState(false);
  const [generatedSong, setGeneratedSong] = useState<any>(null);

  const items = [
    { code: 'IC-1', title: 'Relation médecin-malade' },
    { code: 'IC-2', title: 'Droits du patient' },
    { code: 'IC-3', title: 'Raisonnement médical' },
    { code: 'IC-4', title: 'Evaluation des pratiques' },
    { code: 'IC-5', title: 'Sécurité du patient' }
  ];

  const styles = [
    { id: 'lofi', name: 'Lo-Fi Hip Hop', description: 'Ambiance calme et studieuse' },
    { id: 'classical', name: 'Classique', description: 'Élégant et sophistiqué' },
    { id: 'ambient', name: 'Ambient', description: 'Atmosphérique et relaxant' },
    { id: 'pop', name: 'Pop médical', description: 'Entraînant et mémorable' }
  ];

  const handleGenerate = async () => {
    if (!selectedItem) return;
    
    setLoading(true);
    
    // Simuler la génération
    setTimeout(() => {
      setGeneratedSong({
        title: `Musique ${musicStyle} - ${selectedItem}`,
        audioUrl: null,
        lyrics: `Paroles pour ${selectedItem}`,
        duration: '3:45'
      });
      setLoading(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <PremiumButton
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </PremiumButton>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Générateur Musical</h1>
                <p className="text-sm text-gray-600">Créez de la musique à partir des items EDN</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Configuration */}
            <div className="space-y-6">
              <PremiumCard>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Sélectionner un item EDN</h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <label key={item.code} className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="item"
                          value={item.code}
                          checked={selectedItem === item.code}
                          onChange={(e) => setSelectedItem(e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <span className="font-medium text-gray-900">{item.code}</span>
                          <p className="text-sm text-gray-600">{item.title}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Style musical</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {styles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setMusicStyle(style.id)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          musicStyle === style.id
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{style.name}</div>
                        <div className="text-sm text-gray-600">{style.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </PremiumCard>

              <PremiumButton
                variant="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handleGenerate}
                disabled={!selectedItem || loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Génération en cours...
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Générer la musique
                  </>
                )}
              </PremiumButton>
            </div>

            {/* Résultat */}
            <div>
              <PremiumCard>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Résultat</h3>
                  
                  {generatedSong ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{generatedSong.title}</h4>
                        <p className="text-sm text-gray-600">Durée: {generatedSong.duration}</p>
                      </div>
                      
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center justify-center h-32 bg-gray-200 rounded-lg mb-4">
                          <Music className="w-12 h-12 text-gray-400" />
                        </div>
                        
                        <div className="flex space-x-2">
                          <PremiumButton variant="primary" size="sm" className="flex-1">
                            <Play className="w-4 h-4 mr-2" />
                            Écouter
                          </PremiumButton>
                          <PremiumButton variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </PremiumButton>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Paroles</h5>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                          {generatedSong.lyrics}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Sélectionnez un item et un style, puis cliquez sur "Générer" pour créer votre musique
                      </p>
                    </div>
                  )}
                </div>
              </PremiumCard>
            </div>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default Generator;