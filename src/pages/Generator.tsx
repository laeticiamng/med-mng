import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Sparkles, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
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
import { useAuth } from '@/components/med-mng/AuthProvider';
import { QuotaDisplay } from '@/components/generator/QuotaDisplay';
import { GeneratorForm } from '@/components/generator/GeneratorForm';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

interface EdnItem {
  item_code: string;
  title: string;
  subtitle?: string;
}

const Generator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getRemainingGenerations, maxFreeGenerations } = useFreeTrialLimit();
  const { subscription, musicQuota, incrementMusicUsage, canGenerateMusic, canSaveMusic, getUsageDisplay } = useSubscription();
  const musicGeneration = useMusicGenerationWithTranslation();
  const { logActivity } = useActivityTracking();
  const { addPoints, unlockBadge, loadStats } = useGamification();
  
  const [contentType, setContentType] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedRang, setSelectedRang] = useState('');
  const [selectedSituation, setSelectedSituation] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [generatedSong, setGeneratedSong] = useState(null);
  
  // Chargement direct des items EDN
  const [allEdnItems, setAllEdnItems] = useState<EdnItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);

  // Chargement des items
  useEffect(() => {
    console.log('⚡ USEEFFECT TRIGGERED');
    
    supabase
      .from('edn_items_immersive')
      .select('item_code, title, subtitle')
      .order('item_code')
      .then(({ data, error }) => {
        console.log('✅ SUPABASE RESPONSE:', { count: data?.length, error: error?.message });
        if (error) {
          setItemsError(error.message);
        } else {
          setAllEdnItems(data || []);
        }
        setItemsLoading(false);
      });
  }, []);

  // Debug
  console.log('RENDER:', { itemsLoading, itemsCount: allEdnItems.length });
  
  const { lyrics: ednLyrics, loading: lyricsLoading, error: lyricsError } = useEdnItemLyrics(
    contentType === 'edn' ? selectedItem : null
  );
  
  const remainingFree = getRemainingGenerations();
  const isGenerating = musicGeneration.isGenerating?.rangA || musicGeneration.isGenerating?.rangB;

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

      if (contentType === 'edn' && ednLyrics?.paroles_musicales) {
        lyricsToUse = ednLyrics.paroles_musicales;
        titlePrefix = `${ednLyrics.title} - ${selectedItem}`;
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
      const actualRang: 'A' | 'B' = rang === 'AB' ? 'A' : rang as 'A' | 'B';
      const lyricsIndex = rang === 'A' ? 0 : rang === 'B' ? 1 : 2;
      
      const loadingToast = toast.loading('🎵 Génération en cours... Patience, magie en cours !');
      const audioUrl = await musicGeneration.generateMusicInLanguage(actualRang, lyricsToUse, selectedStyle, 240);
      toast.dismiss(loadingToast);
      
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
      toast.error('Échec de la génération musicale');
    }
  }, [canGenerate, user, remainingFree, canGenerateMusic, contentType, ednLyrics, selectedItem, selectedRang, selectedSituation, selectedStyle, musicGeneration, incrementMusicUsage, navigate, logActivity, addPoints, loadStats]);

  const handleAddToLibrary = useCallback(() => {
    if (!generatedSong) return;
    if (!user) {
      toast.error('Connectez-vous pour sauvegarder vos musiques');
      return;
    }
    if (!canSaveMusic()) {
      toast.error('Votre abonnement ne permet pas de sauvegarder.');
      return;
    }
    toast.success('✨ Chanson ajoutée à votre bibliothèque !');
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-6">
            <PremiumButton variant="glass" size="md" onClick={() => navigate(ROUTE_PATHS.home)} aria-label="Retourner à l'accueil">
              <ArrowLeft className="h-5 w-5 mr-2" aria-hidden="true" />
              <TranslatedText text="Retour" />
            </PremiumButton>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-warning to-warning/80 rounded-xl shadow-lg flex items-center justify-center" aria-hidden="true">
                <Music className="h-7 w-7 text-warning-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  <TranslatedText text="Générateur Musical" />
                </h1>
                <p className="text-sm md:text-base text-muted-foreground font-medium" role="doc-subtitle">
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

          <GeneratorMusicPlayer generatedSong={generatedSong} onAddToLibrary={handleAddToLibrary} />

          <PremiumCard variant="glass" className="p-8" role="region" aria-labelledby="help-heading">
            <h3 id="help-heading" className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center" aria-hidden="true">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <TranslatedText text="Comment utiliser le générateur ?" />
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
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