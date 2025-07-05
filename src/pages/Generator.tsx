
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TranslatedText } from '@/components/TranslatedText';
import { GeneratorMusicPlayer } from '@/components/GeneratorMusicPlayer';
import { Music, Wand2, BookOpen, Users, ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFreeTrialLimit } from '@/hooks/useFreeTrialLimit';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useEdnItemLyrics } from '@/hooks/useEdnItemLyrics';
import { useAllEdnItems } from '@/hooks/useAllEdnItems';
import { toast } from 'sonner';
import { PremiumBackground } from '@/components/ui/premium-background';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';

import { musicStyles, getStylesByGenre } from '@/components/edn/music/MusicStylesData';

const Generator = () => {
  const navigate = useNavigate();
  const { getRemainingGenerations, maxFreeGenerations } = useFreeTrialLimit();
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

  // Situations ECOS disponibles
  const ecosSituations = [
    { code: 'S1', title: 'Situation de départ 1 - Consultation' },
    { code: 'S2', title: 'Situation de départ 2 - Urgence' },
    { code: 'S3', title: 'Situation de départ 3 - Prévention' },
  ];

  // Grouper les styles par genre pour un affichage organisé
  const stylesByGenre = getStylesByGenre();

  const canGenerate = () => {
    if (contentType === 'edn') {
      return selectedItem && selectedRang && selectedStyle && ednLyrics?.paroles_musicales;
    }
    if (contentType === 'ecos') {
      return selectedSituation && selectedStyle;
    }
    return false;
  };

  const handleGenerate = async () => {
    if (!canGenerate()) {
      toast.error('Veuillez sélectionner tous les paramètres requis');
      return;
    }

    if (remainingFree <= 0) {
      toast.error('Plus de générations gratuites disponibles');
      navigate('/med-mng/pricing');
      return;
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
    if (generatedSong) {
      toast.success('Chanson ajoutée à votre bibliothèque !');
      // Ici on pourrait ajouter la logique pour sauvegarder en base
    }
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
          
          {/* Badge générations restantes premium */}
          {remainingFree > 0 && (
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 px-8 py-4 rounded-2xl border border-green-200/50 shadow-lg shadow-green-500/10">
                <Music className="h-6 w-6 text-green-700" />
                <span className="text-green-800 font-bold text-lg">
                  <TranslatedText text={`${remainingFree}/${maxFreeGenerations} générations gratuites restantes`} />
                </span>
              </div>
            </div>
          )}

          {/* Formulaire de génération premium */}
          <PremiumCard variant="glass" className="mb-12 p-8">
            <div className="flex items-center gap-4 mb-8">
              <Wand2 className="h-8 w-8 text-amber-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  <TranslatedText text="Configuration de génération" />
                </h2>
                <p className="text-gray-600">
                  <TranslatedText text="Sélectionnez le type de contenu, l'item et le style musical" />
                </p>
              </div>
            </div>
            
            <div className="space-y-8">
              
              {/* Sélection du type de contenu premium */}
              <div className="space-y-4">
                <label className="text-lg font-semibold text-gray-900">
                  <TranslatedText text="Type de contenu" />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <PremiumCard 
                    variant={contentType === 'edn' ? 'elevated' : 'default'}
                    className={`cursor-pointer transition-all p-4 md:p-6 text-center hover-scale ${contentType === 'edn' ? 'ring-2 ring-amber-500 shadow-amber-500/20' : 'hover:shadow-lg'}`}
                    onClick={() => {
                      setContentType('edn');
                      setSelectedSituation('');
                    }}
                  >
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">EDN</h3>
                    <p className="text-gray-700 mb-3">Items à Choix Multiples</p>
                    <p className="text-sm text-green-600 font-semibold">
                      {itemsLoading ? 'Chargement...' : `${allEdnItems.length} items disponibles`}
                    </p>
                  </PremiumCard>
                    <PremiumCard 
                    variant={contentType === 'ecos' ? 'elevated' : 'default'}
                    className={`cursor-pointer transition-all p-4 md:p-6 text-center hover-scale ${contentType === 'ecos' ? 'ring-2 ring-amber-500 shadow-amber-500/20' : 'hover:shadow-lg'}`}
                    onClick={() => {
                      setContentType('ecos');
                      setSelectedItem('');
                      setSelectedRang('');
                    }}
                  >
                    <Users className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ECOS</h3>
                    <p className="text-gray-700 mb-3">Situations de départ</p>
                    <p className="text-sm text-blue-600 font-semibold">3 situations disponibles</p>
                  </PremiumCard>
                </div>
              </div>

              {/* Sélection EDN premium */}
              {contentType === 'edn' && (
                <>
                  <div className="space-y-4">
                    <label className="text-lg font-semibold text-gray-900">
                      <TranslatedText text="Item EDN" />
                    </label>
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                      <SelectTrigger className="h-14 text-base bg-white/50 backdrop-blur-sm border-white/30 shadow-lg">
                        <SelectValue placeholder="Sélectionnez un item EDN" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl max-h-80 overflow-y-auto">
                        {itemsLoading ? (
                          <SelectItem value="" disabled>Chargement des items...</SelectItem>
                        ) : itemsError ? (
                          <SelectItem value="" disabled>Erreur: {itemsError}</SelectItem>
                        ) : (
                          allEdnItems.map((item) => (
                            <SelectItem key={item.item_code} value={item.item_code} className="text-base py-3">
                              {item.item_code} - {item.title.length > 50 ? item.title.substring(0, 50) + '...' : item.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Affichage du statut des paroles */}
                  {selectedItem && (
                    <div className="space-y-4">
                      <label className="text-lg font-semibold text-gray-900">
                        <TranslatedText text="Paroles de l'item" />
                      </label>
                      {lyricsLoading && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 text-blue-800">
                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            <span>Chargement des paroles...</span>
                          </div>
                        </div>
                      )}
                      {lyricsError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-800">
                            <AlertTriangle className="h-5 w-5" />
                            <span>Erreur: {lyricsError}</span>
                          </div>
                        </div>
                      )}
                      {ednLyrics && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800 mb-2">
                            <Music className="h-5 w-5" />
                            <span className="font-semibold">Paroles trouvées pour {ednLyrics.title}</span>
                          </div>
                          <p className="text-green-700">
                            {ednLyrics.paroles_musicales?.length || 0} versions de paroles disponibles 
                            (Rang A et B)
                          </p>
                          {ednLyrics.paroles_musicales && ednLyrics.paroles_musicales.length > 0 && (
                            <div className="mt-2 text-sm text-green-600">
                              Aperçu: {ednLyrics.paroles_musicales[0]?.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="text-lg font-semibold text-gray-900">
                      <TranslatedText text="Rang" />
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      <PremiumCard 
                        variant={selectedRang === 'A' ? 'elevated' : 'default'}
                        className={`cursor-pointer transition-all p-4 text-center hover-scale ${selectedRang === 'A' ? 'ring-2 ring-blue-500 shadow-blue-500/20' : 'hover:shadow-lg'}`}
                        onClick={() => setSelectedRang('A')}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Rang A</h3>
                        <p className="text-gray-600 text-sm">Compétences fondamentales</p>
                      </PremiumCard>
                      <PremiumCard 
                        variant={selectedRang === 'B' ? 'elevated' : 'default'}
                        className={`cursor-pointer transition-all p-4 text-center hover-scale ${selectedRang === 'B' ? 'ring-2 ring-purple-500 shadow-purple-500/20' : 'hover:shadow-lg'}`}
                        onClick={() => setSelectedRang('B')}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Rang B</h3>
                        <p className="text-gray-600 text-sm">Compétences approfondies</p>
                      </PremiumCard>
                      <PremiumCard 
                        variant={selectedRang === 'AB' ? 'elevated' : 'default'}
                        className={`cursor-pointer transition-all p-4 text-center hover-scale ${selectedRang === 'AB' ? 'ring-2 ring-amber-500 shadow-amber-500/20' : 'hover:shadow-lg'}`}
                        onClick={() => setSelectedRang('AB')}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Rang A+B</h3>
                        <p className="text-gray-600 text-sm">Compétences complètes</p>
                      </PremiumCard>
                    </div>
                  </div>
                </>
              )}

              {/* Sélection ECOS premium */}
              {contentType === 'ecos' && (
                <div className="space-y-4">
                  <label className="text-lg font-semibold text-gray-900">
                    <TranslatedText text="Situation ECOS" />
                  </label>
                  <Select value={selectedSituation} onValueChange={setSelectedSituation}>
                    <SelectTrigger className="h-14 text-base bg-white/50 backdrop-blur-sm border-white/30 shadow-lg">
                      <SelectValue placeholder="Sélectionnez une situation ECOS" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl">
                      {ecosSituations.map((situation) => (
                        <SelectItem key={situation.code} value={situation.code} className="text-base py-3">
                          {situation.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sélection du style musical premium */}
              {contentType && (
                <div className="space-y-4">
                  <label className="text-lg font-semibold text-gray-900">
                    <TranslatedText text="Style musical" />
                  </label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger className="h-14 text-base bg-white/50 backdrop-blur-sm border-white/30 shadow-lg">
                      <SelectValue placeholder="Choisissez un style musical" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl max-h-80 overflow-y-auto">
                      {Object.entries(stylesByGenre).map(([genre, styles]: [string, any[]]) => (
                        <div key={genre}>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                            {genre}
                          </div>
                          {styles.map((style) => (
                            <SelectItem key={style.value} value={style.value} className="text-base py-3 pl-4">
                              {style.label} - {style.description}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Boutons d'action premium */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 pt-6">
                <PremiumButton
                  variant="primary"
                  size="xl"
                  onClick={handleGenerate}
                  disabled={!canGenerate() || isGenerating || remainingFree <= 0 || lyricsLoading}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full" />
                      <TranslatedText text="Génération en cours..." />
                    </>
                  ) : (
                    <>
                      <Music className="h-5 w-5 mr-3" />
                      <TranslatedText text="Générer la musique" />
                    </>
                  )}
                </PremiumButton>
                <PremiumButton
                  variant="secondary"
                  size="xl"
                  onClick={resetForm}
                >
                  <TranslatedText text="Réinitialiser" />
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>

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
