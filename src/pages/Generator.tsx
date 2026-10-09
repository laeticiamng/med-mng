// Générateur audio Med MNG (/med-mng/create et /generator)
//
// Chemin complet : paroles du rang choisi (RPC mm_contenu_immersif_item via
// useEdnItemLyrics) → mm-generate-music (abonnement/quota, modèle imposé,
// durée calculée) → mm-suno-callback → generated_music_tracks → lecteur ici,
// bibliothèque /med-mng/library (med_mng_songs) alimentée par le callback.
import { GenerationHistory } from '@/components/generator/GenerationHistory';
import { useGenerationNotifications } from '@/components/generator/GenerationNotificationHandler';
import { GenerationProgress } from '@/components/generator/GenerationProgress';
import {
  GeneratorForm,
  parolesPourRang,
} from '@/components/generator/GeneratorForm';
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
import { FORMULES_PREMIUM, NOMBRE_ITEMS_TOTAL, NOM_OFFRE_PREMIUM, QUOTA_GENERATIONS_AUDIO_PREMIUM, normaliserCodeItem, GENERATION_AUDIO_DISPONIBLE, MESSAGE_GENERATION_SUSPENDUE } from '@/config/offre';
import { ROUTE_PATHS } from '@/config/routes';
import { libelleStyle, normaliserSlugStyle } from '@/config/stylesMusicaux';
import type { AdvancedSunoParams } from '@/hooks/music/useAdvancedSunoParams';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAllEdnItems } from '@/hooks/useAllEdnItems';
import { useEdnItemLyrics } from '@/hooks/useEdnItemLyrics';
import { parolesSontRedigees } from '@/components/edn/music/utils/parolesFormatter';
import {
  generateComprehensiveLyrics,
  generateMixedLyrics,
} from '@/utils/generateComprehensiveLyrics';
import { useAccesPremium } from '@/hooks/useAccesPremium';
import { useGamification, POINTS_CONFIG } from '@/hooks/useGamification';
import { useGeneratorPreferences } from '@/hooks/useGeneratorPreferences';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useRealtimeGeneration } from '@/hooks/useRealtimeGeneration';
import { useSubscription } from '@/hooks/useSubscription';
import { assurerChansonEnBibliotheque } from '@/lib/bibliothequeGeneration';
import { MedicalDisclaimer } from '@/components/legal';
import { avecSuivant } from '@/lib/cheminSuivant';
import { ArrowLeft, Library, Lock, Music, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

type RangGeneration = 'A' | 'B' | 'AB';

export const MESSAGE_HORS_LIGNE =
  'Vous êtes hors ligne : reconnectez-vous à Internet pour lancer la génération (rien n’a été décompté).';

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
  const [searchParams] = useSearchParams();
  // Item demandé par un lien (« Générer cette chanson » depuis la fiche d'un
  // item : /med-mng/create?itemCode=IC-12). Il prime sur les préférences
  // enregistrées ; avant, le paramètre était ignoré et le générateur
  // rouvrait le dernier item utilisé.
  const itemDemande = normaliserCodeItem(searchParams.get('itemCode'));
  const { user } = useAuth();
  const {
    musicQuota,
    rafraichirQuota,
    loading: chargementAbonnement,
  } = useSubscription();
  const musicGeneration = useMusicGenerationWithTranslation();
  const { logActivity } = useActivityTracking();
  const { addPoints, loadStats } = useGamification();
  const { preferences, savePreferences } = useGeneratorPreferences();
  const {
    aAccesPremium,
    estAdmin,
    peutVoirItem,
    chargement: chargementAcces,
  } = useAccesPremium();

  const [selectedItem, setSelectedItem] = useState('');
  const [selectedRang, setSelectedRang] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [generatedSong, setGeneratedSong] = useState<ChansonGeneree | null>(
    null
  );
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );
  const [bibliotheque, setBibliotheque] = useState<
    'inconnue' | 'verification' | 'enregistree' | 'absente'
  >('inconnue');

  const { handleGenerationComplete, requestNotificationPermission } =
    useGenerationNotifications();

  useRealtimeGeneration({
    userId: user?.id,
    onGenerationComplete: (track) => {
      handleGenerationComplete(track);
      rafraichirQuota();
    },
    enabled: !!user,
  });

  // Restaurer les préférences (style : uniquement s'il existe encore dans le catalogue).
  useEffect(() => {
    if (preferences) {
      if (preferences.selectedItem && !itemDemande)
        setSelectedItem(preferences.selectedItem);
      if (preferences.selectedRang) setSelectedRang(preferences.selectedRang);
      if (preferences.selectedStyle)
        setSelectedStyle(normaliserSlugStyle(preferences.selectedStyle));
    }
  }, [preferences, itemDemande]);

  // Appliqué une seule fois : l'utilisateur peut ensuite choisir un autre item.
  const itemDemandeApplique = useRef(false);
  useEffect(() => {
    if (itemDemande && !itemDemandeApplique.current) {
      itemDemandeApplique.current = true;
      setSelectedItem(itemDemande);
    }
  }, [itemDemande]);

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

  const {
    items: allEdnItems,
    loading: itemsLoading,
    error: itemsError,
  } = useAllEdnItems();

  const {
    lyrics: ednLyricsBrutes,
    loading: lyricsLoading,
    error: lyricsError,
    verrouille: parolesVerrouillees,
  } = useEdnItemLyrics(selectedItem || null);
  // Paroles hors items d'essai : réservées à Med MNG Premium. Le serveur (RPC
  // mm_contenu_immersif_item) fait foi (`parolesVerrouillees`) ; la règle
  // côté client évite seulement d'afficher des paroles avant sa réponse.
  const ednLyrics =
    (selectedItem && !peutVoirItem(selectedItem)) || parolesVerrouillees
      ? null
      : ednLyricsBrutes;

  const isGenerating = Boolean(
    musicGeneration.isGenerating?.rangA ||
    musicGeneration.isGenerating?.rangB ||
    musicGeneration.isGenerating?.rangAB
  );
  const pollingProgress = musicGeneration.pollingProgress || 0;
  const peutGenererSelonQuota =
    aAccesPremium && (musicQuota ? musicQuota.can_generate : true);

  // Item, rang et style choisis, paroles de l'item accessibles (item d'essai ou Premium).
  // Un rang sans paroles rédigées reste générable : elles sont reconstruites
  // depuis les compétences OIC officielles (generer-paroles-item) au lancement.
  const canGenerate = useCallback(() => {
    if (!selectedItem || !selectedRang || !selectedStyle) return false;
    return Boolean(ednLyrics);
  }, [selectedItem, selectedRang, selectedStyle, ednLyrics]);

  const handleGenerate = useCallback(
    async (advancedParams?: Partial<AdvancedSunoParams>) => {
      if (!user) {
        toast.error(
          `Connectez-vous pour utiliser le générateur audio (inclus dans ${NOM_OFFRE_PREMIUM}).`,
          {
            action: {
              label: 'Se connecter',
              onClick: () =>
                navigate(avecSuivant(ROUTE_PATHS.medMngLogin, ROUTE_PATHS.medMngCreate)),
            },
            duration: 5000,
          }
        );
        return;
      }

      if (!canGenerate() || !ednLyrics) {
        toast.error('Choisissez un item, un rang et un style musical.');
        return;
      }

      // Hors ligne : rien n'est envoyé (aucune génération décomptée).
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        toast.error(MESSAGE_HORS_LIGNE);
        return;
      }

      // Génération audio réservée à Med MNG Premium (contrôle définitif côté serveur).
      if (!aAccesPremium) {
        toast.error(
          `La génération audio est incluse dans ${NOM_OFFRE_PREMIUM} (${FORMULES_PREMIUM.annuel.prixAffiche} ou ${FORMULES_PREMIUM.mensuel.prixAffiche}).`,
          {
            action: {
              label: "Voir l'offre",
              onClick: () => navigate(ROUTE_PATHS.medMngPricing),
            },
          }
        );
        return;
      }
      if (musicQuota && !musicQuota.can_generate) {
        toast.error(
          `Vous avez utilisé vos ${QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio de ce mois. Le compteur repart le 1er du mois prochain.`
        );
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
          toast.info(
            `Paroles du ${rang === 'AB' ? 'rang A+B' : `rang ${rang}`} reconstruites depuis les compétences OIC officielles de l'item.`
          );
          try {
            lyricsToUse =
              rang === 'AB'
                ? await generateMixedLyrics(selectedItem)
                : await generateComprehensiveLyrics(selectedItem, rang);
          } catch (erreurParoles) {
            const message =
              erreurParoles instanceof Error
                ? erreurParoles.message
                : String(erreurParoles);
            toast.error(
              `Impossible de préparer les paroles du ${rang === 'AB' ? 'rang A+B' : `rang ${rang}`} : ${message}`
            );
            return;
          }
        }

        if (lyricsToUse.length === 0) {
          toast.error(
            `Aucune parole disponible pour le ${rang === 'AB' ? 'rang A+B' : `rang ${rang}`} de cet item.`
          );
          return;
        }

        setGenerationStartTime(Date.now());
        setGeneratedSong(null);
        setBibliotheque('inconnue');

        const resultat = await musicGeneration.generateMusicInLanguage(
          rang,
          lyricsToUse,
          selectedStyle,
          {
            itemCode: selectedItem,
            itemTitle: ednLyrics.title,
            advancedParams,
          }
        );

        setGenerationStartTime(null);
        const taskId = resultat.taskId;

        const song: ChansonGeneree = {
          id: Date.now(),
          taskId,
          title:
            resultat.titre ||
            `${ednLyrics.title} — ${rang === 'AB' ? 'Rang A+B' : `Rang ${rang}`}`,
          audioUrl: resultat.audioUrl,
          style: selectedStyle,
          styleLibelle: libelleStyle(selectedStyle),
          rang,
          duration: resultat.dureeDemandee,
          itemCode: selectedItem,
          lyrics: lyricsToUse.join('\n'),
        };
        setGeneratedSong(song);
        rafraichirQuota();

        // Le callback a normalement déjà enregistré la chanson dans la bibliothèque ; on le vérifie.
        if (taskId) {
          setBibliotheque('verification');
          const biblio = await assurerChansonEnBibliotheque(user.id, taskId);
          setBibliotheque(
            biblio.etat === 'impossible' ? 'absente' : 'enregistree'
          );
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
            advancedParams: advancedParams ? Object.keys(advancedParams) : [],
          },
        });
        await addPoints(user.id, POINTS_CONFIG.itemReviewed, 'itemReviewed');
        loadStats(user.id);
      } catch (error) {
        // Le hook a déjà affiché le message (français, jamais technique).
        if (import.meta.env.DEV) console.error('Erreur génération:', error);
        setGenerationStartTime(null);
        rafraichirQuota();
      }
    },
    [
      canGenerate,
      user,
      aAccesPremium,
      musicQuota,
      ednLyrics,
      selectedItem,
      selectedRang,
      selectedStyle,
      musicGeneration,
      rafraichirQuota,
      navigate,
      logActivity,
      addPoints,
      loadStats,
    ]
  );

  /** La chanson est enregistrée par le serveur : on vérifie une dernière fois, puis on ouvre la bibliothèque. */
  const handleOuvrirBibliotheque = useCallback(async () => {
    if (!generatedSong) return;
    if (!user) {
      toast.error('Connectez-vous pour retrouver vos chansons');
      return;
    }
    if (generatedSong.taskId && bibliotheque !== 'enregistree') {
      const resultat = await assurerChansonEnBibliotheque(
        user.id,
        generatedSong.taskId
      );
      if (resultat.etat === 'impossible') {
        toast.error(
          `Impossible d'enregistrer la chanson dans votre bibliothèque : ${resultat.raison}`
        );
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

  const afficherEncartPremium =
    Boolean(user) &&
    !chargementAcces &&
    !chargementAbonnement &&
    !aAccesPremium;

  return (
    <PremiumBackground variant="amber">
      <div
        className="bg-card/70 backdrop-blur-xl border-b border-border shadow-lg"
        role="banner"
      >
        <div className="container mx-auto px-4 py-5 sm:py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Med MNG Create</p>
              <h1 className="mt-1 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                <TranslatedText text="Transformez un item EDN en chanson" />
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base" role="doc-subtitle">
                <TranslatedText text="Les connaissances officielles d'un item (rang A, B ou les deux) deviennent des paroles fidèles au programme, puis une chanson à écouter pour réviser." />
              </p>
            </div>
            {/* « Je retrouve ma musique » : la bibliothèque, accessible d'ici. */}
            <Button asChild variant="outline" size="sm" className="min-h-[40px] w-fit shrink-0">
              <Link to={ROUTE_PATHS.medMngMusicLibrary}>
                <Library className="h-4 w-4 mr-2" aria-hidden="true" />
                Mes chansons
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <main
        className="container mx-auto px-2 md:px-4 py-6 md:py-12"
        role="main"
      >
        <div className="max-w-6xl mx-auto">
          {/* Offre visible dès l'arrivée (08.10.2026) : gratuit (0 génération
              audio, paroles des items d'essai) ou Premium (X / 30 ce mois). Avant,
              un compte gratuit ne découvrait la règle qu'après avoir choisi item,
              rang et style. L'encart détaillé reste à la place du bouton. */}
          {user && !chargementAcces && !chargementAbonnement && (
            <div className="mb-6">
              <QuotaDisplay
                user={user}
                musicQuota={musicQuota}
                aAccesPremium={aAccesPremium}
                estAdmin={estAdmin}
                onRefresh={rafraichirQuota}
              />
            </div>
          )}

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
            generationReservee={afficherEncartPremium}
            aAccesPremium={aAccesPremium}
            parolesVerrouillees={parolesVerrouillees}
          />

          <GenerationProgress
            progress={pollingProgress}
            isGenerating={isGenerating}
            message={
              musicGeneration.etape?.etape === 'envoi'
                ? 'Envoi de la demande au service de génération…'
                : "Votre chanson est en cours de création (1 à 3 minutes). Elle sera ajoutée à votre bibliothèque dès qu'elle est prête."
            }
            onCancel={() => {
              const activeRang = musicGeneration.isGenerating?.rangA
                ? 'A'
                : musicGeneration.isGenerating?.rangB
                  ? 'B'
                  : musicGeneration.isGenerating?.rangAB
                    ? 'AB'
                    : undefined;
              musicGeneration.cancelGeneration(activeRang);
              setGenerationStartTime(null);
            }}
            startTime={generationStartTime || undefined}
            taskId={musicGeneration.etape?.taskId}
            rang={
              selectedRang === 'A' ||
              selectedRang === 'B' ||
              selectedRang === 'AB'
                ? selectedRang
                : undefined
            }
          />

          {generatedSong && (
            <p className="mt-4 text-sm text-muted-foreground">
              {bibliotheque === 'enregistree' &&
                'Chanson prête et enregistrée dans votre bibliothèque.'}
              {bibliotheque === 'verification' &&
                'Chanson prête — enregistrement dans votre bibliothèque…'}
              {bibliotheque === 'absente' &&
                "Chanson prête. L'enregistrement en bibliothèque a échoué : utilisez le bouton « Ma bibliothèque » pour réessayer."}
            </p>
          )}

          <GeneratorMusicPlayer
            generatedSong={generatedSong}
            onAddToLibrary={handleOuvrirBibliotheque}
            libraryLabel={
              bibliotheque === 'enregistree'
                ? 'Ma bibliothèque'
                : 'Enregistrer en bibliothèque'
            }
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

          {/* Historique et playlists : utiles, mais pas la priorité de cet écran
              (l'utilisateur vient créer une chanson, pas gérer sa bibliothèque —
              elle a sa propre page, ROUTE_PATHS.medMngMusicLibrary). Repliés par
              défaut plutôt que d'occuper l'écran en permanence. */}
          <details className="my-8 group">
            <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-fit">
              <span className="inline-block transition-transform group-open:rotate-90">
                ▶
              </span>
              Historique et playlists
            </summary>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <PremiumCard variant="glass" className="p-4 sticky top-4">
                  <PlaylistManager className="mb-4" />
                </PremiumCard>
              </div>
              <div className="lg:col-span-3">
                <GenerationHistory />
              </div>
            </div>
          </details>

          <MobileHistoryDrawer />

          <details className="group">
            <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-fit mb-2">
              <span className="inline-block transition-transform group-open:rotate-90">
                ▶
              </span>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <TranslatedText text="Comment ça marche ?" />
            </summary>
            <PremiumCard
              variant="glass"
              className="p-4 sm:p-6 md:p-8"
              role="region"
              aria-label="Comment ça marche"
            >
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 text-muted-foreground text-sm sm:text-base">
                <div className="space-y-4">
                  <p className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      1
                    </span>
                    <TranslatedText
                      text={`Choisissez un item parmi les ${NOMBRE_ITEMS_TOTAL} items EDN`}
                    />
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-success text-success-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      2
                    </span>
                    <TranslatedText text="Sélectionnez le rang A, le rang B ou A+B : ce sont les paroles de ce rang qui seront chantées" />
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      3
                    </span>
                    <TranslatedText text="Choisissez un style musical (rap, pop, lo-fi, chanson française…)" />
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-warning text-warning-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      4
                    </span>
                    <TranslatedText text="La durée est calculée d'après les paroles (1 min 30 à 5 min) ; la génération prend 1 à 3 minutes" />
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      5
                    </span>
                    <TranslatedText text="La chanson est sauvegardée automatiquement dans votre bibliothèque" />
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      6
                    </span>
                    <TranslatedText
                      text={GENERATION_AUDIO_DISPONIBLE ? `${QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio par mois avec ${NOM_OFFRE_PREMIUM} ; une génération qui échoue n'est pas décomptée` : MESSAGE_GENERATION_SUSPENDUE}
                    />
                  </p>
                </div>
              </div>
            </PremiumCard>
          </details>
        </div>

        <div className="max-w-6xl mx-auto mt-6 px-2 md:px-4">
          <MedicalDisclaimer variant="minimal" />
        </div>
      </main>
    </PremiumBackground>
  );
};

export default Generator;
