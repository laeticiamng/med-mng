import { TranslatedText } from '@/components/TranslatedText';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { NOM_OFFRE_PREMIUM } from '@/config/offre';
import { ROUTE_PATHS } from '@/config/routes';
import {
  LIMITES_SUNO,
  dureeEstimeeAffichee,
  tronquerParoles,
} from '@/config/stylesMusicaux';
import { libelleStyle } from '@/config/stylesMusicaux';
import type { AdvancedSunoParams } from '@/hooks/music/useAdvancedSunoParams';
import { AlertTriangle, Keyboard, LogIn, Sparkles, Wand2 } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdvancedParamsToggle } from './AdvancedParamsToggle';
import { EdnItemSelector } from './EdnItemSelector';
import { EncartGenerationAudio } from '@/components/offre/EncartGenerationAudio';
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
          onClick={() => navigate(ROUTE_PATHS.medMngLogin)}
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
  allEdnItems: any[];
  itemsLoading: boolean;
  itemsError: string | null;
  ednLyrics: ParolesItem | null;
  lyricsLoading: boolean;
  lyricsError: string | null;
  canGenerate: () => boolean;
  handleGenerate: (advancedParams?: Partial<AdvancedSunoParams>) => void;
  resetForm: () => void;
  isGenerating: boolean;
  user: any;
  /** Accès Premium effectif (abonnement ou administrateur) et quota non épuisé. */
  canGenerateMusic: () => boolean;
  /** Connecté sans Med MNG Premium : encart permanent à la place du bouton « Générer ». */
  generationReservee?: boolean;
}

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
}) => {
  const [advancedParams, setAdvancedParams] = useState<
    Partial<AdvancedSunoParams> | undefined
  >(undefined);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const handleGenerateWithParams = useCallback(() => {
    handleGenerate(advancedParams);
  }, [handleGenerate, advancedParams]);

  useKeyboardShortcuts({
    onGenerate: handleGenerateWithParams,
    onReset: resetForm,
    canGenerate: canGenerate(),
    isGenerating,
    enabled: true,
  });

  // Paroles du rang choisi (celles qui seront envoyées), durée estimée et dépassement éventuel.
  const previewLyrics = useMemo(() => {
    const lignes = parolesPourRang(ednLyrics, selectedRang);
    return lignes.length > 0 ? lignes : null;
  }, [ednLyrics, selectedRang]);

  const apercuEnvoi = useMemo(() => {
    if (!previewLyrics) return null;
    const coupe = tronquerParoles(previewLyrics, LIMITES_SUNO.paroles);
    return {
      duree: dureeEstimeeAffichee(previewLyrics),
      tronque: coupe.tronque,
      lignesRetirees: coupe.lignesRetirees,
    };
  }, [previewLyrics]);

  return (
    <PremiumCard variant="glass" className="mb-6 sm:mb-12 p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-warning to-warning/80 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
          <Wand2 className="h-5 w-5 sm:h-6 sm:w-6 text-warning-foreground" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
            <TranslatedText text="Configuration" />
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            <TranslatedText text="Item EDN, rang et style musical" />
          </p>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* 1 — Item : ce qu'on veut réviser */}
        <EdnItemSelector
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          allEdnItems={allEdnItems}
          itemsLoading={itemsLoading}
          itemsError={itemsError}
          ednLyrics={ednLyrics}
        />

        {lyricsError && (
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Erreur de chargement des paroles : {lyricsError}
          </p>
        )}

        {/* 2 — Niveau : ce qu'on veut apprendre (paroles du rang choisi visibles plus bas, dans l'aperçu) */}
        <RangSelector
          selectedRang={selectedRang}
          setSelectedRang={setSelectedRang}
          itemCode={selectedItem}
          lyricsAvailability={{
            hasA: parolesPourRang(ednLyrics, 'A').length > 0,
            hasB: parolesPourRang(ednLyrics, 'B').length > 0,
            hasAB: parolesPourRang(ednLyrics, 'AB').length > 0,
          }}
        />

        {/* 3 — Ambiance musicale */}
        <StyleSelector
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
        />

        {selectedStyle && (
          <AdvancedParamsToggle
            onParamsChange={setAdvancedParams}
            disabled={isGenerating}
          />
        )}

        {/* 4 — Aperçu, seulement une fois les trois choix faits */}
        {previewLyrics && selectedStyle && (
          <LyricsPreview
            lyrics={previewLyrics}
            title={ednLyrics?.title}
            rang={selectedRang}
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
            className="mt-2"
          />
        )}

        {!user && <LoginPromptBanner />}

        {/* 5 — Passer à l'action : le CTA doit être l'élément le plus visible de la page. */}
        {selectedItem && selectedRang && selectedStyle && (
          <div className="rounded-xl sm:rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div>
              <p className="text-sm sm:text-base font-semibold text-foreground">
                <TranslatedText text="Ta chanson est prête à être créée" />
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {ednLyrics?.title ? `${ednLyrics.title} · ` : ''}
                {selectedRang === 'AB'
                  ? 'Rang A+B'
                  : `Rang ${selectedRang}`} · {libelleStyle(selectedStyle)}
                {apercuEnvoi ? ` · ≈ ${apercuEnvoi.duree}` : ''}
              </p>
            </div>

            {generationReservee ? (
              <EncartGenerationAudio />
            ) : (
              <PremiumButton
                variant="primary"
                size="lg"
                onClick={handleGenerateWithParams}
                disabled={
                  !user ||
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
                      <TranslatedText text="Générer ma chanson" />
                    </span>
                  </>
                )}
              </PremiumButton>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 sm:gap-4">
          <PremiumButton
            variant="secondary"
            size="lg"
            onClick={resetForm}
            className="min-h-[44px] text-sm sm:text-base"
          >
            <TranslatedText text="Réinitialiser" />
          </PremiumButton>

          <TooltipProvider>
            <Tooltip
              open={showShortcutsHelp}
              onOpenChange={setShowShortcutsHelp}
            >
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11"
                  aria-label="Raccourcis clavier"
                  onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
                >
                  <Keyboard className="h-5 w-5" />
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
