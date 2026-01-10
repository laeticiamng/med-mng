import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Sparkles, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { supabase } from '@/integrations/supabase/client';
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
import { useEcosLyrics } from '@/hooks/useEcosLyrics';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { QuotaDisplay } from '@/components/generator/QuotaDisplay';
import { GeneratorForm } from '@/components/generator/GeneratorForm';
import { GenerationHistory } from '@/components/generator/GenerationHistory';
import { GenerationProgress } from '@/components/generator/GenerationProgress';
import { GeneratorStatusBar } from '@/components/generator/GeneratorStatusBar';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { useAllEdnItems } from '@/hooks/useAllEdnItems';
import { useGeneratorPreferences } from '@/hooks/useGeneratorPreferences';
import { useRealtimeGeneration } from '@/hooks/useRealtimeGeneration';

const Generator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getRemainingGenerations, maxFreeGenerations } = useFreeTrialLimit();
  const { subscription, musicQuota, incrementMusicUsage, canGenerateMusic, canSaveMusic, getUsageDisplay } = useSubscription();
  const musicGeneration = useMusicGenerationWithTranslation();
  const { logActivity } = useActivityTracking();
  const { addPoints, unlockBadge, loadStats } = useGamification();
  const { preferences, savePreferences } = useGeneratorPreferences();
  
  // État avec restauration des préférences
  const [contentType, setContentType] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedRang, setSelectedRang] = useState('');
  const [selectedSituation, setSelectedSituation] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [generatedSong, setGeneratedSong] = useState(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  
  // Hook temps réel pour les mises à jour automatiques
  const { isConnected: realtimeConnected } = useRealtimeGeneration({
    userId: user?.id,
    onGenerationComplete: (track) => {
      // Notification navigateur quand génération terminée
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎵 Musique prête !', {
          body: `Votre musique "${track.title || 'Génération'}" est disponible`,
          icon: '/favicon.ico'
        });
      }
      toast.success('🎵 Nouvelle musique disponible !');
    },
    enabled: !!user
  });
  
  // Restaurer les préférences au montage
  useEffect(() => {
    if (preferences) {
      if (preferences.contentType) setContentType(preferences.contentType);
      if (preferences.selectedItem) setSelectedItem(preferences.selectedItem);
      if (preferences.selectedRang) setSelectedRang(preferences.selectedRang);
      if (preferences.selectedStyle) setSelectedStyle(preferences.selectedStyle);
    }
  }, [preferences]);
  
  // Sauvegarder les préférences quand elles changent
  useEffect(() => {
    if (contentType || selectedItem || selectedRang || selectedStyle) {
      savePreferences({
        contentType,
        selectedItem,
        selectedRang,
        selectedStyle,
      });
    }
  }, [contentType, selectedItem, selectedRang, selectedStyle, savePreferences]);
  
  // Demander permission notifications au montage
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Utiliser le hook centralisé pour charger les items EDN
  const { items: allEdnItems, loading: itemsLoading, error: itemsError } = useAllEdnItems();
  
  const { lyrics: ednLyrics, loading: lyricsLoading, error: lyricsError } = useEdnItemLyrics(
    contentType === 'edn' ? selectedItem : null
  );
  
  // Hook pour les paroles ECOS
  const { lyrics: ecosLyrics, loading: ecosLyricsLoading, error: ecosLyricsError } = useEcosLyrics(
    contentType === 'ecos' ? selectedSituation : null
  );
  
  const remainingFree = getRemainingGenerations();
  const isGenerating = musicGeneration.isGenerating?.rangA || musicGeneration.isGenerating?.rangB || musicGeneration.isGenerating?.rangAB;
  const pollingProgress = musicGeneration.pollingProgress || 0;

  const canGenerate = useCallback(() => {
    if (contentType === 'edn') {
      // Vérifier les paroles par rang ou le legacy paroles_musicales
      const hasLyricsA = ednLyrics?.paroles_rang_a && ednLyrics.paroles_rang_a.length > 0;
      const hasLyricsB = ednLyrics?.paroles_rang_b && ednLyrics.paroles_rang_b.length > 0;
      const hasLyricsAB = ednLyrics?.paroles_rang_ab && ednLyrics.paroles_rang_ab.length > 0;
      const hasLegacy = ednLyrics?.paroles_musicales && ednLyrics.paroles_musicales.length > 0;
      
      const hasLyrics = ednLyrics && (
        (selectedRang === 'A' && (hasLyricsA || hasLegacy)) ||
        (selectedRang === 'B' && (hasLyricsB || hasLegacy)) ||
        (selectedRang === 'AB' && (hasLyricsAB || hasLegacy)) ||
        hasLegacy
      );
      
      return !!(selectedItem && selectedRang && selectedStyle && hasLyrics);
    }
    if (contentType === 'ecos') {
      // Vérifier que les paroles ECOS sont disponibles
      const hasEcosLyrics = ecosLyrics?.paroles && ecosLyrics.paroles.length > 0;
      return !!(selectedSituation && selectedStyle && hasEcosLyrics);
    }
    return false;
  }, [contentType, selectedItem, selectedRang, selectedStyle, ednLyrics, selectedSituation, ecosLyrics]);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate()) {
      toast.error('Veuillez sélectionner tous les paramètres requis');
      return;
    }

    if (!user) {
      if (remainingFree <= 0) {
        toast.error('Plus de générations gratuites disponibles. Connectez-vous pour continuer.', {
          action: { label: 'Se connecter', onClick: () => navigate(ROUTE_PATHS.medMngLogin) }
        });
        return;
      }
    } else {
      if (!canGenerateMusic()) {
        toast.error('Quota de génération atteint pour ce mois. Améliorez votre abonnement.', {
          action: { label: 'Voir les offres', onClick: () => navigate(ROUTE_PATHS.medMngPricing) }
        });
        return;
      }
    }

    try {
      let lyricsToUse: string[] = [];
      let titlePrefix = '';

      if (contentType === 'edn' && ednLyrics) {
        // Utiliser les paroles par rang en priorité
        if (selectedRang === 'A' && ednLyrics.paroles_rang_a && ednLyrics.paroles_rang_a.length > 0) {
          lyricsToUse = ednLyrics.paroles_rang_a;
        } else if (selectedRang === 'B' && ednLyrics.paroles_rang_b && ednLyrics.paroles_rang_b.length > 0) {
          lyricsToUse = ednLyrics.paroles_rang_b;
        } else if (selectedRang === 'AB' && ednLyrics.paroles_rang_ab && ednLyrics.paroles_rang_ab.length > 0) {
          lyricsToUse = ednLyrics.paroles_rang_ab;
        } else if (ednLyrics.paroles_musicales && ednLyrics.paroles_musicales.length > 0) {
          // Fallback vers legacy paroles_musicales
          lyricsToUse = ednLyrics.paroles_musicales;
        }
        titlePrefix = `${ednLyrics.title} - ${selectedItem}`;
      } else if (contentType === 'ecos' && ecosLyrics) {
        // Utiliser les paroles générées à partir du scénario ECOS
        lyricsToUse = ecosLyrics.paroles;
        titlePrefix = `${ecosLyrics.scenario.scenario_code} - ${ecosLyrics.scenario.title}`;
      }

      if (lyricsToUse.length === 0) {
        toast.error('Aucune parole disponible pour cet item');
        return;
      }

      const rang = contentType === 'edn' ? selectedRang as ('A' | 'B' | 'AB') : 'A';
      const lyricsIndex = rang === 'A' ? 0 : rang === 'B' ? 1 : 2;
      
      // Marquer le début de la génération
      setGenerationStartTime(Date.now());
      
      const loadingToast = toast.loading('🎵 Génération en cours... Patience, magie en cours !');
      const audioUrl = await musicGeneration.generateMusicInLanguage(rang, lyricsToUse, selectedStyle, 240);
      toast.dismiss(loadingToast);
      
      // Réinitialiser le temps de génération
      setGenerationStartTime(null);
      
      if (user) {
        await incrementMusicUsage();
      }
      
      const song = {
        id: Date.now(),
        title: `${titlePrefix} - ${selectedStyle}`,
        audioUrl,
        style: selectedStyle,
        rang,
        duration: 240,
        itemCode: contentType === 'edn' ? selectedItem : selectedSituation,
        lyrics: lyricsToUse[lyricsIndex]
      };

      setGeneratedSong(song);
      toast.success('🎵 Musique générée avec succès !');

      // Track activity and award points
      if (user) {
        await logActivity({
          activity_type: 'music_generation',
          count: 1,
          metadata: { 
            itemCode: contentType === 'edn' ? selectedItem : selectedSituation,
            style: selectedStyle,
            rang
          }
        });
        
        await addPoints(user.id, 'itemReviewed');
        loadStats(user.id);
      }
      
    } catch (error) {
      console.error('Erreur génération:', error);
      setGenerationStartTime(null);
      toast.error('Échec de la génération musicale. Veuillez réessayer.');
    }
  }, [canGenerate, user, remainingFree, canGenerateMusic, contentType, ednLyrics, ecosLyrics, selectedItem, selectedRang, selectedSituation, selectedStyle, musicGeneration, incrementMusicUsage, navigate, logActivity, addPoints, loadStats]);

  const handleAddToLibrary = useCallback(async () => {
    if (!generatedSong) return;
    if (!user) {
      toast.error('Connectez-vous pour sauvegarder vos musiques');
      return;
    }
    if (!canSaveMusic()) {
      toast.error('Votre abonnement ne permet pas de sauvegarder.');
      return;
    }

    try {
      const musicId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase
        .from('user_generated_music')
        .insert({
          user_id: user.id,
          title: generatedSong.title,
          audio_url: generatedSong.audioUrl,
          music_style: generatedSong.style,
          rang: generatedSong.rang,
          item_code: generatedSong.itemCode,
          music_id: musicId,
          is_favorite: false
        } as any);

      if (error) throw error;
      toast.success('✨ Chanson ajoutée à votre bibliothèque !');
    } catch (err) {
      console.error('Erreur sauvegarde bibliothèque:', err);
      toast.error('Erreur lors de la sauvegarde');
    }
  }, [generatedSong, user, canSaveMusic]);

  const resetForm = useCallback(() => {
    setContentType('');
    setSelectedItem('');
    setSelectedRang('');
    setSelectedSituation('');
    setSelectedStyle('');
    setGeneratedSong(null);
  }, []);

  return (
    <PremiumBackground variant="amber">
      {/* Header premium */}
      <div className="bg-card/70 backdrop-blur-xl border-b border-border shadow-lg" role="banner">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            <PremiumButton variant="glass" size="md" onClick={() => navigate(ROUTE_PATHS.home)} aria-label="Retourner à l'accueil" className="shrink-0">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" aria-hidden="true" />
              <TranslatedText text="Retour" />
            </PremiumButton>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-warning to-warning/80 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center shrink-0" aria-hidden="true">
                <Music className="h-5 w-5 sm:h-7 sm:w-7 text-warning-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
                  <TranslatedText text="Générateur Musical" />
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium truncate" role="doc-subtitle">
                  <TranslatedText text="Transformez vos cours en musique" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-2 md:px-4 py-6 md:py-12" role="main">
        <div className="max-w-6xl mx-auto">
          {/* Barre de statut globale (réseau, temps réel, crédits) */}
          <GeneratorStatusBar 
            isConnected={realtimeConnected}
            musicQuota={musicQuota}
            className="mb-4"
          />

          <QuotaDisplay
            user={user}
            remainingFree={remainingFree}
            maxFreeGenerations={maxFreeGenerations}
            musicQuota={musicQuota}
            getUsageDisplay={getUsageDisplay}
            onRefresh={async () => {
              // Force refresh du quota en réinitialisant le state
              if (user) {
                await loadStats(user.id);
              }
            }}
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
            ecosLyrics={ecosLyrics}
            ecosLyricsLoading={ecosLyricsLoading}
            ecosLyricsError={ecosLyricsError}
            canGenerate={canGenerate}
            handleGenerate={handleGenerate}
            resetForm={resetForm}
            isGenerating={isGenerating}
            user={user}
            remainingFree={remainingFree}
            canGenerateMusic={canGenerateMusic}
          />

          {/* Barre de progression pendant la génération */}
          <GenerationProgress 
            progress={pollingProgress} 
            isGenerating={!!isGenerating}
            message="Votre musique est en cours de création"
            onCancel={() => {
              // Déterminer quel rang est en cours de génération
              const activeRang = musicGeneration.isGenerating?.rangA ? 'A' 
                : musicGeneration.isGenerating?.rangB ? 'B' 
                : musicGeneration.isGenerating?.rangAB ? 'AB' 
                : undefined;
              musicGeneration.cancelGeneration(activeRang);
              setGenerationStartTime(null);
            }}
            startTime={generationStartTime || undefined}
          />

          <GeneratorMusicPlayer 
            generatedSong={generatedSong} 
            onAddToLibrary={handleAddToLibrary}
            onRetry={handleGenerate}
          />

          {/* Historique des générations */}
          <div className="my-8">
            <GenerationHistory />
          </div>

          <PremiumCard variant="glass" className="p-4 sm:p-6 md:p-8" role="region" aria-labelledby="help-heading">
            <h3 id="help-heading" className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-lg sm:rounded-xl flex items-center justify-center shrink-0" aria-hidden="true">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <span className="break-word"><TranslatedText text="Comment utiliser le générateur ?" /></span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 text-muted-foreground text-sm sm:text-base">
              <div className="space-y-4">
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</span>
                  <TranslatedText text="Choisissez le type de contenu (EDN ou ECOS)" />
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-success text-success-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</span>
                  <TranslatedText text="Pour EDN : sélectionnez parmi les 367 items disponibles" />
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</span>
                  <TranslatedText text="Pour ECOS : choisissez une des 3 situations de départ" />
                </p>
              </div>
              <div className="space-y-4">
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-warning text-warning-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</span>
                  <TranslatedText text="Sélectionnez le rang A, B ou A+B pour EDN" />
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">5</span>
                  <TranslatedText text="Choisissez votre style musical préféré" />
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">6</span>
                  <TranslatedText text="Les paroles seront automatiquement intégrées !" />
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