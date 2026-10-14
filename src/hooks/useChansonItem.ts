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
import { useCallback, useState } from 'react';
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
  const [debutGeneration, setDebutGeneration] = useState<number | null>(null);
  const [bibliotheque, setBibliotheque] =
    useState<EtatBibliotheque>('inconnue');

  const rafraichirChansonsItem = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['mes-chansons-item'] });
  }, [queryClient]);

  // Chanson terminée en arrière-plan (callback serveur) : notification, quota et liste à jour.
  useRealtimeGeneration({
    userId: user?.id,
    onGenerationComplete: (track) => {
      handleGenerationComplete(track);
      rafraichirQuota();
      rafraichirChansonsItem();
    },
    enabled: !!user,
  });

  const enCours = Boolean(
    musicGeneration.isGenerating?.rangA ||
      musicGeneration.isGenerating?.rangB ||
      musicGeneration.isGenerating?.rangAB
  );
  const quotaAtteint = Boolean(musicQuota && !musicQuota.can_generate);

  /** Lance UNE génération payante : seule fonction de ce hook qui contacte le service. */
  const generer = useCallback(
    async (
      rang: RangChanson,
      style: string,
      advancedParams?: Partial<AdvancedSunoParams>
    ) => {
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
        if (lignes.length === 0) {
          toast.error(
            `Aucune parole disponible pour le ${rang === 'AB' ? 'rang A+B' : `rang ${rang}`} de cet item.`
          );
          return;
        }

        setDebutGeneration(Date.now());
        setChanson(null);
        setBibliotheque('inconnue');

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

        setDebutGeneration(null);
        const taskId = resultat.taskId;
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

        if (taskId) {
          setBibliotheque('verification');
          const biblio = await assurerChansonEnBibliotheque(user.id, taskId);
          setBibliotheque(
            biblio.etat === 'impossible' ? 'absente' : 'enregistree'
          );
        }

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
        await addPoints(user.id, POINTS_CONFIG.itemReviewed, 'itemReviewed');
        loadStats(user.id);
        rafraichirChansonsItem();
      } catch (error) {
        // Le hook de génération a déjà affiché un message français, jamais technique.
        if (import.meta.env.DEV) console.error('Erreur génération:', error);
        setDebutGeneration(null);
        rafraichirQuota();
      }
    },
    [
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
      logActivity,
      addPoints,
      loadStats,
    ]
  );

  const annuler = useCallback(() => {
    const rang = musicGeneration.isGenerating?.rangA
      ? 'A'
      : musicGeneration.isGenerating?.rangB
        ? 'B'
        : musicGeneration.isGenerating?.rangAB
          ? 'AB'
          : undefined;
    musicGeneration.cancelGeneration(rang);
    setDebutGeneration(null);
  }, [musicGeneration]);

  const ouvrirBibliotheque = useCallback(async () => {
    if (!chanson) return;
    if (!user) {
      toast.error('Connectez-vous pour retrouver vos chansons');
      return;
    }
    if (chanson.taskId && bibliotheque !== 'enregistree') {
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
    chanson,
    bibliotheque,
    generer,
    annuler,
    ouvrirBibliotheque,
  };
}
