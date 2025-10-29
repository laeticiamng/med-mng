
import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, Sparkles, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TranslatedText } from '@/components/TranslatedText';
import { GeneratorMusicPlayer } from '@/components/GeneratorMusicPlayer';
import { PremiumBackground } from '@/components/ui/premium-background';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { useFreeTrialLimit } from '@/hooks/useFreeTrialLimit';
import { useSubscription } from '@/hooks/useSubscription';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useEdnItemLyrics } from '@/hooks/useEdnItemLyrics';
import { useAllEdnItems } from '@/hooks/useAllEdnItems';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { QuotaDisplay } from '@/components/generator/QuotaDisplay';
import { GeneratorForm } from '@/components/generator/GeneratorForm';

const Generator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getRemainingGenerations, maxFreeGenerations } = useFreeTrialLimit();
  const { subscription, musicQuota, incrementMusicUsage, canGenerateMusic, canSaveMusic, getUsageDisplay } = useSubscription();
  const musicGeneration = useMusicGenerationWithTranslation();
  
  const [contentType, setContentType] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedRang, setSelectedRang] = useState('');
  const [selectedSituation, setSelectedSituation] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [generatedSong, setGeneratedSong] = useState(null);
  
  // Récupération des paroles de l'item EDN sélectionné
  const { lyrics: ednLyrics, loading: lyricsLoading, error: lyricsError } = useEdnItemLyrics(
    contentType === 'edn' ? selectedItem : null
  );
  
  const remainingFree = getRemainingGenerations();

  // Check if any generation is in progress
  const isGenerating = musicGeneration.isGenerating?.rangA || musicGeneration.isGenerating?.rangB;

  // Hook pour charger tous les 367 items EDN depuis la base de données
  const { items: allEdnItems, loading: itemsLoading, error: itemsError } = useAllEdnItems();

  const canGenerate = useCallback(() => {
    if (contentType === 'edn') {
      return !!(selectedItem && selectedRang && selectedStyle && ednLyrics?.paroles_musicales);
    }
    if (contentType === 'ecos') {
      return !!(selectedSituation && selectedStyle);
    }
    return false;
  }, [contentType, selectedItem, selectedRang, selectedStyle, ednLyrics, selectedSituation]);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate()) {
      toast.error('Veuillez sélectionner tous les paramètres requis');
      return;
    }

    // Vérification des quotas selon le type d'utilisateur
    if (!user) {
      if (remainingFree <= 0) {
        toast.error('Plus de générations gratuites disponibles. Connectez-vous pour continuer.', {
          action: {
            label: 'Se connecter',
            onClick: () => navigate('/med-mng/login')
          }
        });
        return;
      }
    } else {
      if (!canGenerateMusic()) {
        toast.error('Quota de génération atteint pour ce mois. Améliorez votre abonnement.', {
          action: {
            label: 'Voir les offres',
            onClick: () => navigate('/med-mng/pricing')
          }
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
      
      console.log('🚀 Génération avec paroles réelles:', {
        contentType,
        selectedItem,
        rang,
        style: selectedStyle,
        lyricsPreview: lyricsToUse[rang === 'A' ? 0 : rang === 'B' ? 1 : 2]?.substring(0, 100) + '...'
      });
      
      const actualRang: 'A' | 'B' = rang === 'AB' ? 'A' : rang as 'A' | 'B';
      const lyricsIndex = rang === 'A' ? 0 : rang === 'B' ? 1 : 2;
      
      const loadingToast = toast.loading('🎵 Génération en cours... Patience, magie en cours !');
      
      const audioUrl = await musicGeneration.generateMusicInLanguage(actualRang, lyricsToUse, selectedStyle, 240);
      
      toast.dismiss(loadingToast);
      
      if (user) {
        const success = await incrementMusicUsage();
        if (!success) {
          toast.warning('Musique générée mais quota non mis à jour');
        }
      }
      
      const song = {
        id: Date.now(),
        title: `${titlePrefix} - ${selectedStyle}`,
        audioUrl: audioUrl, // Peut être un trackId ou une URL HTTP
        style: selectedStyle,
        rang: rang,
        duration: 240,
        itemCode: contentType === 'edn' ? selectedItem : selectedSituation,
        lyrics: lyricsToUse[lyricsIndex]
      };

      setGeneratedSong(song);
      
      // Message selon le type de réponse
      if (audioUrl && audioUrl.startsWith('http')) {
        toast.success('🎵 Musique générée instantanément !', {
          description: 'Cliquez sur Écouter pour profiter de votre chanson'
        });
      } else {
        toast.success('🎵 Génération lancée avec succès !', {
          description: 'Votre musique sera prête dans 1-2 minutes. La barre de progression se met à jour automatiquement.'
        });
      }
      
    } catch (error) {
      console.error('Erreur génération:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error('Échec de la génération musicale', {
        description: errorMessage,
        action: {
          label: 'Réessayer',
          onClick: () => handleGenerate()
        }
      });
    }
  }, [canGenerate, user, remainingFree, canGenerateMusic, contentType, ednLyrics, selectedItem, selectedRang, selectedSituation, selectedStyle, musicGeneration, incrementMusicUsage, navigate]);

  const handleAddToLibrary = useCallback(() => {
    if (!generatedSong) return;
    
    if (!user) {
      toast.error('Connectez-vous pour sauvegarder vos musiques', {
        action: {
          label: 'Se connecter',
          onClick: () => navigate('/med-mng/login')
        }
      });
      return;
    }
    
    if (!canSaveMusic()) {
      toast.error('Votre abonnement ne permet pas de sauvegarder. Améliorez votre plan.', {
        action: {
          label: 'Voir les offres',
          onClick: () => navigate('/med-mng/pricing')
        }
      });
      return;
    }
    
    toast.success('✨ Chanson ajoutée à votre bibliothèque !');
  }, [generatedSong, user, canSaveMusic, navigate]);

  const resetForm = useCallback(() => {
    if (generatedSong || selectedItem || selectedStyle) {
      toast.info('Formulaire réinitialisé');
    }
    setContentType('');
    setSelectedItem('');
    setSelectedRang('');
    setSelectedSituation('');
    setSelectedStyle('');
    setGeneratedSong(null);
  }, [generatedSong, selectedItem, selectedStyle]);

  return (
    <PremiumBackground variant="amber">
      {/* Header premium */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5" role="banner">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-6">
            <PremiumButton
              variant="glass"
              size="md"
              onClick={() => navigate('/')}
              aria-label="Retourner à l'accueil"
            >
              <ArrowLeft className="h-5 w-5 mr-2" aria-hidden="true" />
              <TranslatedText text="Retour" />
            </PremiumButton>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg flex items-center justify-center" aria-hidden="true">
                <Music className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  <TranslatedText text="Générateur Musical" />
                </h1>
                <p className="text-sm md:text-base text-gray-600 font-medium" role="doc-subtitle">
                  <TranslatedText text="Transformez vos cours en musique" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-2 md:px-4 py-6 md:py-12" role="main">
        <div className="max-w-6xl mx-auto">
          
          <QuotaDisplay
            user={user}
            remainingFree={remainingFree}
            maxFreeGenerations={maxFreeGenerations}
            musicQuota={musicQuota}
            getUsageDisplay={getUsageDisplay}
          />

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
          />

          {/* Lecteur de musique générée premium */}
          <GeneratorMusicPlayer
            generatedSong={generatedSong}
            onAddToLibrary={handleAddToLibrary}
          />

          {/* Informations d'aide premium */}
          <PremiumCard variant="glass" className="p-8" role="region" aria-labelledby="help-heading">
            <h3 id="help-heading" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center" aria-hidden="true">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <TranslatedText text="Comment utiliser le générateur ?" />
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-gray-700">
              <div className="space-y-4">
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</span>
                  <TranslatedText text="Choisissez le type de contenu (EDN ou ECOS)" />
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</span>
                  <TranslatedText text="Pour EDN : sélectionnez parmi les 367 items disponibles avec compétences OIC complètes" />
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</span>
                  <TranslatedText text="Pour ECOS : choisissez une des 3 situations de départ" />
                </p>
              </div>
              <div className="space-y-4">
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</span>
                  <TranslatedText text="Sélectionnez le rang A (fondamental), B (approfondi) ou A+B (complet) pour EDN" />
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">5</span>
                  <TranslatedText text="Choisissez votre style musical préféré" />
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">6</span>
                  <TranslatedText text="Les paroles de l'item seront automatiquement intégrées !" />
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>
      </main>
    </PremiumBackground>
  );
};

export default Generator;
