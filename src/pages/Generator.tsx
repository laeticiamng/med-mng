// Générateur audio MED MNG (/med-mng/create et /generator)
//
// Chemin complet : paroles du rang choisi (RPC mm_contenu_immersif_item via
// useEdnItemLyrics) → mm-generate-music (abonnement/quota, modèle imposé,
// durée calculée) → mm-suno-callback → generated_music_tracks → lecteur ici,
// bibliothèque /med-mng/library (med_mng_songs) alimentée par le callback.
import { GenerationHistory } from '@/components/generator/GenerationHistory';
import { useGenerationNotifications } from '@/components/generator/GenerationNotificationHandler';
import { GenerationProgress } from '@/components/generator/GenerationProgress';
import { GeneratorForm, parolesPourRang } from '@/components/generator/GeneratorForm';
import { LyricsExportButton } from '@/components/generator/LyricsExportButton';
import { MobileHistoryDrawer } from '@/components/generator/MobileHistoryDrawer';
import { PlaylistManager } from '@/components/generator/PlaylistManager';
import { PlaylistQuickAdd } from '@/components/generator/PlaylistQuickAdd';
import { QuotaDisplay } from '@/components/generator/QuotaDisplay';
import { GeneratorMusicPlayer } from '@/components/music/GeneratorMusicPlayer';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { TranslatedText } from '@/components/TranslatedText';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PremiumBackground } from '@/components/ui/premium-background';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
import { FORMULES_PREMIUM, NOMBRE_ITEMS_TOTAL, NOM_OFFRE_PREMIUM, QUOTA_GENERATIONS_AUDIO_PREMIUM } from '@/config/offre';
import { ROUTE_PATHS } from '@/config/routes';
import { libelleStyle, normaliserSlugStyle } from '@/config/stylesMusicaux';
import type { AdvancedSunoParams } from '@/hooks/music/useAdvancedSunoParams';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAllEdnItems } from '@/hooks/useAllEdnItems';
import { useEdnItemLyrics } from '@/hooks/useEdnItemLyrics';
import { parolesSontRedigees } from '@/components/edn/music/utils/parolesFormatter';
import { generateComprehensiveLyrics, generateMixedLyrics } from '@/utils/generateComprehensiveLyrics';
import { useAccesPremium } from '@/hooks/useAccesPremium';
import { useGamification, POINTS_CONFIG } from '@/hooks/useGamification';
import { useGeneratorPreferences } from '@/hooks/useGeneratorPreferences';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useRealtimeGeneration } from '@/hooks/useRealtimeGeneration';
import { useSubscription } from '@/hooks/useSubscription';
import { assurerChansonEnBibliotheque } from '@/lib/bibliothequeGeneration';
import { MedicalDisclaimer } from '@/components/legal';
import { ArrowLeft, Lock, Music, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type RangGeneration = 'A' | 'B' | 'AB';

interface ChansonGeneree {
  id: number;
  taskId: string;
  title: string;
  audioUrl: string;
  style: string;
  styleLibelle: string;
  rang: RangGeneration;
  duration?: number;
  itemCode: string;
  lyrics: string;
}

const Generator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { musicQuota, rafraichirQuota, loading: chargementAbonnement } = useSubscription();
  const musicGeneration = useMusicGenerationWithTranslation();
  const { logActivity } = useActivityTracking();
  const { addPoints, loadStats } = useGamification();
  const { preferences, savePreferences } = useGeneratorPreferences();
  const { aAccesPremium, estAdmin, peutVoirItem, chargement: chargementAcces } = useAccesPremium();

  const [selectedItem, setSelectedItem] = useState('');
  const [selectedRang, setSelectedRang] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [generatedSong, setGeneratedSong] = useState<ChansonGeneree | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [bibliotheque, setBibliotheque] = useState<'inconnue' | 'verification' | 'enregistree' | 'absente'>('inconnue');

  const { handleGenerationComplete, requestNotificationPermission } = useGenerationNotifications();

  useRealtimeGeneration({
    userId: user?.id,
    onGenerationComplete: (track) => {
      handleGenerationComplete(track);
      rafraichirQuota();
    },
    enabled: !!user
  });

  // Restaurer les préférences (style : uniquement s'il existe encore dans le catalogue).
  useEffect(() => {
    if (preferences) {
      if (preferences.selectedItem) setSelectedItem(preferences.selectedItem);
      if (preferences.selectedRang) setSelectedRang(preferences.selectedRang);
      if (preferences.selectedStyle) setSelectedStyle(normaliserSlugStyle(preferences.selectedStyle));
    }
  }, [preferences]);

  useEffect(() => {
    if (selectedItem || selectedRang || selectedStyle) {
      savePreferences({
        contentType: 'edn',
        selectedItem,
        selectedRang,
        selectedStyle,
      });
    }
  }, [selectedItem, selectedRang, selectedStyle, savePreferences]);

  useEffect(() => {
    const timer = setTimeout(() => {
      requestNotificationPermission();
    }, 5000);
    return () => clearTimeout(timer);
  }, [requestNotificationPermission]);

  const { items: allEdnItems, loading: itemsLoading, error: itemsError } = useAllEdnItems();

  const {
    lyrics: ednLyricsBrutes,
    loading: lyricsLoading,
    error: lyricsError,
    verrouille: parolesVerrouillees,
  } = useEdnItemLyrics(selectedItem || null);
  // Paroles hors items d'essai : réservées à MED MNG Premium. Le serveur (RPC
  // mm_contenu_immersif_item) fait foi (`parolesVerrouillees`) ; la règle
  // côté client évite seulement d'afficher des paroles avant sa réponse.
  const ednLyrics = (selectedItem && !peutVoirItem(selectedItem)) || parolesVerrouillees ? null : ednLyricsBrutes;

  const isGenerating = Boolean(musicGeneration.isGenerating?.rangA || musicGeneration.isGenerating?.rangB || musicGeneration.isGenerating?.rangAB);
  const pollingProgress = musicGeneration.pollingProgress || 0;
  const peutGenererSelonQuota = aAccesPremium && (musicQuota ? musicQuota.can_generate : true);

  // Item, rang et style choisis, paroles de l'item accessibles (item d'essai ou Premium).
  // Un rang sans paroles rédigées reste générable : elles sont reconstruites
  // depuis les compétences OIC officielles (generer-paroles-item) au lancement.
  const canGenerate = useCallback(() => {
    if (!selectedItem || !selectedRang || !selectedStyle) return false;
    return Boolean(ednLyrics);
  }, [selectedItem, selectedRang, selectedStyle, ednLyrics]);

  const handleGenerate = useCallback(async (advancedParams?: Partial<AdvancedSunoParams>) => {
    if (!user) {
      toast.error(`Connectez-vous pour utiliser le générateur audio (inclus dans ${NOM_OFFRE_PREMIUM}).`, {
        action: { label: 'Se connecter', onClick: () => navigate(ROUTE_PATHS.medMngLogin) },
        duration: 5000
      });
      return;
    }

    if (!canGenerate() || !ednLyrics) {
      toast.error('Choisissez un item, un rang et un style musical.');
      return;
    }

    // Génération audio réservée à MED MNG Premium (contrôle définitif côté serveur).
    if (!aAccesPremium) {
      toast.error(`La génération audio est incluse dans ${NOM_OFFRE_PREMIUM} (${FORMULES_PREMIUM.annuel.prixAffiche} ou ${FORMULES_PREMIUM.mensuel.prixAffiche}).`, {
        action: { label: "Voir l'offre", onClick: () => navigate(ROUTE_PATHS.medMngPricing) }
      });
      return;
    }
    if (musicQuota && !musicQuota.can_generate) {
      toast.error(`Vous avez utilisé vos ${QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio de ce mois. Le compteur repart le 1er du mois prochain.`);
      return;
    }

    const rang = selectedRang as RangGeneration;

    try {
      let lyricsToUse = parolesPourRang(ednLyrics, rang);

      // Les colonnes `paroles_rang_*` ne contiennent, pour une partie des items,
      // qu'une suite de mots-clés sans verbe ni ponctuation. Envoyer ça à Suno
      // consomme une génération pour un résultat inchantable : on repart alors
      // des compétences OIC officielles de l'item (generer-paroles-item).
      if (lyricsToUse.length === 0 || !parolesSontRedigees(lyricsToUse)) {
        toast.info(`Paroles du ${rang === 'AB' ? 'rang A+B' : `rang ${rang}`} reconstruites depuis les compétences OIC officielles de l'item.`);
        try {
          lyricsToUse = rang === 'AB'
            ? await generateMixedLyrics(selectedItem)
            : await generateComprehensiveLyrics(selectedItem, rang);
        } catch (erreurParoles) {
          const message = erreurParoles instanceof Error ? erreurParoles.message : String(erreurParoles);
          toast.error(`Impossible de préparer les paroles du ${rang === 'AB' ? 'rang A+B' : `rang ${rang}`} : ${message}`);
          return;
        }
      }

      if (lyricsToUse.length === 0) {
        toast.error(`Aucune parole disponible pour le ${rang === 'AB' ? 'rang A+B' : `rang ${rang}`} de cet item.`);
        return;
      }

      setGenerationStartTime(Date.now());
      setGeneratedSong(null);
      setBibliotheque('inconnue');

      const resultat = await musicGeneration.generateMusicInLanguage(rang, lyricsToUse, selectedStyle, {
        itemCode: selectedItem,
        itemTitle: ednLyrics.title,
        advancedParams,
      });

      setGenerationStartTime(null);
      const taskId = resultat.taskId;

      const song: ChansonGeneree = {
        id: Date.now(),
        taskId,
        title: resultat.titre || `${ednLyrics.title} — ${rang === 'AB' ? 'Rang A+B' : `Rang ${rang}`}`,
        audioUrl: resultat.audioUrl,
        style: selectedStyle,
        styleLibelle: libelleStyle(selectedStyle),
        rang,
        duration: resultat.dureeDemandee,
        itemCode: selectedItem,
        lyrics: lyricsToUse.join('\n')
      };
      setGeneratedSong(song);
      rafraichirQuota();

      // Le callback a normalement déjà enregistré la chanson dans la bibliothèque ; on le vérifie.
      if (taskId) {
        setBibliotheque('verification');
        const biblio = await assurerChansonEnBibliotheque(user.id, taskId);
        setBibliotheque(biblio.etat === 'impossible' ? 'absente' : 'enregistree');
        if (biblio.etat === 'impossible' && import.meta.env.DEV) {
          console.warn('[Generator] Bibliothèque :', biblio.raison);
        }
      }

      await logActivity({
        activity_type: 'music_generation',
        count: 1,
        metadata: {
          itemCode: selectedItem,
          style: selectedStyle,
          rang,
          advancedParams: advancedParams ? Object.keys(advancedParams) : []
        }
      });
      await addPoints(user.id, POINTS_CONFIG.itemReviewed, 'itemReviewed');
      loadStats(user.id);

    } catch (error) {
      // Le hook a déjà affiché le message (français, jamais technique).
      if (import.meta.env.DEV) console.error('Erreur génération:', error);
      setGenerationStartTime(null);
      rafraichirQuota();
    }
  }, [canGenerate, user, aAccesPremium, musicQuota, ednLyrics, selectedItem, selectedRang, selectedStyle, musicGeneration, rafraichirQuota, navigate, logActivity, addPoints, loadStats]);

  /** La chanson est enregistrée par le serveur : on vérifie une dernière fois, puis on ouvre la bibliothèque. */
  const handleOuvrirBibliotheque = useCallback(async () => {
    if (!generatedSong) return;
    if (!user) {
      toast.error('Connectez-vous pour retrouver vos chansons');
      return;
    }
    if (generatedSong.taskId && bibliotheque !== 'enregistree') {
      const resultat = await assurerChansonEnBibliotheque(user.id, generatedSong.taskId);
      if (resultat.etat === 'impossible') {
        toast.error(`Impossible d'enregistrer la chanson dans votre bibliothèque : ${resultat.raison}`);
        return;
      }
      setBibliotheque('enregistree');
    }
    navigate(ROUTE_PATHS.medMngMusicLibrary);
  }, [generatedSong, user, bibliotheque, navigate]);

  const resetForm = useCallback(() => {
    setSelectedItem('');
    setSelectedRang('');
    setSelectedStyle('');
    setGeneratedSong(null);
    setBibliotheque('inconnue');
  }, []);

  const afficherEncartPremium = Boolean(user) && !chargementAcces && !chargementAbonnement && !aAccesPremium;

  return (
    <PremiumBackground variant="amber">
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
                  <TranslatedText text="Créer une chanson" />
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium truncate" role="doc-subtitle">
                  <TranslatedText text="Les paroles d'un item EDN, chantées dans le style de votre choix" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-2 md:px-4 py-6 md:py-12" role="main">
        <div className="max-w-6xl mx-auto">
          {afficherEncartPremium && (
            <Alert className="mb-6 border-primary/30 bg-primary/5">
              <Lock className="h-4 w-4 text-primary" />
              <AlertTitle>Génération audio : {NOM_OFFRE_PREMIUM}</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>
                  {QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio par mois et le contenu immersif des {NOMBRE_ITEMS_TOTAL} items
                  (paroles, récits, planches, quiz) sont inclus dans {NOM_OFFRE_PREMIUM} :
                  {' '}{FORMULES_PREMIUM.annuel.prixAffiche} ({FORMULES_PREMIUM.annuel.equivalentMensuel}) ou {FORMULES_PREMIUM.mensuel.prixAffiche}.
                  Chaque chanson générée est sauvegardée dans votre bibliothèque.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link to={ROUTE_PATHS.medMngPricing}>Voir l'offre Premium</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to={ROUTE_PATHS.ednComplete}>Explorer les items EDN</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <QuotaDisplay
                user={user}
                musicQuota={musicQuota}
                aAccesPremium={aAccesPremium}
                estAdmin={estAdmin}
                onRefresh={rafraichirQuota}
              />
            </div>

            {ednLyrics && selectedRang && (
              <PremiumCard variant="glass" className="p-4 flex flex-col gap-3 sm:w-72">
                <span className="text-sm font-medium">Paroles du rang choisi</span>
                <LyricsExportButton
                  lyrics={parolesPourRang(ednLyrics, selectedRang).join('\n')}
                  title={ednLyrics.title}
                  rang={selectedRang}
                  style={selectedStyle}
                  variant="outline"
                  size="sm"
                />
              </PremiumCard>
            )}
          </div>

          <GeneratorForm
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            selectedRang={selectedRang}
            setSelectedRang={setSelectedRang}
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
            canGenerateMusic={() => peutGenererSelonQuota}
          />

          <GenerationProgress
            progress={pollingProgress}
            isGenerating={isGenerating}
            message={musicGeneration.etape?.etape === 'envoi'
              ? 'Envoi de la demande au service de génération…'
              : 'Votre chanson est en cours de création (1 à 3 minutes). Elle sera ajoutée à votre bibliothèque dès qu\'elle est prête.'}
            onCancel={() => {
              const activeRang = musicGeneration.isGenerating?.rangA ? 'A'
                : musicGeneration.isGenerating?.rangB ? 'B'
                : musicGeneration.isGenerating?.rangAB ? 'AB'
                : undefined;
              musicGeneration.cancelGeneration(activeRang);
              setGenerationStartTime(null);
            }}
            startTime={generationStartTime || undefined}
            taskId={musicGeneration.etape?.taskId}
            rang={selectedRang === 'A' || selectedRang === 'B' || selectedRang === 'AB' ? selectedRang : undefined}
          />

          {generatedSong && (
            <p className="mt-4 text-sm text-muted-foreground">
              {bibliotheque === 'enregistree' && 'Chanson prête et enregistrée dans votre bibliothèque.'}
              {bibliotheque === 'verification' && 'Chanson prête — enregistrement dans votre bibliothèque…'}
              {bibliotheque === 'absente' && "Chanson prête. L'enregistrement en bibliothèque a échoué : utilisez le bouton « Ma bibliothèque » pour réessayer."}
            </p>
          )}

          <GeneratorMusicPlayer
            generatedSong={generatedSong}
            onAddToLibrary={handleOuvrirBibliotheque}
            libraryLabel={bibliotheque === 'enregistree' ? 'Ma bibliothèque' : 'Enregistrer en bibliothèque'}
            onRetry={handleGenerate}
          />

          {generatedSong && (
            <PlaylistQuickAdd
              trackId={String(generatedSong.id)}
              trackTitle={generatedSong.title}
              audioUrl={generatedSong.audioUrl}
              className="my-4"
            />
          )}

          <div className="my-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <PremiumCard variant="glass" className="p-4 sticky top-4">
                <PlaylistManager className="mb-4" />
              </PremiumCard>
            </div>
            <div className="lg:col-span-3">
              <GenerationHistory />
            </div>
          </div>

          <MobileHistoryDrawer />

          <PremiumCard variant="glass" className="p-4 sm:p-6 md:p-8" role="region" aria-labelledby="help-heading">
            <h3 id="help-heading" className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-lg sm:rounded-xl flex items-center justify-center shrink-0" aria-hidden="true">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <span className="break-word"><TranslatedText text="Comment ça marche ?" /></span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 text-muted-foreground text-sm sm:text-base">
              <div className="space-y-4">
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</span>
                  <TranslatedText text={`Choisissez un item parmi les ${NOMBRE_ITEMS_TOTAL} items EDN`} />
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-success text-success-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</span>
                  <TranslatedText text="Sélectionnez le rang A, le rang B ou A+B : ce sont les paroles de ce rang qui seront chantées" />
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</span>
                  <TranslatedText text="Choisissez un style musical (rap, pop, lo-fi, chanson française…)" />
                </p>
              </div>
              <div className="space-y-4">
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-warning text-warning-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</span>
                  <TranslatedText text="La durée est calculée d'après les paroles (1 min 30 à 5 min) ; la génération prend 1 à 3 minutes" />
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">5</span>
                  <TranslatedText text="La chanson est sauvegardée automatiquement dans votre bibliothèque" />
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">6</span>
                  <TranslatedText text={`${QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio par mois avec ${NOM_OFFRE_PREMIUM} ; une génération qui échoue n'est pas décomptée`} />
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>

        <div className="max-w-6xl mx-auto mt-6 px-2 md:px-4">
          <MedicalDisclaimer variant="minimal" />
        </div>
      </main>
    </PremiumBackground>
  );
};

export default Generator;
