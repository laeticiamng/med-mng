import { TranslatedText } from '@/components/TranslatedText';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ITEMS_GRATUITS, NOM_OFFRE_PREMIUM, estItemGratuit, GENERATION_AUDIO_DISPONIBLE } from '@/config/offre';
import { ROUTE_PATHS } from '@/config/routes';
import { avecSuivant } from '@/lib/cheminSuivant';
import {
  dureeEstimeeAffichee,
  parolesEnvoyees,
} from '@/config/stylesMusicaux';
import { libelleStyle } from '@/config/stylesMusicaux';
import type { AdvancedSunoParams } from '@/hooks/music/useAdvancedSunoParams';
import { AlertTriangle, Keyboard, Lock, LogIn, Sparkles } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { raisonRangIndisponible } from './RangSelector';
import { AdvancedParamsToggle } from './AdvancedParamsToggle';
import { EdnItemSelector } from './EdnItemSelector';
import { EncartGenerationAudio } from '@/components/offre/EncartGenerationAudio';
import { AnnonceAudioSuspendue } from '@/components/offre/AnnonceAudioSuspendue';
import { AmbianceLibre } from './AmbianceLibre';
import { verifierAmbianceLocale } from '../../../supabase/functions/_shared/mm-ambiance';
import {
  KeyboardShortcutsHelp,
  useKeyboardShortcuts,
} from './KeyboardShortcuts';
import { LyricsExportButton } from './LyricsExportButton';
import { LyricsPreview } from './LyricsPreview';
import { RangSelector } from './RangSelector';
import { StyleSelector } from './StyleSelector';

const LoginPromptBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Alert className="bg-primary/10 border-primary/30">
      <Sparkles className="h-4 w-4 text-primary" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-sm">
          <strong>Connectez-vous</strong> pour générer une chanson — génération
          audio incluse dans <strong>{NOM_OFFRE_PREMIUM}</strong>.
        </span>
        <Button
          variant="default"
          size="sm"
          onClick={() =>
            navigate(
              avecSuivant(ROUTE_PATHS.medMngLogin, ROUTE_PATHS.medMngCreate)
            )
          }
          className="w-fit"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Se connecter
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export interface ParolesItem {
  paroles_musicales?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  item_code: string;
  title: string;
  subtitle?: string;
}

/**
 * Paroles envoyées pour un rang (RPC mm_contenu_immersif_item) :
 *  - A  : paroles_rang_a (repli : paroles_musicales, historiquement = rang A) ;
 *  - B  : paroles_rang_b uniquement (jamais les paroles A sous un titre « Rang B ») ;
 *  - AB : paroles_rang_ab, sinon rang A puis rang B.
 */
export const parolesPourRang = (
  paroles: ParolesItem | null | undefined,
  rang: string
): string[] => {
  if (!paroles) return [];
  const a = paroles.paroles_rang_a ?? [];
  const b = paroles.paroles_rang_b ?? [];
  const ab = paroles.paroles_rang_ab ?? [];
  const legacy = paroles.paroles_musicales ?? [];
  if (rang === 'A') return a.length > 0 ? a : legacy;
  if (rang === 'B') return b;
  if (rang === 'AB') {
    if (ab.length > 0) return ab;
    if (a.length > 0 && b.length > 0) return [...a, ...b];
    return [];
  }
  return [];
};

