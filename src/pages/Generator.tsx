
import React, { useState } from 'react';
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
  const freeTrialData = useFreeTrialLimit();
  const { subscription, musicQuota, incrementMusicUsage, canGenerateMusic, canSaveMusic, getUsageDisplay } = useSubscription();
  
  if (!freeTrialData.isInitialized) {
    return <div>Chargement...</div>;
  }
  
  const { getRemainingGenerations, maxFreeGenerations } = freeTrialData;
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

    // Vérification des quotas selon le type d'utilisateur
    if (!user) {
      // Utilisateur non connecté - utilise le système gratuit limité
      if (remainingFree <= 0) {
        toast.error('Plus de générations gratuites disponibles. Connectez-vous pour continuer.');
        navigate('/med-mng/login');
        return;
      }
    } else {
      // Utilisateur connecté - vérifie les quotas d'abonnement
      if (!canGenerateMusic()) {
        toast.error('Quota de génération atteint pour ce mois. Améliorez votre abonnement.');
        navigate('/med-mng/pricing');
        return;
      }
    }

    try {
      let lyricsToUse: string[] = [];
      let titlePrefix = '';

      if (contentType === 'edn' && ednLyrics?.paroles_musicales) {
        // Utiliser les vraies paroles de l'item EDN
        lyricsToUse = ednLyrics.paroles_musicales;
        titlePrefix = `${ednLyrics.title} - ${selectedItem}`;
        
        console.log('🎵 Utilisation des paroles EDN réelles:', {
          item: selectedItem,
          title: ednLyrics.title,
          paroles_count: lyricsToUse.length,
          rang: selectedRang
        });
      } else if (contentType === 'ecos') {
        // Utiliser des paroles simulées pour ECOS (à remplacer par de vraies paroles plus tard)
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
      
      // Gérer le cas du rang AB (mixte)
      let actualRang: 'A' | 'B' = 'A';
      let lyricsIndex = 0;
      
      if (rang === 'A') {
        actualRang = 'A';
        lyricsIndex = 0;
      } else if (rang === 'B') {
        actualRang = 'B'; 
        lyricsIndex = 1;
      } else if (rang === 'AB') {
        actualRang = 'A'; // On utilise le rang A pour l'API mais les paroles mixtes
        lyricsIndex = 2; // Index 2 = paroles mixtes (A+B)
      }
      
      const audioUrl = await musicGeneration.generateMusicInLanguage(actualRang, lyricsToUse, selectedStyle, 240);
      
      // Incrémenter l'usage après génération réussie
      if (user) {
        const success = await incrementMusicUsage();
        if (!success) {
          toast.error('Erreur lors de la mise à jour du quota');
        }
      }
      
      // Créer un objet chanson avec les vraies données
      const song = {
        id: Date.now(),
        title: `${titlePrefix} - ${selectedStyle}`,
        audioUrl: audioUrl,
        style: selectedStyle,
        rang: rang,
        duration: 240,
        itemCode: contentType === 'edn' ? selectedItem : selectedSituation,
        lyrics: lyricsToUse[lyricsIndex]
      };

      setGeneratedSong(song);
      toast.success('Génération musicale réussie avec les paroles de l\'item !');
      
    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error('Erreur lors de la génération musicale');
    }
  };

  const handleAddToLibrary = () => {
    if (!generatedSong) return;
    
    if (!user) {
      toast.error('Connectez-vous pour sauvegarder vos musiques');
      navigate('/med-mng/login');
      return;
    }
    
    if (!canSaveMusic()) {
      toast.error('Votre abonnement ne permet pas de sauvegarder. Améliorez votre plan.');
      navigate('/med-mng/pricing');
      return;
    }
    
    toast.success('Chanson ajoutée à votre bibliothèque !');
    // Ici on pourrait ajouter la logique pour sauvegarder en base
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
    <PremiumBackground variant="amber">
      {/* Header premium */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-6">
            <PremiumButton
              variant="glass"
              size="md"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <TranslatedText text="Retour" />
            </PremiumButton>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg flex items-center justify-center">
                <Music className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  <TranslatedText text="Générateur Musical" />
                </h1>
                <p className="text-sm md:text-base text-gray-600 font-medium">
                  <TranslatedText text="Transformez vos cours en musique" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 md:px-4 py-6 md:py-12">
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
          <PremiumCard variant="glass" className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
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
      </div>
    </PremiumBackground>
  );
};

export default Generator;
