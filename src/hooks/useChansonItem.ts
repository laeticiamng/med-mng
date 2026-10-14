// Génération d'une chanson depuis la sous-page « Musique » d'un item EDN.
//
// Même chemin que Create (src/pages/Generator.tsx), sans second moteur :
// useMusicGenerationWithTranslation → useSunoMusicGeneration → mm-generate-music
// (abonnement, quota, modèle et durée imposés par le serveur) → mm-suno-callback →
// generated_music_tracks / bibliothèque. Les règles avant l'appel sont celles de
// Create : connexion, hors ligne, Premium, quota ; paroles du rang demandé
// seulement, reconstruites depuis les compétences OIC si elles ne sont pas
// rédigées. Rien n'est envoyé tant que `generer` n'est pas appelé : changer de
// rang, de style ou d'option ne contacte aucun service.
import {
  parolesPourRang,
  type ParolesItem,
} from '@/components/generator/GeneratorForm';
import { useGenerationNotifications } from '@/components/generator/GenerationNotificationHandler';
import { parolesSontRedigees } from '@/components/edn/music/utils/parolesFormatter';
import { useAuth } from '@/components/med-mng/AuthProvider';
import {
  FORMULES_PREMIUM,
  NOM_OFFRE_PREMIUM,
  QUOTA_GENERATIONS_AUDIO_PREMIUM,
} from '@/config/offre';
import { ROUTE_PATHS } from '@/config/routes';
import { libelleStyle } from '@/config/stylesMusicaux';
import type { AdvancedSunoParams } from '@/hooks/music/useAdvancedSunoParams';
import { useAccesPremium } from '@/hooks/useAccesPremium';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { POINTS_CONFIG, useGamification } from '@/hooks/useGamification';
import { useMusicGenerationWithTranslation } from '@/hooks/useMusicGenerationWithTranslation';
import { useRealtimeGeneration } from '@/hooks/useRealtimeGeneration';
import { useSubscription } from '@/hooks/useSubscription';
import { assurerChansonEnBibliotheque } from '@/lib/bibliothequeGeneration';
import { avecSuivant } from '@/lib/cheminSuivant';
import {
  generateComprehensiveLyrics,
  generateMixedLyrics,
} from '@/utils/generateComprehensiveLyrics';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type RangChanson = 'A' | 'B' | 'AB';

export const MESSAGE_HORS_LIGNE_ITEM =
  'Vous êtes hors ligne : reconnectez-vous à Internet pour lancer la génération (rien n’a été décompté).';

export const libelleRangChanson = (rang: RangChanson) =>
  rang === 'AB' ? 'Rang A+B' : `Rang ${rang}`;

export interface ChansonGeneree {
  id: number;
  taskId: string;
  title: string;
  audioUrl: string;
  style: string;
  styleLibelle: string;
  rang: RangChanson;
  duration?: number;
  itemCode: string;
  lyrics: string;
}

/**
 * Un lancement = un seul objet, posé de façon synchrone dès le clic et libéré en
 * UN seul point (`liberer`). Il sert à la fois de verrou contre un second lancement
 * et de jeton : toute continuation périmée (annulation, démontage) le voit et
 * s'arrête avant d'appeler le service payant.
 */
interface Lancement {
  rang: RangChanson;
  /** Annulé par l'utilisatrice, ou page quittée pendant la rédaction des paroles. */
  annule: boolean;
  /** La requête payante est partie : le démontage ne l'interrompt plus. */
  audioLance: boolean;
}

/** Borne une attente : au-delà, la promesse rend `null` (elle n'est pas annulée). */
const avecDelai = <T>(promesse: Promise<T>, ms: number): Promise<T | null> =>
  new Promise((resolve, reject) => {
    const minuteur = setTimeout(() => resolve(null), ms);
    promesse.then(
      (valeur) => {
        clearTimeout(minuteur);
        resolve(valeur);
      },
      (erreur) => {
        clearTimeout(minuteur);
        reject(erreur);
      }
    );
  });

/** Délai maximal de la vérification de bibliothèque (le serveur l'a déjà enregistrée en général). */
const DELAI_BIBLIOTHEQUE_MS = 20_000;