interface GeneratorFormProps {
  selectedItem: string;
  setSelectedItem: (item: string) => void;
  selectedRang: string;
  setSelectedRang: (rang: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  allEdnItems: {
    item_code: string;
    title: string;
    subtitle?: string;
    slug?: string;
  }[];
  itemsLoading: boolean;
  itemsError: string | null;
  ednLyrics: ParolesItem | null;
  lyricsLoading: boolean;
  lyricsError: string | null;
  canGenerate: () => boolean;
  handleGenerate: (advancedParams?: Partial<AdvancedSunoParams>) => void;
  resetForm: () => void;
  isGenerating: boolean;
  user: { id: string } | null;
  /** Accès Premium effectif (abonnement ou administrateur) et quota non épuisé. */
  canGenerateMusic: () => boolean;
  /** Connecté sans Med MNG Premium : encart permanent à la place du bouton « Générer ». */
  generationReservee?: boolean;
  /** Accès Premium (abonnement ou administrateur) : sinon, items d'essai signalés. */
  aAccesPremium?: boolean;
  /** Paroles de l'item choisi réservées à Premium (réponse du serveur). */
  parolesVerrouillees?: boolean;
}

/** En-tête d'une étape du parcours (numéro, titre, aide courte). */
const Etape: React.FC<{
  numero: number;
  titre: string;
  aide?: string;
  children: React.ReactNode;
}> = ({ numero, titre, aide, children }) => (
  <section className="space-y-3" aria-labelledby={`etape-${numero}`}>
    <div className="flex items-baseline gap-3">
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
        aria-hidden="true"
      >
        {numero}
      </span>
      <div className="min-w-0">
        <h2
          id={`etape-${numero}`}
          className="text-base font-semibold text-foreground"
        >
          {titre}
        </h2>
        {aide && <p className="text-xs text-muted-foreground">{aide}</p>}
      </div>
    </div>
    {children}
  </section>
);

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  selectedItem,
  setSelectedItem,
  selectedRang,
  setSelectedRang,
  selectedStyle,
  setSelectedStyle,
  allEdnItems,
  itemsLoading,
  itemsError,
  ednLyrics,
  lyricsLoading,
  lyricsError,
  canGenerate,
  handleGenerate,
  resetForm,
  isGenerating,
  user,
  canGenerateMusic,
  generationReservee = false,
  aAccesPremium = false,
  parolesVerrouillees = false,
}) => {
  const [advancedParams, setAdvancedParams] = useState<
    Partial<AdvancedSunoParams> | undefined
  >(undefined);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [ambiance, setAmbiance] = useState('');
  const ambianceValide = verifierAmbianceLocale(ambiance).ok;

  const handleGenerateWithParams = useCallback(() => {
    if (!verifierAmbianceLocale(ambiance).ok) return;
    handleGenerate({ ...advancedParams, ...(ambiance.trim() ? { ambiance: ambiance.trim() } : {}) });
  }, [handleGenerate, advancedParams, ambiance]);

  useKeyboardShortcuts({
    onGenerate: handleGenerateWithParams,
    onReset: resetForm,
    canGenerate: canGenerate(),
    isGenerating,
    enabled: true,
  });

  // Rang cohérent avec l'item : un rang absent du programme officiel de l'item
  // (ex. rang B d'IC-1) est retiré ; s'il ne reste qu'un rang possible, il est
  // présélectionné. Évite de lancer une génération vouée à l'échec.
  const ajusterRang = useCallback(
    ({
      nbA,
      nbB,
      chargement,
    }: {
      nbA: number;
      nbB: number;
      chargement: boolean;
    }) => {
      if (!selectedItem || chargement || (nbA === 0 && nbB === 0)) return;
      const possibles = ['A', 'B', 'AB'].filter(
        (r) => !raisonRangIndisponible(r, nbA, nbB)
      );
      if (selectedRang && possibles.includes(selectedRang)) return;
      setSelectedRang(possibles.length === 1 ? possibles[0] : '');
    },
    [selectedItem, selectedRang, setSelectedRang]
  );

  // Paroles du rang choisi (celles qui seront envoyées), durée estimée et dépassement éventuel.
  const previewLyrics = useMemo(() => {
    const lignes = parolesPourRang(ednLyrics, selectedRang);
    return lignes.length > 0 ? lignes : null;
  }, [ednLyrics, selectedRang]);

  const apercuEnvoi = useMemo(() => {
    if (!previewLyrics) return null;
    const coupe = parolesEnvoyees(previewLyrics);
    return {
      duree: dureeEstimeeAffichee(previewLyrics),
      tronque: coupe.tronque,
      lignesRetirees: coupe.lignesRetirees,
    };
  }, [previewLyrics]);

  const itemReserve =
    Boolean(selectedItem) &&
    !aAccesPremium &&
    (parolesVerrouillees || !estItemGratuit(selectedItem));
  const choixComplets = Boolean(selectedItem && selectedRang && selectedStyle);

  return (
    <PremiumCard
      variant="glass"
      hover={false}
      className="mb-6 sm:mb-10 p-4 sm:p-6 md:p-8"
    >
      <div className="space-y-8">
        <Etape
          numero={1}
          titre="Choisir l'item à réviser"
          aide="Les 367 items du programme officiel des EDN"
        >
          <EdnItemSelector
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            allEdnItems={allEdnItems}
            itemsLoading={itemsLoading}
            itemsError={itemsError}
            ednLyrics={ednLyrics}
            signalerItemsEssai={Boolean(user) && !aAccesPremium}
          />
          {itemReserve && (
            <div
              className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3 text-sm"
              role="note"
            >
              <Lock
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-muted-foreground">
                Les paroles de cet item sont réservées à {NOM_OFFRE_PREMIUM}.
                Sans abonnement, vous pouvez lire et exporter celles des{' '}
                {ITEMS_GRATUITS.length} items d'essai (marqués « Essai » dans la
                liste, par exemple{' '}
                <button
                  type="button"
                  className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                  onClick={() => setSelectedItem(ITEMS_GRATUITS[0])}
                >
                  {ITEMS_GRATUITS[0]}
                </button>
                ).{' '}
                <Link
                  to={ROUTE_PATHS.medMngPricing}
                  className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                >
                  Voir l'offre
                </Link>
              </p>
            </div>
          )}
        </Etape>

        {lyricsError && (
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Erreur de chargement des paroles : {lyricsError}
          </p>
        )}

        <Etape
          numero={2}
          titre="Choisir le niveau"
          aide="Les connaissances de l'item qui seront mises en paroles"
        >
          <RangSelector
            selectedRang={selectedRang}
            setSelectedRang={setSelectedRang}
            itemCode={selectedItem}
            verrouille={itemReserve}
            onComptes={ajusterRang}
            lyricsAvailability={{
              hasA: parolesPourRang(ednLyrics, 'A').length > 0,
              hasB: parolesPourRang(ednLyrics, 'B').length > 0,
              hasAB: parolesPourRang(ednLyrics, 'AB').length > 0,
            }}
          />
        </Etape>

        <Etape numero={3} titre="Choisir l'ambiance musicale">
          <StyleSelector
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
          />
          {selectedStyle && GENERATION_AUDIO_DISPONIBLE && (
            <AmbianceLibre valeur={ambiance} onChange={setAmbiance} disabled={isGenerating} />
          )}
          {selectedStyle && GENERATION_AUDIO_DISPONIBLE && (
            <AdvancedParamsToggle
              onParamsChange={setAdvancedParams}
              disabled={isGenerating}
            />
          )}
        </Etape>

        {previewLyrics && (
          <Etape
            numero={4}
            titre="Relire les paroles"
            aide="Tirées du programme officiel de l'item ; comparez-les avec la source dans l'onglet « Programme officiel »"
          >
            <LyricsPreview
              lyrics={previewLyrics}
              title={ednLyrics?.title}
              rang={selectedRang}
              itemCode={selectedItem}
              dureeAffichee={apercuEnvoi ? `≈ ${apercuEnvoi.duree}` : undefined}
              tronque={apercuEnvoi?.tronque}
              lignesRetirees={apercuEnvoi?.lignesRetirees}
              exportSlot={
                <LyricsExportButton
                  lyrics={previewLyrics}
                  title={ednLyrics?.title}
                  rang={selectedRang}
                  style={selectedStyle}
                  variant="ghost"
                  size="sm"
                />
              }
            />
          </Etape>
        )}

        {!user && <LoginPromptBanner />}

        {/* Dernière étape : l'action principale, seulement une fois les choix faits. */}
        {choixComplets && !itemReserve && (
          <Etape numero={previewLyrics ? 5 : 4} titre="Créer la chanson">
            <div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {selectedItem}
                </span>
                {' · '}
                {selectedRang === 'AB'
                  ? 'Rangs A + B'
                  : `Rang ${selectedRang}`}{' '}
                · {libelleStyle(selectedStyle)}
                {apercuEnvoi ? ` · ≈ ${apercuEnvoi.duree}` : ''}
              </p>

              {!GENERATION_AUDIO_DISPONIBLE ? (
                <AnnonceAudioSuspendue />
              ) : generationReservee ? (
                <EncartGenerationAudio />
              ) : (
                <>
                  <PremiumButton
                    variant="primary"
                    size="lg"
                    onClick={handleGenerateWithParams}
                    disabled={
                      !user ||
                      !ambianceValide ||
                      !canGenerate() ||
                      isGenerating ||
                      (user && !canGenerateMusic()) ||
                      lyricsLoading
                    }
                    className="w-full min-h-[52px] text-sm sm:text-base font-semibold"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 border-2 border-white border-t-transparent rounded-full" />
                        <span className="truncate">
                          <TranslatedText text="Génération en cours…" />
                        </span>
                      </>
                    ) : lyricsLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 border-2 border-current border-t-transparent rounded-full" />
                        <span className="truncate">
                          <TranslatedText text="Chargement des paroles…" />
                        </span>
                      </>
                    ) : !user ? (
                      <>
                        <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 shrink-0" />
                        <span className="truncate">
                          <TranslatedText text="Connexion requise" />
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 shrink-0" />
                        <span className="truncate">
                          <TranslatedText text="Générer la chanson" />
                        </span>
                      </>
                    )}
                  </PremiumButton>
                  <p className="text-xs text-muted-foreground">
                    Prête en 1 à 3 minutes et enregistrée dans votre
                    bibliothèque. Une génération qui échoue n'est pas décomptée.
                  </p>
                </>
              )}
            </div>
          </Etape>
        )}

        <div className="flex items-center gap-2 border-t border-border/60 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetForm}
            className="text-muted-foreground"
          >
            <TranslatedText text="Tout effacer" />
          </Button>

          <TooltipProvider>
            <Tooltip
              open={showShortcutsHelp}
              onOpenChange={setShowShortcutsHelp}
            >
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden h-9 w-9 md:inline-flex"
                  aria-label="Raccourcis clavier"
                  onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="p-3">
                <KeyboardShortcutsHelp />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </PremiumCard>
  );
};
