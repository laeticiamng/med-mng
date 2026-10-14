import { MentionContenuIA } from '@/components/edn/MentionContenuIA';
import { MesChansonsItem } from '@/components/edn/music/MesChansonsItem';
import { parolesSontRedigees } from '@/components/edn/music/utils/parolesFormatter';
import { AdvancedParamsToggle } from '@/components/generator/AdvancedParamsToggle';
import { AmbianceLibre } from '@/components/generator/AmbianceLibre';
import { GenerationProgress } from '@/components/generator/GenerationProgress';
import {
  parolesPourRang,
  type ParolesItem,
} from '@/components/generator/GeneratorForm';
import { LyricsExportButton } from '@/components/generator/LyricsExportButton';
import { LyricsPreview } from '@/components/generator/LyricsPreview';
import { raisonRangIndisponible } from '@/components/generator/RangSelector';
import { StyleSelector } from '@/components/generator/StyleSelector';
import { GeneratorMusicPlayer } from '@/components/music/GeneratorMusicPlayer';
import { AnnonceAudioSuspendue } from '@/components/offre/AnnonceAudioSuspendue';
import { EncartGenerationAudio } from '@/components/offre/EncartGenerationAudio';
import { PremiumButton } from '@/components/ui/premium-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GENERATION_AUDIO_DISPONIBLE,
  QUOTA_GENERATIONS_AUDIO_PREMIUM,
} from '@/config/offre';
import {
  dureeEstimeeAffichee,
  libelleStyle,
  normaliserSlugStyle,
  parolesEnvoyees,
} from '@/config/stylesMusicaux';
import type { AdvancedSunoParams } from '@/hooks/music/useAdvancedSunoParams';
import { useChansonItem, type RangChanson } from '@/hooks/useChansonItem';
import { useGeneratorPreferences } from '@/hooks/useGeneratorPreferences';
import { verifierAmbianceLocale } from '../../../../supabase/functions/_shared/mm-ambiance';
import { Loader2, Music, Sparkles } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const RANGS: ReadonlyArray<{
  valeur: RangChanson;
  onglet: string;
  court: string;
  aide: string;
}> = [
  {
    valeur: 'A',
    onglet: 'Rang A',
    court: 'A',
    aide: 'Connaissances attendues de tout étudiant en fin de 2e cycle',
  },
  {
    valeur: 'B',
    onglet: 'Rang B',
    court: 'B',
    aide: 'Connaissances attendues au premier jour d’internat dans la spécialité',
  },
  {
    valeur: 'AB',
    onglet: 'Rang A+B',
    court: 'A+B',
    aide: 'Tout l’item, rang A puis rang B',
  },
];

interface MusiqueItemProps {
  itemCode: string;
  titre: string;
  numero: number;
  /** Paroles de l'item (RPC mm_contenu_immersif_item) ; un rang sans compétence est déjà vidé. */
  paroles: ParolesItem;
  /**
   * Le référentiel ne contient AUCUNE compétence de ce rang (établi une fois le
   * chargement abouti, voir EdnItemContext) : l'onglet est alors désactivé.
   */
  rangAVide: boolean;
  rangBVide: boolean;
}

/**
 * Sous-page « Musique » d'un item EDN, sur le modèle de Create : item déjà
 * choisi, trois onglets exclusifs (rang A, rang B, rangs A+B), style et options,
 * paroles du SEUL rang choisi, bouton de génération, chansons déjà créées.
 *
 * Réutilise les composants et le moteur de Create (StyleSelector, AmbianceLibre,
 * AdvancedParamsToggle, LyricsPreview, GenerationProgress, GeneratorMusicPlayer,
 * useMusicGenerationWithTranslation via useChansonItem). Changer d'onglet ne
 * change qu'un état local : aucun appel à la génération.
 */
