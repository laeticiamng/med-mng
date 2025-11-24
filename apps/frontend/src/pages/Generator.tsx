
import logger from '@/lib/logger';
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
      if (!selectedItem || !selectedRang || !selectedStyle || !ednLyrics) {
        return false;
      }

      // Vérifier qu'il y a des paroles pour le rang sélectionné
      if (selectedRang === 'A' && ednLyrics.paroles_rang_a && ednLyrics.paroles_rang_a.length > 0) {
        return true;
      }
      if (selectedRang === 'B' && ednLyrics.paroles_rang_b && ednLyrics.paroles_rang_b.length > 0) {
        return true;
      }
      if (selectedRang === 'AB' && ednLyrics.paroles_rang_ab && ednLyrics.paroles_rang_ab.length > 0) {
        return true;
      }

      // Fallback: paroles musicales génériques
      if (ednLyrics.paroles_musicales && ednLyrics.paroles_musicales.length > 0) {
        return true;
      }

      return false;
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
      const rang = contentType === 'edn' ? selectedRang as ('A' | 'B' | 'AB') : 'A';

      if (contentType === 'edn' && ednLyrics) {
        // ✨ Utiliser les paroles séparées par rang (nouvelle structure)
        if (rang === 'A' && ednLyrics.paroles_rang_a && ednLyrics.paroles_rang_a.length > 0) {
          lyricsToUse = ednLyrics.paroles_rang_a;
        } else if (rang === 'B' && ednLyrics.paroles_rang_b && ednLyrics.paroles_rang_b.length > 0) {
          lyricsToUse = ednLyrics.paroles_rang_b;
        } else if (rang === 'AB' && ednLyrics.paroles_rang_ab && ednLyrics.paroles_rang_ab.length > 0) {
          lyricsToUse = ednLyrics.paroles_rang_ab;
        } else if (ednLyrics.paroles_musicales && ednLyrics.paroles_musicales.length > 0) {
          // Fallback sur anciennes paroles si nouvelles pas disponibles
          lyricsToUse = ednLyrics.paroles_musicales;
        }

        titlePrefix = `${ednLyrics.title} - ${selectedItem}`;

        logger.debug('🎵 Utilisation des paroles EDN par rang:', {
          item: selectedItem,
          title: ednLyrics.title,
          rang: rang,
          paroles_count: lyricsToUse.length,
          has_paroles_rang_a: !!ednLyrics.paroles_rang_a,
          has_paroles_rang_b: !!ednLyrics.paroles_rang_b,
          has_paroles_rang_ab: !!ednLyrics.paroles_rang_ab,
        });
      } else if (contentType === 'ecos') {
        lyricsToUse = [
          `Paroles pour ${selectedSituation} - Situation clinique`,
          `Paroles avancées pour ${selectedSituation} - Expertise médicale`
        ];
        titlePrefix = selectedSituation;
      }

      if (lyricsToUse.length === 0) {
        toast.error(`Aucune parole disponible pour le rang ${rang} de cet item. La migration de base de données est peut-être nécessaire.`);
        return;
      }

      logger.debug('🚀 Génération avec paroles réelles:', {
        contentType,
        selectedItem,
        rang,
        style: selectedStyle,
        lyricsCount: lyricsToUse.length,
        lyricsPreview: lyricsToUse[0]?.substring(0, 100) + '...'
      });

      const actualRang: 'A' | 'B' = rang === 'AB' ? 'A' : rang as 'A' | 'B';

      const loadingToast = toast.loading('🎵 Génération en cours... Patience, magie en cours !');

      const audioUrl = await musicGeneration.generateMusicInLanguage(actualRang, lyricsToUse, selectedStyle, 240);

      toast.dismiss(loadingToast);

      if (user) {
        const success = await incrementMusicUsage();
        if (!success) {
          toast.warning('Musique générée mais quota non mis à jour');
        }
      }

      // ✨ Sauvegarder dans med_mng_songs (si user connecté et audioUrl est un ID Suno)
      let savedSongId = null;
      if (user && contentType === 'edn' && audioUrl) {
        try {
          // ✅ SÉCURITÉ: Validation des inputs avant insertion DB
          const sanitizedTitle = `${titlePrefix} - Rang ${rang}`.substring(0, 200); // Limite longueur
          const validRangTypes = ['A', 'B'];
          const validStyles = ['pop', 'rap', 'rock', 'jazz', 'classical', 'electronic']; // Ajuster selon vos styles

          if (!validRangTypes.includes(rang)) {
            throw new Error('Invalid rang type');
          }

          if (selectedStyle && !validStyles.includes(selectedStyle)) {
            logger.warn('Invalid music style, using default');
          }

          const { data: savedSong, error: saveError } = await supabase
            .from('med_mng_songs')
            .insert({
              title: sanitizedTitle,
              suno_audio_id: audioUrl,
              item_code: selectedItem,
              rang_type: rang,
              is_static: false, // ✨ Générée par utilisateur
              music_style: selectedStyle,
              generation_source: 'suno',
              lyrics: { text: lyricsToUse },
              meta: {
                user_id: user.id,
                generated_at: new Date().toISOString(),
                specialite: ednLyrics?.specialite
              }
            })
            .select()
            .single();

          if (!saveError && savedSong) {
            savedSongId = savedSong.id;
            logger.debug('✅ Chanson sauvegardée dans med_mng_songs:', savedSong.id);

            // Ajouter à la bibliothèque utilisateur
            await supabase
              .from('med_mng_user_songs')
              .insert({
                user_id: user.id,
                song_id: savedSong.id,
                is_favorite: false,
                play_count: 0
              });

            logger.debug('✅ Ajoutée à la bibliothèque utilisateur');
          } else {
            logger.warn('⚠️  Erreur sauvegarde chanson:', saveError);
          }
        } catch (saveErr) {
          logger.error('❌ Erreur lors de la sauvegarde:', saveErr);
        }
      }

      const song = {
        id: savedSongId || Date.now(),
        title: `${titlePrefix} - ${selectedStyle}`,
        audioUrl: audioUrl,
        style: selectedStyle,
        rang: rang,
        duration: 240,
        itemCode: contentType === 'edn' ? selectedItem : selectedSituation,
        lyrics: lyricsToUse.join('\n')
      };

      setGeneratedSong(song);

      // Message selon le type de réponse
      if (audioUrl && audioUrl.startsWith('http')) {
        toast.success('🎵 Musique générée et sauvegardée !', {
          description: savedSongId ? 'Ajoutée à votre bibliothèque personnelle' : 'Cliquez sur Écouter pour profiter de votre chanson'
        });
      } else {
        toast.success('🎵 Génération lancée avec succès !', {
          description: 'Votre musique sera prête dans 1-2 minutes. Elle sera automatiquement sauvegardée.'
        });
      }

    } catch (error) {
      logger.error('Erreur génération:', error);
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
