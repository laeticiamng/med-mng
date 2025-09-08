import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TranslatedText } from '@/components/TranslatedText';
import { GeneratorMusicPlayer } from '@/components/GeneratorMusicPlayer';
import { useFreeTrialLimit } from '@/hooks/useFreeTrialLimit';
import { useSubscription } from '@/hooks/useSubscription';
import { useUnifiedMedicalMusicGeneration } from '@/hooks/useUnifiedMedicalMusicGeneration';
import { useEdnItemLyrics } from '@/hooks/useEdnItemLyrics';
import { useAllEdnItems } from '@/hooks/useAllEdnItems';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { QuotaDisplay } from '@/components/generator/QuotaDisplay';
import { GeneratorForm } from '@/components/generator/GeneratorForm';
import { Breadcrumbs } from '@/components/ux/Breadcrumbs';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';

const Generator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getRemainingGenerations, maxFreeGenerations } = useFreeTrialLimit();
  const { subscription, musicQuota, incrementMusicUsage, canGenerateMusic, canSaveMusic, getUsageDisplay } = useSubscription();
  const musicGeneration = useUnifiedMedicalMusicGeneration();
  
  const [contentType, setContentType] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedRang, setSelectedRang] = useState('');
  const [selectedSituation, setSelectedSituation] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [generatedSong, setGeneratedSong] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(null);
  
  // Récupération des paroles de l'item EDN sélectionné
  const { lyrics: ednLyrics, loading: lyricsLoading, error: lyricsError } = useEdnItemLyrics(
    contentType === 'edn' ? selectedItem : null
  );
  
  const remainingFree = getRemainingGenerations();
  const isGenerating = musicGeneration.isGenerating;
  const { items: allEdnItems, loading: itemsLoading, error: itemsError } = useAllEdnItems();

  const canGenerate = () => {
    if (contentType === 'edn') {
      return !!(selectedItem && selectedRang && selectedStyle && ednLyrics?.paroles_musicales);
    }
    if (contentType === 'ecos') {
      return !!(selectedSituation && selectedStyle);
    }
    return false;
  };

  const handleGenerate = async () => {
    if (!canGenerate()) {
      toast.error('Veuillez sélectionner tous les paramètres requis');
      return;
    }

    if (!user) {
      if (remainingFree <= 0) {
        toast.error('🎵 Générations gratuites épuisées', {
          description: "Connectez-vous pour débloquer plus de générations et sauvegarder vos créations !",
          action: {
            label: "🚀 Se connecter",
            onClick: () => navigate('/med-mng/login')
          },
          duration: 8000
        });
        return;
      }
    } else {
      if (!canGenerateMusic()) {
        toast.error('🚀 Quota mensuel atteint', {
          description: "Améliorez votre abonnement pour générer plus de musiques éducatives ce mois-ci.",
          action: {
            label: "⭐ Voir les offres",
            onClick: () => navigate('/med-mng/pricing')
          },
          duration: 10000
        });
        return;
      }
    }

    try {
      let lyricsToUse: string[] = [];
      let titlePrefix = '';

      if (contentType === 'edn' && ednLyrics?.paroles_musicales) {
        lyricsToUse = ednLyrics.paroles_musicales;
        titlePrefix = `${ednLyrics.title} - ${selectedItem}`;
        
        console.log('🎵 Utilisation des paroles EDN réelles:', {
          item: selectedItem,
          title: ednLyrics.title,
          paroles_count: lyricsToUse.length,
          rang: selectedRang
        });
      } else if (contentType === 'ecos') {
        lyricsToUse = [
          `Paroles pour ${selectedSituation} - Situation clinique`,
          `Paroles avancées pour ${selectedSituation} - Expertise médicale`
        ];
        titlePrefix = selectedSituation;
      }

      if (lyricsToUse.length === 0) {
        toast.error('Aucune parole disponible pour cet item');
        return;
      }

      const rang = contentType === 'edn' ? selectedRang as ('A' | 'B' | 'AB') : 'A';
      
      let actualRang: 'A' | 'B' = 'A';
      let lyricsIndex = 0;
      
      if (rang === 'A') {
        actualRang = 'A';
        lyricsIndex = 0;
      } else if (rang === 'B') {
        actualRang = 'B'; 
        lyricsIndex = 1;
      } else if (rang === 'AB') {
        actualRang = 'A';
        lyricsIndex = 2;
      }

      setGenerationProgress({
        rang: selectedRang as 'A' | 'B' | 'AB',
        progress: 5,
        attempts: 0,
        maxAttempts: 18,
        estimatedTimeRemaining: 90
      });
      
      const taskId = await musicGeneration.generateMedicalMusic({
        itemCode: contentType === 'edn' ? selectedItem : selectedSituation,
        rang: actualRang,
        lyrics: lyricsToUse,
        style: selectedStyle,
        duration: 240
      });
      
      if (user) {
        const success = await incrementMusicUsage();
        if (!success) {
          toast.error('Erreur lors de la mise à jour du quota');
        }
      }
      
      // Attendre que la génération soit terminée pour obtenir l'URL audio
      // Pour l'instant, on stocke juste le taskId
      const song = {
        id: Date.now(),
        title: `${titlePrefix} - ${selectedStyle}`,
        audioUrl: '', // Sera rempli quand la génération sera terminée
        taskId: taskId,
        style: selectedStyle,
        rang: rang,
        duration: 240,
        itemCode: contentType === 'edn' ? selectedItem : selectedSituation,
        lyrics: lyricsToUse[lyricsIndex]
      };

      setGeneratedSong(song);
      setGenerationProgress(null);
      toast.success('Génération musicale réussie avec les paroles de l\'item !');
      
    } catch (error) {
      console.error('Erreur génération:', error);
      setGenerationProgress(null);
      toast.error('Erreur lors de la génération musicale');
    }
  };

  const handleAddToLibrary = () => {
    if (!generatedSong) return;
    
    if (!user) {
      toast.error('🔐 Sauvegarde nécessite une connexion', {
        description: "Connectez-vous pour sauvegarder vos créations et y accéder depuis n'importe où.",
        action: {
          label: "🚀 Se connecter", 
          onClick: () => navigate('/med-mng/login')
        },
        duration: 8000
      });
      return;
    }
    
    if (!canSaveMusic()) {
      toast.error('📦 Sauvegarde limitée par votre plan', {
        description: "Améliorez votre abonnement pour sauvegarder toutes vos créations musicales.",
        action: {
          label: "⭐ Améliorer le plan",
          onClick: () => navigate('/med-mng/pricing')
        },
        duration: 10000
      });
      return;
    }
    
    toast.success('Chanson ajoutée à votre bibliothèque !');
  };

  const resetForm = () => {
    setContentType('');
    setSelectedItem('');
    setSelectedRang('');
    setSelectedSituation('');
    setSelectedStyle('');
    setGeneratedSong(null);
  };

  return (
    <ConsistentBackground variant="primary">
      <PageHeader 
        title="Générateur Musical IA" 
        subtitle="Transformez vos connaissances EDN en mélodies inoubliables" 
        backTo="/" 
      />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        {/* Titre principal */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" id="main-content">
            Créez la <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">musique médicale</span><br />
            de vos rêves
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Générez des chansons éducatives personnalisées pour maîtriser chaque item médical avec l'IA de dernière génération.
          </p>
        </div>

        {/* Galerie de démonstration */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { title: "IC-103 Vertige", emoji: "🧠", plays: "2.3K", gradient: "from-purple-600 to-pink-600" },
            { title: "IC-230 Cardiologie", emoji: "❤️", plays: "1.8K", gradient: "from-red-500 to-pink-500" },
            { title: "IC-156 Pneumologie", emoji: "🫁", plays: "1.5K", gradient: "from-blue-500 to-cyan-500" },
            { title: "IC-089 Neurologie", emoji: "🧠", plays: "2.1K", gradient: "from-indigo-500 to-purple-500" }
          ].map((item, index) => (
            <div 
              key={index} 
              className="group cursor-pointer" 
              role="button" 
              tabIndex={0}
              aria-label={`Exemple de chanson éducative: ${item.title} avec ${item.plays} écoutes`}
            >
              <div className={`relative aspect-square bg-gradient-to-br ${item.gradient} rounded-xl mb-3 flex items-center justify-center text-4xl hover:scale-105 transition-transform duration-300 shadow-lg`}>
                {item.emoji}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-2xl">
                    ▶️
                  </div>
                </div>
              </div>
              <p className="text-white font-medium text-sm truncate">{item.title}</p>
              <p className="text-gray-400 text-xs">{item.plays} écoutes</p>
            </div>
          ))}
        </div>

        {/* Quotas */}
        <div className="mb-8">
          <QuotaDisplay
            user={user}
            remainingFree={remainingFree}
            maxFreeGenerations={maxFreeGenerations}
            musicQuota={musicQuota}
            getUsageDisplay={getUsageDisplay}
          />
        </div>

        {/* Section principale de génération */}
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8 shadow-2xl">
          <GeneratorForm
            contentType={contentType}
            setContentType={setContentType}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            selectedRang={selectedRang}
            setSelectedRang={setSelectedRang}
            selectedSituation={selectedSituation}
            setSelectedSituation={setSelectedSituation}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            allEdnItems={allEdnItems}
            itemsLoading={itemsLoading}
            itemsError={itemsError}
            ednLyrics={ednLyrics}
            lyricsLoading={lyricsLoading}
            lyricsError={lyricsError}
            canGenerate={canGenerate}
            handleGenerate={handleGenerate}
            resetForm={resetForm}
            isGenerating={isGenerating}
            user={user}
            remainingFree={remainingFree}
            canGenerateMusic={canGenerateMusic}
            generationProgress={generationProgress}
          />
        </div>

        {/* Lecteur de musique */}
        {generatedSong && (
          <div className="mb-8">
            <GeneratorMusicPlayer
              generatedSong={generatedSong}
              onAddToLibrary={handleAddToLibrary}
              onSongUpdate={(updatedSong) => {
                setGeneratedSong(prev => ({ ...prev, ...updatedSong }));
              }}
            />
          </div>
        )}

        {/* Section des fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="text-5xl mb-6">🎓</div>
            <h3 className="text-2xl font-bold text-white mb-4">Éducation Médicale</h3>
            <p className="text-gray-300 leading-relaxed">Transformez chaque item EDN en chanson mémorable pour faciliter l'apprentissage</p>
          </div>
          <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="text-5xl mb-6">🎵</div>
            <h3 className="text-2xl font-bold text-white mb-4">IA Musicale</h3>
            <p className="text-gray-300 leading-relaxed">Génération automatique de mélodies adaptées au contenu médical avec Suno AI</p>
          </div>
          <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="text-5xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-white mb-4">367 Items EDN</h3>
            <p className="text-gray-300 leading-relaxed">Couverture complète du programme médical français pour votre réussite</p>
          </div>
        </div>

        {/* Guide d'utilisation */}
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h3 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-pink-400" />
            Comment créer votre musique ?
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Choisissez votre contenu</h4>
                  <p className="text-gray-300">EDN ou ECOS selon vos besoins d'apprentissage</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Sélectionnez l'item</h4>
                  <p className="text-gray-300">367 items EDN avec compétences OIC complètes</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Définissez le niveau</h4>
                  <p className="text-gray-300">Rang A, B ou A+B selon votre objectif</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Choisissez le style</h4>
                  <p className="text-gray-300">Pop, Rock, Jazz ou Electronic selon vos préférences</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Générez et écoutez</h4>
                  <p className="text-gray-300">L'IA crée votre chanson en temps réel</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">6</div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Sauvegardez</h4>
                  <p className="text-gray-300">Ajoutez à votre bibliothèque personnelle</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default Generator;