export const MusiqueItem: React.FC<MusiqueItemProps> = ({
  itemCode,
  titre,
  numero,
  paroles,
  rangAVide,
  rangBVide,
}) => {
  const chanson = useChansonItem(itemCode, paroles);
  const { preferences, savePreferences } = useGeneratorPreferences();

  // Rang : A par défaut, ou le premier rang que l'item possède (IC-30 : rang B seul).
  const raison = useCallback(
    // Tant que le chargement n'a pas abouti, aucun rang n'est écarté.
    (rang: RangChanson) =>
      raisonRangIndisponible(rang, rangAVide ? 0 : 1, rangBVide ? 0 : 1),
    [rangAVide, rangBVide]
  );
  const [rangChoisi, setRangChoisi] = useState<RangChanson | null>(null);
  const rangsPossibles = RANGS.filter((r) => !raison(r.valeur)).map(
    (r) => r.valeur
  );
  const rang: RangChanson =
    rangChoisi && rangsPossibles.includes(rangChoisi)
      ? rangChoisi
      : (rangsPossibles[0] ?? 'A');
  const rangMeta = RANGS.find((r) => r.valeur === rang) ?? RANGS[0];

  // Style : celui de Create s'il existe encore dans le catalogue, sinon à choisir.
  const [style, setStyle] = useState('');
  useEffect(() => {
    if (preferences?.selectedStyle) {
      setStyle(
        (courant) => courant || normaliserSlugStyle(preferences.selectedStyle)
      );
    }
  }, [preferences]);
  const choisirStyle = (slug: string) => {
    setStyle(slug);
    // Même clé que Create ; son item et son rang sont conservés tels quels.
    savePreferences({
      contentType: 'edn',
      selectedItem: preferences?.selectedItem ?? '',
      selectedRang: preferences?.selectedRang ?? '',
      selectedStyle: slug,
    });
  };

  const [ambiance, setAmbiance] = useState('');
  const [advancedParams, setAdvancedParams] = useState<
    Partial<AdvancedSunoParams> | undefined
  >(undefined);
  const ambianceValide = verifierAmbianceLocale(ambiance).ok;

  const lignesRang = useMemo(
    () => parolesPourRang(paroles, rang),
    [paroles, rang]
  );
  const parolesRedigeesRang =
    lignesRang.length > 0 && parolesSontRedigees(lignesRang);
  const apercuEnvoi = useMemo(() => {
    if (!parolesRedigeesRang) return null;
    const coupe = parolesEnvoyees(lignesRang);
    return {
      duree: dureeEstimeeAffichee(lignesRang),
      tronque: coupe.tronque,
      lignesRetirees: coupe.lignesRetirees,
    };
  }, [lignesRang, parolesRedigeesRang]);

  const lancer = () => {
    if (!ambianceValide) return;
    void chanson.generer(rang, style, {
      ...advancedParams,
      ...(ambiance.trim() ? { ambiance: ambiance.trim() } : {}),
    });
  };

  const { aAccesPremium, chargementAcces, connecte, enCours, quotaAtteint } =
    chanson;
  const peutGenerer =
    Boolean(style) && ambianceValide && !enCours && !quotaAtteint;

  return (
    <section
      className="space-y-6"
      aria-labelledby="musique-item-titre"
      data-testid="musique-item"
    >
      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-5">
        {/* 1. Titre et numéro de l'item */}
        <header className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/10"
            aria-hidden="true"
          >
            <Music className="h-5 w-5 text-warning" />
          </div>
          <div className="min-w-0">
            <h2
              id="musique-item-titre"
              className="break-words text-lg font-semibold leading-snug text-foreground"
            >
              Chanson de l'item {itemCode}
            </h2>
            <p className="break-words text-sm text-muted-foreground">
              {titre}
              <span className="sr-only"> (item n° {numero})</span>
            </p>
            {aAccesPremium && chanson.musicQuota && (
              <p className="mt-1 text-xs text-muted-foreground">
                Générations audio ce mois-ci :{' '}
                {chanson.musicQuota.current_usage} /{' '}
                {chanson.musicQuota.quota_limit ||
                  QUOTA_GENERATIONS_AUDIO_PREMIUM}
              </p>
            )}
          </div>
        </header>

        <MentionContenuIA
          itemCode={itemCode}
          typeContenu="paroles"
          complement="Chanson (paroles et musique) générée par IA à partir des compétences de l'item."
        />

        <Tabs
          value={rang}
          onValueChange={(v) => setRangChoisi(v as RangChanson)}
          className="space-y-5"
        >
          {/* 2. Trois onglets exclusifs */}
          <div className="space-y-1.5">
            <TabsList
              className="grid h-auto w-full grid-cols-3"
              aria-label="Niveau de connaissances de la chanson"
            >
              {RANGS.map((r) => (
                <TabsTrigger
                  key={r.valeur}
                  value={r.valeur}
                  disabled={Boolean(raison(r.valeur))}
                  className="min-h-[44px] px-1 sm:px-3"
                >
                  {r.onglet}
                </TabsTrigger>
              ))}
            </TabsList>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {raison(rang) ?? rangMeta.aide}
            </p>
            {RANGS.filter((r) => raison(r.valeur)).map((r) => (
              <p key={r.valeur} className="text-xs text-muted-foreground">
                {r.onglet} : {raison(r.valeur)}
              </p>
            ))}
          </div>

          {GENERATION_AUDIO_DISPONIBLE && aAccesPremium && (
            <>
              {/* 3. Style musical */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Ambiance musicale
                </h3>
                <StyleSelector
                  selectedStyle={style}
                  setSelectedStyle={choisirStyle}
                />
              </div>

              {/* 4. Options de génération (les mêmes que Create) */}
              {style && (
                <div className="space-y-3">
                  <AmbianceLibre
                    valeur={ambiance}
                    onChange={setAmbiance}
                    disabled={enCours}
                  />
                  <AdvancedParamsToggle
                    onParamsChange={setAdvancedParams}
                    disabled={enCours}
                  />
                </div>
              )}
            </>
          )}

          {/* 5. Paroles du SEUL rang choisi : un seul panneau est monté à la fois. */}
          {RANGS.map((r) => (
            <TabsContent
              key={r.valeur}
              value={r.valeur}
              className="mt-0 space-y-3"
            >
              <h3 className="text-sm font-semibold text-foreground">
                Paroles — {r.onglet}
              </h3>
              {parolesRedigeesRang ? (
                <LyricsPreview
                  lyrics={lignesRang}
                  title={paroles.title}
                  rang={r.valeur}
                  itemCode={itemCode}
                  dureeAffichee={
                    apercuEnvoi ? `≈ ${apercuEnvoi.duree}` : undefined
                  }
                  tronque={apercuEnvoi?.tronque}
                  lignesRetirees={apercuEnvoi?.lignesRetirees}
                  exportSlot={
                    <LyricsExportButton
                      lyrics={lignesRang}
                      title={paroles.title}
                      rang={r.valeur}
                      style={style}
                      variant="ghost"
                      size="sm"
                    />
                  }
                />
              ) : (
                <p
                  className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground"
                  data-testid="paroles-a-rediger"
                >
                  Pas encore de paroles rédigées pour ce rang. Elles sont
                  écrites au lancement de la chanson, à partir des compétences
                  officielles de l'item.
                </p>
              )}
            </TabsContent>
          ))}

          {/* Sans Premium : l'invitation remplace style, options et bouton ; les paroles restent lisibles. */}
          {GENERATION_AUDIO_DISPONIBLE &&
            !chargementAcces &&
            !aAccesPremium && <EncartGenerationAudio connecte={connecte} />}
          {!GENERATION_AUDIO_DISPONIBLE && <AnnonceAudioSuspendue />}
        </Tabs>

        {/* 6. Génération audio */}
        {GENERATION_AUDIO_DISPONIBLE && aAccesPremium && (
          <div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{itemCode}</span>
              {' · '}
              {rang === 'AB' ? 'Rangs A + B' : `Rang ${rang}`}
              {style ? ` · ${libelleStyle(style)}` : ''}
              {apercuEnvoi ? ` · ≈ ${apercuEnvoi.duree}` : ''}
            </p>
            <PremiumButton
              variant="primary"
              size="lg"
              onClick={lancer}
              disabled={!peutGenerer}
              aria-label={`Générer la chanson du rang ${rangMeta.court}`}
              aria-busy={enCours}
              className="min-h-[52px] w-full text-sm font-semibold sm:text-base"
            >
              {enCours ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span className="truncate">Génération en cours…</span>
                </>
              ) : (
                <>
                  <Sparkles
                    className="mr-2 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">Générer la chanson</span>
                </>
              )}
            </PremiumButton>
            <p className="text-xs text-muted-foreground">
              {!style
                ? 'Choisissez une ambiance musicale pour lancer la génération.'
                : quotaAtteint
                  ? `Vous avez utilisé vos ${QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio de ce mois ; le compteur repart le 1er du mois prochain.`
                  : "Prête en 1 à 3 minutes et enregistrée dans votre bibliothèque. Une génération qui échoue n'est pas décomptée."}
            </p>
          </div>
        )}

        <GenerationProgress
          progress={chanson.progression}
          isGenerating={enCours}
          message={
            chanson.etape?.etape === 'envoi'
              ? 'Envoi de la demande au service de génération…'
              : "Votre chanson est en cours de création (1 à 3 minutes). Elle sera ajoutée à votre bibliothèque dès qu'elle est prête."
          }
          onCancel={chanson.annuler}
          startTime={chanson.debutGeneration || undefined}
          taskId={chanson.etape?.taskId}
          rang={rang}
        />

        {chanson.chanson && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {chanson.bibliotheque === 'enregistree' &&
                'Chanson prête et enregistrée dans votre bibliothèque.'}
              {chanson.bibliotheque === 'verification' &&
                'Chanson prête — enregistrement dans votre bibliothèque…'}
              {chanson.bibliotheque === 'absente' &&
                "Chanson prête. L'enregistrement en bibliothèque a échoué : utilisez le bouton « Ma bibliothèque » pour réessayer."}
            </p>
            <GeneratorMusicPlayer
              generatedSong={chanson.chanson}
              onAddToLibrary={chanson.ouvrirBibliotheque}
              libraryLabel={
                chanson.bibliotheque === 'enregistree'
                  ? 'Ma bibliothèque'
                  : 'Enregistrer en bibliothèque'
              }
            />
          </div>
        )}
      </div>

      {/* 7. Chansons déjà générées pour cet item */}
      <MesChansonsItem itemCode={itemCode} />
    </section>
  );
};

export default MusiqueItem;