type EtatBibliotheque = 'inconnue' | 'verification' | 'enregistree' | 'absente';

export function useChansonItem(itemCode: string, paroles: ParolesItem) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { musicQuota, rafraichirQuota } = useSubscription();
  const {
    aAccesPremium,
    estAdmin,
    chargement: chargementAcces,
  } = useAccesPremium();
  const musicGeneration = useMusicGenerationWithTranslation();
  const { logActivity } = useActivityTracking();
  const { addPoints, loadStats } = useGamification();
  const { handleGenerationComplete } = useGenerationNotifications();

  const [chanson, setChanson] = useState<ChansonGeneree | null>(null);
  /** Rang de la génération réellement lancée : ne suit pas l'onglet affiché pendant qu'elle tourne. */
  const [rangEnCours, setRangEnCours] = useState<RangChanson | null>(null);
  /** Style de la génération réellement lancée (idem : le sélecteur peut bouger entre-temps). */
  const [styleEnCours, setStyleEnCours] = useState<string | null>(null);
  /** Dès le clic, avant toute requête (rédaction des paroles comprise) : verrou contre un second lancement. */
  const [preparation, setPreparation] = useState(false);
  const lancement = useRef<Lancement | null>(null);
  /** Chanson dont le post-traitement (bibliothèque) peut encore mettre l'état à jour. */
  const chansonCourante = useRef<string | null>(null);
  const [debutGeneration, setDebutGeneration] = useState<number | null>(null);
  const [bibliotheque, setBibliotheque] =
    useState<EtatBibliotheque>('inconnue');

  const rafraichirChansonsItem = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['mes-chansons-item'] });
  }, [queryClient]);

  // Chanson terminée en arrière-plan (callback serveur) : notification, quota et liste à jour.
  // Le callback passé à useRealtimeGeneration doit garder la même identité d'un rendu
  // à l'autre : il figure dans les dépendances de sa connexion, et une nouvelle identité
  // à chaque rendu détruirait puis recréerait le canal realtime en boucle. La dernière
  // version des fonctions appelées est lue dans une référence.
  const surChansonTerminee = useRef<(track: unknown) => void>(() => {});
  surChansonTerminee.current = (track) => {
    handleGenerationComplete(track);
    rafraichirQuota();
    rafraichirChansonsItem();
  };
  const onGenerationComplete = useCallback(
    (track: unknown) => surChansonTerminee.current(track),
    []
  );
  useRealtimeGeneration({
    userId: user?.id,
    onGenerationComplete,
    enabled: !!user,
  });

  const enCours =
    preparation ||
    Boolean(
      musicGeneration.isGenerating?.rangA ||
        musicGeneration.isGenerating?.rangB ||
        musicGeneration.isGenerating?.rangAB
    );
  const quotaAtteint = Boolean(musicQuota && !musicQuota.can_generate);

  /**
   * Post-traitement d'une chanson prête : bibliothèque, puis activité et points.
   * Les deux chaînes sont indépendantes (une bibliothèque qui ne répond pas ne
   * fait pas perdre l'activité ni les points d'une chanson réussie) ; la
   * vérification de bibliothèque est bornée ; aucune erreur n'est remontée.
   */
  const apresGeneration = useCallback(
    async (
      userId: string,
      taskId: string,
      rang: RangChanson,
      style: string,
      advancedParams: Partial<AdvancedSunoParams> | undefined
    ) => {
      const toujoursCourante = () =>
        chansonCourante.current === (taskId || null);
      const verifierBibliotheque = async () => {
        if (!taskId) return;
        try {
          if (toujoursCourante()) setBibliotheque('verification');
          const biblio = await avecDelai(
            assurerChansonEnBibliotheque(userId, taskId),
            DELAI_BIBLIOTHEQUE_MS
          );
          if (toujoursCourante()) {
            setBibliotheque(
              biblio && biblio.etat !== 'impossible' ? 'enregistree' : 'absente'
            );
          }
        } catch (erreur) {
          if (toujoursCourante()) setBibliotheque('absente');
          if (import.meta.env.DEV) console.warn('Bibliothèque :', erreur);
        }
      };
      const enregistrerActivite = async () => {
        try {
          await logActivity({
            activity_type: 'music_generation',
            count: 1,
            metadata: {
              itemCode,
              style,
              rang,
              advancedParams: advancedParams ? Object.keys(advancedParams) : [],
            },
          });
        } catch (erreur) {
          if (import.meta.env.DEV) console.warn('Activité :', erreur);
        }
        try {
          await addPoints(userId, POINTS_CONFIG.itemReviewed, 'itemReviewed');
          loadStats(userId);
        } catch (erreur) {
          if (import.meta.env.DEV) console.warn('Points :', erreur);
        }
      };
      await Promise.allSettled([verifierBibliotheque(), enregistrerActivite()]);
      rafraichirChansonsItem();
    },
    [itemCode, logActivity, addPoints, loadStats, rafraichirChansonsItem]
  );

  const genererInterne = useCallback(
    async (
      l: Lancement,
      style: string,
      advancedParams: Partial<AdvancedSunoParams> | undefined,
      liberer: () => void
    ) => {
      const rang = l.rang;
      if (!user) {
        toast.error(
          `Connectez-vous pour utiliser le générateur audio (inclus dans ${NOM_OFFRE_PREMIUM}).`,
          {
            action: {
              label: 'Se connecter',
              onClick: () =>
                navigate(
                  avecSuivant(ROUTE_PATHS.medMngLogin, location.pathname)
                ),
            },
            duration: 5000,
          }
        );
        return;
      }
      if (!style) {
        toast.error('Choisissez un style musical.');
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        toast.error(MESSAGE_HORS_LIGNE_ITEM);
        return;
      }
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

      try {
        let lignes = parolesPourRang(paroles, rang);

        // Mots-clés non rédigés : on repart des compétences OIC officielles (comme Create).
        if (lignes.length === 0 || !parolesSontRedigees(lignes)) {
          toast.info(
            `Paroles du ${rang === 'AB' ? 'rang A+B' : `rang ${rang}`} reconstruites depuis les compétences OIC officielles de l'item.`
          );
          try {
            lignes =
              rang === 'AB'
                ? await generateMixedLyrics(itemCode)
                : await generateComprehensiveLyrics(itemCode, rang);
          } catch (erreurParoles) {
            if (l.annule) return;
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
        // Annulation (ou page quittée) pendant la rédaction : aucune génération payante.
        if (l.annule) return;
        if (lignes.length === 0) {
          toast.error(
            `Aucune parole disponible pour le ${rang === 'AB' ? 'rang A+B' : `rang ${rang}`} de cet item.`
          );
          return;
        }

        chansonCourante.current = null;
        setDebutGeneration(Date.now());
        setChanson(null);
        setBibliotheque('inconnue');

        l.audioLance = true;
        const resultat = await musicGeneration.generateMusicInLanguage(
          rang,
          lignes,
          style,
          {
            itemCode,
            itemTitle: paroles.title,
            advancedParams,
          }
        );

        if (l.annule) return;
        const taskId = resultat.taskId;
        chansonCourante.current = taskId || null;
        setChanson({
          id: Date.now(),
          taskId,
          title:
            resultat.titre || `${paroles.title} — ${libelleRangChanson(rang)}`,
          audioUrl: resultat.audioUrl,
          style,
          styleLibelle: libelleStyle(style),
          rang,
          duration: resultat.dureeDemandee,
          itemCode,
          lyrics: lignes.join('\n'),
        });
        rafraichirQuota();
        rafraichirChansonsItem();

        // La requête payante est terminée : le verrou anti-double-lancement et
        // l'état « génération en cours » sont levés ICI. Le reste (bibliothèque,
        // activité, points) se fait à part, sans bloquer l'interface, et ses
        // erreurs sont traitées : un appel annexe bloqué ne fige plus la page.
        liberer();
        void apresGeneration(user.id, taskId, rang, style, advancedParams);
      } catch (error) {
        // Le hook de génération a déjà affiché un message français, jamais technique.
        if (import.meta.env.DEV) console.error('Erreur génération:', error);
        rafraichirQuota();
      }
    },
    [
      apresGeneration,
      user,
      aAccesPremium,
      musicQuota,
      paroles,
      itemCode,
      musicGeneration,
      navigate,
      location.pathname,
      rafraichirQuota,
      rafraichirChansonsItem,
    ]
  );

  /**
   * UNIQUE point de libération : lève le verrou et remet l'état local à zéro.
   * Idempotent, et sans effet si un autre lancement a pris le verrou depuis.
   */
  const liberer = useCallback((l: Lancement) => {
    if (lancement.current !== l) return;
    lancement.current = null;
    setPreparation(false);
    setRangEnCours(null);
    setStyleEnCours(null);
    setDebutGeneration(null);
  }, []);

  /**
   * Lance UNE génération payante : seule fonction de ce hook qui contacte le service.
   * Le verrou est posé de façon synchrone (référence) puis affiché (état) avant la
   * première requête : la rédaction des paroles, attendue avant l'appel payant, ne
   * laisse pas un second clic (autre rang, autre onglet) lancer une deuxième
   * génération. Il est levé par `liberer` : fin de la requête audio, échec,
   * annulation.
   */
  const generer = useCallback(
    async (
      rang: RangChanson,
      style: string,
      advancedParams?: Partial<AdvancedSunoParams>
    ) => {
      if (lancement.current) return;
      const l: Lancement = { rang, annule: false, audioLance: false };
      lancement.current = l;
      setPreparation(true);
      setRangEnCours(rang);
      setStyleEnCours(style);
      try {
        await genererInterne(l, style, advancedParams, () => liberer(l));
      } finally {
        liberer(l);
      }
    },
    [genererInterne, liberer]
  );

  /**
   * Annule le lancement courant, à n'importe quelle étape : le jeton est invalidé
   * (la continuation périmée ne lancera pas la génération payante), l'attente de
   * l'audio est interrompue et le verrou est libéré tout de suite.
   */
  const annuler = useCallback(() => {
    const l = lancement.current;
    if (l) l.annule = true;
    const rang =
      l?.rang ??
      (musicGeneration.isGenerating?.rangA
        ? 'A'
        : musicGeneration.isGenerating?.rangB
          ? 'B'
          : musicGeneration.isGenerating?.rangAB
            ? 'AB'
            : undefined);
    musicGeneration.cancelGeneration(rang);
    if (l) liberer(l);
    else setDebutGeneration(null);
  }, [musicGeneration, liberer]);

  // Page quittée pendant la rédaction des paroles : la génération payante ne part pas
  // après coup. Une requête déjà partie n'est pas interrompue (son résultat arrive
  // dans la bibliothèque par le callback du serveur).
  useEffect(
    () => () => {
      const l = lancement.current;
      if (l && !l.audioLance) l.annule = true;
    },
    []
  );

  const ouvrirBibliotheque = useCallback(async () => {
    if (!chanson) return;
    if (!user) {
      toast.error('Connectez-vous pour retrouver vos chansons');
      return;
    }
    if (chanson.taskId && bibliotheque !== 'enregistree') {
      try {
        const resultat = await assurerChansonEnBibliotheque(
          user.id,
          chanson.taskId
        );
        if (resultat.etat === 'impossible') {
          toast.error(
            `Impossible d'enregistrer la chanson dans votre bibliothèque : ${resultat.raison}`
          );
          return;
        }
        setBibliotheque('enregistree');
      } catch {
        toast.error(
          "Impossible d'enregistrer la chanson dans votre bibliothèque pour le moment. Réessayez dans un instant."
        );
        return;
      }
    }
    navigate(ROUTE_PATHS.medMngMusicLibrary);
  }, [chanson, user, bibliotheque, navigate]);

  return {
    user,
    connecte: Boolean(user),
    aAccesPremium,
    estAdmin,
    chargementAcces,
    musicQuota,
    quotaAtteint,
    enCours,
    progression: musicGeneration.pollingProgress || 0,
    etape: musicGeneration.etape,
    debutGeneration,
    rangEnCours,
    styleEnCours,
    chanson,
    bibliotheque,
    generer,
    annuler,
    ouvrirBibliotheque,
  };
}
